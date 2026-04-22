import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { AuraChecklist } from "@/components/AuraChecklist";
import { RARITY_ORDER } from "@/lib/rarity";
import type { Rarity } from "@/lib/supabase/types";

export default async function AurasPage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const supabase = await createClient();
  const [{ data: auras }, { data: owned }] = await Promise.all([
    supabase.from("auras").select("*"),
    supabase.from("user_auras").select("aura_id, count, first_obtained_at"),
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
            Check off auras as you roll them. {ownedMap.size} / {catalog.length} collected.
          </p>
        </div>
      </header>
      <AuraChecklist
        auras={catalog}
        initialOwned={Object.fromEntries(ownedMap)}
      />
    </section>
  );
}
