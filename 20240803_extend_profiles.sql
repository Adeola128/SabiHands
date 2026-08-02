-- Migration: Add missing fields for LinkedIn-style profiles

-- 1. Extend Volunteer Profiles
ALTER TABLE public.volunteer_profiles
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- 2. Extend Organization Profiles
ALTER TABLE public.organizations
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Update RLS policies to allow updating these new fields
-- (The existing UPDATE policy "Users can update their own profile" should cover new columns automatically since it applies to the row level, but it's good to ensure it exists).
