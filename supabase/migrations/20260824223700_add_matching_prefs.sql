-- Migration: Add matching preference fields to volunteer_profiles

ALTER TABLE public.volunteer_profiles
ADD COLUMN IF NOT EXISTS pref_causes TEXT[],
ADD COLUMN IF NOT EXISTS pref_gig_type TEXT,
ADD COLUMN IF NOT EXISTS pref_work_mode TEXT,
ADD COLUMN IF NOT EXISTS pref_availability TEXT;
