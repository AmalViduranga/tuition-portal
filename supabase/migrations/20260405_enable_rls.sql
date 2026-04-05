-- =====================================================
-- MIGRATION: CRITICAL SECURITY FIX - ENABLING RLS EVERYWHERE
-- Date: 2026-04-05
-- Description: Enable Row Level Security safely on all tables,
-- dropping overly permissive/missing policies and replacing
-- them with strictly scoped role-based access.
-- =====================================================

-- --------------------------------------------------------
-- STEP 1: HELPER FUNCTIONS
-- Ensures reliable access check without infinite recursion.
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

-- --------------------------------------------------------
-- STEP 2: ENABLE RLS ON ALL IDENTIFIED TABLES
-- This fixes the Supabase warning immediately.
-- --------------------------------------------------------
DO $$
DECLARE
  table_names text[] := ARRAY[
    'profiles', 
    'class_groups', 
    'student_class_enrollments',
    'student_class_payment_periods',
    'recordings',
    'materials',
    'recording_manual_unlocks',
    'material_manual_unlocks',
    'site_settings',
    'student_content_access_logs',
    'payment_plans',
    'payment_plan_classes'
  ];
  t_name text;
BEGIN
  FOREACH t_name IN ARRAY table_names
  LOOP
    EXECUTE 'ALTER TABLE IF EXISTS public.' || quote_ident(t_name) || ' ENABLE ROW LEVEL SECURITY;';
  END LOOP;
END;
$$;

-- --------------------------------------------------------
-- STEP 3: SAFE BASELINE CLEANUP (DROP OLD POLICIES)
-- We wipe existing policies to prevent conflicts, then re-establish.
-- --------------------------------------------------------
DO $$
DECLARE
  pol_record RECORD;
BEGIN
  FOR pol_record IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol_record.policyname) || ' ON public.' || quote_ident(pol_record.tablename);
  END LOOP;
END;
$$;


-- --------------------------------------------------------
-- STEP 4: IMPLEMENT PROPER ROLE-BASED SECURITY
-- --------------------------------------------------------

-- 1. Profiles
CREATE POLICY "profiles: self read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles: self update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.is_admin()) WITH CHECK (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles: admin all" ON public.profiles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2. Class Groups
-- Students can only read classes they are enrolled in (plus admins see all)
CREATE POLICY "class_groups: enrolled or admin read" ON public.class_groups FOR SELECT TO authenticated 
USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.student_class_enrollments 
    WHERE class_id = class_groups.id AND student_id = auth.uid()
  )
);
CREATE POLICY "class_groups: admin all" ON public.class_groups FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 3. Student Class Enrollments
CREATE POLICY "enrollments: self or admin read" ON public.student_class_enrollments FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "enrollments: admin all" ON public.student_class_enrollments FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. Payment Periods
CREATE POLICY "payment_periods: self or admin read" ON public.student_class_payment_periods FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "payment_periods: admin all" ON public.student_class_payment_periods FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 5. Recordings
-- Read constraints: Admins all, or students only if they are enrolled in the corresponding class.
CREATE POLICY "recordings: enrolled or admin read" ON public.recordings FOR SELECT TO authenticated 
USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.student_class_enrollments 
    WHERE class_id = recordings.class_id AND student_id = auth.uid()
  )
);
CREATE POLICY "recordings: admin all" ON public.recordings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Materials
CREATE POLICY "materials: enrolled or admin read" ON public.materials FOR SELECT TO authenticated 
USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.student_class_enrollments 
    WHERE class_id = materials.class_id AND student_id = auth.uid()
  )
);
CREATE POLICY "materials: admin all" ON public.materials FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 7. Recording Unlocks
CREATE POLICY "recording_unlocks: self or admin read" ON public.recording_manual_unlocks FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "recording_unlocks: admin all" ON public.recording_manual_unlocks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 8. Material Unlocks
CREATE POLICY "material_unlocks: self or admin read" ON public.material_manual_unlocks FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "material_unlocks: admin all" ON public.material_manual_unlocks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 9. Student Content Access Logs
CREATE POLICY "access_logs: self or admin read" ON public.student_content_access_logs FOR SELECT TO authenticated USING (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "access_logs: self insert" ON public.student_content_access_logs FOR INSERT TO authenticated WITH CHECK (student_id = auth.uid() OR public.is_admin());
CREATE POLICY "access_logs: admin all" ON public.student_content_access_logs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 10. Site Settings
CREATE POLICY "site_settings: all read" ON public.site_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "site_settings: admin all" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 11. Payment Plans
CREATE POLICY "payment_plans: all read" ON public.payment_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "payment_plans: admin all" ON public.payment_plans FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 12. Payment Plan Classes
CREATE POLICY "payment_plan_classes: all read" ON public.payment_plan_classes FOR SELECT TO authenticated USING (true);
CREATE POLICY "payment_plan_classes: admin all" ON public.payment_plan_classes FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- --------------------------------------------------------
-- STEP 5: SERVICE ROLE OVERRIDES
-- Any server-side Next.js fetch using 'supabaseServiceRoleKey'
-- naturally bypasses all above policies, preventing 500 API errors.
-- --------------------------------------------------------
