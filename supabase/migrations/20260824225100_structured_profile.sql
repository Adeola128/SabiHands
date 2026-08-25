-- Migration: Add structured fields to volunteer_profiles

ALTER TABLE public.volunteer_profiles
ADD COLUMN IF NOT EXISTS motivation TEXT,
ADD COLUMN IF NOT EXISTS education TEXT,
ADD COLUMN IF NOT EXISTS resume_url TEXT;
