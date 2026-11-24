-- Public storefront read access for published catalog content.
-- CMS write/manage permissions remain governed by the existing CMS RLS policies.

drop policy if exists "Public can view published products" on public.products;
create policy "Public can view published products"
on public.products
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Public can view variants of published products" on public.product_variants;
create policy "Public can view variants of published products"
on public.product_variants
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_variants.product_id
      and p.status = 'published'
  )
);

drop policy if exists "Public can view images of published products" on public.product_images;
create policy "Public can view images of published products"
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and p.status = 'published'
  )
);
