-- Migration: CRM feature enhancements
-- Description: Adds 'vdnb' to lead stages, adds 'facing' to clients, and timing fields to tasks and site visits.

-- 1. Add 'vdnb' to lead_stage constraint in crm_clients
DO $$
DECLARE
    constraint_name text;
BEGIN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.crm_clients'::regclass 
    AND contype = 'c' 
    AND pg_get_constraintdef(oid) ILIKE '%lead_stage%';

    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.crm_clients DROP CONSTRAINT ' || constraint_name;
    END IF;
END $$;

ALTER TABLE public.crm_clients
ADD CONSTRAINT crm_clients_lead_stage_check 
CHECK (lead_stage IN ('follow_up_req', 'dnp', 'disqualified', 'callback_required', 'natc', 'visit_booked', 'call_after_1_2_months', 'vdnb'));

COMMENT ON COLUMN public.crm_clients.lead_stage IS 'Current lead stage. Options: follow_up_req, dnp, disqualified, callback_required, natc, visit_booked, call_after_1_2_months, vdnb';

-- 2. Add 'facing' column to crm_clients
ALTER TABLE public.crm_clients ADD COLUMN IF NOT EXISTS facing TEXT;
COMMENT ON COLUMN public.crm_clients.facing IS 'Property facing preference: East, West, North, South';

-- 3. Add 'due_time' to staff_tasks
ALTER TABLE public.staff_tasks ADD COLUMN IF NOT EXISTS due_time TIME;
COMMENT ON COLUMN public.staff_tasks.due_time IS 'Time chosen for the task';

-- 4. Add 'visit_time' to site_visits
ALTER TABLE public.site_visits ADD COLUMN IF NOT EXISTS visit_time TIME;
COMMENT ON COLUMN public.site_visits.visit_time IS 'Time of the site visit';
