-- SabiHands Supabase Schema (Phase B1)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUMS
DO $$ BEGIN CREATE TYPE public.user_role AS ENUM ('volunteer', 'organization', 'admin'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.gig_type AS ENUM ('skilled', 'physical'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'declined', 'withdrawn'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.membership_status AS ENUM ('active', 'past_due', 'canceled'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE public.channel_type AS ENUM ('email', 'sms', 'in_app'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- TABLES

-- 1. Users (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'volunteer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Volunteer Profiles
CREATE TABLE IF NOT EXISTS public.volunteer_profiles (
  user_id UUID REFERENCES public.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT,
  location TEXT,
  interests TEXT[], -- Array of strings
  bio TEXT
);

-- 3. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  name TEXT NOT NULL,
  org_type TEXT,
  cac_number TEXT,
  verification_status verification_status DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE
);

-- 4. Gigs
CREATE TABLE IF NOT EXISTS public.gigs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type gig_type NOT NULL,
  schedule_type TEXT,
  location TEXT,
  date_start TIMESTAMP WITH TIME ZONE,
  date_end TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Applications
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  gig_id UUID REFERENCES public.gigs(id) NOT NULL,
  volunteer_id UUID REFERENCES public.users(id) NOT NULL,
  status application_status DEFAULT 'pending',
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  decided_at TIMESTAMP WITH TIME ZONE
);

-- 6. Attendance
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  application_id UUID REFERENCES public.applications(id) NOT NULL,
  confirmed_by UUID REFERENCES public.users(id) NOT NULL,
  attended BOOLEAN NOT NULL DEFAULT FALSE,
  hours INTEGER DEFAULT 0,
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Certificates
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attendance_id UUID REFERENCES public.attendance(id) NOT NULL,
  volunteer_id UUID REFERENCES public.users(id) NOT NULL,
  gig_id UUID REFERENCES public.gigs(id) NOT NULL,
  verification_code TEXT UNIQUE NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- 8. Memberships
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) NOT NULL,
  plan TEXT NOT NULL,
  status membership_status DEFAULT 'active',
  provider_customer_id TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE
);

-- 9. Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  membership_id UUID REFERENCES public.memberships(id) NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'NGN',
  provider_reference TEXT UNIQUE,
  status TEXT DEFAULT 'pending',
  paid_at TIMESTAMP WITH TIME ZONE
);

-- 10. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  type TEXT NOT NULL,
  channel channel_type NOT NULL,
  payload JSONB NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- 11. Audit Log
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  actor_id UUID REFERENCES public.users(id), -- Nullable for system actions
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Community Posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. Community Comments
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. Community Likes
CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 15. Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user1_id UUID REFERENCES public.users(id) NOT NULL,
  user2_id UUID REFERENCES public.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user1_id, user2_id)
);

-- 16. Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable Realtime for messages
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN others THEN null; -- Might already be added or fail locally
END $$;

-- Basic RLS Rules (to be expanded based on exact business logic)

-- Users can read their own user record
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Volunteer profiles
CREATE POLICY "Volunteers can view their own profile" ON public.volunteer_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Volunteers can update their own profile" ON public.volunteer_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Volunteers can insert their own profile" ON public.volunteer_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Organizations
CREATE POLICY "Organizations can view their own profile" ON public.organizations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Organizations can update their own profile" ON public.organizations
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Organizations can insert their own profile" ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Anyone can read published gigs
CREATE POLICY "Anyone can read gigs" ON public.gigs
  FOR SELECT USING (status = 'published');

-- Organizations can manage their own gigs
CREATE POLICY "Organizations can manage own gigs" ON public.gigs
  FOR ALL USING (organization_id IN (
    SELECT id FROM public.organizations WHERE user_id = auth.uid()
  ));

-- Volunteers can view and create their own applications
CREATE POLICY "Volunteers manage own applications" ON public.applications
  FOR ALL USING (volunteer_id = auth.uid());

-- Organizations can view applications for their gigs
CREATE POLICY "Organizations view applications for their gigs" ON public.applications
  FOR SELECT USING (gig_id IN (
    SELECT id FROM public.gigs WHERE organization_id IN (
      SELECT id FROM public.organizations WHERE user_id = auth.uid()
    )
  ));

-- Community features are public to all logged in users
CREATE POLICY "Anyone can read community posts" ON public.community_posts
  FOR SELECT USING (true);
CREATE POLICY "Users can create community posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own community posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own community posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Anyone can read community comments" ON public.community_comments
  FOR SELECT USING (true);
CREATE POLICY "Users can create community comments" ON public.community_comments
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Anyone can read community likes" ON public.community_likes
  FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON public.community_likes
  FOR ALL USING (auth.uid() = user_id);

-- Conversations and Messages RLS
CREATE POLICY "Users can read own conversations" ON public.conversations
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create conversations" ON public.conversations
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update own conversations" ON public.conversations
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can read conversation messages" ON public.messages
  FOR SELECT USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages (read status)" ON public.messages
  FOR UPDATE USING (
    conversation_id IN (
      SELECT id FROM public.conversations WHERE user1_id = auth.uid() OR user2_id = auth.uid()
    )
  );

