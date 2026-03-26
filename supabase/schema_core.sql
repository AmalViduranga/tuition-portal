-- ============================================
-- Tuition Portal Core Schema (Supabase/Postgres)
-- ============================================
-- This file creates the exact tables requested:
-- 1) profiles
-- 2) classes
-- 3) student_class_enrollments
-- 4) recordings
-- 5) student_recording_unlocks
-- 6) materials
-- 7) payment_reviews

create extension if not exists "pgcrypto";

-- --------------------------------------------
-- Shared helpers
-- --------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- --------------------------------------------
-- 1) profiles
-- --------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role text not null default 'student' check (role in ('admin', 'student')),
  must_change_password boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- Auto-create profile row when auth user is created.
create or replace function public.handle_new_auth_user()
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
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

-- --------------------------------------------
-- 2) classes
-- --------------------------------------------
create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists classes_set_updated_at on public.classes;
create trigger classes_set_updated_at
before update on public.classes
for each row execute procedure public.set_updated_at();

-- --------------------------------------------
-- 3) student_class_enrollments
-- --------------------------------------------
create table if not exists public.student_class_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  start_access_date date not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, class_id)
);

drop trigger if exists student_class_enrollments_set_updated_at on public.student_class_enrollments;
create trigger student_class_enrollments_set_updated_at
before update on public.student_class_enrollments
for each row execute procedure public.set_updated_at();

-- --------------------------------------------
-- 4) recordings
-- --------------------------------------------
create table if not exists public.recordings (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  youtube_video_id text not null,
  release_at date not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists recordings_set_updated_at on public.recordings;
create trigger recordings_set_updated_at
before update on public.recordings
for each row execute procedure public.set_updated_at();

-- --------------------------------------------
-- 5) student_recording_unlocks
-- --------------------------------------------
create table if not exists public.student_recording_unlocks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  recording_id uuid not null references public.recordings(id) on delete cascade,
  unlock_reason text,
  created_at timestamptz not null default now(),
  unique (student_id, recording_id)
);

-- --------------------------------------------
-- 6) materials
-- --------------------------------------------
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  title text not null,
  file_url text not null,
  release_at date not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists materials_set_updated_at on public.materials;
create trigger materials_set_updated_at
before update on public.materials
for each row execute procedure public.set_updated_at();

-- --------------------------------------------
-- 7) payment_reviews
-- --------------------------------------------
-- Payment is reviewed manually outside system (e.g. WhatsApp receipts).
-- Approved date range controls what newly released content is accessible.
create table if not exists public.payment_reviews (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  payment_reference text, -- e.g. screenshot/receipt reference or note
  review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'rejected')),
  approved_from date,
  approved_until date,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint approved_dates_required_for_approved check (
    (review_status <> 'approved')
    or (approved_from is not null and approved_until is not null and approved_until >= approved_from)
  )
);

drop trigger if exists payment_reviews_set_updated_at on public.payment_reviews;
create trigger payment_reviews_set_updated_at
before update on public.payment_reviews
for each row execute procedure public.set_updated_at();

-- --------------------------------------------
-- Indexes for performance
-- --------------------------------------------
create index if not exists idx_profiles_role on public.profiles(role);

create index if not exists idx_enrollments_student on public.student_class_enrollments(student_id);
create index if not exists idx_enrollments_class on public.student_class_enrollments(class_id);

create index if not exists idx_recordings_class_release on public.recordings(class_id, release_at);
create index if not exists idx_materials_class_release on public.materials(class_id, release_at);

create index if not exists idx_unlocks_student on public.student_recording_unlocks(student_id);
create index if not exists idx_unlocks_recording on public.student_recording_unlocks(recording_id);

create index if not exists idx_payments_student_class on public.payment_reviews(student_id, class_id);
create index if not exists idx_payments_status_dates on public.payment_reviews(review_status, approved_from, approved_until);

-- --------------------------------------------
-- Seed classes
-- --------------------------------------------
insert into public.classes (name, description)
values
  ('2026 A/L Theory', 'Full theory coverage for 2026 A/L students'),
  ('2026 A/L Revision', 'Revision and model paper discussions for 2026 batch'),
  ('2027 A/L', 'Core A/L Mathematics program for 2027 batch'),
  ('2028 A/L', 'Foundation and long-term preparation for 2028 batch')
