-- Migration: Allow admins to create their own site visits
-- Description: Makes staff_id nullable, adds admin_id column, and adds storage upload policy for admins

-- ============================================================================
-- ALTER SITE VISITS TABLE
-- ============================================================================

-- Make staff_id nullable (admin visits won't have a staff reference)
ALTER TABLE public.site_visits ALTER COLUMN staff_id DROP NOT NULL;

-- Add admin_id column for admin-created visits
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES public.admins(id) ON DELETE SET NULL;

-- Ensure every visit is attributed to either staff or admin
ALTER TABLE public.site_visits ADD CONSTRAINT site_visits_owner_check
    CHECK (staff_id IS NOT NULL OR admin_id IS NOT NULL);

-- Index for admin visits
CREATE INDEX IF NOT EXISTS idx_site_visits_admin_id ON public.site_visits(admin_id) WHERE admin_id IS NOT NULL;

-- ============================================================================
-- STORAGE POLICY FOR ADMIN UPLOADS
-- ============================================================================

-- Allow admins to upload site visit photos
CREATE POLICY "Admins can upload site visit photos"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'site-visit-photos'
        AND EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );
