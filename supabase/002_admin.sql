-- ============================================================================
-- رُواء (Rawaa) — 002: Admin support
-- Run this AFTER schema.sql, once, in: Supabase Dashboard → SQL Editor → Run
-- ============================================================================

-- Add an admin flag to guardian profiles
alter table public.profiles add column if not exists is_admin boolean default false;

-- Security-definer helper: checks if the CURRENT logged-in user is an admin.
-- Runs as the function owner (bypasses RLS internally), which avoids infinite
-- recursion when we reference it from inside the profiles policy itself.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  );
$$;

-- Let admins read every profile (needed for the admin dashboard's account list)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

-- Let admins read every child profile (needed for the "total children" count)
drop policy if exists "children_select_own" on public.children;
create policy "children_select_own_or_admin" on public.children
  for select using (auth.uid() = guardian_id or public.is_admin());
