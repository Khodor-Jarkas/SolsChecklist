-- Native biome odds — captured from the Sol's RNG wiki.
-- Run AFTER migration 002. Idempotent.

-- Common
update public.auras set native_biome_odds = 6   where name = 'Divinus';
update public.auras set native_biome_odds = 202 where name = 'Forbidden';
update public.auras set native_biome_odds = 128 where name = 'Gilded';
update public.auras set native_biome_odds = 194 where name = 'Jackpot';
update public.auras set native_biome_odds = 300 where name = 'Wind';

-- Unique
update public.auras set native_biome_odds = 2000  where name = 'Undead';
update public.auras set native_biome_odds = 2400  where name = 'Corrosive';
update public.auras set native_biome_odds = 5000  where name = 'Solar';
update public.auras set native_biome_odds = 5000  where name = 'Lunar';
update public.auras set native_biome_odds = 10000 where name = 'Starlight';
update public.auras set native_biome_odds = 10000 where name = 'StarRider';
update public.auras set native_biome_odds = 14000 where name = 'Hazard : Rays';
update public.auras set native_biome_odds = 24500 where name = 'Permafrost';
update public.auras set native_biome_odds = 29000 where name = 'Flow';
update public.auras set native_biome_odds = 30000 where name = 'Stormal';

-- Legendary
update public.auras set native_biome_odds = 24000  where name = 'Comet';
update public.auras set native_biome_odds = 24000  where name = 'Divinus : Angel';
update public.auras set native_biome_odds = 97745  where name = 'Hope';
update public.auras set native_biome_odds = 111111 where name = 'Undead : Devil';

-- Mythic
update public.auras set native_biome_odds = 200000  where name = 'Starlight : Kunzite';
update public.auras set native_biome_odds = 1111    where name = 'Undefined';
update public.auras set native_biome_odds = 266240  where name = 'Symbiosis';
update public.auras set native_biome_odds = 267200  where name = 'Astral';
update public.auras set native_biome_odds = 999999  where name = 'Player : Respawn';
update public.auras set native_biome_odds = 2121    where name = 'Flowed';
update public.auras set native_biome_odds = 1250000 where name = 'Virtual';
update public.auras set native_biome_odds = 600000  where name = 'Parasite';
update public.auras set native_biome_odds = 600000  where name = 'Orion';
update public.auras set native_biome_odds = 3325    where name = 'Shiftlock';
update public.auras set native_biome_odds = 840000  where name = 'Evanescent';
update public.auras set native_biome_odds = 1000000 where name = 'Poseidon';
update public.auras set native_biome_odds = 2000000 where name = 'Metabytes';
update public.auras set native_biome_odds = 500000  where name = 'Solar : Solstice';
update public.auras set native_biome_odds = 1000000 where name = 'Galaxy';
update public.auras set native_biome_odds = 500000  where name = 'Lunar : Full Moon';
update public.auras set native_biome_odds = 600000  where name = 'Twilight';
update public.auras set native_biome_odds = 1111111 where name = 'Hades';
update public.auras set native_biome_odds = 1800000 where name = 'Anubis';
update public.auras set native_biome_odds = 1450000 where name = 'Faith';
update public.auras set native_biome_odds = 1555555 where name = 'Divinus : Guardian';
update public.auras set native_biome_odds = 2000000 where name = 'Outlaw';
update public.auras set native_biome_odds = 9000    where name = 'Nihility';
update public.auras set native_biome_odds = 1840000 where name = 'Stargazer';
