-- Migration: Add slug and hidden_sections to volunteer_profiles

-- Add columns
ALTER TABLE public.volunteer_profiles
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS hidden_sections TEXT[] DEFAULT '{}'::TEXT[];

-- Function to generate slug based on full_name
CREATE OR REPLACE FUNCTION generate_volunteer_slug()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  new_slug TEXT;
  counter INT := 1;
BEGIN
  -- Only generate if slug is null and full_name exists
  IF NEW.slug IS NULL AND NEW.full_name IS NOT NULL THEN
    -- Basic slugify: lowercase, replace spaces with hyphens, remove special characters
    base_slug := lower(regexp_replace(NEW.full_name, '[^a-zA-Z0-9\s-]', '', 'g'));
    base_slug := regexp_replace(base_slug, '[\s-]+', '-', 'g');
    base_slug := trim(both '-' from base_slug);
    
    -- Fallback if name is empty after regex
    IF base_slug = '' THEN
      base_slug := 'volunteer';
    END IF;

    new_slug := base_slug;
    
    -- Check for uniqueness and append counter if necessary
    WHILE EXISTS (SELECT 1 FROM public.volunteer_profiles WHERE slug = new_slug AND user_id != NEW.user_id) LOOP
      new_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    NEW.slug := new_slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically generate slug on insert or update if missing
DROP TRIGGER IF EXISTS ensure_volunteer_slug ON public.volunteer_profiles;
CREATE TRIGGER ensure_volunteer_slug
BEFORE INSERT OR UPDATE OF full_name, slug ON public.volunteer_profiles
FOR EACH ROW
EXECUTE FUNCTION generate_volunteer_slug();

-- Trigger for existing rows to populate slug
UPDATE public.volunteer_profiles SET full_name = full_name WHERE slug IS NULL;
