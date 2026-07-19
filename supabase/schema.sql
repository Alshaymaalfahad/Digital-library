-- ============================================================================
-- رُواء (Rawaa) — Supabase schema
-- Run this once in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================================

-- Extensions needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles: one row per guardian (extends Supabase's built-in auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  email text,
  phone text,
  language text default 'ar',
  region text,
  notifications boolean default true,
  created_at timestamptz default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- children: each guardian can register multiple children
-- ----------------------------------------------------------------------------
create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  guardian_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  age int,
  gender text check (gender in ('boy', 'girl')),
  reading_level text default 'beginner' check (reading_level in ('beginner', 'intermediate', 'advanced')),
  interests text[] default '{}',
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- stories + story_pages: the 40-story library (seeded from stories.json)
-- ----------------------------------------------------------------------------
create table if not exists public.stories (
  id int primary key,
  title text not null,
  type text,
  age_range text,
  moral text,
  cover_image_prompt text,
  cover_image_url text,
  back_image_prompt text,
  back_image_url text,
  created_at timestamptz default now()
);

create table if not exists public.story_pages (
  id uuid primary key default gen_random_uuid(),
  story_id int not null references public.stories (id) on delete cascade,
  page_number int not null,
  text text not null,
  image_prompt text,
  image_url text,
  unique (story_id, page_number)
);

-- ----------------------------------------------------------------------------
-- favorites: which child likes which story
-- ----------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  story_id int not null references public.stories (id) on delete cascade,
  created_at timestamptz default now(),
  unique (child_id, story_id)
);

-- ----------------------------------------------------------------------------
-- reading_progress: last page a child reached in a story
-- ----------------------------------------------------------------------------
create table if not exists public.reading_progress (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  story_id int not null references public.stories (id) on delete cascade,
  last_page int not null default 0,
  updated_at timestamptz default now(),
  unique (child_id, story_id)
);

-- ============================================================================
-- Row Level Security — a guardian can only see/edit their own data
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.stories enable row level security;
alter table public.story_pages enable row level security;
alter table public.favorites enable row level security;
alter table public.reading_progress enable row level security;

-- profiles: read/update your own row only
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- children: full CRUD limited to rows you own
create policy "children_select_own" on public.children
  for select using (auth.uid() = guardian_id);
create policy "children_insert_own" on public.children
  for insert with check (auth.uid() = guardian_id);
create policy "children_update_own" on public.children
  for update using (auth.uid() = guardian_id);
create policy "children_delete_own" on public.children
  for delete using (auth.uid() = guardian_id);

-- stories + story_pages: public read for any signed-in user (it's a shared library)
create policy "stories_read_all" on public.stories
  for select using (auth.role() = 'authenticated');
create policy "story_pages_read_all" on public.story_pages
  for select using (auth.role() = 'authenticated');

-- favorites: only via a child you own
create policy "favorites_select_own" on public.favorites
  for select using (
    exists (select 1 from public.children c where c.id = child_id and c.guardian_id = auth.uid())
  );
create policy "favorites_insert_own" on public.favorites
  for insert with check (
    exists (select 1 from public.children c where c.id = child_id and c.guardian_id = auth.uid())
  );
create policy "favorites_delete_own" on public.favorites
  for delete using (
    exists (select 1 from public.children c where c.id = child_id and c.guardian_id = auth.uid())
  );

-- reading_progress: only via a child you own
create policy "progress_select_own" on public.reading_progress
  for select using (
    exists (select 1 from public.children c where c.id = child_id and c.guardian_id = auth.uid())
  );
create policy "progress_insert_own" on public.reading_progress
  for insert with check (
    exists (select 1 from public.children c where c.id = child_id and c.guardian_id = auth.uid())
  );
create policy "progress_update_own" on public.reading_progress
  for update using (
    exists (select 1 from public.children c where c.id = child_id and c.guardian_id = auth.uid())
  );
