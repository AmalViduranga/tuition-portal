create table if not exists public.student_notification_reads (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  resource_type text not null check (resource_type in ('material', 'recording')),
  resource_id uuid not null,
  seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(student_id, resource_type, resource_id)
);

alter table public.student_notification_reads enable row level security;

create policy "student_notification_reads: self read" on public.student_notification_reads
for select to authenticated
using (student_id = auth.uid() or public.is_admin());

create policy "student_notification_reads: self insert" on public.student_notification_reads
for insert to authenticated
with check (student_id = auth.uid());

create policy "student_notification_reads: admin manage" on public.student_notification_reads
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_student_notification_reads_lookup 
on public.student_notification_reads(student_id, resource_type, resource_id);
