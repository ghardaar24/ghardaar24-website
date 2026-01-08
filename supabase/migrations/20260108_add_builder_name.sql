-- Migration: Add Builder/Developer Name to Properties
-- Description: Adds builder_name column to properties table for storing builder/developer information.

-- Add builder_name column
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS builder_name TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.properties.builder_name IS 'Name of the builder or developer of the property';
