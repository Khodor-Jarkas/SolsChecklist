import Link from "next/link";
import { RARITY_CLASS, RARITY_LABEL, RARITY_ORDER, formatOdds } from "@/lib/rarity";
import type { Rarity } from "@/lib/supabase/types";
import { PrivacyToggle } from "./PrivacyToggle";
import { ProfileAuraGrid } from "./ProfileAuraGrid";

type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  is_private: boolean;
  created_at: string;
};

export type ProfileStats = {
  auraTotal: number;
  auraOwned: number;
  achTotal: number;
  achOwned: number;
  itemTotal: number;
  itemOwned: number;
  totalRolls: number;
  normalTotal: number;
  normalOwned: number;
  eventTotal: number;
  eventOwned: number;
  byRarity: Map<Rarity, number>;
  catalogByRarity: Map<Rarity, number>;
};

export type OwnedAuraItem = {
  count: number;
  first_obtained_at: string;
  aura: {
    id: number;
    name: string;
    rarity: Rarity;
    rarity_odds: number | null;
    native_biome_odds: number | null;
    biome: string | null;
    event_name: string | null;
    event_year: number | null;
    description: string | null;
    obtainment: string | null;
    secondary_obtainment: string | null;
    image_url: string | null;
  };
};

type OwnedAchievement = {
  unlocked_at: string;
  achievement: {
    id: number;
    name: string;
    description: string | null;
    requirement: string | null;
    reward: string | null;
    category: string | null;
    image_url: string | null;
  };
};

export type ProfileData = {
  stats: ProfileStats;
  ownedAuras: OwnedAuraItem[];
  ownedAchievements: OwnedAchievement[];
};

const pct = (o: number, t: number) => (t > 0 ? Math.round((o / t) * 100) : 0);

