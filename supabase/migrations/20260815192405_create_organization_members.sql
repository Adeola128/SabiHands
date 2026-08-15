CREATE TABLE public.organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, 
    invited_email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
    invite_token UUID DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(organization_id, invited_email)
);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their organizations" 
ON public.organization_members
FOR SELECT 
USING (
    auth.uid() IN (SELECT user_id FROM public.organizations WHERE id = organization_id)
    OR 
    auth.uid() IN (SELECT user_id FROM public.organization_members WHERE organization_id = organization_members.organization_id AND status = 'active')
);

CREATE POLICY "Admins and Owners can insert members" 
ON public.organization_members
FOR INSERT 
WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.organizations WHERE id = organization_id)
    OR 
    auth.uid() IN (SELECT user_id FROM public.organization_members WHERE organization_id = organization_members.organization_id AND status = 'active' AND role IN ('owner', 'admin'))
);

CREATE POLICY "Admins can update members or self can accept invite" 
ON public.organization_members
FOR UPDATE
USING (
    auth.uid() IN (SELECT user_id FROM public.organizations WHERE id = organization_id)
    OR 
    auth.uid() IN (SELECT user_id FROM public.organization_members WHERE organization_id = organization_members.organization_id AND status = 'active' AND role IN ('owner', 'admin'))
    OR 
    (auth.uid() = user_id) 
);

CREATE POLICY "Admins can delete members" 
ON public.organization_members
FOR DELETE
USING (
    auth.uid() IN (SELECT user_id FROM public.organizations WHERE id = organization_id)
    OR 
    auth.uid() IN (SELECT user_id FROM public.organization_members WHERE organization_id = organization_members.organization_id AND status = 'active' AND role IN ('owner', 'admin'))
);
