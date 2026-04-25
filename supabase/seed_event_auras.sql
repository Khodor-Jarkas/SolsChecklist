-- Event auras — sourced from the "Events and Special Auras" wiki page.
-- Each row is (name, rarity, rarity_odds, event_name, event_year).
-- Limited/craft-only auras without a documented roll have rarity_odds = null
-- and are tagged `craftable`.
--
-- Idempotent: if a row already exists it just tags it with the event.
-- Run AFTER migration 003 (adds event_name / event_year columns).

insert into public.auras (name, rarity, rarity_odds, event_name, event_year) values
  -- Valentine's Day 2024
  ('Divinus : Love',        'craftable', null,          'Valentine''s Day', 2024),
  ('Flushed : Heart Eye',   'craftable', null,          'Valentine''s Day', 2024),
  ('Celestial : Cupid',     'craftable', null,          'Valentine''s Day', 2024),
  ('Blossom',               'craftable', null,          'Valentine''s Day', 2024),

  -- April Fools 2024
  ('Defined',               'mythic',    2222000,       'April Fools',      2024),
  ('Kromat1k',              'exalted',   40000000,      'April Fools',      2024),
  ('Impeached : i''m peach','glorious',  400000000,     'April Fools',      2024),

  -- Summer 2024
  ('Surfer',                'craftable', null,          'Summer',           2024),
  ('StarRider : Starfish',  'legendary', 250000,        'Summer',           2024),
  ('Watermelon',            'legendary', 320000,        'Summer',           2024),
  ('Shard Surfer',          'glorious',  225000000,     'Summer',           2024),

  -- Innovator Event 2024
  ('Innovator',             'exalted',   30000000,      'Innovator',        2024),

  -- Halloween 2024
  ('Pump',                  'legendary', 200000,        'Halloween',        2024),
  ('Lunar : Nightfall',     'mythic',    3000000,       'Halloween',        2024),
  ('Vital',                 'mythic',    6000000,       'Halloween',        2024),
  ('Moonflower',            'mythic',    10000000,      'Halloween',        2024),
  ('Cryptfire',             'exalted',   21000000,      'Halloween',        2024),
  ('Soul Hunter',           'exalted',   40000000,      'Halloween',        2024),
  ('Dullahan',              'exalted',   72000000,      'Halloween',        2024),
  ('Nightmare Sky',         'glorious',  190000000,     'Halloween',        2024),
  ('Harvester',             'glorious',  666000000,     'Halloween',        2024),
  ('Apostolos : Veil',      'glorious',  800000000,     'Halloween',        2024),

  -- Winter 2025
  ('Blossom : Frozen',      'craftable', null,          'Winter',           2025),
  ('Frigid',                'craftable', null,          'Winter',           2025),
  ('Wonderland',            'exalted',   12000000,      'Winter',           2025),
  ('Santa Frost',           'exalted',   45000000,      'Winter',           2025),
  ('Winter Fantasy',        'exalted',   72000000,      'Winter',           2025),
  ('Express',               'exalted',   90000000,      'Winter',           2025),
  ('Abomitable',            'glorious',  120000000,     'Winter',           2025),
  ('Atlas : Yuletide',      'glorious',  510000000,     'Winter',           2025),

  -- April Fools 2025
  ('Pukeko',                'epic',      3198,          'April Fools',      2025),
  ('Flushed : Troll',       'mythic',    1000000,       'April Fools',      2025),
  ('Origin : Onion',        'mythic',    8000000,       'April Fools',      2025),
  ('Glock : the glock of the sky','glorious', 170000000,'April Fools',      2025),

  -- Easter 2025 (event eggs — craftable since they double as items)
  ('Windy Egg',             'craftable', null,          'Easter',           2025),
  ('Snowy Egg',             'craftable', null,          'Easter',           2025),
  ('Rainy Egg',             'craftable', null,          'Easter',           2025),
  ('Starfall Egg',          'craftable', null,          'Easter',           2025),
  ('Hellfire Egg',          'craftable', null,          'Easter',           2025),
  ('Corruption Egg',        'craftable', null,          'Easter',           2025),
  ('Sandstorm Egg',         'craftable', null,          'Easter',           2025),
  ('Null Egg',              'craftable', null,          'Easter',           2025),
  ('Glitched Egg',          'craftable', null,          'Easter',           2025),

  -- Summer 2025
  ('Manta',                 'glorious',  300000000,     'Summer',           2025),
  ('Aegis : Watergun',      'glorious',  825000000,     'Summer',           2025),
  ('SandBasket',            'craftable', null,          'Summer',           2025),
  ('Bubble',                'craftable', null,          'Summer',           2025),
  ('Bioluminescent',        'craftable', null,          'Summer',           2025),
  ('Life Guard',            'craftable', null,          'Summer',           2025),
  ('Ink : PaintballGun',    'craftable', null,          'Summer',           2025),
  ('Parasol',               'craftable', null,          'Summer',           2025),

  -- Halloween 2025
  ('Pump : Trickster',      'legendary', 600000,        'Halloween',        2025),
  ('Celestial : Wicked',    'mythic',    1500000,       'Halloween',        2025),
  ('Lunar : Cultist',       'mythic',    2000000,       'Halloween',        2025),
  ('Headless',              'mythic',    3200000,       'Halloween',        2025),
  ('Werewolf',              'mythic',    3600000,       'Halloween',        2025),
  ('Shucks',                'mythic',    4460000,       'Halloween',        2025),
  ('Oni',                   'mythic',    6666666,       'Halloween',        2025),
  ('Sinister',              'exalted',   15000000,      'Halloween',        2025),
  ('Headless : Horseman',   'exalted',   32000000,      'Halloween',        2025),
  ('Reaper',                'exalted',   66000000,      'Halloween',        2025),
  ('Accursed',              'exalted',   82000000,      'Halloween',        2025),
  ('Bloodgarden',           'exalted',   88000000,      'Halloween',        2025),
  ('Grief',                 'exalted',   88250000,      'Halloween',        2025),
  ('Crimson',               'glorious',  120000000,     'Halloween',        2025),
  ('Graveborn',             'glorious',  290000000,     'Halloween',        2025),
  ('Afterparty',            'glorious',  440000000,     'Halloween',        2025),
  ('Phantasma',             'glorious',  462000000,     'Halloween',        2025),
  ('Apocalypse',            'glorious',  624000000,     'Halloween',        2025),
  ('Wraithlight',           'glorious',  695000000,     'Halloween',        2025),
  ('Malediction',           'glorious',  730000000,     'Halloween',        2025),
  ('Banshee',               'glorious',  730000000,     'Halloween',        2025),
  ('Ravage',                'glorious',  930000000,     'Halloween',        2025),
  ('Arachnophobia',         'glorious',  940000000,     'Halloween',        2025),
  ('Lamenthyr',             'transcendent', 1000000000, 'Halloween',        2025),
  ('Erebus',                'transcendent', 1200000000, 'Halloween',        2025),
  ('Veinweaver',            'craftable', null,          'Halloween',        2025),
  ('Dreadsea',              'craftable', null,          'Halloween',        2025),
  ('Carousel',              'craftable', null,          'Halloween',        2025),
  ('Lament',                'craftable', null,          'Halloween',        2025),
  ('Thaneborne',            'craftable', null,          'Halloween',        2025),
  ('Slaughter',             'craftable', null,          'Halloween',        2025),

  -- Christmas 2025
  ('Snowball',              'unique',    10000,         'Christmas',        2025),
  ('StarRider : Snowflake', 'legendary', 240000,        'Christmas',        2025),
  ('Cryogenic',             'legendary', 250000,        'Christmas',        2025),
  ('Gingerbread',           'mythic',    3750000,       'Christmas',        2025),
  ('Jackfrost',             'mythic',    4700000,       'Christmas',        2025),
  ('Lost Soul : Wander',    'mythic',    9400000,       'Christmas',        2025),
  ('Frostwood',             'exalted',   24500000,      'Christmas',        2025),
  ('North Pole',            'exalted',   45000000,      'Christmas',        2025),
  ('Sky Burst',             'exalted',   60000000,      'Christmas',        2025),
  ('Encase',                'glorious',  230000000,     'Christmas',        2025),
  ('CryoFang',              'glorious',  380000000,     'Christmas',        2025),
  ('Northern',              'glorious',  405000000,     'Christmas',        2025),
  ('EveNight',              'glorious',  424000000,     'Christmas',        2025),
  ('Workshop',              'glorious',  700000000,     'Christmas',        2025),
  ('Parol',                 'glorious',  760000000,     'Christmas',        2025),
  ('Sovereign : Frostveil', 'transcendent', 1000000000, 'Christmas',        2025),
  ('Winter Garden',         'transcendent', 1450012025, 'Christmas',        2025),
  ('Dream Traveler',        'transcendent', 2025012025, 'Christmas',        2025),
  ('Present',               'craftable', null,          'Christmas',        2025),
  ('Skyforge',              'craftable', null,          'Christmas',        2025),
  ('Christmastide',         'craftable', null,          'Christmas',        2025),
  ('Reina',                 'craftable', null,          'Christmas',        2025),

  -- Valentine's Day 2026
  ('Velvet',                'craftable', null,          'Valentine''s Day', 2026),
  ('Symphony : Bloomed',    'glorious',  375000000,     'Valentine''s Day', 2026),

  -- Easter 2026
  ('Hatchwarden',           'exalted',   40000000,      'Easter',           2026),
  ('Emperor',               'exalted',   80000000,      'Easter',           2026),
  ('Eggsistance',           'glorious',  307777777,     'Easter',           2026),
  ('Revive',                'glorious',  645000000,     'Easter',           2026),
  ('Eggore',                'glorious',  700000000,     'Easter',           2026),
  ('Eostre',                'transcendent', 1000000000, 'Easter',           2026),
  ('Aegis : Eggis',         'transcendent', 1150000000, 'Easter',           2026),
  ('Yolkegg',               'transcendent', 1790909090, 'Easter',           2026),
  ('Sky Festival',          'transcendent', 2000000000, 'Easter',           2026),
  ('Egger',                 'craftable', null,          'Easter',           2026),
  ('Easter Isles',          'craftable', null,          'Easter',           2026),
  ('Aeroquest',             'craftable', null,          'Easter',           2026),
  ('Rabbit Invasion',       'craftable', null,          'Easter',           2026),
  ('Scavenger',             'craftable', null,          'Easter',           2026),
  ('Zilch',                 'craftable', null,          'Easter',           2026),

  -- April Fools 2026
  ('Burger',                'legendary', 676767,        'April Fools',      2026),
  ('StarRider : yourdidit', 'mythic',    1234567,       'April Fools',      2026),
  ('Bounded : Kidnapped',   'mythic',    2000000,       'April Fools',      2026),
  ('Very Small Sewage Rat That''s About 3.082 Studs Long', 'exalted', 20070629, 'April Fools', 2026),
  ('Pukeko : Jumping',      'exalted',   31980000,      'April Fools',      2026),
  ('Aether : Disappointment','exalted',  33333330,      'April Fools',      2026),
  ('Bloated.exe',           'exalted',   67676767,      'April Fools',      2026),
  ('Impeached : Imcrine',   'glorious',  250000000,     'April Fools',      2026),
  ('Doodle : Abyssal Hunter','glorious', 400000000,     'April Fools',      2026),
  ('Surfer : Symphony',     'glorious',  600000000,     'April Fools',      2026),
  ('Lumenpool : Ramenpool', 'glorious',  630000000,     'April Fools',      2026),
  ('Workshop : System',     'glorious',  650000000,     'April Fools',      2026),
  ('Pukeko : P.U.K.E.K.O.G.O.D.','transcendent', 1000000000,'April Fools',  2026),
  ('A Fool''s Experience',  'transcendent', 1000000000, 'April Fools',      2026),
  ('Equinox : You Are An Idiot','transcendent', 2500000000,'April Fools',   2026)
on conflict (name) do update set
  event_name = excluded.event_name,
  event_year = excluded.event_year;

-- Boss Raid 2 Update (Eon 1-16 / 1-17) — court & dev-biome auras.
-- These spawn only in dev-spawned biomes (Citadel of Orders, The Null's
-- Existence, Hyperspace Realm) so they're tagged Dev Biomes / 2026.
insert into public.auras (name, rarity, rarity_odds, biome, event_name, event_year) values
  ('Attorney',  'legendary', 270000, 'The Citadel of Orders', 'Dev Biomes', 2026),
  ('Clockwork', 'legendary', 530000, 'The Null''s Existence', 'Dev Biomes', 2026),
  ('Prowler',   'legendary', 540000, 'The Hyperspace Realm',  'Dev Biomes', 2026),
  ('Verdict',   'legendary', 700000, 'The Citadel of Orders', 'Dev Biomes', 2026)
on conflict (name) do update set
  event_name = excluded.event_name,
  event_year = excluded.event_year,
  biome      = excluded.biome;
