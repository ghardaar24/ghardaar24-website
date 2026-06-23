-- Migration: Add client fields to revenue_entries
-- Description: Adds client_name, client_email, client_phone for associating entries with clients.

ALTER TABLE public.revenue_entries
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS client_email TEXT,
  ADD COLUMN IF NOT EXISTS client_phone TEXT;
