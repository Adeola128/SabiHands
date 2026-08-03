-- Migration: Add missing fields to applications table

ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS pitch TEXT,
ADD COLUMN IF NOT EXISTS cv_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- (Optional) Update RLS policies if necessary.
-- The existing policies allow volunteers to manage their own applications
-- and organizations to view applications for their gigs, which implicitly includes these new columns.
