-- Migration: add native_biome_odds column to public.auras so we can show the
-- better odds an aura has inside its native biome (e.g. Divinus is 1/32 globally
-- but 1/6 in Heaven). Non-destructive; just adds a nullable column.
-- Safe to re-run.

alter table public.auras
  add column if not exists native_biome_odds bigint;

-- Schema.sql stays in sync — fresh installs will include the column via the
-- updated create table statement.
