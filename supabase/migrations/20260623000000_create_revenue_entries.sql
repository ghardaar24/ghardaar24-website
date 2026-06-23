-- Migration: Create revenue_entries table
-- Description: Tracks admin-logged earnings and expenses for revenue analytics.

CREATE TABLE IF NOT EXISTS public.revenue_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('earning', 'expense')),
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    category TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.revenue_entries ENABLE ROW LEVEL SECURITY;

-- Only admins can access revenue entries
CREATE POLICY "Admins can manage revenue entries"
    ON public.revenue_entries
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );
