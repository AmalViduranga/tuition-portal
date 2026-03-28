-- Create storage buckets for materials and thumbnails
insert into storage.buckets (id, name, public) 
values ('materials', 'materials', true) 
on conflict (id) do nothing;

insert into storage.buckets (id, name, public) 
values ('thumbnails', 'thumbnails', true) 
on conflict (id) do nothing;

-- Create policies to allow public read access to these buckets
create policy "Public Access Materials" 
on storage.objects for select 
using ( bucket_id = 'materials' );

create policy "Public Access Thumbnails" 
on storage.objects for select 
using ( bucket_id = 'thumbnails' );
