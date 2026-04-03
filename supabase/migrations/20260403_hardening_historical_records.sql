-- Final hardening of enrollment and payment periods for historical renewals
-- 1. Drop any potential unique constraints that block renewals
ALTER TABLE public.student_class_enrollments 
DROP CONSTRAINT IF EXISTS student_class_enrollments_student_id_class_id_key;

ALTER TABLE public.student_class_payment_periods
DROP CONSTRAINT IF EXISTS student_class_payment_periods_student_id_class_id_key;

-- 2. Ensure primary keys are UUIDs and exist
DO $$
BEGIN
    -- Enrollments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_class_enrollments' AND column_name='id') THEN
        ALTER TABLE public.student_class_enrollments ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
    END IF;

    -- Payment Periods
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_class_payment_periods' AND column_name='id') THEN
        ALTER TABLE public.student_class_payment_periods ADD COLUMN id UUID DEFAULT gen_random_uuid() PRIMARY KEY;
    END IF;
END $$;

-- 3. Ensure standard access duration is 40 days
-- already set in previous migration, but let's confirm indices
CREATE INDEX IF NOT EXISTS idx_enrollments_combined ON public.student_class_enrollments(student_id, class_id);
CREATE INDEX IF NOT EXISTS idx_payments_combined ON public.student_class_payment_periods(student_id, class_id);
