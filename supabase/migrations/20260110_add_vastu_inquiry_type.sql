-- Migration: Add Vastu Consultation to Inquiry Types
-- Purpose: Update check constraints to allow 'vastu_consultation' in inquiries and access control
-- Date: 2026-01-10

DO $$
DECLARE
    constraint_record RECORD;
BEGIN
    -- 1. Update public.inquiries
    -- Drop existing check constraint if it exists (handling both auto-generated and named constraints)
    FOR constraint_record IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.inquiries'::regclass 
        AND contype = 'c' 
        AND (
            conname = 'inquiries_inquiry_type_check' 
            OR pg_get_constraintdef(oid) LIKE '%inquiry_type%'
        )
    ) LOOP
        EXECUTE 'ALTER TABLE public.inquiries DROP CONSTRAINT ' || constraint_record.conname;
    END LOOP;

    -- Add new constraint including vastu_consultation
    ALTER TABLE public.inquiries
    ADD CONSTRAINT inquiries_inquiry_type_check
    CHECK (inquiry_type IN ('property', 'home_loan', 'interior_design', 'vastu_consultation'));

    -- 2. Update public.crm_inquiry_access
    -- Drop existing check constraint if it exists
    FOR constraint_record IN (
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'public.crm_inquiry_access'::regclass 
        AND contype = 'c' 
        AND pg_get_constraintdef(oid) LIKE '%inquiry_type%'
    ) LOOP
        EXECUTE 'ALTER TABLE public.crm_inquiry_access DROP CONSTRAINT ' || constraint_record.conname;
    END LOOP;

    -- Add new constraint including vastu_consultation
    ALTER TABLE public.crm_inquiry_access
    ADD CONSTRAINT crm_inquiry_access_inquiry_type_check
    CHECK (inquiry_type IN ('property', 'home_loan', 'interior_design', 'vastu_consultation'));
    
    -- Update comment on columns to reflect new type
    COMMENT ON COLUMN public.inquiries.inquiry_type IS 'Type of inquiry: property (default), home_loan, interior_design, or vastu_consultation';
    COMMENT ON COLUMN public.crm_inquiry_access.inquiry_type IS 'Type of inquiry: property, home_loan, interior_design, or vastu_consultation';

END $$;
