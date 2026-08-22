-- Update the RLS policy on the gigs table to allow reading gigs that are completed or closed
-- This is necessary so that certificates can join and display the correct organization name and logo
-- even after the gig is no longer actively taking applications.

DROP POLICY IF EXISTS "Anyone can read gigs" ON public.gigs;

CREATE POLICY "Anyone can read gigs" ON public.gigs
  FOR SELECT USING (status IN ('published', 'completed', 'closed'));
