import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Cookie-less client for public reads (the catalog, share images). Sees only
// what an anonymous visitor may see under RLS — private collections excluded.
export function anonClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
