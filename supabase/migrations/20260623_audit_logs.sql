-- Add Audit Log System

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid primary key default gen_random_uuid(),
    actor_id uuid references public.profiles(id) on delete set null,
    actor_email text,
    actor_role text,
    action text not null,
    target_type text,
    target_id text,
    target_label text,
    metadata jsonb not null default '{}'::jsonb,
    ip_address text,
    user_agent text,
    created_at timestamptz not null default now()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.audit_logs (actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs (target_type, target_id);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Note: We do not add an INSERT policy. 
-- All inserts will be performed server-side using the Supabase Service Role key
-- to ensure clients cannot spoof or tamper with audit logs.
