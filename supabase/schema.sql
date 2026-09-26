-- Study Bee database schema.
-- Run this once in Supabase → SQL Editor → New query → paste → Run.

-- A study set is one thing a user is studying (e.g. a pasted syllabus).
create table public.study_sets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null,
  source_text text,
  created_at timestamptz not null default now()
);

-- Cards belong to a study set and power flashcards, quizzes, etc.
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  study_set_id uuid not null references public.study_sets (id) on delete cascade,
  front text not null,
  back text not null,
  created_at timestamptz not null default now()
);

create index cards_study_set_id_idx on public.cards (study_set_id);
create index study_sets_user_id_idx on public.study_sets (user_id);

-- Row Level Security: users can only see and change their own data.
alter table public.study_sets enable row level security;
alter table public.cards enable row level security;

create policy "Users manage their own study sets"
  on public.study_sets for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage cards in their own study sets"
  on public.cards for all
  to authenticated
  using (exists (
    select 1 from public.study_sets s
    where s.id = cards.study_set_id and s.user_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from public.study_sets s
    where s.id = cards.study_set_id and s.user_id = (select auth.uid())
  ));
