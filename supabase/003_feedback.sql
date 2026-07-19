-- ============================================================================
-- رُواء (Rawaa) — 003: Guardian feedback / complaints
-- Run this AFTER schema.sql and 002_admin.sql, once, in the SQL Editor.
-- ============================================================================

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.profiles (id) on delete cascade,
  category text not null default 'general' check (category in ('bug', 'suggestion', 'complaint', 'general')),
  message text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved')),
  created_at timestamptz default now()
);

alter table public.feedback enable row level security;

-- Guardians can submit and read their own feedback
create policy "feedback_insert_own" on public.feedback
  for insert with check (auth.uid() = guardian_id);

create policy "feedback_select_own_or_admin" on public.feedback
  for select using (auth.uid() = guardian_id or public.is_admin());

-- Only admins can update status (triage)
create policy "feedback_update_admin" on public.feedback
  for update using (public.is_admin());
