-- Migration: split the achievement `description` blob into three fields so the
-- UI can render flavor text, requirement, and reward cleanly instead of one
-- bullet-separated paragraph.
--
-- `description` becomes nullable (was "not null" on create) since some badges
-- have no flavor text (just a requirement). Existing rows keep their current
-- description unchanged; re-running seed_achievements.sql will refill the
-- three columns with the split data.
--
-- Idempotent.

alter table public.achievements add column if not exists requirement text;
alter table public.achievements add column if not exists reward text;
alter table public.achievements alter column description drop not null;
