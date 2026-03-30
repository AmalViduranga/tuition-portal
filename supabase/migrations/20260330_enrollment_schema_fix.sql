-- Migration: Align student_class_enrollments table with application requirements
-- Adds missing columns (id, access_end_date, access_mode) if they don't exist

-- 1. Ensure student_class_enrollments has all required columns
ALTER TABLE public.student_class_enrollments 
ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS access_end_date DATE,
ADD COLUMN IF NOT EXISTS access_mode TEXT NOT NULL DEFAULT 'paid' CHECK (access_mode IN ('paid', 'free_card', 'manual'));

-- 2. Ensure student_class_payment_periods has status and metadata
ALTER TABLE public.student_class_payment_periods
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_plan_id UUID REFERENCES public.payment_plans(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS access_mode TEXT NOT NULL DEFAULT 'paid' CHECK (access_mode IN ('paid', 'free_card', 'manual')),
ADD COLUMN IF NOT EXISTS admin_note TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 3. Ensure profiles has phone
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT;
