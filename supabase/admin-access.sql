-- YUWO Philippines: initial admin access
-- Run this in Supabase SQL Editor before signing in to /admin.
-- Create the user first in Supabase Dashboard > Authentication > Users.
-- Then replace the email below with that exact user's email and run the INSERT.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  full_name text,
  role text not null default 'editor'
    check (role in ('owner', 'admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A signed-in user may read only their own profile.
drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- No client-side insert/update/delete policies are intentionally provided.
-- Provision accounts and change roles through the Supabase SQL Editor.

-- After creating the first Auth user, run this separately:
-- insert into public.profiles (id, email, full_name, role)
-- select id, email, 'YUWO Owner', 'owner'
-- from auth.users
-- where lower(email) = lower('YOUR_ADMIN_EMAIL')
-- on conflict (id) do update
-- set email = excluded.email,
--     full_name = excluded.full_name,
--     role = 'owner',
--     updated_at = now();

-- To promote another existing Auth user, use:
-- update public.profiles
-- set role = 'admin', updated_at = now()
-- where lower(email) = lower('ADMIN_EMAIL');
