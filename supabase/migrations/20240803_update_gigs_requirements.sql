-- Migration: Add customizable application requirement fields to gigs table

ALTER TABLE public.gigs
ADD COLUMN IF NOT EXISTS require_resume BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS require_linkedin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS require_portfolio BOOLEAN DEFAULT FALSE;