-- Helper function to bypass RLS for role checks (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.get_user_role(check_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::text FROM public.users WHERE id = check_id;
$$;

-- ADMIN POLICIES (Bypass RLS for admins)
CREATE POLICY "Admins can read all users" ON public.users FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Admins can read all volunteer_profiles" ON public.volunteer_profiles FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Admins can read all organizations" ON public.organizations FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Admins can read all gigs" ON public.gigs FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Admins can read all applications" ON public.applications FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Admins can read all attendance" ON public.attendance FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Admins can read all certificates" ON public.certificates FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Admins can read all memberships" ON public.memberships FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'admin'
);
CREATE POLICY "Admins can read all payments" ON public.payments FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'admin'
);

-- Trigger to automatically create a public.users row and corresponding profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  assigned_role public.user_role;
  raw_name TEXT;
BEGIN
  -- Safely extract role, fallback to volunteer if missing
  IF new.raw_user_meta_data->>'role' IS NOT NULL THEN
    assigned_role := (new.raw_user_meta_data->>'role')::public.user_role;
  ELSE
    assigned_role := 'volunteer'::public.user_role;
  END IF;

  raw_name := COALESCE(new.raw_user_meta_data->>'full_name', 'User');

  -- 1. Insert into public.users
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, assigned_role);
  
  -- 2. Insert into the appropriate profile table
  IF assigned_role = 'volunteer' THEN
    INSERT INTO public.volunteer_profiles (user_id, full_name, interests)
    VALUES (
      new.id, 
      raw_name,
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(new.raw_user_meta_data->'interests', '[]'::jsonb)))
    );
  ELSIF assigned_role = 'organization' THEN
    INSERT INTO public.organizations (user_id, name, org_type, cac_number)
    VALUES (
      new.id, 
      raw_name,
      new.raw_user_meta_data->>'org_type',
      new.raw_user_meta_data->>'cac_number'
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Certificate Engine: Automatically generate certificates when attendance is confirmed
CREATE OR REPLACE FUNCTION public.issue_certificate_on_attendance()
RETURNS trigger AS $$
DECLARE
  v_volunteer_id UUID;
  v_gig_id UUID;
  v_code TEXT;
BEGIN
  -- Only trigger if attendance is marked as true
  IF NEW.attended = true AND (TG_OP = 'INSERT' OR OLD.attended = false) THEN
    
    -- Fetch the application details to get volunteer and gig IDs
    SELECT volunteer_id, gig_id INTO v_volunteer_id, v_gig_id
    FROM public.applications
    WHERE id = NEW.application_id;

    -- Generate a unique, readable verification code (e.g. SH-A8B9C2D1)
    v_code := 'SH-' || upper(substring(replace(uuid_generate_v4()::text, '-', '') from 1 for 8));

    -- Insert the certificate
    INSERT INTO public.certificates (attendance_id, volunteer_id, gig_id, verification_code)
    VALUES (NEW.id, v_volunteer_id, v_gig_id, v_code)
    ON CONFLICT DO NOTHING; -- Prevents duplicates if somehow triggered twice

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_issue_certificate ON public.attendance;
CREATE TRIGGER trigger_issue_certificate
  AFTER INSERT OR UPDATE ON public.attendance
  FOR EACH ROW EXECUTE PROCEDURE public.issue_certificate_on_attendance();

-- =========================================================================
-- EDGE FUNCTIONS & WEBHOOKS
-- =========================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pg_net";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Webhook Trigger for Welcome Email (Volunteer Profile Creation)
CREATE OR REPLACE FUNCTION public.webhook_email_welcome()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://menijtrnjpdwevmpkvjx.supabase.co/functions/v1/email-welcome',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer sb_publishable_GiBXJ8nKj3Zw5p8fFK3-wA_rIbjr95h"}'::jsonb,
    body := json_build_object('type', TG_OP, 'record', row_to_json(NEW))::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_webhook_email_welcome ON public.volunteer_profiles;
CREATE TRIGGER trigger_webhook_email_welcome
  AFTER INSERT ON public.volunteer_profiles
  FOR EACH ROW EXECUTE PROCEDURE public.webhook_email_welcome();

-- Webhook Trigger for New Gig Email
CREATE OR REPLACE FUNCTION public.webhook_email_new_gig()
RETURNS trigger AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://menijtrnjpdwevmpkvjx.supabase.co/functions/v1/email-new-gig',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer sb_publishable_GiBXJ8nKj3Zw5p8fFK3-wA_rIbjr95h"}'::jsonb,
    body := json_build_object('type', TG_OP, 'record', row_to_json(NEW), 'old_record', row_to_json(OLD))::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_webhook_email_new_gig ON public.gigs;
CREATE TRIGGER trigger_webhook_email_new_gig
  AFTER INSERT OR UPDATE ON public.gigs
  FOR EACH ROW EXECUTE PROCEDURE public.webhook_email_new_gig();

-- Set up pg_cron jobs for daily emails
SELECT cron.schedule('daily_email_onboarding', '0 9 * * *', $$
  SELECT net.http_post(
    url := 'https://menijtrnjpdwevmpkvjx.supabase.co/functions/v1/email-onboarding',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer sb_publishable_GiBXJ8nKj3Zw5p8fFK3-wA_rIbjr95h"}'::jsonb
  );
$$);

SELECT cron.schedule('daily_email_recommendations', '0 10 * * *', $$
  SELECT net.http_post(
    url := 'https://menijtrnjpdwevmpkvjx.supabase.co/functions/v1/email-recommendations',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer sb_publishable_GiBXJ8nKj3Zw5p8fFK3-wA_rIbjr95h"}'::jsonb
  );
$$);
