-- Migration: Allow staff to read all site visits
-- Description: Updates the RLS policy on site_visits so staff can view the full visit history for clients.

DROP POLICY IF EXISTS "Staff can read own site visits" ON public.site_visits;
DROP POLICY IF EXISTS "Staff can read all site visits" ON public.site_visits;

CREATE POLICY "Staff can read all site visits"
    ON public.site_visits
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.crm_staff WHERE id = auth.uid() AND is_active = true
        )
    );
