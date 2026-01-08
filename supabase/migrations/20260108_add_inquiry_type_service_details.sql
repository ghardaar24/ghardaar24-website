-- Migration: Add inquiry_type and service_details columns to inquiries table
-- Purpose: Support Home Loan and Interior Design consultation forms
-- Date: 2026-01-08

-- Add inquiry_type column to categorize inquiries
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS inquiry_type TEXT DEFAULT 'property';

-- Add check constraint for valid inquiry types
DO $$ 
BEGIN
    -- Only add constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'inquiries_inquiry_type_check'
    ) THEN
        ALTER TABLE public.inquiries 
        ADD CONSTRAINT inquiries_inquiry_type_check 
        CHECK (inquiry_type IN ('property', 'home_loan', 'interior_design'));
    END IF;
END $$;

-- Add service_details JSONB column for storing service-specific form data
ALTER TABLE public.inquiries 
ADD COLUMN IF NOT EXISTS service_details JSONB DEFAULT '{}';

-- Create index on inquiry_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_inquiries_inquiry_type 
ON public.inquiries(inquiry_type);

-- Add comment for documentation
COMMENT ON COLUMN public.inquiries.inquiry_type IS 'Type of inquiry: property (default), home_loan, or interior_design';
COMMENT ON COLUMN public.inquiries.service_details IS 'JSONB field storing service-specific form data (e.g., loan amount for home loans, budget range for interior design)';
