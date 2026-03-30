-- =====================================================
-- MIGRATION: Payment Plans and Extended Reporting
-- Date: 2026-03-30
-- Description: Adds payment plans, bundles, and record tracking
-- =====================================================

-- 1. Create payment_plans table
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

-- 3. Extend student_class_payment_periods
-- We will keep the name for compatibility but add the missing fields
ALTER TABLE public.student_class_payment_periods
ALTER COLUMN class_id DROP NOT NULL,
ADD COLUMN IF NOT EXISTS payment_plan_id UUID REFERENCES public.payment_plans(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS access_mode TEXT NOT NULL DEFAULT 'paid' CHECK (access_mode IN ('paid', 'free_card', 'manual')),
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS admin_note TEXT;


-- 4. Add index for reporting
CREATE INDEX IF NOT EXISTS idx_payments_reporting ON public.student_class_payment_periods (status, start_date);
CREATE INDEX IF NOT EXISTS idx_payments_plan ON public.student_class_payment_periods (payment_plan_id);

-- 5. Seed some initial plans based on business rules
-- Note: We use subqueries to find IDs if they exist, or just insert names
DO $$
DECLARE
    theory_id UUID;
    revision_id UUID;
BEGIN
    -- Get class IDs
    SELECT id INTO theory_id FROM public.class_groups WHERE name ILIKE '%Theory%';
    SELECT id INTO revision_id FROM public.class_groups WHERE name ILIKE '%Revision%';

    -- Insert plans
    INSERT INTO public.payment_plans (name, fee)
    VALUES 
        ('2026 THEORY ONLINE', 2500),
        ('2026 REVISION ONLY', 3000),
        ('2026 THEORY AND REVISION BOTH', 4000),
        ('2027 A/L THEORY', 2500)
    ON CONFLICT (name) DO NOTHING;

    -- Link plans to classes
    -- Plan: 2026 THEORY ONLINE
    IF theory_id IS NOT NULL THEN
        INSERT INTO public.payment_plan_classes (payment_plan_id, class_id)
        SELECT id, theory_id FROM public.payment_plans WHERE name = '2026 THEORY ONLINE'
        ON CONFLICT DO NOTHING;
    END IF;

    -- Plan: 2026 REVISION ONLY
    IF revision_id IS NOT NULL THEN
        INSERT INTO public.payment_plan_classes (payment_plan_id, class_id)
        SELECT id, revision_id FROM public.payment_plans WHERE name = '2026 REVISION ONLY'
        ON CONFLICT DO NOTHING;
    END IF;

    -- Plan: 2026 THEORY AND REVISION BOTH
    IF theory_id IS NOT NULL AND revision_id IS NOT NULL THEN
        INSERT INTO public.payment_plan_classes (payment_plan_id, class_id)
        SELECT id, theory_id FROM public.payment_plans WHERE name = '2026 THEORY AND REVISION BOTH'
        ON CONFLICT DO NOTHING;
        
        INSERT INTO public.payment_plan_classes (payment_plan_id, class_id)
        SELECT id, revision_id FROM public.payment_plans WHERE name = '2026 THEORY AND REVISION BOTH'
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Plan: 2027 A/L THEORY
    IF theory_id IS NOT NULL THEN
        -- Note: If we had a specific 2027 Theory class, we'd use that. 
        -- For now linking to what's available.
        INSERT INTO public.payment_plan_classes (payment_plan_id, class_id)
        SELECT id, theory_id FROM public.payment_plans WHERE name = '2027 A/L THEORY'
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- 6. RLS Policies for new tables
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plan_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payment plans visible to all authenticated"
ON public.payment_plans FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Payment plans manageable by admins"
ON public.payment_plans FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Plan classes visible to all authenticated"
ON public.payment_plan_classes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Plan classes manageable by admins"
ON public.payment_plan_classes FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
