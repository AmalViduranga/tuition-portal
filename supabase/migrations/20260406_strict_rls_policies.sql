-- =====================================================
-- MIGRATION: STRICT ROW LEVEL SECURITY (PRODUCTION)
-- Date: 2026-04-06
-- Description: Replaces broad temporary policies with
-- precise, locked-down business-logic access rules.
-- =====================================================

-- --------------------------------------------------------
-- 1. HELPER FUNCTIONS
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Function to check complex access logic for content
CREATE OR REPLACE FUNCTION public.student_can_access_content(p_class_id uuid, p_release_at date)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check enrollment window
  IF EXISTS (
    SELECT 1 FROM public.student_class_enrollments
    WHERE student_id = auth.uid()
      AND class_id = p_class_id
      AND p_release_at >= start_access_date
      AND p_release_at <= COALESCE(access_end_date, start_access_date + 40)
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check approved payment periods
  IF EXISTS (
    SELECT 1 FROM public.student_class_payment_periods
    WHERE student_id = auth.uid()
      AND class_id = p_class_id
      AND status = 'approved'
      AND p_release_at >= start_date
      AND p_release_at <= end_date
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;


-- --------------------------------------------------------
-- 2. WIPE TEMPORARY OR BROAD POLICIES
-- Ensure we are starting completely clean.
-- --------------------------------------------------------
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END;
$$;

-- --------------------------------------------------------
-- 3. ENSURE ALL RELEVANT TABLES HAVE RLS ENABLED
-- --------------------------------------------------------
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_class_payment_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recording_manual_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.material_manual_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_content_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_plan_classes ENABLE ROW LEVEL SECURITY;


-- --------------------------------------------------------
-- 4. APPLY STRICT ROLE-BASED POLICIES
-- --------------------------------------------------------

--
-- PROFILES
-- Students read/update own (no role modifications). Admins manage all.
--
CREATE POLICY "profiles: read own or admin" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "profiles: update own safe" ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_admin())
WITH CHECK (
  public.is_admin() OR 
  (id = auth.uid() AND role = (SELECT role FROM public.profiles p WHERE p.id = auth.uid()))
);

CREATE POLICY "profiles: admin all" ON public.profiles FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- CLASS GROUPS
-- Enrolled students can view the class metadata. Admins manage all.
--
CREATE POLICY "class_groups: enrolled or admin read" ON public.class_groups FOR SELECT TO authenticated 
USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.student_class_enrollments 
    WHERE class_id = class_groups.id AND student_id = auth.uid()
  )
);

CREATE POLICY "class_groups: admin all" ON public.class_groups FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- ENROLLMENTS & PAYMENTS
-- Students securely isolated to their own records.
--
CREATE POLICY "enrollments: self read" ON public.student_class_enrollments FOR SELECT TO authenticated
USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "enrollments: admin all" ON public.student_class_enrollments FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "payment_periods: self read" ON public.student_class_payment_periods FOR SELECT TO authenticated
USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "payment_periods: admin all" ON public.student_class_payment_periods FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- RECORDINGS
-- 1. Is Admin? -> Yes
-- 2. Is Published? -> And either explicitly manually unlocked OR valid payment/enrollment period.
--
CREATE POLICY "recordings: access logic or admin" ON public.recordings FOR SELECT TO authenticated 
USING (
  public.is_admin() OR (
    published = true AND (
      EXISTS (
        SELECT 1 FROM public.recording_manual_unlocks 
        WHERE student_id = auth.uid() AND recording_id = recordings.id AND revoked_at IS NULL
      )
      OR public.student_can_access_content(class_id, release_at)
    )
  )
);
CREATE POLICY "recordings: admin all" ON public.recordings FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- MATERIALS
-- Analogous rules to recordings.
--
CREATE POLICY "materials: access logic or admin" ON public.materials FOR SELECT TO authenticated 
USING (
  public.is_admin() OR (
    published = true AND (
      EXISTS (
        SELECT 1 FROM public.material_manual_unlocks 
        WHERE student_id = auth.uid() AND material_id = materials.id AND revoked_at IS NULL
      )
      OR public.student_can_access_content(class_id, release_at)
    )
  )
);
CREATE POLICY "materials: admin all" ON public.materials FOR ALL TO authenticated
USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- UNLOCKS (MANUAL GRANTS)
--
CREATE POLICY "rec_unlocks: self read" ON public.recording_manual_unlocks FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "mat_unlocks: self read" ON public.material_manual_unlocks FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin());

CREATE POLICY "rec_unlocks: admin all" ON public.recording_manual_unlocks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "mat_unlocks: admin all" ON public.material_manual_unlocks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- ACCESS LOGS
--
CREATE POLICY "access_logs: self read" ON public.student_content_access_logs FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "access_logs: self insert" ON public.student_content_access_logs FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "access_logs: admin all" ON public.student_content_access_logs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


--
-- SITE SETTINGS & PLANS (Global Readable)
-- Keep plans visible so unauthenticated users can see pricing on landing pages.
--
CREATE POLICY "site_settings: public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "payment_plans: public read" ON public.payment_plans FOR SELECT USING (true);
CREATE POLICY "payment_plan_classes: public read" ON public.payment_plan_classes FOR SELECT USING (true);

CREATE POLICY "site_settings: admin all" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "payment_plans: admin all" ON public.payment_plans FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "payment_plan_classes: admin all" ON public.payment_plan_classes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
