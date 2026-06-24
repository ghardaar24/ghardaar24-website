-- ============================================================================
-- SECURITY FIXES
-- ============================================================================

-- Fix 1: Change approval_status default from 'approved' to 'pending'
-- Prevents any authenticated user from auto-publishing properties on INSERT
ALTER TABLE public.properties
  ALTER COLUMN approval_status SET DEFAULT 'pending';

-- Fix 2: Remove open user_profiles SELECT policy (USING true exposes all rows to anon)
DROP POLICY IF EXISTS "Public can check phone and email uniqueness" ON public.user_profiles;

-- Create SECURITY DEFINER functions for uniqueness checks during signup
CREATE OR REPLACE FUNCTION public.check_phone_exists(p_phone TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE phone = p_phone);
$$;

CREATE OR REPLACE FUNCTION public.check_email_exists(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS(SELECT 1 FROM public.user_profiles WHERE email = p_email);
$$;

GRANT EXECUTE ON FUNCTION public.check_phone_exists(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon, authenticated;

-- Fix 3: Restrict sensitive columns from anon (unauthenticated) users on properties
-- owner_name, owner_phone, owner_email, cp_slab must not be readable without auth
REVOKE SELECT ON TABLE public.properties FROM anon;
GRANT SELECT (
  id, title, description, price, min_price, max_price,
  state, city, area, address,
  property_type, listing_type, featured, status,
  images, video_urls, amenities, brochure_urls,
  land_parcel, towers, floors, config, carpet_area,
  rera_no, rera_possession, possession_status, target_possession, litigation,
  approval_status, submitted_by, submission_date, approval_date, rejection_reason,
  created_at, updated_at, builder_name, floor_plan_url, property_age
) ON TABLE public.properties TO anon;
