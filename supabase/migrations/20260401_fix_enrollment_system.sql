-- Migration to fix enrollment system and access logic
-- 1. Modify student_class_enrollments to support multiple enrollment periods
-- 2. Update RLS policies to use the 45-day window correctly
-- 3. Add student account creation date handling (profiles table already has created_at)

-- Update student_class_enrollments table
ALTER TABLE public.student_class_enrollments DROP CONSTRAINT IF EXISTS student_class_enrollments_pkey CASCADE;
ALTER TABLE public.student_class_enrollments DROP CONSTRAINT IF EXISTS student_class_enrollments_student_id_class_id_key CASCADE;

-- Ensure surrogate ID exists and is primary key
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='student_class_enrollments' AND column_name='id') THEN
        ALTER TABLE public.student_class_enrollments ADD COLUMN id uuid DEFAULT gen_random_uuid() PRIMARY KEY;
    ELSE
        -- If id exists but isn't primary key, fix it
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE table_name='student_class_enrollments' AND constraint_type='PRIMARY KEY') THEN
            ALTER TABLE public.student_class_enrollments ADD PRIMARY KEY (id);
        END IF;
    END IF;
END $$;

-- Ensure columns exist
ALTER TABLE public.student_class_enrollments ADD COLUMN IF NOT EXISTS access_end_date date;
ALTER TABLE public.student_class_enrollments ADD COLUMN IF NOT EXISTS access_mode text NOT NULL DEFAULT 'paid' CHECK (access_mode IN ('paid', 'free_card', 'manual'));

-- Update existing records to have access_end_date if null
UPDATE public.student_class_enrollments 
SET access_end_date = start_access_date + INTERVAL '45 days' 
WHERE access_end_date IS NULL;

-- ------------------------------------------------------------
-- Update RLS Policies for Access Control
-- ------------------------------------------------------------

-- Helper function to check if student has a valid enrollment window for a specific date
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

-- Recordings Policy
DROP POLICY IF EXISTS "recordings: read eligible or admin" ON public.recordings;
DROP POLICY IF EXISTS "recordings_student_select_access_controlled" ON public.recordings;

CREATE POLICY "recordings_student_select_access_controlled" ON public.recordings
FOR SELECT TO authenticated
USING (
  public.is_admin() OR (
    -- Access is granted if the recording release date falls within ANY valid enrollment window
    public.has_valid_enrollment(auth.uid(), recordings.class_id, recordings.release_at)
    OR
    -- Or if it's manually unlocked (keeping existing pattern if relevant)
    EXISTS (
      SELECT 1 FROM public.student_recording_unlocks u 
      WHERE u.student_id = auth.uid() AND u.recording_id = recordings.id
    )
  )
);

-- Materials Policy
DROP POLICY IF EXISTS "materials: read eligible or admin" ON public.materials;
DROP POLICY IF EXISTS "materials_student_select_access_controlled" ON public.materials;

CREATE POLICY "materials_student_select_access_controlled" ON public.materials
FOR SELECT TO authenticated
USING (
  public.is_admin() OR (
    -- Access is granted if the material release date falls within ANY valid enrollment window
    public.has_valid_enrollment(auth.uid(), materials.class_id, materials.release_at)
  )
);

-- Profiles Update (Self-read already exists)
-- Ensure admin can manage materials (delete)
DROP POLICY IF EXISTS "materials: admin manage" ON public.materials;
DROP POLICY IF EXISTS "materials_admin_write" ON public.materials;
CREATE POLICY "materials_admin_manage" ON public.materials
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Cleanup unused helper if necessary (student_has_approved_payment seems redundant now)
-- We'll keep it for now to avoid breaking anything else, but prioritize has_valid_enrollment.
