-- Seed Script: Generate 5 Personas (3 Volunteers, 2 Organizations)

-- Ensure pgcrypto extension is available for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ 
DECLARE
    -- User UUIDs
    vol1_id UUID := '11111111-1111-1111-1111-111111111111';
    vol2_id UUID := '22222222-2222-2222-2222-222222222222';
    vol3_id UUID := '33333333-3333-3333-3333-333333333333';
    org1_id UUID := '44444444-4444-4444-4444-444444444444';
    org2_id UUID := '55555555-5555-5555-5555-555555555555';
    
    -- Organization UUIDs (for gigs table)
    org_profile_1_id UUID := '44444444-0000-0000-0000-444444444444';
    org_profile_2_id UUID := '55555555-0000-0000-0000-555555555555';
    
    -- Gig UUIDs
    gig1_id UUID := 'a1111111-1111-1111-1111-111111111111';
    gig2_id UUID := 'a2222222-2222-2222-2222-222222222222';
    gig3_id UUID := 'a3333333-3333-3333-3333-333333333333';
    
    -- Community Post UUIDs
    post1_id UUID := 'b1111111-1111-1111-1111-111111111111';
    post2_id UUID := 'b2222222-2222-2222-2222-222222222222';

BEGIN

  -----------------------------------------
  -- 1. Insert into auth.users
  -----------------------------------------
  -- Password for all mock users: Password123!
  INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES
    -- Volunteers
    (vol1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'john@example.com', crypt('Password123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"volunteer"}', NOW(), NOW()),
    (vol2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@example.com', crypt('Password123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"volunteer"}', NOW(), NOW()),
    (vol3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bob@example.com', crypt('Password123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"volunteer"}', NOW(), NOW()),
    
    -- Organizations
    (org1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'techforgood@example.com', crypt('Password123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"organization"}', NOW(), NOW()),
    (org2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ecowarriors@example.com', crypt('Password123!', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"role":"organization"}', NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;

  -----------------------------------------
  -- 2. Insert into public.users
  -----------------------------------------
  INSERT INTO public.users (id, email, role)
  VALUES
    (vol1_id, 'john@example.com', 'volunteer'),
    (vol2_id, 'alice@example.com', 'volunteer'),
    (vol3_id, 'bob@example.com', 'volunteer'),
    (org1_id, 'techforgood@example.com', 'organization'),
    (org2_id, 'ecowarriors@example.com', 'organization')
  ON CONFLICT (id) DO NOTHING;

  -----------------------------------------
  -- 3. Insert Profiles
  -----------------------------------------
  INSERT INTO public.volunteer_profiles (user_id, full_name, phone, location, interests, bio)
  VALUES
    (vol1_id, 'John Doe', '+2348000000001', 'Lagos, Nigeria', ARRAY['technology', 'education'], 'Passionate about teaching kids to code.'),
    (vol2_id, 'Alice Smith', '+2348000000002', 'Abuja, Nigeria', ARRAY['events', 'community'], 'Love organizing events and crowd control.'),
    (vol3_id, 'Bob Johnson', '+2348000000003', 'Port Harcourt, Nigeria', ARRAY['environment', 'health'], 'Environmental activist and volunteer.')
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.organizations (id, user_id, name, org_type, cac_number, verification_status, verified_at)
  VALUES
    (org_profile_1_id, org1_id, 'Tech for Good Nigeria', 'NGO', 'RC123456', 'verified', NOW()),
    (org_profile_2_id, org2_id, 'Eco Warriors', 'Non-profit', 'RC654321', 'verified', NOW())
  ON CONFLICT (id) DO NOTHING;

  -----------------------------------------
  -- 4. Insert Gigs
  -----------------------------------------
  INSERT INTO public.gigs (id, organization_id, title, description, type, location, date_start, date_end, status)
  VALUES
    (gig1_id, org_profile_1_id, 'React Developer for NGO Website', 'We are looking for a passionate React Developer to help build the front-end of our new community engagement platform. You will work closely with our design team to implement responsive interfaces.', 'skilled', 'Remote', NOW() + INTERVAL '2 days', NOW() + INTERVAL '30 days', 'published'),
    (gig2_id, org_profile_1_id, 'Content Writer for Newsletter', 'We need a creative content writer to help curate and write our monthly newsletter updating our sponsors on the impact we are making across local communities.', 'skilled', 'Remote', NOW() + INTERVAL '5 days', NOW() + INTERVAL '10 days', 'published'),
    (gig3_id, org_profile_2_id, 'Beach Cleanup Support', 'Join us for a massive beach cleanup! We need physical volunteers to help us pick up plastic waste and organize the recycling stations.', 'physical', 'Elegushi Beach, Lekki', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days', 'published')
  ON CONFLICT (id) DO NOTHING;

  -----------------------------------------
  -- 5. Insert Applications
  -----------------------------------------
  INSERT INTO public.applications (gig_id, volunteer_id, status)
  VALUES
    -- John applied to React Developer (Approved)
    (gig1_id, vol1_id, 'accepted'),
    -- John applied to Content Writer (Pending)
    (gig2_id, vol1_id, 'pending'),
    
    -- Alice applied to Beach Cleanup (Approved)
    (gig3_id, vol2_id, 'accepted'),
    
    -- Bob applied to React Developer (Declined)
    (gig1_id, vol3_id, 'declined'),
    -- Bob applied to Beach Cleanup (Pending)
    (gig3_id, vol3_id, 'pending')
  ON CONFLICT (id) DO NOTHING;

  -----------------------------------------
  -- 6. Insert Mock Certificates (for John and Alice to have stats)
  -----------------------------------------
  -- Note: We need attendance first
  -- Create dummy attendance for past gigs
  INSERT INTO public.attendance (id, application_id, confirmed_by, attended, hours)
  VALUES
    ('c1111111-1111-1111-1111-111111111111', (SELECT id FROM public.applications WHERE volunteer_id = vol1_id AND gig_id = gig1_id LIMIT 1), org1_id, TRUE, 10),
    ('c2222222-2222-2222-2222-222222222222', (SELECT id FROM public.applications WHERE volunteer_id = vol2_id AND gig_id = gig3_id LIMIT 1), org2_id, TRUE, 5)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.certificates (attendance_id, volunteer_id, gig_id, verification_code)
  VALUES
    ('c1111111-1111-1111-1111-111111111111', vol1_id, gig1_id, 'CERT-JOHN-001'),
    ('c2222222-2222-2222-2222-222222222222', vol2_id, gig3_id, 'CERT-ALICE-001')
  ON CONFLICT (id) DO NOTHING;

  -----------------------------------------
  -- 7. Insert Community Data
  -----------------------------------------
  INSERT INTO public.community_posts (id, author_id, content, image_url, created_at)
  VALUES
    (post1_id, vol1_id, 'Had an amazing time teaching coding at the local community center today! The kids were incredibly bright and eager to learn HTML & CSS. Big thanks to Tech for Good for organizing this gig. Anyone else interested in volunteering for the next cohort? Let me know! 👇', NULL, NOW() - INTERVAL '2 hours'),
    (post2_id, org1_id, 'We are currently looking for 5 dedicated writers to help draft compelling stories about the impact of education in underserved communities. If you have a flair for writing and want to make a difference, check out our latest gig posting!', '/images/automated_certificates_brand.png', NOW() - INTERVAL '1 day')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.community_comments (post_id, author_id, content, created_at)
  VALUES
    (post1_id, vol2_id, 'This is amazing John! Count me in for the next cohort.', NOW() - INTERVAL '1 hour'),
    (post2_id, vol3_id, 'Just applied to the writer gig! I am excited to help tell these stories.', NOW() - INTERVAL '12 hours')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.community_likes (post_id, user_id)
  VALUES
    (post1_id, vol2_id),
    (post1_id, vol3_id),
    (post2_id, vol1_id)
  ON CONFLICT (id) DO NOTHING;

END $$;
