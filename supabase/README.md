# Supabase

Everything here is plain SQL, run by hand in the Supabase SQL editor
(Dashboard → SQL Editor). Every file is idempotent, so re-running one is safe.

## Existing project: applying new migrations

Run any file in `migrations/` you haven't run yet, in number order:

| File | What it does |
| --- | --- |
| `001`–`008` | Earlier schema changes (rarity overhaul, native odds, event auras, obtainment, achievement fields, public/private profiles). |
| `009_indexes.sql` | Performance indexes. Uses `CREATE INDEX CONCURRENTLY`, so run it on its own rather than inside a transaction. |
| `010_private_collections.sql` | Makes private profiles private at the database level. Collections are readable only by their owner, or by anyone when the profile is public. |

## New project: from scratch

1. `schema.sql`: tables, row-level security policies, and the profile trigger.
2. `migrations/` in number order (skip `010`: `schema.sql` already includes those policies).
3. Seeds:
   1. `seed.sql`
   2. `seed_auras.sql`
   3. `seed_event_auras.sql`
   4. `seed_native_odds.sql`
   5. `seed_aura_obtainment.sql`
   6. `seed_event_aura_obtainment.sql`
   7. `seed_aura_images.sql`
   8. `seed_event_aura_images.sql`
   9. `seed_achievements.sql`
   10. `seed_achievements_images.sql`
4. `2026-05_buglist_pass.sql`: a one-off data fix pass. Run it after the seeds.

## Instant catalog refresh

The site caches the aura and achievement catalog for 10 minutes. To make
edits show up immediately:

1. In Vercel, add the env var `REVALIDATE_SECRET` (any long random string) and redeploy.
2. In Supabase: Database → Webhooks → **Create a new hook**.
   - Table: `auras`. Events: insert, update, delete.
   - Type: HTTP Request, `POST https://<your-site>/api/revalidate`.
   - HTTP header: `x-revalidate-secret: <the same secret>`.
3. Repeat step 2 for the `achievements` table.

To refresh by hand instead:

```
curl -X POST https://<your-site>/api/revalidate -H "x-revalidate-secret: <secret>"
```

## Generated TypeScript types

`src/lib/supabase/types.ts` is written by hand. To generate the real types
from the database:

```
npx supabase login                      # once
SUPABASE_PROJECT_ID=<project-ref> npm run db:types
```

This writes `src/lib/supabase/database.types.ts`. The project ref is the
`xxxx` in `https://xxxx.supabase.co`.

## Tools

- `tools/fix-broken-images.mjs`: finds catalog images that no longer exist
  on the wiki and prints SQL to fix them.
- `tools/gen-*.mjs`: regenerate the seed files from wiki data.
