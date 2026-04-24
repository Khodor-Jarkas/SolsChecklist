-- Non-event aura obtainment overrides. The main catalog defaults to 'roll'
-- via migration 004; this file tags the five auras that are genuinely
-- craftable (rarity tier = craftable / "Misc") with obtainment = 'craft'.
--
-- Run AFTER migration 004. Idempotent.

update public.auras set obtainment = 'craft' where name in (
  'Eclipse',
  'Chromatic : Hyper',
  'Atlas : A.T.L.A.S.',
  'Matrix : Steampunk',
  'MasterHand'
);
