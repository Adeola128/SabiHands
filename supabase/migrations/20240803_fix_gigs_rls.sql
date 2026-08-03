DROP POLICY IF EXISTS "Anyone can read gigs" ON public.gigs;

CREATE POLICY "Anyone can read gigs" ON public.gigs
  FOR SELECT USING (status = 'published');
