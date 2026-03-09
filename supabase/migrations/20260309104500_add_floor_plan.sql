-- Add floor_plan_url to properties table
ALTER TABLE public.properties ADD COLUMN floor_plan_url TEXT;

-- Remove bedrooms and bathrooms columns as they are no longer required
ALTER TABLE public.properties DROP COLUMN bedrooms;
ALTER TABLE public.properties DROP COLUMN bathrooms;
