-- 1. Updates to student_class_enrollments
ALTER TABLE student_class_enrollments
ADD COLUMN access_end_date DATE,
ADD COLUMN access_mode TEXT NOT NULL DEFAULT 'paid';

ALTER TABLE student_class_enrollments
ADD CONSTRAINT check_access_mode CHECK (access_mode IN ('paid', 'free_card', 'manual'));

-- 2. Updates to recording_manual_unlocks
ALTER TABLE recording_manual_unlocks
ADD COLUMN granted_by UUID REFERENCES auth.users(id),
ADD COLUMN grant_type TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN revoked_at TIMESTAMPTZ,
ADD COLUMN revoke_reason TEXT;

ALTER TABLE recording_manual_unlocks
ADD CONSTRAINT check_grant_type_rec CHECK (grant_type IN ('manual', 'payment', 'free_card'));

-- 3. Updates to material_manual_unlocks
ALTER TABLE material_manual_unlocks
ADD COLUMN granted_by UUID REFERENCES auth.users(id),
ADD COLUMN grant_type TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN revoked_at TIMESTAMPTZ,
ADD COLUMN revoke_reason TEXT;

ALTER TABLE material_manual_unlocks
ADD CONSTRAINT check_grant_type_mat CHECK (grant_type IN ('manual', 'payment', 'free_card'));

-- 4. Update Policies
DROP POLICY IF EXISTS "recordings: read eligible or admin" ON public.recordings;
CREATE POLICY "recordings: read eligible or admin" ON public.recordings
FOR SELECT TO authenticated
USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.recording_manual_unlocks ru
    WHERE ru.student_id = auth.uid() 
      AND ru.recording_id = recordings.id
      AND ru.revoked_at IS NULL
  )
);

DROP POLICY IF EXISTS "materials: read eligible or admin" ON public.materials;
CREATE POLICY "materials: read eligible or admin" ON public.materials
FOR SELECT TO authenticated
USING (
  public.is_admin() OR EXISTS (
    SELECT 1 FROM public.material_manual_unlocks mu
    WHERE mu.student_id = auth.uid() 
      AND mu.material_id = materials.id
      AND mu.revoked_at IS NULL
  )
);
