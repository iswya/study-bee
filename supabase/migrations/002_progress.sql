-- Study Bee: accounts + progress tracking.
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- (Run schema.sql first if you haven't.)

alter table public.study_sets
  add column if not exists subject text not null default '',
  add column if not exists accent text not null default 'honey';

alter table public.cards
  add column if not exists position int not null default 0,
  add column if not exists known boolean not null default false,
  add column if not exists reviewed_at timestamptz;

-- One row per finished flashcard / quiz round. Powers minutes + streaks.
create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  mode text not null check (mode in ('flashcards', 'quiz')),
  correct int not null,
  total int not null,
  seconds int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists study_sessions_user_id_idx on public.study_sessions (user_id, created_at desc);

alter table public.study_sessions enable row level security;

drop policy if exists "Users manage their own sessions" on public.study_sessions;
create policy "Users manage their own sessions"
  on public.study_sessions for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
