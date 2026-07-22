-- ============================================================================
-- رُواء (Rawaa) — 008: Child personal PIN
-- Run this AFTER 007_character.sql, once, in the SQL Editor.
-- ============================================================================

-- 4-digit personal code the guardian sets for the child during onboarding.
-- Stored as text to preserve leading zeros (e.g. "0512").
alter table public.children add column if not exists pin text;
