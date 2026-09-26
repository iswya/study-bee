-- Study Bee: profiles, privacy, leaderboard, avatars.
-- Run once in Supabase → SQL Editor → New query → paste → Run.

-- ───────────── Profiles ─────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (username ~ '^[a-z0-9_]{3,20}$'),
  avatar_emoji text not null default '🐝',
  avatar_color text not null default 'honey',
  avatar_url text,
  is_private boolean not null default false,        -- hide stats + sets from everyone
  show_on_leaderboard boolean not null default true,
  show_sets boolean not null default true,          -- others can browse your sets/cards
  show_activity boolean not null default true,      -- others can see when you're online
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Your own row only. Other people's data goes through the functions below,
-- which apply the privacy settings.
drop policy if exists "Read own profile" on public.profiles;
create policy "Read own profile" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
drop policy if exists "Update own profile" on public.profiles;
create policy "Update own profile" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Turns a name/email into a free username like "sky", "sky2", …
create or replace function public.unique_username(seed text)
returns text language plpgsql security definer set search_path = public as $$
declare
  base text := left(lower(regexp_replace(coalesce(seed, ''), '[^a-zA-Z0-9_]', '', 'g')), 16);
  candidate text;
  n int := 1;
begin
  if length(base) < 3 then base := base || 'bee'; end if;
  candidate := base;
  while exists (select 1 from public.profiles where username = candidate) loop
    n := n + 1;
    candidate := base || n;
  end loop;
  return candidate;
end $$;

-- Every new account gets a profile automatically.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, public.unique_username(coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Profiles for accounts that already exist.
do $$
declare u record;
begin
  for u in select id, email, raw_user_meta_data from auth.users where id not in (select id from public.profiles) loop
    insert into public.profiles (id, username)
    values (u.id, public.unique_username(coalesce(u.raw_user_meta_data ->> 'display_name', split_part(u.email, '@', 1))));
  end loop;
end $$;

-- ───────────── Sharing sets ─────────────
create or replace function public.sets_are_public(owner uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = owner and show_sets and not is_private);
$$;

drop policy if exists "Read public study sets" on public.study_sets;
create policy "Read public study sets" on public.study_sets for select to authenticated
  using (public.sets_are_public(user_id));

drop policy if exists "Read cards in public study sets" on public.cards;
create policy "Read cards in public study sets" on public.cards for select to authenticated
  using (exists (select 1 from public.study_sets s where s.id = cards.study_set_id and public.sets_are_public(s.user_id)));

-- ───────────── Stats ─────────────
-- Consecutive days (UTC) with a study session, ending today or yesterday.
create or replace function public.user_streak(uid uuid)
returns int language sql stable security definer set search_path = public as $$
  with days as (
    select distinct (created_at at time zone 'utc')::date as d from public.study_sessions where user_id = uid
  ), islands as (
    select d, d + (row_number() over (order by d desc))::int as grp from days
  )
  select coalesce((
    select count(*)::int from islands
    where grp = (select grp from islands order by d desc limit 1)
      and (select max(d) from days) >= (now() at time zone 'utc')::date - 1
  ), 0);
$$;

-- Leaderboard: cards reviewed in the last `days` days (null = all time).
create or replace function public.leaderboard(days int default 7)
returns table (
  username text, avatar_emoji text, avatar_color text, avatar_url text,
  cards_reviewed bigint, minutes int, streak int, online boolean, is_me boolean
) language sql stable security definer set search_path = public as $$
  select p.username, p.avatar_emoji, p.avatar_color, p.avatar_url,
         coalesce(sum(s.total), 0)::bigint,
         (coalesce(sum(s.seconds), 0) / 60)::int,
         public.user_streak(p.id),
         p.show_activity and coalesce(p.last_seen_at > now() - interval '5 minutes', false),
         p.id = auth.uid()
  from public.profiles p
  left join public.study_sessions s
    on s.user_id = p.id and (days is null or s.created_at > now() - make_interval(days => days))
  where auth.uid() is not null
    and ((p.show_on_leaderboard and not p.is_private) or p.id = auth.uid())
  group by p.id
  order by 5 desc, 6 desc, p.username
  limit 100;
$$;

-- Everything a profile page needs, with privacy applied.
create or replace function public.get_profile(uname text)
returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  p public.profiles;
  me uuid := auth.uid();
  visible boolean;
begin
  if me is null then return null; end if;
  select * into p from public.profiles where username = lower(uname);
  if not found then return null; end if;
  visible := p.id = me or not p.is_private;

  return jsonb_build_object(
    'id', p.id,
    'username', p.username,
    'avatar_emoji', p.avatar_emoji,
    'avatar_color', p.avatar_color,
    'avatar_url', p.avatar_url,
    'created_at', p.created_at,
    'is_me', p.id = me,
    'is_private', not visible,
    'show_sets', visible and (p.show_sets or p.id = me),
    'online', case when p.id = me or (visible and p.show_activity)
                   then coalesce(p.last_seen_at > now() - interval '5 minutes', false) end,
    'last_seen_at', case when p.id = me or (visible and p.show_activity) then p.last_seen_at end,
    'stats', case when visible then jsonb_build_object(
      'cards_reviewed', (select coalesce(sum(total), 0) from public.study_sessions where user_id = p.id),
      'cards_known', (select count(*) from public.cards c join public.study_sets s on s.id = c.study_set_id
                      where s.user_id = p.id and c.known),
      'minutes', (select coalesce(sum(seconds), 0) / 60 from public.study_sessions where user_id = p.id),
      'sessions', (select count(*) from public.study_sessions where user_id = p.id),
      'accuracy', (select case when sum(total) > 0 then round(100.0 * sum(correct) / sum(total)) end
                   from public.study_sessions where user_id = p.id),
      'streak', public.user_streak(p.id),
      'sets', (select count(*) from public.study_sets where user_id = p.id)
    ) end,
    'activity', case when visible then (
      select coalesce(jsonb_agg(jsonb_build_object('day', d, 'cards', n) order by d), '[]'::jsonb) from (
        select (created_at at time zone 'utc')::date as d, sum(total) as n
        from public.study_sessions
        where user_id = p.id and created_at > now() - interval '84 days'
        group by 1
      ) x
    ) end,
    'studying', case when visible and (p.show_sets or p.id = me) then (
      select jsonb_build_object('id', s.id, 'title', s.title, 'at', ss.created_at)
      from public.study_sessions ss join public.study_sets s on s.id = ss.study_set_id
      where ss.user_id = p.id
      order by ss.created_at desc limit 1
    ) end
  );
end $$;

-- Name + avatar for any user id (shown on shared sets).
create or replace function public.profile_card(uid uuid)
returns table (username text, avatar_emoji text, avatar_color text, avatar_url text)
language sql stable security definer set search_path = public as $$
  select username, avatar_emoji, avatar_color, avatar_url from public.profiles
  where id = uid and auth.uid() is not null;
$$;

revoke execute on function public.leaderboard(int), public.get_profile(text), public.profile_card(uuid),
  public.user_streak(uuid), public.unique_username(text) from anon, public;
grant execute on function public.leaderboard(int), public.get_profile(text), public.profile_card(uuid)
  to authenticated;

-- ───────────── Avatar photos ─────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "Upload own avatar" on storage.objects;
create policy "Upload own avatar" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "List own avatars" on storage.objects;
create policy "List own avatars" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
drop policy if exists "Delete own avatar" on storage.objects;
create policy "Delete own avatar" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
