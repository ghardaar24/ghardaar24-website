-- Migration: Add Staff Tasks Table
-- Description: Creates a table for admin to assign tasks to staff members

-- ============================================================================
-- STAFF TASKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.staff_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Task details
    title TEXT NOT NULL,
    description TEXT,
    
    -- Assignment
    assigned_to UUID NOT NULL REFERENCES public.crm_staff(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.admins(id) ON DELETE SET NULL,
    
    -- Task properties
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    
    -- Dates
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.staff_tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Admins can manage all tasks
CREATE POLICY "Admins can manage all tasks"
    ON public.staff_tasks
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.admins WHERE id = auth.uid()
        )
    );

-- Staff can read tasks assigned to them
CREATE POLICY "Staff can read assigned tasks"
    ON public.staff_tasks
    FOR SELECT
    USING (
        assigned_to = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.crm_staff WHERE id = auth.uid() AND is_active = true
        )
    );

-- Staff can update status of tasks assigned to them
CREATE POLICY "Staff can update assigned task status"
    ON public.staff_tasks
    FOR UPDATE
    USING (
        assigned_to = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.crm_staff WHERE id = auth.uid() AND is_active = true
        )
    )
    WITH CHECK (
        assigned_to = auth.uid()
        AND EXISTS (
            SELECT 1 FROM public.crm_staff WHERE id = auth.uid() AND is_active = true
        )
    );

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned_to ON public.staff_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_status ON public.staff_tasks(status);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_due_date ON public.staff_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_created_at ON public.staff_tasks(created_at DESC);

-- ============================================================================
-- TRIGGER FOR updated_at
-- ============================================================================

CREATE TRIGGER update_staff_tasks_updated_at
    BEFORE UPDATE ON public.staff_tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ENABLE REALTIME
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_tasks;

-- Add comment for documentation
COMMENT ON TABLE public.staff_tasks IS 'Tasks assigned by admins to staff members';
