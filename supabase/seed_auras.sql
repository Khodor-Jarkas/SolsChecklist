-- Sol's Checklist — full aura catalog seeded from sol-rng.fandom.com/wiki/Auras.
-- Run AFTER schema.sql (and 001_rarity_overhaul.sql if migrating).
-- Idempotent: safe to re-run; duplicates are skipped.
--
-- Source: fandom wiki Auras page (~233 auras across Common/Epic/Unique/
-- Legendary/Mythic/Exalted/Glorious/Transcendent/Challenged/Challenged+/Craftable).
-- If the wiki adds new auras, append them here or edit via Supabase table editor.

-- ============================================================================
-- Common (1 in 1 – 1 in 999)
-- ============================================================================
insert into public.auras (name, rarity, rarity_odds, biome) values
  ('Nothing',      'common',  1,   'The Limbo'),
  ('Common',       'common',  2,   null),
  ('Uncommon',     'common',  4,   null),
  ('Good',         'common',  5,   null),
  ('Natural',      'common',  8,   null),
  ('Rare',         'common',  16,  null),
  ('Divinus',      'common',  32,  'Heaven'),
  ('Crystallized', 'common',  64,  null),
  ('Rage',         'common',  128, null),
  ('Topaz',        'common',  150, null),
  ('Ruby',         'common',  350, null),
  ('Forbidden',    'common',  403, 'Cyberspace'),
  ('Emerald',      'common',  500, null),
  ('Gilded',       'common',  512, 'Sandstorm'),
  ('Ink',          'common',  700, null),
  ('Jackpot',      'common',  777, 'Sandstorm'),
  ('Sapphire',     'common',  800, null),
  ('Aquamarine',   'common',  900, null),
  ('Wind',         'common',  900, 'Windy')
on conflict (name) do nothing;

-- ============================================================================
-- Epic (1 in 1,000 – 1 in 9,999)
-- ============================================================================
insert into public.auras (name, rarity, rarity_odds, biome) values
  ('Diaboli',              'epic', 1004, null),
  ('Precious',             'epic', 1024, null),
  ('Hydrogen',             'epic', 1111, null),
  ('Atomic',               'epic', 1180, null),
  ('Glock',                'epic', 1700, null),
  ('Magnetic',             'epic', 2048, null),
  ('Ash',                  'epic', 2300, null),
  ('Glacier',              'epic', 2304, 'Snowy'),
  ('Player',               'epic', 3000, 'Cyberspace'),
  ('Flora',                'epic', 3700, null),
  ('Cola',                 'epic', 3999, null),
  ('Sidereum',             'epic', 4096, null),
  ('Bleeding',             'epic', 4444, null),
  ('Flutter',              'epic', 5000, null),
  ('Flushed',              'epic', 6900, null),
  ('Hazard',               'epic', 7000, 'Corruption'),
  ('Doodle',               'epic', 7500, null),
  ('Quartz',               'epic', 8192, null),
  ('Honey',                'epic', 8335, null),
  ('Lost Soul',            'epic', 9200, null),
  ('Atomic : Ribonucleic', 'epic', 9876, null)
on conflict (name) do nothing;

-- ============================================================================
-- Unique (1 in 10,000 – 1 in 99,999)
-- Note: ★ is biome-locked to Dreamspace with in-biome odds of 1/100,
-- but classified as Unique on the wiki.
-- ============================================================================
insert into public.auras (name, rarity, rarity_odds, biome) values
  ('★',                   'unique', 100,    'Dreamspace'),
  ('Undead',              'unique', 12000,  'Hell'),
  ('Corrosive',           'unique', 12000,  'Corruption'),
  ('Kawaii',              'unique', 12300,  null),
  ('Rage : Heated',       'unique', 12800,  null),
  ('Ink : Leak',          'unique', 14000,  null),
  ('Powered',             'unique', 16384,  null),
  ('Copper',              'unique', 29000,  null),
  ('Watt',                'unique', 32768,  null),
  ('Aquatic',             'unique', 40000,  null),
  ('Solar',               'unique', 50000,  'Daytime'),
  ('Lunar',               'unique', 50000,  'Nighttime'),
  ('Starlight',           'unique', 50000,  'Starfall'),
  ('StarRider',           'unique', 50000,  'Starfall'),
  ('Flushed : Lobotomy',  'unique', 69000,  null),
  ('Hazard : Rays',       'unique', 70000,  'Corruption'),
  ('Nautilus',            'unique', 70000,  null),
  ('Permafrost',          'unique', 73500,  'Snowy'),
  ('Flow',                'unique', 87000,  'Windy'),
  ('Stormal',             'unique', 90000,  'Windy')
on conflict (name) do nothing;

