-- ============================================================================
-- GHARDAAR24 - SUPABASE DATABASE SCHEMA
-- ============================================================================
-- This schema includes all tables, RLS policies, triggers, and storage buckets
-- for the Ghardaar24 real estate platform.
-- ============================================================================

-- ============================================================================
-- 1. ADMINS TABLE
-- ============================================================================
-- Stores admin user profiles linked to auth.users

CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Admins can read their own profile
CREATE POLICY "Admins can read own profile"
    ON public.admins
    FOR SELECT
    USING (auth.uid() = id);

-- Admins can update their own profile
CREATE POLICY "Admins can update own profile"
    ON public.admins
    FOR UPDATE
    USING (auth.uid() = id);

-- ============================================================================
-- 2. USER PROFILES TABLE
-- ============================================================================
-- Stores regular user profiles linked to auth.users

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
    ON public.user_profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.user_profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.user_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Admins can read all profiles (for leads management)
CREATE POLICY "Admins can read all profiles"
    ON public.user_profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Allow public to check phone/email uniqueness during signup
CREATE POLICY "Public can check phone and email uniqueness"
    ON public.user_profiles
    FOR SELECT
    USING (true);

-- ============================================================================
-- 3. LOCATIONS TABLE
-- ============================================================================
-- Stores active state/city combinations for location dropdowns

CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(state, city)
);

-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- Anyone can read active locations
CREATE POLICY "Anyone can read active locations"
    ON public.locations
    FOR SELECT
    USING (is_active = true);

-- Admins can manage locations
CREATE POLICY "Admins can manage locations"
    ON public.locations
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- ============================================================================
-- 4. PROPERTIES TABLE
-- ============================================================================
-- Stores all property listings

CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    price BIGINT NOT NULL,
    
    -- Location Details
    state TEXT,
    city TEXT,
    area TEXT NOT NULL,
    address TEXT NOT NULL,
    
    -- Property Features
    bedrooms INTEGER DEFAULT 0,
    bathrooms INTEGER DEFAULT 0,
    property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'villa', 'plot', 'commercial')),
    listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent', 'resale')),
    featured BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'active',
    
    -- Media
    images TEXT[] DEFAULT '{}',
    video_urls TEXT[] DEFAULT '{}',
    amenities TEXT[] DEFAULT '{}',
    brochure_urls TEXT[] DEFAULT '{}',
    
    -- Project Details
    land_parcel INTEGER DEFAULT 0,
    towers INTEGER DEFAULT 0,
    floors TEXT,
    config TEXT,
    carpet_area TEXT,
    
    -- RERA & Legal Details
    rera_no TEXT,
    possession_status TEXT,
    target_possession TEXT,
    litigation BOOLEAN DEFAULT false,
    
    -- Owner Details (for user submissions)
    owner_name TEXT,
    owner_phone TEXT,
    owner_email TEXT,
    
    -- Approval Workflow
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

-- Anyone can read approved properties
CREATE POLICY "Anyone can read approved properties"
    ON public.properties
    FOR SELECT
    USING (approval_status = 'approved');

-- Users can read their own submitted properties
CREATE POLICY "Users can read own submissions"
    ON public.properties
    FOR SELECT
    USING (auth.uid() = submitted_by);

-- Authenticated users can submit properties
CREATE POLICY "Authenticated users can submit properties"
    ON public.properties
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can manage all properties
CREATE POLICY "Admins can manage all properties"
    ON public.properties
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_properties_approval_status ON public.properties(approval_status);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON public.properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_state_city ON public.properties(state, city);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured);

-- ============================================================================
-- 5. INQUIRIES TABLE
-- ============================================================================
-- Stores property inquiries from contact forms

CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    message TEXT,
    state TEXT,
    city TEXT,
    inquiry_type TEXT DEFAULT 'property' CHECK (inquiry_type IN ('property', 'home_loan', 'interior_design')),
    service_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone can submit inquiries
CREATE POLICY "Anyone can submit inquiries"
    ON public.inquiries
    FOR INSERT
    WITH CHECK (true);

-- Admins can read and manage inquiries
CREATE POLICY "Admins can manage inquiries"
    ON public.inquiries
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Create index for property inquiries
CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON public.inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);

-- ============================================================================
-- 6. DATABASE FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, name, phone, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        NEW.email
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on properties
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
    BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 7. STORAGE BUCKETS
-- ============================================================================

-- Create storage bucket for property images
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for property brochures
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-brochures', 'property-brochures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property-images bucket
CREATE POLICY "Anyone can view property images"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'property-images' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Admins can delete property images"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'property-images'
        AND EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Storage policies for property-brochures bucket
CREATE POLICY "Anyone can view property brochures"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'property-brochures');

CREATE POLICY "Authenticated users can upload property brochures"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'property-brochures' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Admins can delete property brochures"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'property-brochures'
        AND EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Create storage bucket for property videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-videos', 'property-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property-videos bucket
CREATE POLICY "Anyone can view property videos"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'property-videos');

CREATE POLICY "Authenticated users can upload property videos"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'property-videos' 
        AND auth.uid() IS NOT NULL
    );

CREATE POLICY "Admins can delete property videos"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'property-videos'
        AND EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- ============================================================================
-- 8. SEED DATA (Optional - Default Locations)
-- ============================================================================
-- Uncomment below to add default locations

/*
INSERT INTO public.locations (state, city) VALUES
    ('Maharashtra', 'Mumbai'),
    ('Maharashtra', 'Pune'),
    ('Maharashtra', 'Nagpur'),
    ('Karnataka', 'Bangalore'),
    ('Karnataka', 'Mysore'),
    ('Delhi', 'New Delhi'),
    ('Gujarat', 'Ahmedabad'),
    ('Gujarat', 'Surat'),
    ('Tamil Nadu', 'Chennai'),
    ('Telangana', 'Hyderabad')
ON CONFLICT (state, city) DO NOTHING;
*/

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
