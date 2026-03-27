-- =====================================================
-- MIGRATION: Admin Dashboard Enhancements
-- Date: 2024-03-27
-- Description: Add new fields and indexes for admin dashboard
-- =====================================================

-- 1. Add published column to recordings
ALTER TABLE recordings
ADD COLUMN published BOOLEAN DEFAULT true,
ADD COLUMN description TEXT;

-- Add index for published filtering
CREATE INDEX idx_recordings_published ON recordings(published);

-- 2. Add published column to materials
ALTER TABLE materials
ADD COLUMN published BOOLEAN DEFAULT true,
ADD COLUMN material_type TEXT CHECK (material_type IN ('tute', 'paper', 'revision', 'other')) DEFAULT 'other';

-- Add index for published and type filtering
CREATE INDEX idx_materials_published ON materials(published);
CREATE INDEX idx_materials_type ON materials(material_type);

-- 3. Add is_active column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT true;

-- Add index for active filtering
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_profiles_phone ON profiles(phone) WHERE phone IS NOT NULL;

-- 4. Add file_size and file_type to materials for better tracking
ALTER TABLE materials
ADD COLUMN file_size BIGINT,
ADD COLUMN file_type TEXT;

-- 5. Add last_accessed tracking (optional, for future use)
-- We'll create a separate table to avoid bloating enrollment table
CREATE TABLE IF NOT EXISTS student_content_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recording_id UUID REFERENCES recordings(id) ON DELETE SET NULL,
  material_id UUID REFERENCES materials(id) ON DELETE SET NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Indexes for access logs
CREATE INDEX idx_access_logs_student ON student_content_access_logs(student_id);
CREATE INDEX idx_access_logs_accessed_at ON student_content_access_logs(accessed_at DESC);

-- 6. Add RLS policies for site_settings (for site content management)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_site_settings_key ON site_settings(key);

-- 7. Add payment_period_status to payment periods (for better tracking)
ALTER TABLE student_class_payment_periods
ADD COLUMN status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'expired')) DEFAULT 'pending';

-- Add index for status filtering
CREATE INDEX idx_payment_periods_status ON student_class_payment_periods(status);

-- 8. Add last_accessed to materials log (for analytics)
ALTER TABLE materials
ADD COLUMN views_count INTEGER DEFAULT 0;

ALTER TABLE recordings
ADD COLUMN views_count INTEGER DEFAULT 0;

-- =====================================================
-- Row Level Security Policies
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_content_access_logs ENABLE ROW LEVEL SECURITY;

-- Site settings: admins can read/write, others can only read certain keys
CREATE POLICY "Admins can manage site settings"
ON site_settings FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Access logs: admins can read all, students can read their own
CREATE POLICY "Admins can read all access logs"
ON student_content_access_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Students can read their own access logs"
ON student_content_access_logs FOR SELECT
TO authenticated
USING (student_id = auth.uid());

-- 9. Update profiles policy to respect is_active
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;

CREATE POLICY "Active profiles are visible to authenticated users"
ON profiles FOR SELECT
TO authenticated
USING (
  is_active = true
  OR EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid()
    AND p.role = 'admin'
  )
);

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON COLUMN recordings.published IS 'Controls whether recording is visible to students';
COMMENT ON COLUMN recordings.description IS 'Detailed description of the recording lesson';
COMMENT ON COLUMN materials.published IS 'Controls whether material is visible to students';
COMMENT ON COLUMN materials.material_type IS 'Type of material: tute, paper, revision, other';
COMMENT ON COLUMN profiles.is_active IS 'Whether student account is active (inactive = deactivated but data preserved)';
COMMENT ON COLUMN profiles.phone IS 'Optional phone number for student contact';
COMMENT ON COLUMN profiles.must_change_password IS 'Whether student must change password on next login (set true for admin-created accounts)';
COMMENT ON COLUMN materials.file_size IS 'File size in bytes';
COMMENT ON COLUMN materials.file_type IS 'MIME type of uploaded file';
