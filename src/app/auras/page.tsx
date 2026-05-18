import type { Metadata } from "next";
import { createClient, getUser } from "@/lib/supabase/server";
import { AuraChecklist } from "@/components/AuraChecklist";
import { SignInBanner } from "@/components/SignInBanner";
import { RARITY_ORDER } from "@/lib/rarity";
import type { Rarity } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Auras",
  description:
    "Browse and track every aura in Sol's RNG — filter by rarity, biome, and obtainment. Mark what you've rolled and watch your collection grow.",
};

export default async function AurasPage() {
  const user = await getUser();
  const supabase = await createClient();

  const [{ data: auras }, { data: owned }] = await Promise.all([
    supabase.from("auras").select("*"),
    user
      ? supabase
          .from("user_auras")
          .select("aura_id, count, first_obtained_at")
          .eq("user_id", user.id)
      : Promise.resolve({ data: [] as { aura_id: number; count: number; first_obtained_at: string }[] }),
  ]);

  const catalog = (auras ?? []).slice().sort((a, b) => {
    const r = RARITY_ORDER.indexOf(a.rarity as Rarity) - RARITY_ORDER.indexOf(b.rarity as Rarity);
    if (r !== 0) return r;
    return (a.rarity_odds ?? 0) - (b.rarity_odds ?? 0);
  });

  const ownedMap = new Map<number, { count: number; first_obtained_at: string }>();
  for (const row of owned ?? []) {
    ownedMap.set(row.aura_id, { count: row.count, first_obtained_at: row.first_obtained_at });
  }

  return (
    <section className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Auras</h1>
          <p className="text-sm text-[var(--foreground)]/70 mt-1">
            {user
              ? `Check off auras as you roll them. ${ownedMap.size} / ${catalog.length} collected.`
              : `The full catalog — ${catalog.length} auras.`}
          </p>
        </div>
      </header>
      {!user && <SignInBanner what="track your collection" />}
      <AuraChecklist
        auras={catalog}
        initialOwned={Object.fromEntries(ownedMap)}
        userId={user?.id}
        readOnly={!user}
      />
    </section>
  );
}
