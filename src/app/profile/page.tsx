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
    { data: allAuras },
    { count: totalAchievements },
    { count: totalItems },
    { data: ownedAuras },
    { count: unlockedAch },
    { count: ownedItemsCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("auras").select("rarity, event_name"),
    supabase.from("achievements").select("*", { count: "exact", head: true }),
    supabase.from("items").select("*", { count: "exact", head: true }),
    supabase.from("user_auras").select("aura_id, count, auras(rarity, event_name)"),
    supabase.from("user_achievements").select("*", { count: "exact", head: true }),
    supabase.from("user_items").select("*", { count: "exact", head: true }),
  ]);

  const auraTotal = allAuras?.length ?? 0;
  const achTotal = totalAchievements ?? 0;
  const itemTotal = totalItems ?? 0;
  const auraOwned = ownedAuras?.length ?? 0;

  // Catalog totals per rarity (for correct progress bars).
  const catalogByRarity = new Map<Rarity, number>();
  let normalTotal = 0, eventTotal = 0;
  for (const a of allAuras ?? []) {
    catalogByRarity.set(a.rarity, (catalogByRarity.get(a.rarity) ?? 0) + 1);
    if (a.event_name) eventTotal++; else normalTotal++;
  }

  const byRarity = new Map<Rarity, number>();
  let totalRolls = 0, normalOwned = 0, eventOwned = 0;
  for (const row of ownedAuras ?? []) {
    totalRolls += row.count;
    const auraJoin = row.auras as { rarity: Rarity; event_name: string | null } | { rarity: Rarity; event_name: string | null }[] | null;
    const joined = Array.isArray(auraJoin) ? auraJoin[0] : auraJoin;
    if (!joined) continue;
    byRarity.set(joined.rarity, (byRarity.get(joined.rarity) ?? 0) + 1);
    if (joined.event_name) eventOwned++; else normalOwned++;
  }

  const pct = (o: number, t: number) => (t > 0 ? Math.round((o / t) * 100) : 0);
  const normalPct = pct(normalOwned, normalTotal);
  const eventPct = pct(eventOwned, eventTotal);

  const overallPct = auraTotal + achTotal + itemTotal > 0
    ? Math.round(((auraOwned + (unlockedAch ?? 0) + (ownedItemsCount ?? 0)) / (auraTotal + achTotal + itemTotal)) * 100)
    : 0;

  const initial = (profile?.username ?? "U").charAt(0).toUpperCase();

  return (
    <section className="space-y-8">
      {/* Hero header */}
      <header className="card p-6 md:p-8 flex items-center gap-6 flex-wrap">
        <div className="relative">
          {profile?.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="h-20 w-20 rounded-full object-cover border-2 border-[var(--border-strong)]"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-semibold text-white">
              {initial}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            {profile?.username ?? "Profile"}
          </h1>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
          </p>
        </div>
        <ProgressRing pct={overallPct} />
      </header>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Auras"
          value={auraOwned}
          total={auraTotal}
          href="/auras"
          accent="purple"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
            </svg>
          }
        />
        <StatCard
          label="Achievements"
          value={unlockedAch ?? 0}
          total={achTotal}
          href="/achievements"
          accent="sky"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
          }
        />
        <StatCard
          label="Items"
          value={ownedItemsCount ?? 0}
          total={itemTotal}
          href="/crafting"
          accent="pink"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          }
        />
        <StatCard
          label="Rolls logged"
          value={totalRolls}
          accent="amber"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          }
        />
      </div>

      {/* Aura collection breakdown */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Aura collection</h2>
          <Link href="/auras" className="text-xs text-[var(--accent)] hover:underline">
            View all →
          </Link>
        </div>

        {/* Normal vs Event split */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SplitProgress
            label="Normal"
            owned={normalOwned}
            total={normalTotal}
            pct={normalPct}
            gradient="from-purple-500 to-pink-400"
          />
          <SplitProgress
            label="Event"
            owned={eventOwned}
            total={eventTotal}
            pct={eventPct}
            gradient="from-amber-400 to-rose-500"
          />
        </div>

        {/* By rarity */}
        <div className="space-y-3 pt-2 border-t border-[var(--border)]">
          <h3 className="text-xs uppercase tracking-wider text-[var(--foreground-muted)] pt-4">By rarity</h3>
          {RARITY_ORDER.map((r) => {
            const owned = byRarity.get(r) ?? 0;
            const tierTotal = catalogByRarity.get(r) ?? 0;
            if (tierTotal === 0) return null;
            const hasAny = owned > 0;
            const tierPct = tierTotal > 0 ? Math.min(100, (owned / tierTotal) * 100) : 0;
            return (
              <div key={r} className="flex items-center gap-3">
                <span className={`w-28 text-sm text-rarity-${r} font-medium`}>
                  {RARITY_LABEL[r]}
                </span>
                <div className="flex-1 h-2 rounded-full bg-[var(--surface)] overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-rarity-${r} transition-all duration-500`}
                    style={{ width: `${tierPct}%` }}
                  />
                </div>
                <span className={`text-sm font-mono tabular-nums w-16 text-right ${hasAny ? "text-[var(--foreground)]" : "text-[var(--foreground-faint)]"}`}>
                  {owned} / {tierTotal}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SplitProgress({
  label,
  owned,
  total,
  pct,
  gradient,
}: {
  label: string;
  owned: number;
  total: number;
  pct: number;
  gradient: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--foreground-muted)] font-medium">{label}</span>
        <span className="font-mono text-[var(--foreground)]">
          {owned} / {total}
          <span className="text-[var(--foreground-muted)] ml-2">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--surface)] overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const size = 96;
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-semibold tabular-nums">{pct}%</span>
        <span className="text-[10px] text-[var(--foreground-faint)] uppercase tracking-wider">
          Overall
        </span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  total,
  href,
  accent,
  icon,
}: {
  label: string;
  value: number;
  total?: number;
  href?: string;
  accent: "purple" | "sky" | "pink" | "amber";
  icon: React.ReactNode;
}) {
  const accentClasses = {
    purple: "text-purple-400 bg-purple-500/10",
    sky: "text-sky-400 bg-sky-500/10",
    pink: "text-pink-400 bg-pink-500/10",
    amber: "text-amber-400 bg-amber-500/10",
  }[accent];

  const pct = total && total > 0 ? Math.round((value / total) * 100) : null;

  const body = (
    <div className="card p-5 h-full space-y-3 group">
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${accentClasses}`}>
          {icon}
        </span>
        {pct !== null && (
          <span className="text-xs font-mono text-[var(--foreground-muted)]">
            {pct}%
          </span>
        )}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-[var(--foreground-muted)]">{label}</p>
        <p className="text-2xl font-semibold mt-1 tabular-nums">
          {value.toLocaleString()}
          {total !== undefined && (
            <span className="text-base font-normal text-[var(--foreground-faint)]">
              {" / "}{total.toLocaleString()}
            </span>
          )}
        </p>
      </div>
    </div>
  );
  return href ? (
    <Link href={href} className="block h-full hover:[&>.card]:border-[var(--border-strong)] hover:[&>.card]:bg-[var(--card-hover)]">
      {body}
    </Link>
  ) : body;
}