export function ProfileView({
  profile,
  data,
  isOwner,
}: {
  profile: Profile;
  data: ProfileData;
  isOwner: boolean;
}) {
  if (profile.is_private && !isOwner) {
    return <PrivateProfileStub profile={profile} />;
  }
  const { stats, ownedAuras, ownedAchievements } = data;
  const initial = (profile.username ?? "U").charAt(0).toUpperCase();
  const totalOwned = stats.auraOwned + stats.achOwned + stats.itemOwned;
  const totalCatalog = stats.auraTotal + stats.achTotal + stats.itemTotal;
  const overallPct = pct(totalOwned, totalCatalog);
  const normalPct = pct(stats.normalOwned, stats.normalTotal);
  const eventPct = pct(stats.eventOwned, stats.eventTotal);

  return (
    <section className="space-y-8">
      {/* Hero header */}
      <header className="card p-6 md:p-8 flex items-center gap-6 flex-wrap">
        <div className="relative">
          {profile.avatar_url ? (
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
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {profile.username}
            </h1>
            {profile.is_private && !isOwner && (
              <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground-muted)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Private
              </span>
            )}
          </div>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Member since {new Date(profile.created_at).toLocaleDateString()}
          </p>
          {isOwner && (
            <div className="mt-3">
              <PrivacyToggle userId={profile.id} initialPrivate={profile.is_private} />
            </div>
          )}
        </div>
        <ProgressRing pct={overallPct} />
      </header>

      {/* Stat grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard
          label="Auras"
          value={stats.auraOwned}
          total={stats.auraTotal}
          href={isOwner ? "/auras" : undefined}
          accent="purple"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4L2 9.4h7.6z" />
            </svg>
          }
        />
        <StatCard
          label="Achievements"
          value={stats.achOwned}
          total={stats.achTotal}
          href={isOwner ? "/achievements" : undefined}
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
          label="Rolls logged"
          value={stats.totalRolls}
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
          {isOwner && (
            <Link href="/auras" className="text-xs text-[var(--accent)] hover:underline">
              View all →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SplitProgress
            label="Normal"
            owned={stats.normalOwned}
            total={stats.normalTotal}
            pct={normalPct}
            gradient="from-purple-500 to-pink-400"
          />
          <SplitProgress
            label="Event"
            owned={stats.eventOwned}
            total={stats.eventTotal}
            pct={eventPct}
            gradient="from-amber-400 to-rose-500"
          />
        </div>

        <div className="space-y-3 pt-2 border-t border-[var(--border)]">
          <h3 className="text-xs uppercase tracking-wider text-[var(--foreground-muted)] pt-4">By rarity</h3>
          {RARITY_ORDER.map((r) => {
            const owned = stats.byRarity.get(r) ?? 0;
            const tierTotal = stats.catalogByRarity.get(r) ?? 0;
            if (tierTotal === 0) return null;
            const hasAny = owned > 0;
            const tierPct = pct(owned, tierTotal);
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

      {/* Owned auras (compact grid, rarest first) */}
      {ownedAuras.length > 0 && (
        <CollapsibleList
          title="Auras owned"
          count={ownedAuras.length}
          total={stats.auraTotal}
        >
          <ProfileAuraGrid ownedAuras={ownedAuras} />
        </CollapsibleList>
      )}

      {/* Unlocked achievements */}
      {ownedAchievements.length > 0 && (
        <CollapsibleList
          title="Achievements unlocked"
          count={ownedAchievements.length}
          total={stats.achTotal}
        >
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ownedAchievements
              .slice()
              .sort((a, b) => b.unlocked_at.localeCompare(a.unlocked_at))
              .map((o) => (
                <li key={o.achievement.id} className="card p-3 flex items-start gap-3">
                  {o.achievement.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={o.achievement.image_url}
                      alt={o.achievement.name}
                      loading="lazy"
                      decoding="async"
                      className="h-10 w-10 shrink-0 rounded-md bg-[var(--surface)] p-0.5 object-contain border border-[var(--border)]"
                    />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-md bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-sm text-[var(--foreground-muted)]">
                      {o.achievement.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{o.achievement.name}</p>
                    {o.achievement.requirement && (
                      <p className="text-xs text-[var(--foreground-muted)] line-clamp-1">
                        {o.achievement.requirement}
                      </p>
                    )}
                    <p className="text-[10px] text-[var(--foreground-faint)] mt-1">
                      Unlocked {new Date(o.unlocked_at).toLocaleDateString()}
                    </p>
                  </div>
                </li>
              ))}
          </ul>
        </CollapsibleList>
      )}

      {isOwner && ownedAuras.length === 0 && ownedAchievements.length === 0 && (
        <div className="card p-8 text-center text-sm text-[var(--foreground-muted)] space-y-3">
          <p>Nothing tracked yet.</p>
          <Link href="/auras" className="btn btn-primary inline-flex">
            Start checking things off
          </Link>
        </div>
      )}
    </section>
  );
}

function PrivateProfileStub({ profile }: { profile: Profile }) {
  const initial = profile.username.charAt(0).toUpperCase();
  return (
    <section className="space-y-6">
      <header className="card p-6 md:p-8 flex items-center gap-6 flex-wrap">
        <div className="relative">
          {profile.avatar_url ? (
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
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
              {profile.username}
            </h1>
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--card)] text-[var(--foreground-muted)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Private
            </span>
          </div>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            Member since {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </header>
      <div className="card p-10 text-center space-y-3">
        <div className="mx-auto h-12 w-12 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--foreground-muted)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <p className="text-[var(--foreground)] font-medium">This profile is private.</p>
        <p className="text-sm text-[var(--foreground-muted)]">
          @{profile.username} has chosen not to share their collection.
        </p>
      </div>
    </section>
  );
}

function CollapsibleList({
  title,
  count,
  total,
  children,
}: {
  title: string;
  count: number;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {title}{" "}
          <span className="text-sm font-normal text-[var(--foreground-muted)] ml-1 font-mono">
            {count} / {total}
          </span>
        </h2>
      </div>
      {children}
    </div>
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
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface)" strokeWidth={stroke} />
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

  const pctVal = total && total > 0 ? Math.round((value / total) * 100) : null;

  const body = (
    <div className="card p-5 h-full space-y-3 group">
      <div className="flex items-center justify-between">
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${accentClasses}`}>
          {icon}
        </span>
        {pctVal !== null && (
          <span className="text-xs font-mono text-[var(--foreground-muted)]">
            {pctVal}%
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
