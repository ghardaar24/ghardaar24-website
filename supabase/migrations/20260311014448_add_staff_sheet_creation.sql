-- Add can_add_sheets to crm_staff table
ALTER TABLE public.crm_staff 
ADD COLUMN IF NOT EXISTS can_add_sheets BOOLEAN DEFAULT false;

-- Add created_by_staff to crm_sheets table
ALTER TABLE public.crm_sheets
ADD COLUMN IF NOT EXISTS created_by_staff UUID REFERENCES public.crm_staff(id) ON DELETE SET NULL;

-- Create index for faster filtering of sheets by staff creator
CREATE INDEX IF NOT EXISTS idx_crm_sheets_created_by_staff ON public.crm_sheets(created_by_staff);
