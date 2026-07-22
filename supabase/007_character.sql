-- ============================================================================
-- رُواء (Rawaa) — 007: Child character selection
-- Run this AFTER 006_narration.sql, once, in the SQL Editor.
-- ============================================================================

-- Which avatar/character a child picked. Values match the `id` field in
-- src/data/characters.js (currently placeholder emoji — swap for real
-- illustrated character art later, no schema change needed to do that).
alter table public.children add column if not exists character_id text;
