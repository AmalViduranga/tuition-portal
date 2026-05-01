-- Create promotions table
create table public.promotions (
    id uuid primary key default gen_random_uuid(),
    title text,
    description text,
    image_url text not null,
    is_active boolean not null default true,
    target_url text default '/contact',
    starts_at timestamptz,
    ends_at timestamptz,
    created_by uuid references public.profiles(id),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- RLS for promotions table
alter table public.promotions enable row level security;

-- Admins can manage promotions
create policy "promotions: admin all" on public.promotions
for all to authenticated
using (public.is_admin()) 
with check (public.is_admin());

-- Public can view active promotions
create policy "promotions: public read" on public.promotions
for select to public
using (
    is_active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
);

-- Create storage bucket for promotions
insert into storage.buckets (id, name, public) 
values ('promotions', 'promotions', true) 
on conflict (id) do nothing;

-- Public can read promotion images
create policy "Public Access Promotions" 
on storage.objects for select 
using ( bucket_id = 'promotions' );

-- Admins can upload/manage promotion images
create policy "Admin Access Promotions"
on storage.objects for all
to authenticated
using ( bucket_id = 'promotions' and public.is_admin() )
with check ( bucket_id = 'promotions' and public.is_admin() );
