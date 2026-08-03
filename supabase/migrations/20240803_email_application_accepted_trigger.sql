-- Migration: Add webhook trigger for sending email when application is accepted

CREATE OR REPLACE FUNCTION public.webhook_email_application_accepted()
RETURNS trigger AS $$
DECLARE
  v_volunteer_email TEXT;
  v_volunteer_name TEXT;
  v_gig_title TEXT;
  v_org_name TEXT;
BEGIN
  -- Only trigger if status changed to 'accepted'
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    
    -- Get Volunteer Email
    SELECT email INTO v_volunteer_email FROM public.users WHERE id = NEW.volunteer_id;
    
    -- Get Volunteer Name
    SELECT full_name INTO v_volunteer_name FROM public.volunteer_profiles WHERE user_id = NEW.volunteer_id;
    
    -- Get Gig Title and Org Name
    SELECT g.title, o.name INTO v_gig_title, v_org_name 
    FROM public.gigs g
    JOIN public.organizations o ON g.organization_id = o.id
    WHERE g.id = NEW.gig_id;

    -- Send to Edge Function
    PERFORM net.http_post(
      url := 'https://menijtrnjpdwevmpkvjx.supabase.co/functions/v1/email-application-accepted',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer sb_publishable_GiBXJ8nKj3Zw5p8fFK3-wA_rIbjr95h"}'::jsonb,
      body := json_build_object(
        'volunteer_email', v_volunteer_email,
        'volunteer_name', COALESCE(v_volunteer_name, 'Volunteer'),
        'gig_title', v_gig_title,
        'org_name', v_org_name
      )::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_webhook_email_application_accepted ON public.applications;
CREATE TRIGGER trigger_webhook_email_application_accepted
  AFTER UPDATE ON public.applications
  FOR EACH ROW EXECUTE PROCEDURE public.webhook_email_application_accepted();
