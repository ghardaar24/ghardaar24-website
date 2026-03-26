-- Migration: Add Profile Pictures
-- Description: Adds profile_picture_url to admins and crm_staff tables, creates storage bucket

-- ============================================================================
-- ADD PROFILE PICTURE COLUMNS
-- ============================================================================

ALTER TABLE public.admins ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
ALTER TABLE public.crm_staff ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;

-- ============================================================================
-- STORAGE BUCKET FOR PROFILE PICTURES
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view profile pictures
CREATE POLICY "Anyone can view profile pictures"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'profile-pictures');

-- Admins can upload their own profile pictures
CREATE POLICY "Admins can upload profile pictures"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'profile-pictures'
        AND EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Admins can update their own profile pictures
CREATE POLICY "Admins can update profile pictures"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'profile-pictures'
        AND EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Admins can delete their own profile pictures
CREATE POLICY "Admins can delete profile pictures"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'profile-pictures'
        AND EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Staff can upload their own profile pictures
CREATE POLICY "Staff can upload profile pictures"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'profile-pictures'
        AND EXISTS (
            SELECT 1 FROM public.crm_staff WHERE id = auth.uid() AND is_active = true
        )
    );

-- Staff can update their own profile pictures
CREATE POLICY "Staff can update profile pictures"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'profile-pictures'
        AND EXISTS (
            SELECT 1 FROM public.crm_staff WHERE id = auth.uid() AND is_active = true
        )
    );

-- Staff can delete their own profile pictures
CREATE POLICY "Staff can delete profile pictures"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'profile-pictures'
        AND EXISTS (
            SELECT 1 FROM public.crm_staff WHERE id = auth.uid() AND is_active = true
        )
    );
