-- Sample profiles table structure for role-based auth.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null check (role in ('admin', 'student')) default 'student',
  created_at timestamptz not null default now()
);
