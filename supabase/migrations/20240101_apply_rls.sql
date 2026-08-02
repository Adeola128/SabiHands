CREATE POLICY "Volunteers can view their own profile" ON public.volunteer_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Volunteers can update their own profile" ON public.volunteer_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Organizations can view their own profile" ON public.organizations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Organizations can update their own profile" ON public.organizations
  FOR UPDATE USING (auth.uid() = user_id);