-- ============================================================================
-- Legendary (1 in 100,000 – 1 in 999,999)
-- ============================================================================
insert into public.auras (name, rarity, rarity_odds, biome) values
  ('★★',              'legendary', 1000,   'Dreamspace'),
  ('Fault',           'legendary', 3000,   'Glitched'),
  ('Exotic',          'legendary', 99999,  null),
  ('Diaboli : Void',  'legendary', 100400, null),
  ('Comet',           'legendary', 120000, 'Starfall'),
  ('Divinus : Angel', 'legendary', 120000, 'Heaven'),
  ('Jade',            'legendary', 125000, null),
  ('Spectre',         'legendary', 140000, null),
  ('Jazz',            'legendary', 160000, null),
  ('Aether',          'legendary', 180000, null),
  ('Bounded',         'legendary', 200000, null),
  ('Lantern',         'legendary', 333333, null),
  ('Celestial',       'legendary', 350000, null),
  ('Terror',          'legendary', 400000, null),
  ('Hope',            'legendary', 488725, 'Heaven'),
  ('Raven',           'legendary', 500000, 'The Limbo'),
  ('Warlock',         'legendary', 666000, null),
  ('Undead : Devil',  'legendary', 666666, 'Hell'),
  ('Kyawthuite',      'legendary', 850000, null)
on conflict (name) do nothing;

-- ============================================================================
-- Mythic (1 in 1,000,000 – 1 in 10,000,000)
-- ============================================================================
insert into public.auras (name, rarity, rarity_odds, biome) values
  ('★★★',                        'mythic', 10000,   'Dreamspace'),
  ('Arcane',                     'mythic', 1000000, null),
  ('Gothic',                     'mythic', 1000001, 'The Limbo'),
  ('Starlight : Kunzite',        'mythic', 1000000, 'Starfall'),
  ('Magnetic : Reverse Polarity','mythic', 1024000, null),
  ('Undefined',                  'mythic', 1111000, 'The Limbo'),
  ('Rage : Brawler',             'mythic', 1280000, null),
  ('Symbiosis',                  'mythic', 1331201, 'Corruption'),
  ('Astral',                     'mythic', 1336000, 'Starfall'),
  ('Cosmos',                     'mythic', 1520000, null),
  ('Archmage',                   'mythic', 1766000, null),
  ('Player : Respawn',           'mythic', 1999999, 'Cyberspace'),
  ('Gravitational',              'mythic', 2000000, null),
  ('Bounded : Unbound',          'mythic', 2000000, null),
  ('Flutter : Buggify',          'mythic', 2000000, null),
  ('Flowed',                     'mythic', 2121121, 'The Limbo'),
  ('Virtual',                    'mythic', 2500000, 'Cyberspace'),
  ('Parasite',                   'mythic', 3000000, 'Corruption'),
  ('Orion',                      'mythic', 3000000, 'Starfall'),
  ('Apatite',                    'mythic', 3133133, null),
  ('Savior',                     'mythic', 3200000, null),
  ('Shiftlock',                  'mythic', 3325000, 'The Limbo'),
  ('Evanescent',                 'mythic', 3360000, 'Rainy'),
  ('Cosmos : Alice',             'mythic', 3500000, null),
  ('Crystallized : Bejeweled',   'mythic', 3600000, null),
  ('Aquatic : Flame',            'mythic', 4000000, null),
  ('Poseidon',                   'mythic', 4000000, 'Rainy'),
  ('Metabytes',                  'mythic', 4000000, 'Cyberspace'),
  ('Wraith',                     'mythic', 4100000, null),
  ('Zeus',                       'mythic', 4500000, null),
  ('Solar : Solstice',           'mythic', 5000000, 'Daytime'),
  ('Galaxy',                     'mythic', 5000000, 'Starfall'),
  ('Lunar : Full Moon',          'mythic', 5000000, 'Nighttime'),
  ('Anima',                      'mythic', 5730000, 'The Limbo'),
  ('Twilight',                   'mythic', 6000000, 'Nighttime'),
  ('Origin',                     'mythic', 6500000, null),
  ('Hades',                      'mythic', 6666666, 'Hell'),
  ('Celestial : Divine',         'mythic', 7000000, null),
  ('Anubis',                     'mythic', 7200000, 'Sandstorm'),
  ('Refraction',                 'mythic', 7242000, null),
  ('Faith',                      'mythic', 7250000, 'Heaven'),
  ('Hyper-Volt',                 'mythic', 7500000, null),
  ('Velocity',                   'mythic', 7630000, null),
  ('Nautilus : Lost',            'mythic', 7700000, null),
  ('Divinus : Guardian',         'mythic', 7777777, 'Heaven'),
  ('Outlaw',                     'mythic', 8000000, 'Sandstorm'),
  ('Harnessed',                  'mythic', 8500000, null),
  ('Nihility',                   'mythic', 9000000, 'The Limbo'),
  ('Helios',                     'mythic', 9000000, null),
  ('Stargazer',                  'mythic', 9200000, 'Starfall'),
  ('Amethyst',                   'mythic', 9333700, null)
