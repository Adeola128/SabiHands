-- Migration to add dedicated columns for the new onboarding data

-- 1. Add primary goals to volunteer_profiles
ALTER TABLE public.volunteer_profiles
ADD COLUMN IF NOT EXISTS primary_goals text[] DEFAULT '{}'::text[];

-- 2. Add focus area to organizations
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS focus_area text;

-- (Optional) Update existing RLS policies if necessary, but these new columns 
-- are covered by the existing UPDATE and SELECT policies on these tables.
