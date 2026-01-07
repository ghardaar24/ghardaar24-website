-- Migration: Add CRM Clients Table
-- Description: Adds the crm_clients table for managing leads and clients in the admin panel.

-- ============================================================================
-- CRM CLIENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.crm_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic Info
    client_name TEXT NOT NULL,
    customer_number TEXT,
    
    -- Lead Classification
    lead_stage TEXT DEFAULT 'follow_up_req' CHECK (lead_stage IN ('follow_up_req', 'dnp', 'disqualified', 'callback_later')),
    lead_type TEXT DEFAULT 'cold' CHECK (lead_type IN ('hot', 'warm', 'cold')),
    location_category TEXT,
    
    -- Call/Meeting Details
    calling_comment TEXT,
    expected_visit_date DATE,
    
    -- Deal Status
    deal_status TEXT DEFAULT 'open' CHECK (deal_status IN ('open', 'locked', 'lost')),
    
    -- Admin Notes (additional notes by admin)
    admin_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.crm_clients ENABLE ROW LEVEL SECURITY;

-- Only admins can access CRM clients
CREATE POLICY "Admins can manage CRM clients"
    ON public.crm_clients
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_crm_clients_lead_stage ON public.crm_clients(lead_stage);
CREATE INDEX IF NOT EXISTS idx_crm_clients_lead_type ON public.crm_clients(lead_type);
CREATE INDEX IF NOT EXISTS idx_crm_clients_deal_status ON public.crm_clients(deal_status);
CREATE INDEX IF NOT EXISTS idx_crm_clients_created_at ON public.crm_clients(created_at DESC);

-- Trigger to auto-update updated_at on crm_clients
DROP TRIGGER IF EXISTS update_crm_clients_updated_at ON public.crm_clients;
CREATE TRIGGER update_crm_clients_updated_at
    BEFORE UPDATE ON public.crm_clients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
