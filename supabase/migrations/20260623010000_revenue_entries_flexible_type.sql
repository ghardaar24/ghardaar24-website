-- Migration: Allow custom type and category values in revenue_entries
-- Description: Removes the CHECK constraint on `type` so admins can enter custom types.

ALTER TABLE public.revenue_entries
    DROP CONSTRAINT IF EXISTS revenue_entries_type_check;
