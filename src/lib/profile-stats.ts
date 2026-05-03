import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Rarity } from "./supabase/types";
import type { ProfileData } from "@/components/ProfileView";

export async function loadProfileData(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ProfileData> {
  const [
    { data: allAuras },
    { count: totalAchievements },
    { count: totalItems },
    { data: ownedAuraRows },
    { data: ownedAchievementRows },
    { count: ownedItemsCount },
  ] = await Promise.all([
    supabase.from("auras").select("rarity, event_name"),
    supabase.from("achievements").select("*", { count: "exact", head: true }),
    supabase.from("items").select("*", { count: "exact", head: true }),
    supabase
      .from("user_auras")
      .select("count, first_obtained_at, auras(id, name, rarity, rarity_odds, native_biome_odds, biome, event_name, event_year, description, obtainment, secondary_obtainment, image_url)")
      .eq("user_id", userId),
    supabase
      .from("user_achievements")
      .select("unlocked_at, achievements(id, name, description, requirement, reward, category, image_url)")
      .eq("user_id", userId),
    supabase
      .from("user_items")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const auraTotal = allAuras?.length ?? 0;
  const achTotal = totalAchievements ?? 0;
  const itemTotal = totalItems ?? 0;

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

  type AuraJoin = { id: number; name: string; rarity: Rarity; rarity_odds: number | null; native_biome_odds: number | null; biome: string | null; event_name: string | null; event_year: number | null; description: string | null; obtainment: string | null; secondary_obtainment: string | null; image_url: string | null };
  type OwnedAura = { count: number; first_obtained_at: string; aura: AuraJoin };

  const ownedAuras: OwnedAura[] = [];
  for (const row of ownedAuraRows ?? []) {
    totalRolls += row.count;
    const j = row.auras as AuraJoin | AuraJoin[] | null;
    const joined = Array.isArray(j) ? j[0] : j;
    if (!joined) continue;
    byRarity.set(joined.rarity, (byRarity.get(joined.rarity) ?? 0) + 1);
    if (joined.event_name) eventOwned++;
    else normalOwned++;
    ownedAuras.push({ count: row.count, first_obtained_at: row.first_obtained_at, aura: joined });
  }

  type AchJoin = { id: number; name: string; description: string | null; requirement: string | null; reward: string | null; category: string | null; image_url: string | null };
  type OwnedAch = { unlocked_at: string; achievement: AchJoin };

  const ownedAchievements: OwnedAch[] = [];
  for (const row of ownedAchievementRows ?? []) {
    const j = row.achievements as AchJoin | AchJoin[] | null;
    const joined = Array.isArray(j) ? j[0] : j;
    if (!joined) continue;
    ownedAchievements.push({ unlocked_at: row.unlocked_at, achievement: joined });
  }

  return {
    stats: {
      auraTotal,
      auraOwned: ownedAuras.length,
      achTotal,
      achOwned: ownedAchievements.length,
      itemTotal,
      itemOwned: ownedItemsCount ?? 0,
      totalRolls,
      normalTotal,
      normalOwned,
      eventTotal,
      eventOwned,
      byRarity,
      catalogByRarity,
    },
    ownedAuras,
    ownedAchievements,
  };
}