on conflict (name) do nothing;

-- ============================================================================
-- Exalted (1 in 11,000,000 – 1 in 99,000,000)
-- ============================================================================
insert into public.auras (name, rarity, rarity_odds, biome) values
  ('Starscourge',                  'exalted', 10000000, 'Starfall'),
  ('Sharkyn',                      'exalted', 10000000, 'Rainy'),
  ('Guardian',                     'exalted', 10000000, null),
  ('Melodic',                      'exalted', 11300000, null),
  ('Sailor',                       'exalted', 12000000, 'Rainy'),
  ('Stormal : Hurricane',          'exalted', 13500000, 'Windy'),
  ('Sirius',                       'exalted', 14000000, 'Starfall'),
  ('Arcane : Legacy',              'exalted', 15000000, null),
  ('Icarus',                       'exalted', 15660000, 'Heaven'),
  ('Lullaby',                      'exalted', 17000000, 'Nighttime'),
  ('Chromatic',                    'exalted', 20000000, null),
  ('Plasma',                       'exalted', 20600000, null),
  ('Aviator',                      'exalted', 24000000, 'Windy'),
  ('Ruby : Brimstone',             'exalted', 24060000, null),
  ('Apotheosis',                   'exalted', 24691356, null),
  ('Blizzard',                     'exalted', 27315000, 'Snowy'),
  ('Arcane : Dark',                'exalted', 30000000, null),
  ('Flora : Florest',              'exalted', 32800000, null),
  ('Ethereal',                     'exalted', 35000000, null),
  ('Virtual : Fatal Error',        'exalted', 40413000, 'Cyberspace'),
  ('Juxtaposition',                'exalted', 40440400, 'The Limbo'),
  ('Overseer',                     'exalted', 45000000, null),
  ('Exotic : Apex',                'exalted', 49999500, null),
  ('Matrix',                       'exalted', 50000000, 'Cyberspace'),
  ('Runic',                        'exalted', 50000000, null),
  ('Sentinel',                     'exalted', 60000000, null),
  ('Twilight : Iridescent Memory', 'exalted', 60000000, 'Nighttime'),
  ('Antivirus',                    'exalted', 62500000, 'Cyberspace'),
  ('Dominion',                     'exalted', 70000000, 'Heaven'),
  ('Starborn',                     'exalted', 72000000, 'Starfall'),
  ('Melodic : Serenade',           'exalted', 77000000, 'Nighttime'),
  ('Sailor : Flying Dutchman',     'exalted', 80000000, 'Rainy'),
  ('Carriage',                     'exalted', 80000000, null),
  ('Aquaria',                      'exalted', 80000000, 'Rainy'),
  ('Virtual : Full Control',       'exalted', 80000000, 'Cyberspace'),
  ('Harnessed : Elements',         'exalted', 85000000, null),
  ('Virtual : WorldWide',          'exalted', 87500000, 'Cyberspace'),
  ('Atomic : Nucleus',             'exalted', 92118000, null)
on conflict (name) do nothing;

