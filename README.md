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

