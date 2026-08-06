-- 1. Function and Trigger for email-submission-received
CREATE OR REPLACE FUNCTION public.invoke_email_submission_received()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://menijtrnjpdwevmpkvjx.supabase.co/functions/v1/email-submission-received',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := json_build_object(
      'type', 'INSERT',
      'table', 'submissions',
      'record', row_to_json(NEW)
    )::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_email_submission_received ON public.submissions;
CREATE TRIGGER trigger_email_submission_received
  AFTER INSERT ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.invoke_email_submission_received();


-- 2. Function and Trigger for email-submission-reviewed
CREATE OR REPLACE FUNCTION public.invoke_email_submission_reviewed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != OLD.status THEN
    PERFORM net.http_post(
      url := 'https://menijtrnjpdwevmpkvjx.supabase.co/functions/v1/email-submission-reviewed',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body := json_build_object(
        'type', 'UPDATE',
        'table', 'submissions',
        'record', row_to_json(NEW),
        'old_record', row_to_json(OLD)
      )::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_email_submission_reviewed ON public.submissions;
CREATE TRIGGER trigger_email_submission_reviewed
  AFTER UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION public.invoke_email_submission_reviewed();


-- 3. Function and Trigger for email-certificate-issued
CREATE OR REPLACE FUNCTION public.invoke_email_certificate_issued()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://menijtrnjpdwevmpkvjx.supabase.co/functions/v1/email-certificate-issued',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := json_build_object(
      'type', 'INSERT',
      'table', 'certificates',
      'record', row_to_json(NEW)
    )::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_email_certificate_issued ON public.certificates;
CREATE TRIGGER trigger_email_certificate_issued
  AFTER INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.invoke_email_certificate_issued();


-- 4. Function and Trigger for email-org-approved
CREATE OR REPLACE FUNCTION public.invoke_email_org_approved()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    PERFORM net.http_post(
      url := 'https://menijtrnjpdwevmpkvjx.supabase.co/functions/v1/email-org-approved',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body := json_build_object(
        'type', 'UPDATE',
        'table', 'organizations',
        'record', row_to_json(NEW),
        'old_record', row_to_json(OLD)
      )::jsonb
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_email_org_approved ON public.organizations;
CREATE TRIGGER trigger_email_org_approved
  AFTER UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.invoke_email_org_approved();
