import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Rarity } from "./supabase/types";
import type { ProfileStats } from "@/components/ProfileView";

export async function loadProfileStats(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ProfileStats> {
  const [
    { data: allAuras },
    { count: totalAchievements },
    { count: totalItems },
    { data: ownedAuras },
    { count: unlockedAch },
    { count: ownedItemsCount },
  ] = await Promise.all([
    supabase.from("auras").select("rarity, event_name"),
    supabase.from("achievements").select("*", { count: "exact", head: true }),
    supabase.from("items").select("*", { count: "exact", head: true }),
    supabase
      .from("user_auras")
      .select("aura_id, count, auras(rarity, event_name)")
      .eq("user_id", userId),
    supabase
      .from("user_achievements")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("user_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const auraTotal = allAuras?.length ?? 0;
  const achTotal = totalAchievements ?? 0;
  const itemTotal = totalItems ?? 0;
  const auraOwned = ownedAuras?.length ?? 0;

  const catalogByRarity = new Map<Rarity, number>();
  let normalTotal = 0;
  let eventTotal = 0;
  for (const a of allAuras ?? []) {
    catalogByRarity.set(a.rarity, (catalogByRarity.get(a.rarity) ?? 0) + 1);
    if (a.event_name) eventTotal++;
    else normalTotal++;
  }

  const byRarity = new Map<Rarity, number>();
  let totalRolls = 0;
  let normalOwned = 0;
  let eventOwned = 0;
  for (const row of ownedAuras ?? []) {
    totalRolls += row.count;
    const j = row.auras as { rarity: Rarity; event_name: string | null } | { rarity: Rarity; event_name: string | null }[] | null;
    const joined = Array.isArray(j) ? j[0] : j;
    if (!joined) continue;
    byRarity.set(joined.rarity, (byRarity.get(joined.rarity) ?? 0) + 1);
    if (joined.event_name) eventOwned++;
    else normalOwned++;
  }

  return {
    auraTotal,
    auraOwned,
    achTotal,
    achOwned: unlockedAch ?? 0,
    itemTotal,
    itemOwned: ownedItemsCount ?? 0,
    totalRolls,
    normalTotal,
    normalOwned,
    eventTotal,
    eventOwned,
    byRarity,
    catalogByRarity,
  };
}
