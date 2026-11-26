-- YUWO CMS user administration
-- Run in Supabase SQL Editor. Only existing Super Admin (owner) profiles
-- can list profiles and update roles. The Edge Function uses the service role
-- to invite users and create their profile records after checking the caller.

create or replace function public.is_cms_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

revoke all on function public.is_cms_owner() from public;
grant execute on function public.is_cms_owner() to authenticated;

drop policy if exists "CMS owners can view all profiles" on public.profiles;
create policy "CMS owners can view all profiles"
on public.profiles
for select
to authenticated
using (public.is_cms_owner());

drop policy if exists "CMS owners can update profiles" on public.profiles;
create policy "CMS owners can update profiles"
on public.profiles
for update
to authenticated
using (public.is_cms_owner())
with check (role in ('owner', 'admin', 'editor'));
