import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import type { Database } from "./types";

type CookieToSet = { name: string; value: string; options: CookieOptions };

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — middleware handles cookie refresh.
          }
        },
      },
    },
  );
}

// Per-request memoized: the layout and the page both need the viewer, and
// without cache() each call was a separate network round trip to Auth.
// getClaims() verifies the JWT locally (asymmetric signing keys) instead of
// asking the Auth server; with legacy symmetric keys it falls back to getUser().
export const getUser = cache(async (): Promise<{ id: string } | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  return id ? { id } : null;
});

// Per-request memoized profile lookup — deduplicates if layout and a page
// both need the profile within the same server render tree.
export const getUserProfile = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("username, is_private")
    .eq("id", userId)
    .single();
  return data;
});
