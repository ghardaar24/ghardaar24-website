-- Add rera_possession field to properties table
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS rera_possession TEXT;
