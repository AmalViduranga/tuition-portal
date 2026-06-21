-- =====================================================
-- MIGRATION: SECURITY AUDIT FIXES
-- Date: 2026-06-22
-- Description: Locks down the materials storage bucket,
-- updates RLS access logic to respect revoked enrollments,
-- and prepares profile schema for User-Agent session locks.
-- =====================================================

-- 1. Lock down the public materials bucket
UPDATE storage.buckets
SET public = false
WHERE id = 'materials';

-- Remove the overly permissive public read policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public Access Materials'
  ) THEN
    DROP POLICY "Public Access Materials" ON storage.objects;
  END IF;
END;
$$;

-- Note: Admin uploads and secure signed URLs will use the service_role key,
-- so we don't necessarily need a complex storage policy for downloading if
-- we exclusively use backend-generated signed URLs.


-- 2. Fix `student_can_access_content` to respect revoked_at
CREATE OR REPLACE FUNCTION public.student_can_access_content(p_class_id uuid, p_release_at date)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check enrollment window (Must NOT be revoked)
  IF EXISTS (
    SELECT 1 FROM public.student_class_enrollments
    WHERE student_id = auth.uid()
      AND class_id = p_class_id
      AND p_release_at >= start_access_date
      AND p_release_at <= COALESCE(access_end_date, start_access_date + 40)
      AND revoked_at IS NULL
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


-- 3. Enhance Session Lock with User-Agent hash
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS current_session_user_agent_hash TEXT DEFAULT NULL;
