-- Refactor student_class_enrollments to support historical records and 45-day windows correctly.
-- 1. Remove the unique constraint that prevents history.
ALTER TABLE public.student_class_enrollments DROP CONSTRAINT IF EXISTS student_class_enrollments_student_id_class_id_key;

-- 2. Ensure access_end_date exists and has a default or is nullable.
-- (It already exists in some sessions, but let's make sure it's correct)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_class_enrollments' AND column_name='access_end_date') THEN
        ALTER TABLE public.student_class_enrollments ADD COLUMN access_end_date DATE;
    END IF;
END $$;

-- 3. Add access_mode column if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_class_enrollments' AND column_name='access_mode') THEN
        ALTER TABLE public.student_class_enrollments ADD COLUMN access_mode TEXT DEFAULT 'paid';
    END IF;
END $$;

-- 4. Update the profiles table to ensure created_at is sufficient for "student_created_date"
-- It's already there in schema_core.sql

-- 5. Add a helper function for the dashboard to check if a student has ANY currently active enrollment window
CREATE OR REPLACE FUNCTION public.has_active_enrollment(sid UUID) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.student_class_enrollments
    WHERE student_id = sid 
      AND CURRENT_DATE BETWEEN start_access_date AND COALESCE(access_end_date, start_access_date + INTERVAL '45 days')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
