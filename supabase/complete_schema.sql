-- =====================================================
-- GHARDAAR24 COMPLETE DATABASE SCHEMA
-- Run this in your Supabase SQL Editor to set up the database
-- =====================================================

-- =====================================================
-- TABLE: admins
-- Stores admin user information
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can only read their own record
CREATE POLICY "Admins can read own record" ON public.admins
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Only service role can insert/update admins
CREATE POLICY "Service role manages admins" ON public.admins
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- TABLE: user_profiles
-- Stores regular user profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Admins can read all profiles
CREATE POLICY "Admins can read all profiles" ON public.user_profiles
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- Policy: Anyone can check if phone/email exists (for signup validation)
CREATE POLICY "Anyone can check phone email" ON public.user_profiles
  FOR SELECT
  USING (true);

-- =====================================================
-- TABLE: properties
-- Stores property listings
-- =====================================================
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  area TEXT NOT NULL,
  address TEXT,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'villa', 'plot', 'commercial')),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent', 'resale')),
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  -- Project Details
  land_parcel NUMERIC,
  towers INTEGER,
  floors TEXT,
  config TEXT,
  carpet_area TEXT,
  -- RERA & Legal Details
  rera_no TEXT,
  possession_status TEXT,
  target_possession TEXT,
  litigation BOOLEAN DEFAULT FALSE,
  -- Brochure
  brochure_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  -- Approval workflow
  approval_status TEXT DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  submission_date TIMESTAMPTZ,
  approval_date TIMESTAMPTZ,
  rejection_reason TEXT,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read approved properties
CREATE POLICY "Anyone can read approved properties" ON public.properties
  FOR SELECT
  USING (approval_status = 'approved');

-- Policy: Users can read their own submitted properties (any status)
CREATE POLICY "Users can read own properties" ON public.properties
  FOR SELECT
  USING (submitted_by = auth.uid());

-- Policy: Users can insert properties (they become pending)
CREATE POLICY "Users can insert properties" ON public.properties
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Admins can read all properties
CREATE POLICY "Admins can read all properties" ON public.properties
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- Policy: Admins can insert properties
CREATE POLICY "Admins can insert properties" ON public.properties
  FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- Policy: Admins can update any property
CREATE POLICY "Admins can update properties" ON public.properties
  FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- Policy: Admins can delete properties
CREATE POLICY "Admins can delete properties" ON public.properties
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- =====================================================
-- TABLE: inquiries
-- Stores property inquiries from users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert inquiries
CREATE POLICY "Anyone can insert inquiries" ON public.inquiries
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can read all inquiries
CREATE POLICY "Admins can read all inquiries" ON public.inquiries
  FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- Policy: Admins can delete inquiries
CREATE POLICY "Admins can delete inquiries" ON public.inquiries
  FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- =====================================================
-- TRIGGER: Auto-create user profile on signup
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name, phone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', ''),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- TRIGGER: Update updated_at timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger to properties
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('brochures', 'brochures', true)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES: property-images bucket
-- =====================================================

-- Anyone can view property images (public read)
CREATE POLICY "Public read property images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'property-images');

-- Authenticated users can upload property images
CREATE POLICY "Authenticated upload property images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images' 
    AND auth.role() = 'authenticated'
  );

-- Admins can update property images
CREATE POLICY "Admins update property images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'property-images' 
    AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  )
  WITH CHECK (
    bucket_id = 'property-images' 
    AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- Admins can delete property images
CREATE POLICY "Admins delete property images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'property-images' 
    AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- =====================================================
-- STORAGE POLICIES: brochures bucket
-- =====================================================

-- Anyone can view brochures (public read)
CREATE POLICY "Public read brochures" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'brochures');

-- Authenticated users can upload brochures
CREATE POLICY "Authenticated upload brochures" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'brochures' 
    AND auth.role() = 'authenticated'
  );

-- Admins can update brochures
CREATE POLICY "Admins update brochures" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'brochures' 
    AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  )
  WITH CHECK (
    bucket_id = 'brochures' 
    AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- Admins can delete brochures
CREATE POLICY "Admins delete brochures" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'brochures' 
    AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
  );

-- =====================================================
-- INSERT YOUR ADMIN USER
-- Replace 'your-admin-user-id' with actual UUID from auth.users
-- =====================================================
-- INSERT INTO public.admins (id, email, name)
-- VALUES ('your-admin-user-id', 'admin@ghardaar24.com', 'Admin')
-- ON CONFLICT (id) DO NOTHING;
