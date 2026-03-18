-- Migration: Fix staff CRM update permissions
-- Description: Ensures staff can properly update CRM client fields for sheets they have access to.
-- Also grants INSERT permission for staff on crm_clients so they can add clients to their sheets.

-- Drop and recreate the staff UPDATE policy to ensure it's properly configured
DROP POLICY IF EXISTS "Staff can update accessible clients" ON public.crm_clients;

CREATE POLICY "Staff can update accessible clients"
    ON public.crm_clients
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.crm_sheet_access 
            WHERE sheet_id = crm_clients.sheet_id 
            AND staff_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.crm_sheet_access 
            WHERE sheet_id = crm_clients.sheet_id 
            AND staff_id = auth.uid()
        )
    );

-- Also add INSERT policy for staff so they can add clients to their sheets
DROP POLICY IF EXISTS "Staff can insert clients to accessible sheets" ON public.crm_clients;

CREATE POLICY "Staff can insert clients to accessible sheets"
    ON public.crm_clients
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.crm_sheet_access 
            WHERE sheet_id = crm_clients.sheet_id 
            AND staff_id = auth.uid()
        )
    );

-- Ensure all necessary grants are in place for the authenticated role
GRANT SELECT, INSERT, UPDATE ON public.crm_clients TO authenticated;
GRANT SELECT ON public.crm_sheet_access TO authenticated;
GRANT SELECT ON public.crm_sheets TO authenticated;
