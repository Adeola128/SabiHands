-- Migration: Add gig_id to conversations

ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS gig_id UUID REFERENCES public.gigs(id) ON DELETE SET NULL;
