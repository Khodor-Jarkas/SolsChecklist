# Sol's Checklist

A multi-user progress tracker for **Sol's RNG** — auras, achievements, and
crafting. Built with Next.js 15 (App Router), TypeScript, Tailwind, and
Supabase (Postgres + Auth + RLS).

> **Note on an API:** Sol's RNG does not expose an official API. This app ships
> with a seed catalog derived from community wiki data; extend it via the
> Supabase table editor as new auras / biomes / items are added.

## Stack

- **Next.js 15** (App Router, Server Components, Server Actions)
- **TypeScript** strict
- **Tailwind CSS** 3
- **Supabase** — Postgres, Auth (email + password), Row-Level Security
- **Deploys on** Vercel (Supabase cloud for the DB)

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. In the project dashboard, go to **Project Settings → API Keys**. Copy:
   - **Project URL** (under the **API** section) → `NEXT_PUBLIC_SUPABASE_URL`.
     Format: `https://<project-ref>.supabase.co`.
   - **Publishable key** (starts with `sb_publishable_...`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
     This is the new name for what used to be called the `anon` key.
   - **Do NOT** copy the `sb_secret_...` key. It bypasses RLS and must never
     be placed in a `NEXT_PUBLIC_*` variable — that ships the key to the
     browser. This app doesn't need the secret key at all.
3. In **Authentication → Providers**, make sure **Email** is enabled. For
   local dev it's convenient to turn off "Confirm email" (Auth → Policies)
   so you can sign up and log in immediately.

#### Optional: Discord login

To enable "Continue with Discord" on the sign-in / sign-up pages:

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
   → **New Application** → give it a name → **OAuth2** tab.
2. Copy the **Client ID** and **Client Secret**.
3. Under **Redirects** in the Discord app, add:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
   (find this exact URL in Supabase dashboard → **Authentication → Providers
   → Discord**; the dashboard shows you the value to paste.)
4. In Supabase dashboard → **Authentication → Providers → Discord** →
   toggle **Enable Sign in with Discord**, paste the Client ID + Secret,
   and save.
5. Set your site URL in Supabase dashboard → **Authentication → URL
   Configuration → Site URL** to `http://localhost:3000` for dev (add your
   Vercel URL later for prod). Also add both to **Redirect URLs** (allow
   list).

That's it — the Discord button will work end-to-end. Username is
auto-populated from the Discord handle by the `handle_new_user` trigger.

### 3. Apply the schema

In the Supabase **SQL Editor**, run the contents of these files in order:

1. [`supabase/schema.sql`](supabase/schema.sql) — tables, RLS policies, profile
   auto-create trigger.
2. [`supabase/seed.sql`](supabase/seed.sql) — sample auras / achievements / items.

### 4. Configure env vars

Copy the example and fill in your keys:

```bash
cp .env.local.example .env.local
# then edit .env.local
```

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), sign up, and start
checking things off.

## How it works

### Data model

- **Catalog tables** (`auras`, `achievements`, `items`) — global, read-only
  for clients. Populated by seed; extend via the Supabase table editor.
- **`profiles`** — one row per auth user, auto-created by a trigger on
  `auth.users` insert. Stores the username.
- **User progress joins** (`user_auras`, `user_achievements`, `user_items`) —
  per-user state; RLS ensures each user can only read/write their own rows.

### Auth & security

- Sign in / sign up go through **Server Actions** using the Supabase
  cookies-based SSR helper (`@supabase/ssr`). The session cookie is refreshed
  in middleware on every request.
- All progress writes happen from the browser with the user's session; RLS
  policies on the DB are the source of truth for what each user can touch.

### Privacy

Profiles are readable by any authenticated user so usernames can display, but
all progress tables (`user_auras`, `user_achievements`, `user_items`) are
private — only the owning user can read or write them. If you later want
public profile pages, relax the `select` policies on those tables.

## Extending the catalog

To add a new aura (or achievement / item) later, open the Supabase dashboard →
**Table Editor** → pick the catalog table → **Insert row**. Changes appear to
users immediately on next page load; no deploy needed.

For bulk inserts, write a SQL snippet similar to `seed.sql` and run it in the
SQL editor with `on conflict (name) do nothing` so it's idempotent.

## Project layout

```
src/
  app/
    layout.tsx              # header + shell
    page.tsx                # landing
    sign-in/  sign-up/      # auth pages
    auth/actions.ts         # signIn / signUp / signOut server actions
    auras/                  # aura checklist
    achievements/           # achievements
    crafting/               # crafting / items
    profile/                # dashboard
  components/
    AuraChecklist.tsx       # client — filters + optimistic toggle
    AchievementsChecklist.tsx
    CraftingChecklist.tsx
    SignOutButton.tsx
  lib/
    rarity.ts               # rarity ordering + labels + colour classes
    supabase/
      client.ts             # browser client
      server.ts             # RSC / server action client + getUser()
      middleware.ts         # session cookie refresh
      types.ts              # Database type definitions
  middleware.ts             # wires the session refresh into Next.js
supabase/
  schema.sql                # run once per project
  seed.sql                  # sample catalog data
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. [Import the project in Vercel](https://vercel.com/new).
3. Add the two env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
4. Deploy.

Supabase's free tier and Vercel's hobby tier are both sufficient for a
personal / small-community tracker.
