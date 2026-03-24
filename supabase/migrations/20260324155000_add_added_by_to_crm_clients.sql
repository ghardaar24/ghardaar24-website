-- Migration: Add added_by to CRM Clients
-- Description: Adds added_by column to track who uploaded the lead, and updates RLS policies so staff can manage their personal leads.

-- Add added_by column
ALTER TABLE public.crm_clients 
ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES public.crm_staff(id) ON DELETE SET NULL;

-- Update SELECT policy
DROP POLICY IF EXISTS "Staff can read accessible clients" ON public.crm_clients;
CREATE POLICY "Staff can read accessible clients"
    ON public.crm_clients
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.crm_sheet_access 
            WHERE sheet_id = crm_clients.sheet_id 
            AND staff_id = auth.uid()
        )
        OR
        added_by = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Update UPDATE policy
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
        OR
        added_by = auth.uid()
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.crm_sheet_access 
            WHERE sheet_id = crm_clients.sheet_id 
            AND staff_id = auth.uid()
        )
        OR
        added_by = auth.uid()
    );

-- Update INSERT policy
DROP POLICY IF EXISTS "Staff can insert clients to accessible sheets" ON public.crm_clients;
CREATE POLICY "Staff can insert clients to accessible sheets"
    ON public.crm_clients
    FOR INSERT
    WITH CHECK (
        (sheet_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.crm_sheet_access 
            WHERE sheet_id = crm_clients.sheet_id 
            AND staff_id = auth.uid()
        ))
        OR
        (sheet_id IS NULL AND added_by = auth.uid())
    );
