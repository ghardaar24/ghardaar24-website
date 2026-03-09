-- Add new permission columns to crm_staff table
ALTER TABLE public.crm_staff 
ADD COLUMN IF NOT EXISTS can_manage_properties BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_generate_invoices BOOLEAN DEFAULT false;

-- Create invoices history table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_no TEXT NOT NULL,
    date TEXT NOT NULL,
    customer_name TEXT,
    project_name TEXT,
    total_amount BIGINT DEFAULT 0,
    invoice_data JSONB DEFAULT '{}',
    
    -- Tracking
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Admins can manage all invoices
CREATE POLICY "Admins can manage all invoices"
    ON public.invoices
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Staff with permission can manage all invoices (to see history)
CREATE POLICY "Staff with permission can manage all invoices"
    ON public.invoices
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.crm_staff 
            WHERE id = auth.uid() 
            AND can_generate_invoices = true
            AND is_active = true
        )
    );

-- Trigger to auto-update updated_at on invoices
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_invoices_created_by ON public.invoices(created_by);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_no ON public.invoices(invoice_no);
