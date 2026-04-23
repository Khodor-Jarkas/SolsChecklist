-- Migration: add image_url to achievements (already present on items).
-- Idempotent.

alter table public.achievements add column if not exists image_url text;
