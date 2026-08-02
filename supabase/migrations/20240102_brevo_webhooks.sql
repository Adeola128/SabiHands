-- Enable pg_net for HTTP requests if not enabled
CREATE EXTENSION IF NOT EXISTS pg_net;
-- Enable pg_cron for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

----------------------------------------------------------
-- 1. Webhook for Welcome Email (Triggered on volunteer profile insert)
----------------------------------------------------------

-- Replace with your actual project URL and anon key (or service key for Edge Functions)
-- In production, configure webhooks via the Supabase Dashboard UI for easier management.
-- Below is the manual SQL approach using pg_net.

CREATE OR REPLACE FUNCTION public.invoke_email_welcome_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- We assume Edge Function URL is structured as:
  -- https://<project-ref>.supabase.co/functions/v1/email-welcome
  
  -- Since we don't have the project ref dynamically here, the recommended way
  -- to set up Webhooks is via the Supabase Dashboard -> Database -> Webhooks.
  
  -- For local testing using pg_net (assuming local supabase running on port 54321):
  PERFORM net.http_post(
    url := 'http://host.docker.internal:54321/functions/v1/email-welcome',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}',
    body := json_build_object(
      'type', 'INSERT',
      'table', 'volunteer_profiles',
      'record', row_to_json(NEW)
    )::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for Welcome Email
DROP TRIGGER IF EXISTS trigger_email_welcome ON public.volunteer_profiles;
CREATE TRIGGER trigger_email_welcome
  AFTER INSERT ON public.volunteer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.invoke_email_welcome_webhook();


----------------------------------------------------------
-- 2. Webhook for New Gig Alerts (Triggered on gig insert/update to published)
----------------------------------------------------------

CREATE OR REPLACE FUNCTION public.invoke_email_new_gig_webhook()
RETURNS TRIGGER AS $$
BEGIN
  -- For local testing using pg_net:
  PERFORM net.http_post(
    url := 'http://host.docker.internal:54321/functions/v1/email-new-gig',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}',
    body := json_build_object(
      'type', TG_OP,
      'table', 'gigs',
      'record', row_to_json(NEW),
      'old_record', row_to_json(OLD)
    )::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for New Gig
DROP TRIGGER IF EXISTS trigger_email_new_gig ON public.gigs;
CREATE TRIGGER trigger_email_new_gig
  AFTER INSERT OR UPDATE ON public.gigs
  FOR EACH ROW
  EXECUTE FUNCTION public.invoke_email_new_gig_webhook();


----------------------------------------------------------
-- 3. Scheduled Cron Jobs (pg_cron)
----------------------------------------------------------
-- Note: Replace 'http://host.docker.internal:54321' with your production URL 
-- and include the proper Authorization Bearer token header.

-- Daily Onboarding Reminders at 9:00 AM (0 9 * * *)
SELECT cron.schedule(
  'email-onboarding-daily',
  '0 9 * * *',
  $$
    SELECT net.http_post(
        url:='http://host.docker.internal:54321/functions/v1/email-onboarding',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Weekly Recommendations on Monday at 10:00 AM (0 10 * * 1)
SELECT cron.schedule(
  'email-recommendations-weekly',
  '0 10 * * 1',
  $$
    SELECT net.http_post(
        url:='http://host.docker.internal:54321/functions/v1/email-recommendations',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_ANON_KEY"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);
