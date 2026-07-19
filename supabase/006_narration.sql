-- ============================================================================
-- رُواء (Rawaa) — 006: Narration audio (TTS) caching
-- Run this AFTER 005_ratings.sql, once, in the SQL Editor.
-- ============================================================================

-- Cached narration audio URL per page — generated once via the `tts` Edge
-- Function, then reused by every child who reads that page (never regenerated).
alter table public.story_pages add column if not exists audio_url text;
