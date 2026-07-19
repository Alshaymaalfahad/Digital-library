-- ============================================================================
-- رُواء (Rawaa) — 004: Screen time limits + reading time tracking
-- Run this AFTER 003_feedback.sql, once, in the SQL Editor.
-- ============================================================================

-- Guardian-configurable daily limit (minutes). NULL = no limit.
alter table public.children add column if not exists daily_screen_time_minutes int;

-- Cumulative time spent on each story, in seconds — updated incrementally
-- while a child reads (used for "متوسط الجلسة" in the child report).
alter table public.reading_progress add column if not exists time_spent_seconds int not null default 0;
