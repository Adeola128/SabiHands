-- Create organization_followers table
CREATE TABLE IF NOT EXISTS public.organization_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    volunteer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(organization_id, volunteer_id)
);

-- Set up RLS
ALTER TABLE public.organization_followers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read followers
CREATE POLICY "Anyone can view followers"
    ON public.organization_followers
    FOR SELECT
    USING (true);

-- Policy: Volunteers can follow organizations
CREATE POLICY "Volunteers can follow organizations"
    ON public.organization_followers
    FOR INSERT
    WITH CHECK (auth.uid() = volunteer_id);

-- Policy: Volunteers can unfollow organizations
CREATE POLICY "Volunteers can unfollow organizations"
    ON public.organization_followers
    FOR DELETE
    USING (auth.uid() = volunteer_id);
