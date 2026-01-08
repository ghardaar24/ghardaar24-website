-- Migration: Add Inquiry Access Control for Staff
-- Description: Adds table to link staff members to inquiry types they can access
-- Date: 2026-01-08

-- ============================================================================
-- CRM INQUIRY ACCESS TABLE
-- ============================================================================
-- Links staff to permitted inquiry types

CREATE TABLE IF NOT EXISTS public.crm_inquiry_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES public.crm_staff(id) ON DELETE CASCADE,
    inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('property', 'home_loan', 'interior_design')),
    granted_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(staff_id, inquiry_type)
);

-- Enable RLS
ALTER TABLE public.crm_inquiry_access ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_crm_inquiry_access_staff_id ON public.crm_inquiry_access(staff_id);
CREATE INDEX IF NOT EXISTS idx_crm_inquiry_access_inquiry_type ON public.crm_inquiry_access(inquiry_type);

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Staff can read their own inquiry access entries
CREATE POLICY "Staff can read own inquiry access"
    ON public.crm_inquiry_access
    FOR SELECT
    USING (auth.uid() = staff_id);

-- Admins can manage all inquiry access entries
CREATE POLICY "Admins can manage inquiry access"
    ON public.crm_inquiry_access
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- ============================================================================
-- INQUIRY READ ACCESS FOR STAFF
-- ============================================================================
-- Allow staff to read inquiries based on their inquiry type access

-- Drop existing policy if exists (to avoid conflicts)
DROP POLICY IF EXISTS "Staff can read accessible inquiries" ON public.inquiries;

-- Create policy for staff to read inquiries they have access to
CREATE POLICY "Staff can read accessible inquiries"
    ON public.inquiries
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.crm_inquiry_access 
            WHERE staff_id = auth.uid()
            AND inquiry_type = COALESCE(inquiries.inquiry_type, 'property')
        )
        OR
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Add documentation comments
COMMENT ON TABLE public.crm_inquiry_access IS 'Links staff members to inquiry types they are permitted to view';
COMMENT ON COLUMN public.crm_inquiry_access.inquiry_type IS 'Type of inquiry: property, home_loan, or interior_design';
