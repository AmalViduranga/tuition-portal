-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS student_class_enrollments_student_id_idx ON student_class_enrollments (student_id);
CREATE INDEX IF NOT EXISTS student_class_enrollments_class_id_idx ON student_class_enrollments (class_id);
CREATE INDEX IF NOT EXISTS student_class_enrollments_student_id_class_id_idx ON student_class_enrollments (student_id, class_id);

CREATE INDEX IF NOT EXISTS recordings_class_id_idx ON recordings (class_id);
CREATE INDEX IF NOT EXISTS recordings_release_at_idx ON recordings (release_at);
CREATE INDEX IF NOT EXISTS recordings_class_id_release_at_idx ON recordings (class_id, release_at);

CREATE INDEX IF NOT EXISTS payments_student_id_idx ON payments (student_id);
CREATE INDEX IF NOT EXISTS payments_class_id_idx ON payments (class_id);
CREATE INDEX IF NOT EXISTS payments_payment_date_idx ON payments (payment_date);

CREATE INDEX IF NOT EXISTS user_roles_user_id_idx ON user_roles (user_id);
