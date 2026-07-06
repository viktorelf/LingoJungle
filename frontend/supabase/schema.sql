create extension if not exists "pgcrypto";

create table if not exists public.languages (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.avatars (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  role text not null,
  tone text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.themes (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  preview_color text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  selected_language_id uuid references public.languages(id),
  selected_goal_id uuid references public.goals(id),
  selected_avatar_id uuid references public.avatars(id),
  selected_theme_id uuid references public.themes(id),
  selected_level_code text not null default 'A1',
  recommended_level_code text,
  placement_completed boolean not null default false,
  coins integer not null default 0,
  level_code text not null default 'A1',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists selected_level_code text not null default 'A1';

alter table public.profiles
  add column if not exists recommended_level_code text;

alter table public.profiles
  add column if not exists placement_completed boolean not null default false;

create table if not exists public.avatar_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  item_type text not null,
  price integer not null default 0,
  asset_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  avatar_item_id uuid not null references public.avatar_items(id) on delete cascade,
  equipped boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, avatar_item_id)
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  language_id uuid not null references public.languages(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade,
  title text not null,
  description text not null,
  target_level text not null default 'B1',
  created_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text not null,
  position integer not null,
  level_code text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  slug text not null unique,
  title text not null,
  topic text not null,
  lesson_type text not null default 'mixed',
  position integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  exercise_type text not null,
  prompt text not null,
  payload jsonb not null default '{}'::jsonb,
  correct_answer text,
  hint_key text,
  position integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  current_module_id uuid references public.modules(id),
  current_lesson_id uuid references public.lessons(id),
  xp integer not null default 0,
  streak integer not null default 0,
  completion_percent numeric(5,2) not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table if not exists public.lesson_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  score_percent numeric(5,2) not null,
  correct_answers integer not null,
  total_answers integer not null,
  coins_earned integer not null default 0,
  weak_topics text[] not null default '{}',
  completed_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.languages enable row level security;
alter table public.goals enable row level security;
alter table public.avatars enable row level security;
alter table public.themes enable row level security;
alter table public.avatar_items enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.exercises enable row level security;
alter table public.user_inventory enable row level security;
alter table public.user_progress enable row level security;
alter table public.lesson_results enable row level security;

drop policy if exists "Authenticated users can read languages" on public.languages;
create policy "Authenticated users can read languages"
on public.languages
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read goals" on public.goals;
create policy "Authenticated users can read goals"
on public.goals
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read avatars" on public.avatars;
create policy "Authenticated users can read avatars"
on public.avatars
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read themes" on public.themes;
create policy "Authenticated users can read themes"
on public.themes
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read avatar items" on public.avatar_items;
create policy "Authenticated users can read avatar items"
on public.avatar_items
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read courses" on public.courses;
create policy "Authenticated users can read courses"
on public.courses
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read modules" on public.modules;
create policy "Authenticated users can read modules"
on public.modules
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read lessons" on public.lessons;
create policy "Authenticated users can read lessons"
on public.lessons
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can read exercises" on public.exercises;
create policy "Authenticated users can read exercises"
on public.exercises
for select
to authenticated
using (true);

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can read own inventory" on public.user_inventory;
create policy "Users can read own inventory"
on public.user_inventory
for select
using (auth.uid() = user_id);

drop policy if exists "Users can manage own inventory" on public.user_inventory;
create policy "Users can manage own inventory"
on public.user_inventory
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own progress" on public.user_progress;
create policy "Users can read own progress"
on public.user_progress
for select
using (auth.uid() = user_id);

drop policy if exists "Users can manage own progress" on public.user_progress;
create policy "Users can manage own progress"
on public.user_progress
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can read own results" on public.lesson_results;
create policy "Users can read own results"
on public.lesson_results
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own results" on public.lesson_results;
create policy "Users can insert own results"
on public.lesson_results
for insert
with check (auth.uid() = user_id);
