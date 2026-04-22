-- Sol's Checklist — sample catalog data
-- Run AFTER schema.sql. Values are illustrative samples based on the
-- community wiki; adjust / extend via the Supabase table editor.

-- ============================================================================
-- Auras
-- ============================================================================
insert into public.auras (name, rarity, rarity_odds, biome, description) values
  ('Common',          'common',       4,         null,        'The baseline aura. Easy to roll.'),
  ('Uncommon',        'uncommon',     16,        null,        'Slightly more interesting.'),
  ('Good',            'uncommon',     50,        null,        'A solid roll.'),
  ('Rare',            'rare',         128,       null,        'Starting to feel lucky.'),
  ('Natural',         'rare',         200,       null,        null),
  ('Divinus',         'epic',         1024,      null,        'Holy aura, high-rarity tier.'),
  ('Ancient',         'epic',         2048,      null,        null),
  ('Precious',        'epic',         8192,      null,        null),
  ('Undefined',       'legendary',    10000,     null,        null),
  ('Glock',           'legendary',    10000,     null,        'Joke aura that became iconic.'),
  ('Nautilus',        'legendary',    20000,     'Sea',       'Ocean biome aura.'),
  ('Flushed',         'legendary',    64000,     null,        null),
  ('Starlight',       'mythic',       150000,    'Starfall',  'Rolled more often during Starfall.'),
  ('Wind',            'mythic',       200000,    'Windy',     null),
  ('Jackpot',         'mythic',       250000,    null,        null),
  ('Permafrost',      'mythic',       500000,    'Snowy',     null),
  ('Bloodlust',       'mythic',       1000000,   'Hell',      'Hell biome favored.'),
  ('Corrosive',       'exalted',      2000000,   null,        null),
  ('Magnetic',        'exalted',      4000000,   null,        null),
  ('Undead',          'exalted',      12000000,  'Graveyard', null),
  ('Sidereum',        'celestial',    25000000,  null,        null),
  ('Astral',          'celestial',    50000000,  null,        null),
  ('Arcane',          'celestial',    60000000,  null,        null),
  ('Oppression',      'transcendent', 120000000, null,        null),
  ('Ethereal',        'transcendent', 350000000, null,        null),
  ('Aether',          'transcendent', 500000000, null,        null)
on conflict (name) do nothing;

-- ============================================================================
-- Achievements
-- ============================================================================
insert into public.achievements (name, description, category) values
  ('First Roll',            'Roll for the first time.',                           'rolling'),
  ('Hundred Rolls',         'Perform 100 total rolls.',                           'rolling'),
  ('Thousand Rolls',        'Perform 1,000 total rolls.',                         'rolling'),
  ('Ten Thousand Rolls',    'Perform 10,000 total rolls.',                        'rolling'),
  ('Lucky Streak',          'Roll a rare+ aura three times in a row.',            'rolling'),
  ('Common Collector',      'Obtain a common aura.',                              'collection'),
  ('Rare Hunter',           'Obtain any rare aura.',                              'collection'),
  ('Epic Finder',           'Obtain any epic aura.',                              'collection'),
  ('Mythic Mastery',        'Obtain any mythic aura.',                            'collection'),
  ('Exalted One',           'Obtain any exalted aura.',                           'collection'),
  ('Celestial Walker',      'Obtain any celestial aura.',                         'collection'),
  ('Transcendent',          'Obtain any transcendent aura.',                      'collection'),
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
