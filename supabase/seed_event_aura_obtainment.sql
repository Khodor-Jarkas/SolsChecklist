-- Event aura obtainment methods — classified from the wiki's
-- `|obtainment=` infobox field for each aura, with manual review.
--
-- Run AFTER migration 004 (which defaults every aura to 'roll').
-- Only non-roll event auras need an explicit update here; rollable
-- event auras are already correctly set to 'roll' by the migration.
--
-- Idempotent.

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

-- Crafted from items / recipes
update public.auras set obtainment = 'craft' where name in (
  'Windy Egg', 'Snowy Egg', 'Rainy Egg', 'Starfall Egg', 'Hellfire Egg',
  'Corruption Egg', 'Sandstorm Egg', 'Null Egg', 'Glitched Egg',
  'Eggore',
  'Aether : Disappointment'
);

-- Wheel / Roulette rewards
update public.auras set obtainment = 'wheel' where name in (
  'StarRider : Snowflake',
  'Present', 'Skyforge', 'Christmastide'
);