-- ============================================================================
-- Glorious (1 in 99,900,000 – 1 in 999,000,000)
-- ============================================================================
insert into public.auras (name, rarity, rarity_odds, biome) values
  ('Chromatic : Genesis',         'glorious', 99999999,  null),
  ('Starscourge : Radiant',       'glorious', 100000000, 'Starfall'),
  ('Spectraflow',                 'glorious', 100000000, null),
  ('Lily',                        'glorious', 112000000, null),
  ('Overture',                    'glorious', 150000000, null),
  ('Symphony',                    'glorious', 175000000, null),
  ('Twilight : Withering Grace',  'glorious', 180000000, 'Nighttime'),
  ('Felled',                      'glorious', 180000000, 'Hell'),
  ('Impeached',                   'glorious', 200000000, 'Corruption'),
  ('Raven : Plague',              'glorious', 200000000, 'The Limbo'),
  ('Lumenpool',                   'glorious', 220000000, 'Rainy'),
  ('Hyper-Volt : Ever-Storm',     'glorious', 225000000, null),
  ('Astral : Zodiac',             'glorious', 267200000, 'Starfall'),
  ('Prophecy',                    'glorious', 275649430, 'Heaven'),
  ('Exotic : Void',               'glorious', 299999999, null),
  ('Overture : History',          'glorious', 300000000, null),
  ('Bloodlust',                   'glorious', 300000000, 'Hell'),
  ('Maelstrom',                   'glorious', 309999999, 'Windy'),
  ('Perpetual',                   'glorious', 315000000, null),
  ('Lotusfall',                   'glorious', 320000000, null),
  ('Jazz : Orchestra',            'glorious', 336870912, null),
  ('Archangel',                   'glorious', 350000000, 'Heaven'),
  ('Atlas',                       'glorious', 360000000, 'Sandstorm'),
  ('Flora : Evergreen',           'glorious', 370073730, null),
  ('Chillsear',                   'glorious', 375000000, 'Snowy'),
  ('Celestial : Eclipse',         'glorious', 384400000, null),
  ('Abyssal Hunter',              'glorious', 400000000, 'Rainy'),
  ('Gargantua',                   'glorious', 430000000, 'Starfall'),
  ('Apostolos',                   'glorious', 444000000, 'The Citadel Of Orders'),
  ('Unknown',                     'glorious', 444444444, 'The Limbo'),
  ('Kyawthuite : Remembrance',    'glorious', 450000000, null),
  ('Ruins',                       'glorious', 500000000, null),
  ('Matrix : Overdrive',          'glorious', 503000000, 'Cyberspace'),
  ('Sailor : Admiral',            'glorious', 540000000, 'Rainy'),
  ('Elude',                       'glorious', 555555555, 'The Limbo'),
  ('Sophyra',                     'glorious', 570000000, null),
  ('Matrix : Reality',            'glorious', 601020102, 'Cyberspace'),
  ('Prologue',                    'glorious', 666616111, 'The Limbo'),
  ('Pythios',                     'glorious', 666666666, 'Hell'),
  ('Sovereign',                   'glorious', 750000000, null),
  ('Ruins : Withered',            'glorious', 800000000, null),
  ('Aegis',                       'glorious', 825000000, 'Cyberspace'),
  ('Dreamscape',                  'glorious', 850000000, 'The Limbo'),
  ('Ascendant',                   'glorious', 935000000, 'Heaven')
on conflict (name) do nothing;

-- ============================================================================
-- Transcendent (1 in 1,000,000,000+)
-- ============================================================================
insert into public.auras (name, rarity, rarity_odds, biome) values
  ('Nyctophobia',  'transcendent', 1011111010, 'The Limbo'),
  ('Pixelation',   'transcendent', 1073741824, 'Cyberspace'),
  ('Luminosity',   'transcendent', 1200000000, null),
  ('Breakthrough', 'transcendent', 1999999999, null),
  ('Equinox',      'transcendent', 2500000000, null)
on conflict (name) do nothing;

-- ============================================================================
-- Challenged (earned via challenges / special conditions, not rolled)
-- ============================================================================
insert into public.auras (name, rarity, rarity_odds, biome, description) values
  ('Glitch',                          'challenged', 12210110,   'Glitched',   null),
  ('Borealis',                        'challenged', 13333333,   'Dreamspace', null),
  ('Leviathan',                       'challenged', 1730400000, 'Rainy',      'Also rollable in Glitched biome.'),
  ('Memory',                          'challenged', 100,        null,         'Obtained from Oblivion Potion.'),
  ('Neferkhaf',                       'challenged', 1000,       null,         'Obtained from Potion of the Dune.'),
  ('Fragments of the Crimson Moon',   'challenged', 1000,       null,         'Obtained from Red Moon Potion.')
on conflict (name) do nothing;

-- ============================================================================
-- Challenged+ (upgraded challenged auras)
-- ============================================================================
insert into public.auras (name, rarity, rarity_odds, biome, description) values
  ('Eden',         'challenged_plus', 50000,      null,         'Obtained from Eden (NPC).'),
  ('Oppression',   'challenged_plus', 220000000,  'Glitched',   null),
  ('Dreammetric',  'challenged_plus', 320000000,  'Dreamspace', null),
  ('Monarch',      'challenged_plus', 3000000000, 'Corruption', 'Also rollable in Glitched biome.'),
  ('Oblivion',     'challenged_plus', 2000,       null,         'Obtained from Oblivion Potion.'),
  ('Illusionary',  'challenged_plus', 10000000,   'Cyberspace', null)
on conflict (name) do nothing;

-- ============================================================================
-- Craftable (obtained via crafting recipes, not rolled)
-- ============================================================================
insert into public.auras (name, rarity, rarity_odds, biome, description) values
  ('Eclipse',              'craftable', null, null, 'Crafted aura.'),
  ('Chromatic : Hyper',    'craftable', null, null, 'Crafted aura.'),
  ('Atlas : A.T.L.A.S.',   'craftable', null, null, 'Crafted aura.'),
  ('Matrix : Steampunk',   'craftable', null, null, 'Crafted aura.'),
  ('MasterHand',           'craftable', null, null, 'Crafted aura.')
on conflict (name) do nothing;
