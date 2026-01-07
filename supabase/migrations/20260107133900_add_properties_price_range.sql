-- Migration: Add Min/Max Price to Properties
-- Description: Adds min_price and max_price columns to properties table and backfills existing data.

-- Add min_price and max_price columns
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS min_price BIGINT,
ADD COLUMN IF NOT EXISTS max_price BIGINT;

-- Migrate existing price data to min_price and max_price
UPDATE public.properties 
SET min_price = price, max_price = price 
WHERE min_price IS NULL;
