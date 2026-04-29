-- Migration: Allow staff to read all CRM clients
-- Description: Gives active staff read-only access to all CRM client rows so full call history can be viewed across sheets.

DROP POLICY IF EXISTS "Staff can read accessible clients" ON public.crm_clients;
DROP POLICY IF EXISTS "Staff can read all CRM clients" ON public.crm_clients;

CREATE POLICY "Staff can read all CRM clients"
    ON public.crm_clients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.crm_staff
            WHERE id = auth.uid()
              AND is_active = true
        )
        OR EXISTS (
            SELECT 1
            FROM public.admins
            WHERE id = auth.uid()
        )
    );
