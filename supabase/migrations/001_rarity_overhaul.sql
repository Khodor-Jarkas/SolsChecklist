-- Migration: rewrite the rarity enum to match Sol's RNG in-game tiers.
-- Run this ONCE in the Supabase SQL editor if you already ran the original
-- schema.sql. Fresh installs should use the updated schema.sql directly.
--
-- WARNING: this drops and recreates the `auras` and `user_auras` tables,
-- which wipes any aura progress users have logged. Other progress
-- (achievements, items, profiles) is untouched.

begin;

-- Drop dependants first. CASCADE on the type drop is important — without it,
-- Postgres will silently skip the drop if anything still references it, and
-- then the subsequent CREATE TYPE fails with "type already exists".
drop table if exists public.user_auras cascade;
drop table if exists public.auras cascade;
drop type if exists rarity cascade;

-- New enum aligned with in-game tier names + special categories.
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

-- Recreate auras.
create table public.auras (
  id            bigserial primary key,
  name          text not null unique,
  rarity        rarity not null,
  rarity_odds   bigint,
  biome         text,
  image_url     text,
  description   text
);

-- Recreate user_auras with the same shape as schema.sql.
create table public.user_auras (
  user_id             uuid not null references public.profiles(id) on delete cascade,
  aura_id             bigint not null references public.auras(id) on delete cascade,
  count               int not null default 1 check (count >= 0),
  first_obtained_at   timestamptz not null default now(),
  primary key (user_id, aura_id)
);

-- RLS
alter table public.auras       enable row level security;
alter table public.user_auras  enable row level security;

create policy "catalog auras readable"  on public.auras       for select using (true);

create policy "user_auras self select"  on public.user_auras  for select using (auth.uid() = user_id);
create policy "user_auras self insert"  on public.user_auras  for insert with check (auth.uid() = user_id);
create policy "user_auras self update"  on public.user_auras  for update using (auth.uid() = user_id);
create policy "user_auras self delete"  on public.user_auras  for delete using (auth.uid() = user_id);

-- Indexes
create index auras_rarity_idx    on public.auras(rarity);
create index auras_biome_idx     on public.auras(biome);
create index user_auras_user_idx on public.user_auras(user_id);

commit;
