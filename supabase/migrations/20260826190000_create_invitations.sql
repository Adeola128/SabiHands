-- Drop the table if it already exists (to prevent schema mismatch errors if a partial/old version exists)
DROP TABLE IF EXISTS public.invitations CASCADE;

-- Create invitations table
CREATE TABLE public.invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gig_id UUID NOT NULL REFERENCES public.gigs(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add unique constraint so an org can't spam invite the same volunteer to the same gig multiple times
ALTER TABLE public.invitations ADD CONSTRAINT unique_gig_volunteer_invite UNIQUE (gig_id, volunteer_id);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Policies for Organizations (can insert and select their own invitations)
CREATE POLICY "Organizations can insert their own invitations"
    ON public.invitations FOR INSERT
    WITH CHECK (org_id IN (
        SELECT id FROM public.organizations WHERE user_id = auth.uid()
    ));

CREATE POLICY "Organizations can view their own invitations"
    ON public.invitations FOR SELECT
    USING (org_id IN (
        SELECT id FROM public.organizations WHERE user_id = auth.uid()
    ));

-- Policies for Volunteers (can select and update their own invitations)
CREATE POLICY "Volunteers can view their own invitations"
    ON public.invitations FOR SELECT
    USING (volunteer_id = auth.uid());

CREATE POLICY "Volunteers can update their own invitations"
    ON public.invitations FOR UPDATE
    USING (volunteer_id = auth.uid())
    WITH CHECK (volunteer_id = auth.uid());
