-- YUWO product image storage
-- Run this once in Supabase SQL Editor. The products table and CMS roles are already configured.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 8388608, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set public = true, file_size_limit = 8388608,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/avif'];

drop policy if exists "YUWO CMS can upload product images" on storage.objects;
create policy "YUWO CMS can upload product images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','admin','editor'))
);

drop policy if exists "YUWO CMS can update product images" on storage.objects;
create policy "YUWO CMS can update product images"
on storage.objects for update to authenticated
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','admin','editor'))
)
with check (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','admin','editor'))
);

drop policy if exists "YUWO CMS can delete product images" on storage.objects;
create policy "YUWO CMS can delete product images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'product-images'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('owner','admin','editor'))
);

drop policy if exists "YUWO product images are publicly viewable" on storage.objects;
create policy "YUWO product images are publicly viewable"
on storage.objects for select to public
using (bucket_id = 'product-images');
