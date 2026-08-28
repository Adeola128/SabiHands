-- Add hours_required to gigs table
ALTER TABLE public.gigs ADD COLUMN IF NOT EXISTS hours_required INTEGER NOT NULL DEFAULT 0;

-- Ensure attendance table has an hours column (if it doesn't already)
-- Note: the application assumes attendance.hours exists (used in MarkAttendance.tsx and MyCertificates.tsx)
-- Just to be safe, we will add it if it doesn't exist, though it likely does.
ALTER TABLE public.attendance ADD COLUMN IF NOT EXISTS hours INTEGER NOT NULL DEFAULT 0;
