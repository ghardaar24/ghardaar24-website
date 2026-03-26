-- Migration: Allow admins to be assigned tasks
-- Description: Changes assigned_to FK from crm_staff to auth.users so admins can also be assigned tasks

-- Drop the existing foreign key constraint on assigned_to
ALTER TABLE public.staff_tasks
    DROP CONSTRAINT IF EXISTS staff_tasks_assigned_to_fkey;

-- Add new foreign key referencing auth.users instead of crm_staff
ALTER TABLE public.staff_tasks
    ADD CONSTRAINT staff_tasks_assigned_to_fkey
    FOREIGN KEY (assigned_to) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add RLS policy for admins to read tasks assigned to them
CREATE POLICY "Admins can read tasks assigned to them"
    ON public.staff_tasks
    FOR SELECT
    USING (
        assigned_to = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Add RLS policy for admins to update tasks assigned to them
CREATE POLICY "Admins can update tasks assigned to them"
    ON public.staff_tasks
    FOR UPDATE
    USING (
        assigned_to = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        assigned_to = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );
