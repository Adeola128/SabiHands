-- Fix RLS policies to allow organizations to see volunteer profiles and vice versa
DROP POLICY IF EXISTS "Volunteers can view their own profile" ON public.volunteer_profiles;
CREATE POLICY "Anyone can view volunteer profiles" ON public.volunteer_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Organizations can view their own profile" ON public.organizations;
CREATE POLICY "Anyone can view organizations" ON public.organizations
  FOR SELECT USING (true);
