create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'student' check (role in ('admin', 'student')),
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists email text;

create table if not exists public.class_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.student_class_enrollments (
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.class_groups(id) on delete cascade,
  start_access_date date not null,
  access_end_date date,
  access_mode text not null default 'paid' check (access_mode in ('paid', 'free_card', 'manual')),
  created_at timestamptz not null default now(),
  primary key (student_id, class_id)
);

create table if not exists public.student_class_payment_periods (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.class_groups(id) on delete cascade,
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  created_at timestamptz not null default now()
);

create table if not exists public.recordings (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.class_groups(id) on delete cascade,
  title text not null,
  youtube_video_id text not null,
  release_at date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.class_groups(id) on delete cascade,
  title text not null,
  file_url text not null,
  release_at date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.recording_manual_unlocks (
  student_id uuid not null references public.profiles(id) on delete cascade,
  recording_id uuid not null references public.recordings(id) on delete cascade,
  granted_by uuid references auth.users(id),
  grant_type text not null default 'manual' check (grant_type in ('manual', 'payment', 'free_card')),
  revoked_at timestamptz,
  revoke_reason text,
  created_at timestamptz not null default now(),
  primary key (student_id, recording_id)
);

create table if not exists public.material_manual_unlocks (
  student_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid not null references public.materials(id) on delete cascade,
  granted_by uuid references auth.users(id),
  grant_type text not null default 'manual' check (grant_type in ('manual', 'payment', 'free_card')),
  revoked_at timestamptz,
  revoke_reason text,
  created_at timestamptz not null default now(),
  primary key (student_id, material_id)
);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, must_change_password)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    'student',
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.class_groups enable row level security;
alter table public.student_class_enrollments enable row level security;
alter table public.student_class_payment_periods enable row level security;
alter table public.recordings enable row level security;
alter table public.materials enable row level security;
alter table public.recording_manual_unlocks enable row level security;
alter table public.material_manual_unlocks enable row level security;
alter table public.site_settings enable row level security;

create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
end;
$$;

create policy "profiles: self read" on public.profiles
for select to authenticated
using (id = auth.uid() or public.is_admin());

create policy "profiles: admin manage" on public.profiles
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "class_groups: students in enrolled classes read" on public.class_groups
for select to authenticated
using (
  public.is_admin() or exists (
    select 1
    from public.student_class_enrollments e
    where e.class_id = class_groups.id and e.student_id = auth.uid()
  )
);

create policy "class_groups: admin manage" on public.class_groups
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "enrollments: self or admin read" on public.student_class_enrollments
for select to authenticated
using (student_id = auth.uid() or public.is_admin());

create policy "enrollments: admin manage" on public.student_class_enrollments
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "payment_periods: self or admin read" on public.student_class_payment_periods
for select to authenticated
using (student_id = auth.uid() or public.is_admin());

create policy "payment_periods: admin manage" on public.student_class_payment_periods
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "recordings: read eligible or admin" on public.recordings
for select to authenticated
using (
  public.is_admin() or exists (
    select 1
    from public.recording_manual_unlocks ru
    where ru.student_id = auth.uid() 
      and ru.recording_id = recordings.id
      and ru.revoked_at is null
  )
);

create policy "recordings: admin manage" on public.recordings
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "materials: read eligible or admin" on public.materials
for select to authenticated
using (
  public.is_admin() or exists (
    select 1
    from public.material_manual_unlocks mu
    where mu.student_id = auth.uid() 
      and mu.material_id = materials.id
      and mu.revoked_at is null
  )
);

create policy "materials: admin manage" on public.materials
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "recording_unlocks: self or admin read" on public.recording_manual_unlocks
for select to authenticated
using (student_id = auth.uid() or public.is_admin());

create policy "recording_unlocks: admin manage" on public.recording_manual_unlocks
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "material_unlocks: self or admin read" on public.material_manual_unlocks
for select to authenticated
using (student_id = auth.uid() or public.is_admin());

create policy "material_unlocks: admin manage" on public.material_manual_unlocks
for all to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "site_settings: public read" on public.site_settings
for select to anon, authenticated
using (true);

create policy "site_settings: admin manage" on public.site_settings
for all to authenticated
using (public.is_admin())
with check (public.is_admin());
