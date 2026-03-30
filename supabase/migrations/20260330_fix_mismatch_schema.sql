-- =====================================================
-- MIGRATION: Fix missing columns and tables for Advanced Features
-- Run this in your Supabase SQL Editor if you see errors about missing columns.
-- =====================================================

-- 1. Create payment_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create junction table for bundles
CREATE TABLE IF NOT EXISTS public.payment_plan_classes (
  payment_plan_id UUID REFERENCES public.payment_plans(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.class_groups(id) ON DELETE CASCADE,
  PRIMARY KEY (payment_plan_id, class_id)
);

-- 3. Add missing columns to student_class_payment_periods
DO $$
BEGIN
  -- Add amount_paid if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_class_payment_periods' AND column_name='amount_paid') THEN
    ALTER TABLE public.student_class_payment_periods ADD COLUMN amount_paid NUMERIC(10, 2) DEFAULT 0;
  END IF;

  -- Add payment_plan_id if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_class_payment_periods' AND column_name='payment_plan_id') THEN
    ALTER TABLE public.student_class_payment_periods ADD COLUMN payment_plan_id UUID REFERENCES public.payment_plans(id) ON DELETE SET NULL;
  END IF;

  -- Add access_mode if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_class_payment_periods' AND column_name='access_mode') THEN
    ALTER TABLE public.student_class_payment_periods ADD COLUMN access_mode TEXT NOT NULL DEFAULT 'paid' CHECK (access_mode IN ('paid', 'free_card', 'manual'));
  END IF;
END $$;

-- 4. Ensure RLS is active
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plan_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to authenticated users" ON public.payment_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow all access to admins" ON public.payment_plans FOR ALL TO authenticated USING (public.is_admin());
CREATE POLICY "Allow read access to authenticated users" ON public.payment_plan_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow all access to admins" ON public.payment_plan_classes FOR ALL TO authenticated USING (public.is_admin());
