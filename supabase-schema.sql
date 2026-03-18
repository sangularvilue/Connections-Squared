-- Run this in your Supabase SQL editor to set up the database

create table if not exists puzzles (
  id text primary key,
  date date not null,
  title text,
  rows jsonb not null,       -- array of {theme, words, difficulty}
  columns jsonb not null,    -- array of {theme, words, difficulty}
  matrix jsonb not null,     -- 4x4 array of strings
  published boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_puzzles_date on puzzles(date desc);

-- User progress table
create table if not exists user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  puzzle_id text not null references puzzles(id),
  completed boolean default false,
  guesses integer default 0,
  solved_order jsonb,
  played_at timestamptz default now(),
  unique(user_id, puzzle_id)
);

create index idx_user_progress_user on user_progress(user_id);

-- Enable Row Level Security
alter table puzzles enable row level security;
alter table user_progress enable row level security;

-- Puzzles are readable by everyone
create policy "Puzzles are publicly readable"
  on puzzles for select
  using (published = true);

-- User progress is readable/writable by the user
create policy "Users can read own progress"
  on user_progress for select
  using (true);

create policy "Users can insert own progress"
  on user_progress for insert
  with check (true);

create policy "Users can update own progress"
  on user_progress for update
  using (true);
