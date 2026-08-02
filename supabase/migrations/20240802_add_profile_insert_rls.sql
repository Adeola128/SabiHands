-- Add missing INSERT RLS policies so onboarding upsert can create profiles
-- Run this in the Supabase SQL Editor

-- Allow volunteers to insert their own profile row
CREATE POLICY "Volunteers can insert their own profile"
  ON public.volunteer_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow organizations to insert their own profile row
CREATE POLICY "Organizations can insert their own profile"
  ON public.organizations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
