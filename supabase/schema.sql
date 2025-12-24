-- =============================================
-- Ghardaar24 - Complete Database Schema
-- Real Estate Platform
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DROP EXISTING TABLES (for clean reinstall)
-- =============================================
-- WARNING: This will delete all existing data!
DROP TABLE IF EXISTS inquiries CASCADE;
DROP TABLE IF EXISTS properties CASCADE;

-- =============================================
-- TABLES
-- =============================================

-- Properties Table
-- Stores all property listings with their details
CREATE TABLE IF NOT EXISTS properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Basic Information
  title TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL,
  
  -- Location
  area TEXT NOT NULL,
  address TEXT NOT NULL,
  
  -- Property Specifications
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  
  -- Property Classification
  property_type TEXT NOT NULL CHECK (property_type IN ('apartment', 'house', 'villa', 'plot', 'commercial')),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent', 'resale')),
  
  -- Images - Array of public URLs from Supabase Storage
  images TEXT[] DEFAULT '{}',
  
  -- Amenities - Array of amenity names
  amenities TEXT[] DEFAULT '{}',
  
  -- Listing Status
  featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'rented', 'inactive')),
  

  
  -- Project Details
  land_parcel INTEGER DEFAULT 0,
  towers INTEGER DEFAULT 0,
  floors TEXT DEFAULT '',
  config TEXT DEFAULT '',
  carpet_area TEXT DEFAULT '',
  
  -- RERA & Legal Details
  rera_no TEXT DEFAULT '',
  possession_status TEXT DEFAULT '',
  target_possession TEXT DEFAULT '',
  litigation BOOLEAN DEFAULT false,
  
  -- Brochure
  brochure_url TEXT DEFAULT '',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inquiries Table
-- Stores contact form submissions from potential buyers/renters
CREATE TABLE IF NOT EXISTS inquiries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Reference to property (nullable for general inquiries)
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Contact Information
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Properties Indexes (for faster queries)
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_properties_area_type_listing 
  ON properties(area, property_type, listing_type);

-- Inquiries Indexes
CREATE INDEX IF NOT EXISTS idx_inquiries_property_id ON inquiries(property_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_is_read ON inquiries(is_read);
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROPERTIES POLICIES
-- =============================================

-- Drop existing policies first (for clean reinstall)
DROP POLICY IF EXISTS "Public can view active properties" ON properties;
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON properties;
DROP POLICY IF EXISTS "Authenticated users can update properties" ON properties;
DROP POLICY IF EXISTS "Authenticated users can delete properties" ON properties;

-- Public: Read all active properties
CREATE POLICY "Public can view active properties"
ON properties FOR SELECT
TO anon, authenticated
USING (status = 'active' OR auth.role() = 'authenticated');

-- Admin: Insert properties
CREATE POLICY "Authenticated users can insert properties"
ON properties FOR INSERT
TO authenticated
WITH CHECK (true);

-- Admin: Update properties
CREATE POLICY "Authenticated users can update properties"
ON properties FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Admin: Delete properties
CREATE POLICY "Authenticated users can delete properties"
ON properties FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- INQUIRIES POLICIES
-- =============================================

-- Drop existing policies first (for clean reinstall)
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON inquiries;
DROP POLICY IF EXISTS "Authenticated users can view inquiries" ON inquiries;
DROP POLICY IF EXISTS "Authenticated users can update inquiries" ON inquiries;
DROP POLICY IF EXISTS "Authenticated users can delete inquiries" ON inquiries;

-- Public: Submit inquiries
CREATE POLICY "Anyone can submit inquiries"
ON inquiries FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Admin: Read all inquiries
CREATE POLICY "Authenticated users can view inquiries"
ON inquiries FOR SELECT
TO authenticated
USING (true);

-- Admin: Update inquiries (mark as read)
CREATE POLICY "Authenticated users can update inquiries"
ON inquiries FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Admin: Delete inquiries
CREATE POLICY "Authenticated users can delete inquiries"
ON inquiries FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger first
DROP TRIGGER IF EXISTS update_properties_updated_at ON properties;

-- Trigger for properties
CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- STORAGE BUCKET SETUP
-- =============================================

-- Create the property-images bucket (public bucket for property images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  5242880, -- 5MB max file size
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Drop existing storage policies first
DROP POLICY IF EXISTS "Public can view property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update property images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete property images" ON storage.objects;

-- Policy: Allow public read access to property images
CREATE POLICY "Public can view property images"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'property-images');

-- Policy: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload property images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-images');

-- Policy: Allow authenticated users to update images
CREATE POLICY "Authenticated users can update property images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-images')
WITH CHECK (bucket_id = 'property-images');

-- Policy: Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete property images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-images');

-- =============================================
-- EXAMPLE QUERIES
-- =============================================
-- 
-- Get all active properties in Mumbai:
-- SELECT * FROM properties WHERE city = 'Mumbai' AND status = 'active';
--
-- Get featured properties:
-- SELECT * FROM properties WHERE featured = true AND status = 'active';
--
-- Get properties with specific amenities:
-- SELECT * FROM properties WHERE 'Swimming Pool' = ANY(amenities);
--
-- Get unread inquiries count:
-- SELECT COUNT(*) FROM inquiries WHERE is_read = false;
--
-- Mark inquiry as read:
-- UPDATE inquiries SET is_read = true WHERE id = 'inquiry-uuid';

-- =============================================
-- MIGRATION: Add amenities column if upgrading
-- =============================================
-- If you're upgrading an existing database, run this:
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}';



-- =============================================
-- MIGRATION: Add project details columns if upgrading
-- =============================================
-- If you're upgrading an existing database, run these:
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS land_parcel INTEGER DEFAULT 0;
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS towers INTEGER DEFAULT 0;
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS floors TEXT DEFAULT '';
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS config TEXT DEFAULT '';
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS carpet_area TEXT DEFAULT '';
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS rera_no TEXT DEFAULT '';
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS possession_status TEXT DEFAULT '';
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS target_possession TEXT DEFAULT '';
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS litigation BOOLEAN DEFAULT false;

-- =============================================
-- MIGRATION: Add brochure_url column if upgrading
-- =============================================
-- If you're upgrading an existing database, run this:
-- ALTER TABLE properties ADD COLUMN IF NOT EXISTS brochure_url TEXT DEFAULT '';

-- =============================================
-- BROCHURE STORAGE BUCKET SETUP
-- =============================================

-- Create the property-brochures bucket (public bucket for property brochures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-brochures',
  'property-brochures',
  true,
  10485760, -- 10MB max file size
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf'];

-- =============================================
-- BROCHURE STORAGE POLICIES
-- =============================================

-- Drop existing brochure storage policies first
DROP POLICY IF EXISTS "Public can view brochures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload brochures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update brochures" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete brochures" ON storage.objects;

-- Policy: Allow public read access to property brochures
CREATE POLICY "Public can view brochures"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'property-brochures');

-- Policy: Allow authenticated users to upload brochures
CREATE POLICY "Authenticated users can upload brochures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'property-brochures');

-- Policy: Allow authenticated users to update brochures
CREATE POLICY "Authenticated users can update brochures"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'property-brochures')
WITH CHECK (bucket_id = 'property-brochures');

-- Policy: Allow authenticated users to delete brochures
CREATE POLICY "Authenticated users can delete brochures"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'property-brochures');
