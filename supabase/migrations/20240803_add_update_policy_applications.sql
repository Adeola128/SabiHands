-- Add UPDATE policy so organizations can change the status of applications
CREATE POLICY "Organizations update applications for their gigs" ON public.applications
    FOR UPDATE USING (gig_id IN (
      SELECT id FROM public.gigs WHERE organization_id IN (
        SELECT id FROM public.organizations WHERE user_id = auth.uid()
      )
    ));
