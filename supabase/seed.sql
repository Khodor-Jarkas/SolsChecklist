-- Sol's Checklist — seed data.
-- Run AFTER schema.sql (or 001_rarity_overhaul.sql if migrating).
--
-- The full aura catalog lives in `seed_auras.sql` (233+ auras sourced from
-- the Sol's RNG wiki). Run that file AFTER this one, or run both together.

-- ============================================================================
-- Achievements
-- ============================================================================
insert into public.achievements (name, description, category) values
  ('First Roll',            'Roll for the first time.',                           'rolling'),
  ('Hundred Rolls',         'Perform 100 total rolls.',                           'rolling'),
  ('Thousand Rolls',        'Perform 1,000 total rolls.',                         'rolling'),
  ('Ten Thousand Rolls',    'Perform 10,000 total rolls.',                        'rolling'),
  ('Lucky Streak',          'Roll a unique+ aura three times in a row.',          'rolling'),
  ('Common Collector',      'Obtain a common aura.',                              'collection'),
  ('Epic Finder',           'Obtain any epic aura.',                              'collection'),
  ('Unique Hunter',         'Obtain any unique aura.',                            'collection'),
  ('Legendary',             'Obtain any legendary aura.',                         'collection'),
  ('Mythic Mastery',        'Obtain any mythic aura.',                            'collection'),
  ('Exalted One',           'Obtain any exalted aura.',                           'collection'),
  ('Glorious',              'Obtain any glorious aura.',                          'collection'),
  ('Transcendent',          'Obtain any transcendent aura.',                      'collection'),
  ('Challenge Accepted',    'Obtain any challenged aura.',                        'collection'),
  ('Biome Explorer',        'Witness 5 different biomes.',                        'exploration'),
  ('Storm Chaser',          'Roll during a Rainy biome.',                         'exploration'),
  ('Starfall Witness',      'Roll during a Starfall biome.',                      'exploration'),
  ('Hell Dweller',          'Roll during a Hell biome.',                          'exploration'),
  ('First Craft',           'Craft any item for the first time.',                 'crafting'),
  ('Master Crafter',        'Craft 50 items in total.',                           'crafting'),
  ('Gear Up',               'Equip a crafted piece of gear.',                     'crafting')
on conflict (name) do nothing;

-- ============================================================================
-- Items (crafting & gear)
-- ============================================================================
insert into public.items (name, kind, description) values
  ('Lucky Potion',       'potion',   'Temporarily increases luck.'),
  ('Speed Potion',       'potion',   'Reduces roll cooldown.'),
  ('Heavenly Potion',    'potion',   'Strongest luck potion.'),
  ('Merchant Potion',    'potion',   'Boosts merchant chances.'),
  ('Gale Rune',          'gear',     'Movement-focused rune.'),
  ('Titan Rune',         'gear',     'Defensive rune.'),
  ('Galaxy Gauntlet',    'gear',     'Endgame crafted gauntlet.'),
  ('Lucky Coin',         'material', 'Used in luck-based recipes.'),
  ('Stardust',           'material', 'Dropped during Starfall.'),
  ('Void Shard',         'material', 'Rare material from Hell biome.')
on conflict (name) do nothing;
