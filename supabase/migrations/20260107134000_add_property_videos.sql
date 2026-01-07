-- Migration: Add Video URLs and Storage to Properties
-- Description: Adds video_urls column to properties and sets up storage bucket for videos.

-- Add column to existing properties table
ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS video_urls TEXT[] DEFAULT '{}';

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-videos', 'property-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies
CREATE POLICY "Anyone can view property videos" ON storage.objects FOR SELECT USING (bucket_id = 'property-videos');
CREATE POLICY "Authenticated users can upload property videos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'property-videos' AND auth.uid() IS NOT NULL);
