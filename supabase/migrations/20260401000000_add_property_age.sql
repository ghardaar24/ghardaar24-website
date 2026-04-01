-- Add property_age column for resale properties
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS property_age TEXT;
