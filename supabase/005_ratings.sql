-- ============================================================================
-- رُواء (Rawaa) — 005: Story ratings (5 stars) + admin read access
-- Run this AFTER 004_screen_time.sql, once, in the SQL Editor.
-- ============================================================================

-- One rating per child per story, stored right on their reading progress row
-- (a child only rates a story they've actually opened).
alter table public.reading_progress add column if not exists rating smallint check (rating between 1 and 5);

-- Admins need to read every child's ratings to compute the average score per
-- story — the existing policy only allowed a guardian to see their OWN
-- children's rows. Replace it with a version that also allows admins.
drop policy if exists "progress_select_own" on public.reading_progress;
drop policy if exists "progress_select_own_or_admin" on public.reading_progress;
create policy "progress_select_own_or_admin" on public.reading_progress
  for select using (
    exists (select 1 from public.children c where c.id = child_id and c.guardian_id = auth.uid())
    or public.is_admin()
  );
