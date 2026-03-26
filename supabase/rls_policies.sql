-- ============================================
-- Tuition Portal RLS Policies (Supabase)
-- ============================================
-- System roles: admin, student
--
-- SECURITY GOALS
-- - Students can only read their own profile.
-- - Students can only read classes they are enrolled in.
-- - Students can only read recordings/materials they are allowed to access:
--   - must be enrolled
--   - release_at must be >= start_access_date
--   - and must fall inside an approved payment window OR recording unlocked manually
-- - Students must never directly read admin-only payment data.
-- - Admin can manage all data.
--
-- NOTES
-- - We use helper functions to prevent students from needing direct SELECT on payment_reviews.
-- - payment_reviews access stays admin-only. Access checks for recordings/materials are done via
--   a SECURITY DEFINER function that evaluates approved windows for auth.uid().

-- ------------------------------------------------------------
-- Helpers
-- ------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
security definer
set search_path = public
language plpgsql
as $$
begin
  return exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
end;
$$;

create or replace function public.student_has_approved_payment(
  p_class_id uuid,
  p_release_at date
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  -- If not authenticated, always deny.
  if auth.uid() is null then
    return false;
  end if;

  return exists (
    select 1
    from public.payment_reviews pr
    where pr.student_id = auth.uid()
      and pr.class_id = p_class_id
      and pr.review_status = 'approved'
      and pr.approved_from is not null
      and pr.approved_until is not null
      and p_release_at between pr.approved_from and pr.approved_until
  );
end;
$$;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.student_has_approved_payment(uuid, date) to authenticated;

-- ------------------------------------------------------------
-- Enable RLS on all relevant tables
-- ------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.student_class_enrollments enable row level security;
alter table public.recordings enable row level security;
alter table public.student_recording_unlocks enable row level security;
alter table public.materials enable row level security;
alter table public.payment_reviews enable row level security;

-- ------------------------------------------------------------
-- 1) profiles
-- ------------------------------------------------------------
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select to authenticated
using (
  id = auth.uid()
  or public.is_admin()
);

-- Student can update only their own profile while keeping role+email unchanged.
-- This supports "first login -> must change password" flows that update must_change_password.
drop policy if exists "profiles_update_self_student_safe" on public.profiles;
create policy "profiles_update_self_student_safe"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and role = (select role from public.profiles p where p.id = auth.uid())
  and email = (select email from public.profiles p where p.id = auth.uid())
);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all"
on public.profiles for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 2) classes
-- ------------------------------------------------------------
drop policy if exists "classes_student_select_enrolled_only" on public.classes;
create policy "classes_student_select_enrolled_only"
on public.classes for select to authenticated
using (
  exists (
    select 1
    from public.student_class_enrollments e
    where e.student_id = auth.uid()
      and e.class_id = classes.id
      and e.is_active = true
  )
);

drop policy if exists "classes_admin_all" on public.classes;
create policy "classes_admin_all"
on public.classes for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 3) student_class_enrollments
-- ------------------------------------------------------------
drop policy if exists "enrollments_student_select_own" on public.student_class_enrollments;
create policy "enrollments_student_select_own"
on public.student_class_enrollments for select to authenticated
using (student_id = auth.uid());

drop policy if exists "enrollments_admin_all" on public.student_class_enrollments;
create policy "enrollments_admin_all"
on public.student_class_enrollments for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 4) recordings
-- ------------------------------------------------------------
drop policy if exists "recordings_student_select_access_controlled" on public.recordings;
create policy "recordings_student_select_access_controlled"
on public.recordings for select to authenticated
using (
  (
    -- Must be enrolled and released after (or on) the student's start_access_date
    exists (
      select 1
      from public.student_class_enrollments e
      where e.student_id = auth.uid()
        and e.class_id = recordings.class_id
        and e.is_active = true
        and recordings.release_at >= e.start_access_date
    )
  )
  and (
    -- Access conditions:
    -- - either manually unlocked forever
    exists (
      select 1
      from public.student_recording_unlocks u
      where u.student_id = auth.uid()
        and u.recording_id = recordings.id
    )
    -- - or approved payment window covers the release date
    or public.student_has_approved_payment(recordings.class_id, recordings.release_at)
  )
)
;

drop policy if exists "recordings_admin_all" on public.recordings;
create policy "recordings_admin_all"
on public.recordings for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 5) student_recording_unlocks
-- ------------------------------------------------------------
drop policy if exists "unlock_logs_student_select_own" on public.student_recording_unlocks;
create policy "unlock_logs_student_select_own"
on public.student_recording_unlocks for select to authenticated
using (student_id = auth.uid());

drop policy if exists "unlock_logs_admin_all" on public.student_recording_unlocks;
create policy "unlock_logs_admin_all"
on public.student_recording_unlocks for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 6) materials
-- ------------------------------------------------------------
drop policy if exists "materials_student_select_access_controlled" on public.materials;
create policy "materials_student_select_access_controlled"
on public.materials for select to authenticated
using (
  exists (
    select 1
    from public.student_class_enrollments e
    where e.student_id = auth.uid()
      and e.class_id = materials.class_id
      and e.is_active = true
      and materials.release_at >= e.start_access_date
  )
  and public.student_has_approved_payment(materials.class_id, materials.release_at)
);

drop policy if exists "materials_admin_all" on public.materials;
create policy "materials_admin_all"
on public.materials for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ------------------------------------------------------------
-- 7) payment_reviews (admin-only)
-- ------------------------------------------------------------
-- Students can never directly read payment approval data.
-- Access to paid windows is done only through the SECURITY DEFINER helper function above.
drop policy if exists "payment_reviews_admin_all" on public.payment_reviews;
create policy "payment_reviews_admin_all"
on public.payment_reviews for all to authenticated
using (public.is_admin())
with check (public.is_admin());

-- ============================================================
-- End of policies
-- ============================================================

