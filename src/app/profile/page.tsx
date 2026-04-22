import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { RARITY_LABEL, RARITY_ORDER } from "@/lib/rarity";
import type { Rarity } from "@/lib/supabase/types";

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) redirect("/sign-in");

  const supabase = await createClient();

  const [
    { data: profile },
    { count: totalAuras },
    { count: totalAchievements },
    { count: totalItems },
    { data: ownedAuras },
    { count: unlockedAch },
    { count: ownedItemsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("auras").select("*", { count: "exact", head: true }),
    supabase.from("achievements").select("*", { count: "exact", head: true }),
    supabase.from("items").select("*", { count: "exact", head: true }),
    supabase.from("user_auras").select("aura_id, count, auras(rarity)"),
    supabase.from("user_achievements").select("*", { count: "exact", head: true }),
    supabase.from("user_items").select("*", { count: "exact", head: true }),
  ]);

  const auraTotal = totalAuras ?? 0;
  const achTotal = totalAchievements ?? 0;
  const itemTotal = totalItems ?? 0;
  const auraOwned = ownedAuras?.length ?? 0;

  // Tally rolls and rarity breakdown
  const byRarity = new Map<Rarity, number>();
  let totalRolls = 0;
  for (const row of ownedAuras ?? []) {
    totalRolls += row.count;
    const auraJoin = row.auras as { rarity: Rarity } | { rarity: Rarity }[] | null;
    const rarity = Array.isArray(auraJoin) ? auraJoin[0]?.rarity : auraJoin?.rarity;
    if (rarity) byRarity.set(rarity, (byRarity.get(rarity) ?? 0) + 1);
  }

  return (
    <section className="space-y-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {profile?.username ?? "Profile"}
          </h1>
          <p className="text-sm text-[var(--foreground)]/70 mt-1">
            Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Auras collected"       value={`${auraOwned} / ${auraTotal}`}       href="/auras" />
        <StatCard label="Achievements unlocked" value={`${unlockedAch ?? 0} / ${achTotal}`}   href="/achievements" />
        <StatCard label="Items tracked"         value={`${ownedItemsCount ?? 0} / ${itemTotal}`} href="/crafting" />
        <StatCard label="Total rolls logged"    value={totalRolls.toLocaleString()} />
      </div>

      <div className="card p-6 space-y-4">
        <h2 className="text-lg font-semibold">Aura rarity breakdown</h2>
        <div className="space-y-2">
          {RARITY_ORDER.map((r) => {
            const owned = byRarity.get(r) ?? 0;
            return (
              <div key={r} className="flex items-center gap-3">
                <span className={`w-28 text-sm text-rarity-${r}`}>{RARITY_LABEL[r]}</span>
                <div className="flex-1 h-2 rounded-full bg-[var(--card-hover)] overflow-hidden">
                  <div
                    className={`h-full bg-rarity-${r} transition-all`}
                    style={{
                      width: `${auraOwned > 0 ? Math.min(100, (owned / auraOwned) * 100) : 0}%`,
                    }}
                  />
                </div>
                <span className="text-sm font-mono text-[var(--foreground)]/70 w-10 text-right">
                  {owned}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-6 space-y-3">
        <h2 className="text-lg font-semibold">Quick links</h2>
        <ul className="space-y-1 text-sm">
          <li>
            <Link href="/auras" className="text-[var(--accent)] hover:underline">
              Aura checklist →
            </Link>
          </li>
          <li>
            <Link href="/achievements" className="text-[var(--accent)] hover:underline">
              Achievements →
            </Link>
          </li>
          <li>
            <Link href="/crafting" className="text-[var(--accent)] hover:underline">
              Crafting →
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const body = (
    <div className="card p-5 h-full">
      <p className="text-xs uppercase tracking-wider text-[var(--foreground)]/60">{label}</p>
      <p className="text-2xl font-semibold mt-2">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}
