-- Seed data for Ralvo Platform
-- This file provides a baseline organization, gigs, and volunteer profiles for local development and testing.

-- Insert test users into auth.users (requires uuid extension)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'org@ralvo.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test Organization","user_type":"organization"}', now(), now(), '', '', '', ''),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'volunteer@ralvo.com', crypt('password123', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Test Volunteer","user_type":"volunteer"}', now(), now(), '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Insert organization profile
INSERT INTO public.organizations (id, user_id, name, slug, org_type, location, contact_email, bio, verification_status)
VALUES
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Test Organization', 'test-org', 'NGO', 'Lagos, Nigeria', 'org@ralvo.com', 'We are a test organization focused on environmental sustainability.', 'verified')
ON CONFLICT (user_id) DO NOTHING;

-- Insert volunteer profile
INSERT INTO public.volunteer_profiles (user_id, full_name, bio, location, skills)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Test Volunteer', 'I am a passionate volunteer looking to make a difference.', 'Lagos, Nigeria', ARRAY['Community Service', 'Event Planning'])
ON CONFLICT (user_id) DO NOTHING;

-- Insert gig
INSERT INTO public.gigs (id, organization_id, title, description, location, type, date_start, date_end, status)
VALUES
  ('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 'Beach Cleanup Drive', 'Join us for a massive beach cleanup this weekend.', 'Elegushi Beach, Lagos', 'physical', now() + interval '2 days', now() + interval '2 days' + interval '4 hours', 'published')
ON CONFLICT (id) DO NOTHING;

-- Insert application
INSERT INTO public.applications (id, gig_id, volunteer_id, status, pitch)
VALUES
  ('66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'accepted', 'I would love to help clean the beach!')
ON CONFLICT (id) DO NOTHING;
