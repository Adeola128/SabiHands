-- Add closed status to gigs if it's an enum, otherwise just a constraint update if needed.
-- Since Supabase typically uses text for status, we might not need to strictly alter an ENUM type,
-- but let's make sure we track email reminders on applications.

ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS email_reminders_sent JSONB DEFAULT '[]'::jsonb;