on conflict (name) do nothing;

-- --------------------------------------------
-- Role helper
-- --------------------------------------------
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

-- --------------------------------------------
-- Row Level Security
-- --------------------------------------------
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.student_class_enrollments enable row level security;
alter table public.recordings enable row level security;
alter table public.student_recording_unlocks enable row level security;
alter table public.materials enable row level security;
alter table public.payment_reviews enable row level security;

-- profiles: user can read self; admin can manage all
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
on public.profiles for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- classes: authenticated read; admin write
drop policy if exists "classes_select_authenticated" on public.classes;
create policy "classes_select_authenticated"
on public.classes for select to authenticated
using (true);

drop policy if exists "classes_admin_write" on public.classes;
create policy "classes_admin_write"
on public.classes for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- enrollments: student reads own; admin manages all
drop policy if exists "enrollments_select_self_or_admin" on public.student_class_enrollments;
create policy "enrollments_select_self_or_admin"
on public.student_class_enrollments for select to authenticated
using (student_id = auth.uid() or public.is_admin());

drop policy if exists "enrollments_admin_write" on public.student_class_enrollments;
create policy "enrollments_admin_write"
on public.student_class_enrollments for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- payment reviews: student reads own; admin manages all
drop policy if exists "payments_select_self_or_admin" on public.payment_reviews;
create policy "payments_select_self_or_admin"
on public.payment_reviews for select to authenticated
using (student_id = auth.uid() or public.is_admin());

drop policy if exists "payments_admin_write" on public.payment_reviews;
create policy "payments_admin_write"
on public.payment_reviews for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- student manual recording unlocks: student reads own; admin manages all
drop policy if exists "recording_unlocks_select_self_or_admin" on public.student_recording_unlocks;
create policy "recording_unlocks_select_self_or_admin"
on public.student_recording_unlocks for select to authenticated
using (student_id = auth.uid() or public.is_admin());

drop policy if exists "recording_unlocks_admin_write" on public.student_recording_unlocks;
create policy "recording_unlocks_admin_write"
on public.student_recording_unlocks for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- recordings visibility policy:
-- A student can read a recording if:
-- 1) recording belongs to an enrolled class and release_at >= start_access_date
-- 2) AND either manually unlocked forever, OR release_at falls in approved paid period
-- Admin can read/manage all.
drop policy if exists "recordings_select_access_controlled" on public.recordings;
create policy "recordings_select_access_controlled"
on public.recordings for select to authenticated
using (
  public.is_admin()
  or (
    exists (
      select 1
      from public.student_class_enrollments e
      where e.student_id = auth.uid()
        and e.class_id = recordings.class_id
        and e.is_active = true
        and recordings.release_at >= e.start_access_date
    )
    and (
      exists (
        select 1
        from public.student_recording_unlocks u
        where u.student_id = auth.uid()
          and u.recording_id = recordings.id
      )
      or exists (
        select 1
        from public.payment_reviews pr
        where pr.student_id = auth.uid()
          and pr.class_id = recordings.class_id
          and pr.review_status = 'approved'
          and recordings.release_at between pr.approved_from and pr.approved_until
      )
    )
  )
);

drop policy if exists "recordings_admin_write" on public.recordings;
create policy "recordings_admin_write"
on public.recordings for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- materials visibility:
-- Similar rule to recordings, but no manual unlock table requested for materials.
drop policy if exists "materials_select_access_controlled" on public.materials;
create policy "materials_select_access_controlled"
on public.materials for select to authenticated
using (
  public.is_admin()
  or (
    exists (
      select 1
      from public.student_class_enrollments e
      where e.student_id = auth.uid()
        and e.class_id = materials.class_id
        and e.is_active = true
        and materials.release_at >= e.start_access_date
    )
    and exists (
      select 1
      from public.payment_reviews pr
      where pr.student_id = auth.uid()
        and pr.class_id = materials.class_id
        and pr.review_status = 'approved'
        and materials.release_at between pr.approved_from and pr.approved_until
    )
  )
);

drop policy if exists "materials_admin_write" on public.materials;
create policy "materials_admin_write"
on public.materials for all to authenticated
using (public.is_admin())
with check (public.is_admin());
