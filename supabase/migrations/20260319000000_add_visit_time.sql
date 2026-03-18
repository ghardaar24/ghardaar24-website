-- Migration: Add expected_visit_time to crm_clients
-- Description: Stores the time component for expected visit/followup alongside the existing date.

ALTER TABLE public.crm_clients ADD COLUMN IF NOT EXISTS expected_visit_time TIME;
COMMENT ON COLUMN public.crm_clients.expected_visit_time IS 'Expected visit or followup time, paired with expected_visit_date';
