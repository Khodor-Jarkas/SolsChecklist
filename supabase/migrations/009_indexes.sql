-- ============================================================
-- Performance indexes for Sol's Checklist
-- Run once in Supabase SQL editor (Dashboard → SQL Editor).
-- All statements use IF NOT EXISTS / CREATE INDEX CONCURRENTLY
-- so they are safe to re-run without downtime.
-- ============================================================

-- Enable pg_trgm for trigram similarity (needed for the ILIKE prefix search
-- in UserSearch). This extension is already available on Supabase.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ------------------------------------------------------------
-- profiles.username
-- Plain B-tree: exact-match lookup in /u/[username] route.
-- GIN trigram: powers the ilike("%q%") search in UserSearch.
-- ------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_username
  ON profiles (username);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_username_trgm
  ON profiles USING gin (username gin_trgm_ops);

-- ------------------------------------------------------------
-- user_auras(user_id)
-- Supabase creates FK indexes automatically, but the name may
-- differ. This is idempotent — no harm if it already exists.
-- ------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_auras_user_id
  ON user_auras (user_id);

-- ------------------------------------------------------------
-- user_achievements(user_id)
-- ------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_achievements_user_id
  ON user_achievements (user_id);

-- ------------------------------------------------------------
-- user_items(user_id)
-- ------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_items_user_id
  ON user_items (user_id);

-- ------------------------------------------------------------
-- auras(event_name, rarity)
-- Composite index covers the profile-stats query that groups
-- auras by event_name and rarity in a single scan.
-- ------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auras_event_rarity
  ON auras (event_name, rarity);

-- ------------------------------------------------------------
-- auras(biome)
-- Covers biome-filter queries in the checklist and biomes page.
-- ------------------------------------------------------------
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_auras_biome
  ON auras (biome)
  WHERE biome IS NOT NULL;
