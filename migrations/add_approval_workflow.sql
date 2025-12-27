-- Migration: Add approval workflow columns to properties table
-- Run this in Supabase SQL Editor

-- Add approval workflow columns
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES user_profiles(id),
ADD COLUMN IF NOT EXISTS submission_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approval_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for faster filtering by approval status
CREATE INDEX IF NOT EXISTS idx_properties_approval_status ON properties(approval_status);

-- Verify the changes
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name IN ('approval_status', 'submitted_by', 'submission_date', 'approval_date', 'rejection_reason');
