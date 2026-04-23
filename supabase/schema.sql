-- Sol's Checklist — Supabase schema
-- Run this in the Supabase SQL editor once per new project.
-- It creates tables, RLS policies, and the profile auto-create trigger.

-- ============================================================================
-- 1. Enums
-- ============================================================================
create type rarity as enum (
  'common',          -- 1 – 999
  'epic',            -- 1,000 – 9,999
  'unique',          -- 10,000 – 99,999
  'legendary',       -- 100,000 – 999,999
  'mythic',          -- 1,000,000 – 10,000,000
  'exalted',         -- 11,000,000 – 99,000,000
  'glorious',        -- 99,900,000 – 999,000,000
  'transcendent',    -- 1,000,000,000+
  'challenged',
  'challenged_plus',
  'craftable'
);

-- ============================================================================
-- 2. Catalog tables (global, read-only for clients)
-- ============================================================================
create table public.auras (
  id                 bigserial primary key,
  name               text not null unique,
  rarity             rarity not null,
  rarity_odds        bigint,           -- global odds: e.g. 1_000_000 = 1 in 1M
  native_biome_odds  bigint,           -- better odds when in `biome` if any
  biome              text,
  event_name         text,             -- e.g. 'Easter', 'Summer', 'Winter', 'Anniversary'
  event_year         int,              -- year the aura was introduced/available
  obtainment         text,             -- how to obtain: roll, craft, shop, battle_pass, quest, wheel, ugc, login
  image_url          text,
  description        text
);

create table public.achievements (
  id            bigserial primary key,
  name          text not null unique,
  description   text not null,
  category      text,
  image_url     text
);

create table public.items (
  id            bigserial primary key,
  name          text not null unique,
  kind          text not null,         -- 'gear' | 'potion' | 'material' | ...
  description   text,
  image_url     text
);

-- ============================================================================
-- 3. Profiles — one per auth user
-- ============================================================================
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  username    text not null unique,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

-- Auto-create a profile when a new auth user is created.
-- Username candidates (in order): our signup form → Discord handle →
-- Discord display name → generic user_<shortid>. For OAuth signups the
-- Supabase `raw_user_meta_data` carries provider-specific fields.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  uname       text;
  avatar      text;
  meta        jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  uname := coalesce(
    nullif(trim(meta ->> 'username'), ''),
    nullif(trim(meta ->> 'preferred_username'), ''),
    nullif(trim(meta ->> 'user_name'), ''),
    nullif(trim(meta ->> 'name'), ''),
    nullif(trim(meta ->> 'full_name'), ''),
    'user_' || substr(new.id::text, 1, 8)
  );

  -- Keep it filesystem / URL friendly.
  uname := regexp_replace(uname, '[^a-zA-Z0-9_.-]', '_', 'g');
  if length(uname) < 3 then
    uname := uname || substr(md5(random()::text), 1, 4);
  end if;

  -- Ensure uniqueness by appending a short suffix if needed.
  while exists (select 1 from public.profiles where username = uname) loop
    uname := uname || '_' || substr(md5(random()::text), 1, 4);
  end loop;

  avatar := nullif(trim(meta ->> 'avatar_url'), '');

  insert into public.profiles (id, username, avatar_url)
  values (new.id, uname, avatar);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- 4. User progress join tables
-- ============================================================================
create table public.user_auras (
  user_id             uuid not null references public.profiles(id) on delete cascade,
  aura_id             bigint not null references public.auras(id) on delete cascade,
  count               int not null default 1 check (count >= 0),
  first_obtained_at   timestamptz not null default now(),
  primary key (user_id, aura_id)
);

create table public.user_achievements (
  user_id         uuid not null references public.profiles(id) on delete cascade,
  achievement_id  bigint not null references public.achievements(id) on delete cascade,
  unlocked_at     timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table public.user_items (
  user_id   uuid not null references public.profiles(id) on delete cascade,
  item_id   bigint not null references public.items(id) on delete cascade,
  count     int not null default 1 check (count >= 0),
  primary key (user_id, item_id)
);

-- ============================================================================
-- 5. Row-level security
-- ============================================================================
alter table public.auras          enable row level security;
alter table public.achievements   enable row level security;
alter table public.items          enable row level security;
alter table public.profiles       enable row level security;
alter table public.user_auras     enable row level security;
alter table public.user_achievements enable row level security;
alter table public.user_items     enable row level security;

-- Catalog: readable by everyone (including anonymous).
create policy "catalog auras readable"          on public.auras         for select using (true);
create policy "catalog achievements readable"   on public.achievements  for select using (true);
create policy "catalog items readable"          on public.items         for select using (true);

-- Profiles: readable by anyone (so usernames display), only the owner can update.
create policy "profiles readable"       on public.profiles for select using (true);
create policy "profiles self update"    on public.profiles for update using (auth.uid() = id);

-- User progress: publicly readable (for shared /u/<username> profiles),
-- but only the owner can INSERT/UPDATE/DELETE.
create policy "user_auras public select"    on public.user_auras        for select using (true);
create policy "user_auras self insert"      on public.user_auras        for insert with check (auth.uid() = user_id);
create policy "user_auras self update"      on public.user_auras        for update using (auth.uid() = user_id);
create policy "user_auras self delete"      on public.user_auras        for delete using (auth.uid() = user_id);

create policy "user_achievements public select" on public.user_achievements for select using (true);
create policy "user_ach self insert"         on public.user_achievements for insert with check (auth.uid() = user_id);
create policy "user_ach self delete"         on public.user_achievements for delete using (auth.uid() = user_id);

create policy "user_items public select"     on public.user_items        for select using (true);
create policy "user_items self insert"       on public.user_items        for insert with check (auth.uid() = user_id);
create policy "user_items self update"       on public.user_items        for update using (auth.uid() = user_id);
create policy "user_items self delete"       on public.user_items        for delete using (auth.uid() = user_id);

-- ============================================================================
-- 6. Helpful indexes
-- ============================================================================
create index auras_rarity_idx     on public.auras(rarity);
create index auras_biome_idx      on public.auras(biome);
create index auras_event_idx      on public.auras(event_name, event_year);
create index auras_obtainment_idx on public.auras(obtainment);
create index user_auras_user_idx on public.user_auras(user_id);
create index user_ach_user_idx   on public.user_achievements(user_id);
create index user_items_user_idx on public.user_items(user_id);
