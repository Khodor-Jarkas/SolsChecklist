-- Migration: add obtainment method to auras.
-- How an aura is acquired: roll, craft, shop, battle_pass, quest, wheel, ugc, login.
-- Nullable — unknown/unspecified leaves it blank.
--
-- Idempotent. Run AFTER migrations 001-003.

alter table public.auras add column if not exists obtainment text;
create index if not exists auras_obtainment_idx on public.auras(obtainment);

-- Default every existing aura to 'roll' — all non-event, pre-004 rows got
-- their rarity_odds from the main catalog, which means they're rollable. This
-- is overridden per-aura by seed_event_aura_obtainment.sql.
update public.auras set obtainment = 'roll' where obtainment is null;
