-- Migration: Add Staff Self-Update RLS Policy
-- Description: Allows staff members to update their own profile (needed for profile picture uploads)

CREATE POLICY "Staff can update own profile"
    ON public.crm_staff
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
