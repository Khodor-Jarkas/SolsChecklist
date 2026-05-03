-- Sol's Checklist — 2026-05 bug-list pass.
-- One-shot patch consolidating every Supabase change from the May 2026
-- bug-list cleanup. Run once, in any Supabase SQL editor, after the
-- existing schema + seeds. Idempotent: re-running is a no-op.
--
-- Companion code changes live in the app repo (rarity labels, sorter,
-- AuraChecklist filters/render). This file only touches the database.

-- ============================================================================
-- Schema: add `secondary_obtainment` so an aura can carry a second source
-- tag (e.g. Winter 2025 auras that are both Roll and Wheel obtainable).
-- ============================================================================
alter table public.auras
  add column if not exists secondary_obtainment text;

create index if not exists auras_secondary_obtainment_idx
  on public.auras(secondary_obtainment);

-- ============================================================================
-- Singularity biome reassignment.
-- Per the Singularity Biome Update infographic, COMET / Galaxy / Gargantua
-- are now Singularity-exclusive and no longer roll out of Starfall.
-- ============================================================================
update public.auras set biome = 'Singularity'
 where name in ('Comet', 'Galaxy', 'Gargantua');

-- ============================================================================
-- Innovator: rename event tag to "RIA event" and clear the incorrect
-- battle_pass classification — the headline aura was actually rollable.
-- ============================================================================
update public.auras set event_name = 'RIA event'
 where event_name = 'Innovator';

update public.auras set obtainment = 'roll'
 where name = 'Innovator';

-- ============================================================================
-- Dev Biomes → Admin Events.
-- The four Boss Raid 2 court / dev-biome auras keep their `biome` field
-- (Citadel of Orders / Null's Existence / Hyperspace Realm), which the UI
-- uses to sub-group them by the dev responsible (Word / Axis / Xyz).
-- ============================================================================
update public.auras set event_name = 'Admin Events'
 where event_name = 'Dev Biomes';

-- ============================================================================
-- Winter 2025 dual-source: Wonderland, Santa Frost, Winter Fantasy, Express,
-- Abomitable, Atlas : Yuletide are primarily rolled but also offered as
-- Winter Wheel rewards. They keep obtainment='roll' so the Roll filter
-- still picks them up; secondary_obtainment='wheel' adds the Wheel badge
-- and makes the Wheel filter match too.
-- ============================================================================
update public.auras set secondary_obtainment = 'wheel'
 where name in (
   'Wonderland',
   'Santa Frost',
   'Winter Fantasy',
   'Express',
   'Abomitable',
   'Atlas : Yuletide'
 );

-- ============================================================================
-- Eon 1-20 update — new auras.
-- ============================================================================

-- Singularity-exclusive auras. rarity_odds carries the in-biome roll rate
-- since these are unrollable outside Singularity.
insert into public.auras (name, rarity, rarity_odds, biome) values
  ('Pleiades',     'unique',          65358,         'Singularity'),
  ('Pulsar',       'unique',          83345,         'Singularity'),
  ('Constella',    'unique',          86988,         'Singularity'),
  ('Vega',         'mythic',          2580000,       'Singularity'),
  ('Astronaut',    'mythic',          6117186,       'Singularity'),
  ('Centurion',    'exalted',         25000000,      'Singularity'),
  ('Projection',   'glorious',        197000000,     'Singularity'),
  ('Point : Zero', 'glorious',        521121900,     'Singularity'),
  ('Astraios',     'challenged_plus', 1750000000,    'Singularity')
on conflict (name) do nothing;

-- Boosted-in-biome auras (rollable globally, better odds in their biome).
insert into public.auras (name, rarity, rarity_odds, native_biome_odds, biome) values
  ('Virtual Memory', 'glorious', 232232232, 116116116, 'Cyberspace'),
  ('Oculus',         'exalted',  23233340,  4646668,   'Heaven')
on conflict (name) do nothing;

-- Globally rollable, no biome.
insert into public.auras (name, rarity, rarity_odds) values
  ('Dizzy', 'common', 123)
on conflict (name) do nothing;

-- Cell Asteroides — Exalted-tier crafted aura. Rarity tier is exalted (for
-- collection-stat purposes) but it has no roll odds; obtainment is craft.
insert into public.auras (name, rarity, rarity_odds, obtainment, description) values
  ('Cell Asteroides', 'exalted', null, 'craft', 'Crafted aura. Grants 5,000,000 collected stats.')
on conflict (name) do nothing;

-- New auras default to obtainment='roll' from the migration-004 default,
-- but the inserts above bypassed that for non-roll cases — make sure any
-- new roll-only Singularity / boosted auras above land on 'roll'.
update public.auras set obtainment = 'roll'
 where obtainment is null
   and name in (
     'Pleiades', 'Pulsar', 'Constella', 'Vega', 'Astronaut',
     'Centurion', 'Projection', 'Point : Zero', 'Astraios',
     'Virtual Memory', 'Oculus', 'Dizzy'
   );

-- ============================================================================
-- Craftable aura difficulty order.
-- rarity_odds is repurposed as a rank (1 = easiest) so the Crafting section
-- sorts by actual recipe difficulty rather than alphabetically.
-- Order derived from crafting stat value & known recipe complexity:
--   1. Eclipse          (30k stat  — needs Divinus + Solar + Lunar)
--   2. Chromatic : Hyper(35M stat  — medium recipe)
--   3. Atlas : A.T.L.A.S(470M stat — needs 1× Atlas, Glorious tier)
--   4. Matrix : Steampunk(high stat — 9× Matrix + bulk items)
--   5. MasterHand       (highest   — ~3× Matrix : Steampunk's full recipe)
-- ============================================================================
update public.auras set rarity_odds = 1 where name = 'Eclipse'           and rarity = 'craftable';
update public.auras set rarity_odds = 2 where name = 'Chromatic : Hyper' and rarity = 'craftable';
update public.auras set rarity_odds = 3 where name = 'Atlas : A.T.L.A.S.'and rarity = 'craftable';
update public.auras set rarity_odds = 4 where name = 'Matrix : Steampunk' and rarity = 'craftable';
update public.auras set rarity_odds = 5 where name = 'MasterHand'         and rarity = 'craftable';

