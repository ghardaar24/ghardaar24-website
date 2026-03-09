-- Migration: Add Site Visits Table & Storage
-- Description: Adds the site_visits table for staff to record property visits with photo proof

-- ============================================================================
-- SITE VISITS TABLE
-- ============================================================================
-- Stores staff site visit records with photo proof

CREATE TABLE IF NOT EXISTS public.site_visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Staff Reference
    staff_id UUID NOT NULL REFERENCES public.crm_staff(id) ON DELETE CASCADE,
    
    -- Visit Details
    property_title TEXT NOT NULL,
    location TEXT NOT NULL,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    
    -- Photo Proof
    photo_url TEXT NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

-- Staff can insert their own visits
CREATE POLICY "Staff can insert own site visits"
    ON public.site_visits
    FOR INSERT
    WITH CHECK (
        auth.uid() = staff_id
        AND EXISTS (
            SELECT 1 FROM public.crm_staff WHERE id = auth.uid() AND is_active = true
        )
    );

-- Staff can read their own visits
CREATE POLICY "Staff can read own site visits"
    ON public.site_visits
    FOR SELECT
    USING (
        auth.uid() = staff_id
    );

-- Admins can read all site visits
CREATE POLICY "Admins can read all site visits"
    ON public.site_visits
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Admins can manage all site visits
CREATE POLICY "Admins can manage all site visits"
    ON public.site_visits
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_site_visits_staff_id ON public.site_visits(staff_id);
CREATE INDEX IF NOT EXISTS idx_site_visits_visit_date ON public.site_visits(visit_date DESC);
CREATE INDEX IF NOT EXISTS idx_site_visits_created_at ON public.site_visits(created_at DESC);

-- ============================================================================
-- STORAGE BUCKET FOR SITE VISIT PHOTOS
-- ============================================================================

-- Create storage bucket for site visit photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-visit-photos', 'site-visit-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view site visit photos
CREATE POLICY "Anyone can view site visit photos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'site-visit-photos');

-- Active staff can upload site visit photos
CREATE POLICY "Staff can upload site visit photos"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'site-visit-photos'
        AND EXISTS (
            SELECT 1 FROM public.crm_staff WHERE id = auth.uid() AND is_active = true
        )
    );

-- Admins can delete site visit photos
CREATE POLICY "Admins can delete site visit photos"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'site-visit-photos'
        AND EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );
