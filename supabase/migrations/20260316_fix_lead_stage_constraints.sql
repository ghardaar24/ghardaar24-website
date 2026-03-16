-- Migration: Fix Lead Stage Constraints
-- Description: Updates the check constraint on crm_clients.lead_stage to match frontend options

-- 1. Drop existing constraint if it exists
-- We need to find the constraint name. Usually it's something like "crm_clients_lead_stage_check"
DO $$ 
DECLARE 
    constraint_name TEXT;
BEGIN 
    SELECT conname INTO constraint_name
    FROM pg_constraint 
    WHERE conrelid = 'public.crm_clients'::regclass 
    AND contype = 'c' 
    AND confkey IS NULL -- Check constraint, not foreign key
    AND pg_get_constraintdef(oid) LIKE '%lead_stage%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.crm_clients DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

-- 2. Migrate existing 'callback_later' to 'callback_required' 
-- (aligning old data with new UI option)
UPDATE public.crm_clients 
SET lead_stage = 'callback_required' 
WHERE lead_stage = 'callback_later';

-- 3. Add new flexible check constraint that matches all UI options
ALTER TABLE public.crm_clients
ADD CONSTRAINT crm_clients_lead_stage_check 
CHECK (lead_stage IN (
    'follow_up_req', 
    'dnp', 
    'disqualified', 
    'callback_required', 
    'natc', 
    'visit_booked', 
    'call_after_1_2_months'
));

-- 4. Add comment to clarify the change
COMMENT ON COLUMN public.crm_clients.lead_stage IS 'Current lead stage. Options: follow_up_req, dnp, disqualified, callback_required, natc, visit_booked, call_after_1_2_months';
