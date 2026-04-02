-- Upgrade enrollment and earnings tracking system
-- 1. Add amount_paid and tracked monthly earnings data to enrollments
ALTER TABLE public.student_class_enrollments ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10, 2) DEFAULT 0;

-- 2. Update existing null access_end_date logic to use 40-day window instead of 45-day
UPDATE public.student_class_enrollments 
SET access_end_date = start_access_date + INTERVAL '40 days' 
WHERE access_end_date IS NULL OR (access_end_date = start_access_date + INTERVAL '45 days');

-- 3. Update the dashboard helper for 40-day logic if it was hardcoded (actually it reads from table, but let's check functions)
-- has_active_enrollment and has_valid_enrollment read from the columns directly, so they are already correct once the data is updated.

-- 4. Ensure payment amount is indexed for reporting
CREATE INDEX IF NOT EXISTS idx_enrollments_amount ON public.student_class_enrollments(amount_paid);
CREATE INDEX IF NOT EXISTS idx_enrollments_start_date ON public.student_class_enrollments(start_access_date);
