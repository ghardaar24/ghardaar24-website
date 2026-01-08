-- ============================================================================
-- BROCHURES MIGRATION
-- ============================================================================
-- Stores downloadable brochures for the footer section

CREATE TABLE IF NOT EXISTS public.brochures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size BIGINT,
    is_active BOOLEAN DEFAULT true,
    download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.brochures ENABLE ROW LEVEL SECURITY;

-- Anyone can read active brochures
CREATE POLICY "Anyone can read active brochures"
    ON public.brochures
    FOR SELECT
    USING (is_active = true);

-- Admins can manage brochures
CREATE POLICY "Admins can manage brochures"
    ON public.brochures
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Trigger to auto-update updated_at on brochures
DROP TRIGGER IF EXISTS update_brochures_updated_at ON public.brochures;
CREATE TRIGGER update_brochures_updated_at
    BEFORE UPDATE ON public.brochures
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for company brochures
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-brochures', 'company-brochures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for company-brochures bucket
-- Note: We check if policies exist before creating them to be safe, 
-- though standard `create policy if not exists` isn't supported in all postgres versions for policies.
-- We'll just create them, assuming this migration runs once.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view company brochures' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Anyone can view company brochures"
            ON storage.objects
            FOR SELECT
            USING (bucket_id = 'company-brochures');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload company brochures' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Authenticated users can upload company brochures"
            ON storage.objects
            FOR INSERT
            WITH CHECK (
                bucket_id = 'company-brochures' 
                AND auth.uid() IS NOT NULL
            );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete company brochures' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Admins can delete company brochures"
            ON storage.objects
            FOR DELETE
            USING (
                bucket_id = 'company-brochures'
                AND EXISTS (
                    SELECT 1 FROM public.admins WHERE id = auth.uid()
                )
            );
    END IF;
END
$$;
