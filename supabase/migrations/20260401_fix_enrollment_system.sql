-- Refactor student_class_enrollments to support historical records and 45-day windows correctly.
-- 1. Remove the unique constraint that prevents history.
ALTER TABLE public.student_class_enrollments DROP CONSTRAINT IF EXISTS student_class_enrollments_student_id_class_id_key;

-- 2. Ensure id column exists and is PK
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_class_enrollments' AND column_name='id') THEN
        ALTER TABLE public.student_class_enrollments ADD COLUMN id uuid DEFAULT gen_random_uuid();
        -- Set as primary key if none exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='student_class_enrollments' AND constraint_type='PRIMARY KEY') THEN
            ALTER TABLE public.student_class_enrollments ADD PRIMARY KEY (id);
        END IF;
    END IF;
END $$;

-- 3. Ensure columns exist for access logic
ALTER TABLE public.student_class_enrollments ADD COLUMN IF NOT EXISTS access_end_date date;
ALTER TABLE public.student_class_enrollments ADD COLUMN IF NOT EXISTS access_mode text NOT NULL DEFAULT 'paid' CHECK (access_mode IN ('paid', 'free_card', 'manual'));

-- 4. Set default 45-day expiry for nulls
UPDATE public.student_class_enrollments 
SET access_end_date = start_access_date + INTERVAL '45 days' 
WHERE access_end_date IS NULL;

-- 5. Add a helper function for the dashboard to check if a student has ANY currently active enrollment window
CREATE OR REPLACE FUNCTION public.has_active_enrollment(sid UUID) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.student_class_enrollments
    WHERE student_id = sid 
      AND CURRENT_DATE BETWEEN start_access_date AND access_end_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Helper function for content access (checking specific release dates against all student's windows)
CREATE OR REPLACE FUNCTION public.has_valid_enrollment(p_student_id uuid, p_class_id uuid, p_target_date date)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.student_class_enrollments
    WHERE student_id = p_student_id
      AND class_id = p_class_id
      AND p_target_date >= start_access_date 
      AND p_target_date <= access_end_date
  );
END;
$$;

-- 7. Update RLS Policies for Access Control using the new function
DROP POLICY IF EXISTS "recordings_student_select_access_controlled" ON public.recordings;
CREATE POLICY "recordings_student_select_access_controlled" ON public.recordings
FOR SELECT TO authenticated
USING (
  public.is_admin() OR (
    -- Released and published
    published = true 
    AND release_at <= CURRENT_DATE
    AND (
      -- Student has a valid enrollment for this recording's class and release date
      public.has_valid_enrollment(auth.uid(), class_id, release_at)
      OR
      -- OR it's manually unlocked
      EXISTS (
        SELECT 1 FROM public.recording_manual_unlocks u 
        WHERE u.student_id = auth.uid() AND u.recording_id = id AND u.revoked_at IS NULL
      )
    )
  )
);

DROP POLICY IF EXISTS "materials_student_select_access_controlled" ON public.materials;
CREATE POLICY "materials_student_select_access_controlled" ON public.materials
FOR SELECT TO authenticated
USING (
  public.is_admin() OR (
    -- Released and published
    published = true 
    AND release_at <= CURRENT_DATE
    AND (
      -- Student has a valid enrollment for this material's class and release date
      public.has_valid_enrollment(auth.uid(), class_id, release_at)
      OR
      -- OR it's manually unlocked
      EXISTS (
        SELECT 1 FROM public.material_manual_unlocks u 
        WHERE u.student_id = auth.uid() AND u.material_id = id AND u.revoked_at IS NULL
      )
    )
  )
);
