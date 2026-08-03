-- Add foreign key constraint to link applications directly to volunteer_profiles
-- This enables direct PostgREST joins like .select('*, volunteer_profiles(*)')
ALTER TABLE public.applications
  ADD CONSTRAINT fk_applications_volunteer_profiles
  FOREIGN KEY (volunteer_id)
  REFERENCES public.volunteer_profiles(user_id);
