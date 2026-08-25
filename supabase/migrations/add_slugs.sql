-- Add slug column to gigs
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Add slug column to organizations
ALTER TABLE public.organizations ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- We could backfill existing rows here, but for now we just add the columns
