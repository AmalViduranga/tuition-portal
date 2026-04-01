-- Single-device login restriction for student accounts
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS current_session_lock UUID DEFAULT NULL;

-- Ensure only students have session locks enforced if we want to be explicit,
-- but the column itself can be null for anyone.
