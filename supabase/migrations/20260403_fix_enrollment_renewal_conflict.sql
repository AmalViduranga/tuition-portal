-- Critical Fix: Enrollment Renewal Conflict (v2 - Fixed constraint dependency)
-- This migration ensures that multiple enrollment periods can exist for the same student and class.
-- It correctly handles dependency between constraints and unique indexes.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. DROP ALL CONSTRAINTS FIRST (to avoid index dependency errors)
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'student_class_enrollments' 
        AND constraint_type IN ('PRIMARY KEY', 'UNIQUE')
    ) LOOP
        EXECUTE 'ALTER TABLE public.student_class_enrollments DROP CONSTRAINT IF EXISTS ' || r.constraint_name || ' CASCADE';
    END LOOP;

    -- 2. DROP any remaining unique indexes that might not have been caught by constraint drop
    FOR r IN (
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = 'student_class_enrollments' 
        AND indexdef LIKE '%student_id%' AND indexdef LIKE '%class_id%'
        AND (indexdef LIKE '%UNIQUE%' OR indexdef LIKE '%PRIMARY KEY%')
    ) LOOP
        EXECUTE 'DROP INDEX IF EXISTS public.' || r.indexname || ' CASCADE';
    END LOOP;

    -- 3. Ensure 'id' exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_class_enrollments' AND column_name = 'id') THEN
        ALTER TABLE public.student_class_enrollments ADD COLUMN id UUID DEFAULT gen_random_uuid();
    END IF;

    -- 4. Clean up student_class_payment_periods too
    FOR r IN (
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_name = 'student_class_payment_periods' 
        AND constraint_type IN ('PRIMARY KEY', 'UNIQUE')
    ) LOOP
        EXECUTE 'ALTER TABLE public.student_class_payment_periods DROP CONSTRAINT IF EXISTS ' || r.constraint_name || ' CASCADE';
    END LOOP;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'student_class_payment_periods' AND column_name = 'id') THEN
        ALTER TABLE public.student_class_payment_periods ADD COLUMN id UUID DEFAULT gen_random_uuid();
    END IF;

    -- 5. RE-ESTABLISH the solitary UUID Primary Key for both tables
    -- Use id if it exists, otherwise use what we just added
    ALTER TABLE public.student_class_enrollments ADD PRIMARY KEY (id);
    ALTER TABLE public.student_class_payment_periods ADD PRIMARY KEY (id);

END $$;

-- 6. Apply final non-unique performance indices
CREATE INDEX IF NOT EXISTS idx_enrollments_lookup ON public.student_class_enrollments(student_id, class_id);
CREATE INDEX IF NOT EXISTS idx_payments_lookup ON public.student_class_payment_periods(student_id, class_id);
