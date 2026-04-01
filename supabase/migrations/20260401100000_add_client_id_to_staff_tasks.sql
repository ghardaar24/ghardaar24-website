-- Add client_id column to staff_tasks for linking tasks to CRM clients
ALTER TABLE public.staff_tasks ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.crm_clients(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_staff_tasks_client_id ON public.staff_tasks(client_id);
