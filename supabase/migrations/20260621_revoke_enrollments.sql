-- =====================================================
-- MIGRATION: Soft Revoke Student Enrollments
-- Date: 2026-06-21
-- Description: Adds revoked fields to student_class_enrollments to support safe, reversible enrollment revocation without losing history.
-- =====================================================

ALTER TABLE public.student_class_enrollments
ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS revoked_by UUID REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS revoke_reason TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create trigger to automatically update updated_at if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'student_class_enrollments_set_updated_at') THEN
        CREATE TRIGGER student_class_enrollments_set_updated_at
        BEFORE UPDATE ON public.student_class_enrollments
        FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If set_updated_at function doesn't exist, we skip the trigger.
        NULL;
END $$;

-- Active lookup: Very common for student portal to only look for non-revoked classes
CREATE INDEX IF NOT EXISTS idx_student_class_enrollments_active_lookup
ON public.student_class_enrollments(student_id, class_id)
WHERE revoked_at IS NULL;

-- Revoked lookup: Useful for admin to filter revoked cases
CREATE INDEX IF NOT EXISTS idx_student_class_enrollments_revoked
ON public.student_class_enrollments(revoked_at)
WHERE revoked_at IS NOT NULL;
