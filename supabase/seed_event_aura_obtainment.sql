-- Event aura obtainment methods — classified from the wiki's
-- `|obtainment=` infobox field for each aura, with manual review.
--
-- Run AFTER migration 004 (which defaults every aura to 'roll').
-- Idempotent: re-running fully resets event obtainment and reapplies
-- the overrides below, so bug fixes propagate cleanly.

-- Reset all event auras to 'roll' first so any previous mis-classification
-- (e.g. an aura moved out of the 'craft' list below) flips back.
update public.auras set obtainment = 'roll' where event_name is not null;

-- Quest rewards
update public.auras set obtainment = 'quest' where name in (
  'Divinus : Love', 'Flushed : Heart Eye', 'Celestial : Cupid', 'Blossom',
  'Blossom : Frozen', 'Frigid',
  'Velvet',
  'Aeroquest', 'Scavenger', 'Surfer : Symphony'
);

-- Battle / season pass rewards
update public.auras set obtainment = 'battle_pass' where name in (
  'Innovator',
  'Life Guard',
  'Slaughter',
  'Reina',
  'Zilch'
);

-- Shop-bought (Lime's, Mari's, token shops, UGC exchanges)
update public.auras set obtainment = 'shop' where name in (
  'Surfer',
  'Bubble', 'Bioluminescent', 'Ink : PaintballGun', 'Parasol',
  'Veinweaver', 'Dreadsea', 'Carousel', 'Lament', 'Thaneborne',
  'Egger', 'Easter Isles', 'Rabbit Invasion',
  'Workshop : System'
);

-- Crafted / item-use only: the nine Biome Eggs are obtained by using the
-- corresponding egg item. Eggore and Aether : Disappointment were corrected
-- out — both are actually roll-obtainable (Eggore has a 1/700M roll in
-- addition to being egg-related, so roll is the primary method).
update public.auras set obtainment = 'craft' where name in (
  'Windy Egg', 'Snowy Egg', 'Rainy Egg', 'Starfall Egg', 'Hellfire Egg',
  'Corruption Egg', 'Sandstorm Egg', 'Null Egg', 'Glitched Egg'
);

-- Wheel / Roulette rewards
update public.auras set obtainment = 'wheel' where name in (
  'StarRider : Snowflake',
  'Present', 'Skyforge', 'Christmastide'
);
