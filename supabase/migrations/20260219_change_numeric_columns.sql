-- Change columns to NUMERIC to support float values
ALTER TABLE public.properties ALTER COLUMN land_parcel TYPE NUMERIC USING land_parcel::NUMERIC;
ALTER TABLE public.properties ALTER COLUMN towers TYPE NUMERIC USING towers::NUMERIC;
ALTER TABLE public.properties ALTER COLUMN bedrooms TYPE NUMERIC USING bedrooms::NUMERIC;
ALTER TABLE public.properties ALTER COLUMN bathrooms TYPE NUMERIC USING bathrooms::NUMERIC;
