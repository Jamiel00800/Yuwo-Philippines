-- YUWO CMS: username-only authentication and user administration
-- Run this migration in Supabase SQL Editor before deploying admin-manage-users.

alter table public.profiles
  add column if not exists username text;

-- Backfill existing profiles from the local part of their existing auth/profile email.
-- Add a short stable suffix only when two accounts have the same normalized username.
with source as (
  select
    p.id,
    coalesce(
      nullif(trim(both '._-' from lower(regexp_replace(split_part(coalesce(p.email, ''), '@', 1), '[^a-zA-Z0-9._-]', '', 'g'))), ''),
      'user'
    ) as base_username
  from public.profiles p
  where p.username is null or btrim(p.username) = ''
),
ranked as (
  select id, base_username,
         row_number() over (partition by base_username order by id) as duplicate_number
  from source
)
update public.profiles p
set username = case
  when ranked.duplicate_number = 1 then left(ranked.base_username, 24)
  else left(ranked.base_username, 15) || '_' || substr(ranked.id::text, 1, 8)
end
from ranked
where p.id = ranked.id;

create unique index if not exists profiles_username_lower_unique
  on public.profiles (lower(username))
  where username is not null;

alter table public.profiles
  drop constraint if exists profiles_username_format_check;

alter table public.profiles
  add constraint profiles_username_format_check
  check (username is null or username ~ '^[a-z0-9][a-z0-9._-]{2,23}$');

comment on column public.profiles.username is
  'Unique case-insensitive CMS login username. Supabase Auth uses an internal synthetic email alias; no real email is required.';
