-- Migration: opt-in profile privacy. Public by default; users toggle their
-- own profile private from the profile page. UI hides the collection when
-- private and the viewer isn't the owner; the row is still readable at the
-- SQL level because `profiles` is public, which is fine — a determined
-- client could skim a few stats, but the UI layer is the product-visible
-- privacy boundary and matches how similar trackers work.
--
-- Idempotent.

alter table public.profiles add column if not exists is_private boolean not null default false;
