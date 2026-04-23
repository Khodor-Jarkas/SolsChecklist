-- Migration: add event metadata to auras.
-- Lets an aura be tagged with a limited-time event (e.g. "Easter", "Summer",
-- "Winter", "Anniversary") and the year it appeared. An aura can still have a
-- normal `biome`; event_name / event_year are independent tags.
--
-- Idempotent. Run AFTER migrations 001 and 002.

alter table public.auras add column if not exists event_name text;
alter table public.auras add column if not exists event_year int;

create index if not exists auras_event_idx on public.auras(event_name, event_year);
