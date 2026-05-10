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

update public.auras set native_biome_odds = 86000000
 where name = 'Gargantua';

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
-- Cell Asteroides: move to craftable rarity so it appears in the Crafting
-- section rather than the Exalted section.
-- ============================================================================
update public.auras set rarity = 'craftable' where name = 'Cell Asteroides';

-- Ensure craftable auras have null rarity_odds (sort order is handled in the
-- UI via CRAFTABLE_ORDER; non-null odds would show as bogus "1 in N" labels).
update public.auras set rarity_odds = null where rarity = 'craftable';

-- ============================================================================
-- Images for Eon 1-20 new auras (sourced via Fandom API).
-- ============================================================================
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/a/ad/DizzyColl.gif'                where name = 'Dizzy';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/d/da/Cell_Asteroides_collect.gif' where name = 'Cell Asteroides';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/f/f8/Pleiades_collect.gif'        where name = 'Pleiades';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/d/d8/PulsarCollection.gif'        where name = 'Pulsar';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/9/91/Constella_Collection.gif'    where name = 'Constella';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/f/fd/Vega_collect.gif'            where name = 'Vega';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/9/90/Astronautcollection.gif'     where name = 'Astronaut';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/f/f8/CenturionCollection.gif'     where name = 'Centurion';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/8/81/ProjectionCollection.gif'    where name = 'Projection';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/3/3c/PointZeroCol.gif'            where name = 'Point : Zero';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/3/3c/AstriosCollection.gif'       where name = 'Astraios';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/b/ba/Virtual_memory_collect.gif'  where name = 'Virtual Memory';
update public.auras set image_url = 'https://static.wikia.nocookie.net/sol-rng/images/7/7c/Oculus_collect.gif'          where name = 'Oculus';

-- ============================================================================
-- Rarity rename: common → basic + new Dimensional tier.
-- Must extend the enum before updating rows.
-- ============================================================================
alter type rarity add value if not exists 'basic';
alter type rarity add value if not exists 'dimensional';

update public.auras set rarity = 'basic'
 where rarity = 'common';

-- MasterHand is the only Dimensional aura (craftable, odds > 7.5 B).
update public.auras set rarity = 'dimensional'
 where name = 'MasterHand';

-- Gargantua: 1 in 86,000,000 inside Singularity.
update public.auras set native_biome_odds = 86000000
 where name = 'Gargantua';

