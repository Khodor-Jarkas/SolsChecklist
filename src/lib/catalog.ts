// Cached reads of the global catalog (auras, achievements). The catalog is
// identical for every visitor and only changes when it's edited in Supabase,
// so it's served from Next's data cache instead of querying the database on
// every page view. Edits show up within CATALOG_TTL seconds.
import { unstable_cache } from "next/cache";
import { anonClient } from "./supabase/anon";
import type { Database } from "./supabase/types";

const CATALOG_TTL = 600;

type Aura = Database["public"]["Tables"]["auras"]["Row"];
type Achievement = Database["public"]["Tables"]["achievements"]["Row"];

const cachedAuras = unstable_cache(
  async (): Promise<Aura[]> => {
    const { data, error } = await anonClient().from("auras").select("*");
    // Throwing keeps a failed fetch out of the cache.
    if (error) throw error;
    return data ?? [];
  },
  ["catalog:auras"],
  { revalidate: CATALOG_TTL, tags: ["catalog"] },
);

const cachedAchievements = unstable_cache(
  async (): Promise<Achievement[]> => {
    const { data, error } = await anonClient()
      .from("achievements")
      .select("*")
      .order("category")
      .order("id");
    if (error) throw error;
    return data ?? [];
  },
  ["catalog:achievements"],
  { revalidate: CATALOG_TTL, tags: ["catalog"] },
);

// Callers get an empty catalog on failure (as with the old direct queries)
// rather than an error page.
export async function getAuraCatalog(): Promise<Aura[]> {
  try {
    return await cachedAuras();
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getAchievementCatalog(): Promise<Achievement[]> {
  try {
    return await cachedAchievements();
  } catch (e) {
    console.error(e);
    return [];
  }
}
