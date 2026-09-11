-- ========================================================
-- AdeptIELTS — Supabase Production Database Schema
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Learner Profiles Table
create table if not exists public.learner_profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  display_name text not null default 'Learner',
  avatar_url text,
  target_band numeric(2,1) not null default 7.5 check (target_band between 1.0 and 9.0),
  current_estimated_band numeric(2,1) not null default 6.0 check (current_estimated_band between 1.0 and 9.0),
  test_type text not null default 'academic' check (test_type in ('academic', 'general')),
  exam_date date,
  available_daily_minutes integer not null default 45,
  skill_bands jsonb not null default '{"reading": 6.0, "listening": 6.5, "writing": 5.5, "speaking": 6.0}'::jsonb,
  subskill_mastery jsonb not null default '{}'::jsonb,
  streak integer not null default 1,
  last_active_date date not null default current_date,
  total_study_minutes integer not null default 0,
  onboarding_completed boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Question Attempts Table
create table if not exists public.question_attempts (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.learner_profiles(id) on delete cascade,
  question_id text not null,
  skill text not null,
  subskill text not null,
  user_answer text not null,
  is_correct boolean not null,
  time_spent_seconds integer not null default 0,
  confidence_rating text check (confidence_rating in ('low', 'medium', 'high')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Writing Submissions Table
create table if not exists public.writing_submissions (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.learner_profiles(id) on delete cascade,
  task_type text not null check (task_type in ('task1', 'task2')),
  prompt_title text not null,
  prompt_text text not null,
  essay_text text not null,
  word_count integer not null default 0,
  time_spent_seconds integer not null default 0,
  feedback jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Speaking Sessions Table
create table if not exists public.speaking_sessions (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.learner_profiles(id) on delete cascade,
  part integer not null check (part in (1, 2, 3)),
  topic text not null,
  prompt text not null,
  bullet_points jsonb,
  transcript text not null,
  duration_seconds integer not null default 0,
  feedback jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Vocabulary Cards (Spaced Repetition) Table
create table if not exists public.vocabulary_cards (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.learner_profiles(id) on delete cascade,
  word text not null,
  phonetic text,
  part_of_speech text,
  definition text not null,
  collocations jsonb default '[]'::jsonb,
  ielts_context text,
  topic text,
  target_band numeric(2,1) default 7.5,
  repetitions integer default 0,
  interval_days integer default 1,
  next_review_date date not null default current_date,
  last_reviewed date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.learner_profiles enable row level security;
alter table public.question_attempts enable row level security;
alter table public.writing_submissions enable row level security;
alter table public.speaking_sessions enable row level security;
alter table public.vocabulary_cards enable row level security;

-- RLS Policies (Allow access to own rows)
create policy "Allow individual user access to learner_profiles"
  on public.learner_profiles for all
  using (auth.uid() = user_id);

create policy "Allow profile owner access to question_attempts"
  on public.question_attempts for all
  using (profile_id in (select id from public.learner_profiles where user_id = auth.uid()));

create policy "Allow profile owner access to writing_submissions"
  on public.writing_submissions for all
  using (profile_id in (select id from public.learner_profiles where user_id = auth.uid()));

create policy "Allow profile owner access to speaking_sessions"
  on public.speaking_sessions for all
  using (profile_id in (select id from public.learner_profiles where user_id = auth.uid()));

create policy "Allow profile owner access to vocabulary_cards"
  on public.vocabulary_cards for all
  using (profile_id in (select id from public.learner_profiles where user_id = auth.uid()));
