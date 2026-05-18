"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Achievement = Database["public"]["Tables"]["achievements"]["Row"];
type UnlockedState = Record<number, string>;

// Category → accent colour for the section pill.
const CATEGORY_ACCENT: Record<string, string> = {
  Rolls:                "text-purple-400 bg-purple-500/10",
  "Highest Stat":       "text-fuchsia-400 bg-fuchsia-500/10",
  Playtime:             "text-sky-400 bg-sky-500/10",
  Breakthroughs:        "text-amber-400 bg-amber-500/10",
  "Daily Quests":       "text-emerald-400 bg-emerald-500/10",
  "Auras Obtained":     "text-pink-400 bg-pink-500/10",
  Miscellaneous:        "text-slate-400 bg-slate-500/10",
  Quests:               "text-teal-400 bg-teal-500/10",
  "Achievement Progress":"text-indigo-400 bg-indigo-500/10",
  Developer:            "text-rose-400 bg-rose-500/10",
  "Limited Time":       "text-orange-400 bg-orange-500/10",
};

type Filter = "all" | "unlocked" | "locked";

export function AchievementsChecklist({
  achievements,
  initialUnlocked,
  readOnly = false,
}: {
  achievements: Achievement[];
  initialUnlocked: UnlockedState;
  readOnly?: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [unlocked, setUnlocked] = useState<UnlockedState>(initialUnlocked);
  const [justUnlocked, setJustUnlocked] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [prefsHydrated, setPrefsHydrated] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("achievements:prefs:v1");
      if (raw) {
        const p = JSON.parse(raw);
        if (p.filter) setFilter(p.filter);
      }
    } catch {}
    setPrefsHydrated(true);
  }, []);

  useEffect(() => {
    if (!prefsHydrated) return;
    try {
      localStorage.setItem("achievements:prefs:v1", JSON.stringify({ filter }));
    } catch {}
  }, [prefsHydrated, filter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return achievements.filter((a) => {
      const has = Boolean(unlocked[a.id]);
      if (filter === "unlocked" && !has) return false;
      if (filter === "locked" && has) return false;
      if (q) {
        const hay = `${a.name} ${a.description ?? ""} ${a.requirement ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [achievements, unlocked, filter, query]);

  const grouped = useMemo(() => {
    const categoryOrder = Object.keys(CATEGORY_ACCENT);
    const map = new Map<string, Achievement[]>();
    for (const a of filtered) {
      const key = a.category ?? "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries()).sort(([a], [b]) => {
      const ai = categoryOrder.indexOf(a);
      const bi = categoryOrder.indexOf(b);
      const aIdx = ai === -1 ? categoryOrder.length : ai;
      const bIdx = bi === -1 ? categoryOrder.length : bi;
      return aIdx - bIdx;
    });
  }, [filtered]);

  const stats = useMemo(() => {
    const owned = Object.keys(unlocked).length;
    const total = achievements.length;
    const pct = total > 0 ? Math.round((owned / total) * 100) : 0;
    return { owned, total, pct };
  }, [unlocked, achievements]);

  async function toggle(achievement: Achievement) {
    if (readOnly) return;
    const has = Boolean(unlocked[achievement.id]);
    const prev = unlocked;
    const next: UnlockedState = { ...unlocked };
    if (has) delete next[achievement.id];
    else {
      next[achievement.id] = new Date().toISOString();
      setJustUnlocked(achievement.id);
      setTimeout(() => setJustUnlocked(null), 300);
    }
    setUnlocked(next);

    startTransition(async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return setUnlocked(prev);
      const { error } = has
        ? await supabase.from("user_achievements").delete().eq("user_id", uid).eq("achievement_id", achievement.id)
        : await supabase.from("user_achievements").insert({ user_id: uid, achievement_id: achievement.id });
      if (error) {
        setUnlocked(prev);
        console.error(error);
      }
    });
  }

  return (
    <div className="space-y-5">
      {/* Progress */}
      {!readOnly && (
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--foreground-muted)]">Overall progress</span>
            <span className="font-mono">
              {stats.owned} / {stats.total}
              <span className="text-[var(--foreground-muted)] ml-2">({stats.pct}%)</span>
            </span>
          </div>
          <div className="h-2 rounded-full bg-[var(--surface)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 transition-all duration-500"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-2.5 items-center">
        <input
          placeholder="Search achievements…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input max-w-xs"
        />
        <div className="flex items-center gap-1 ml-auto">
          {(["all", "unlocked", "locked"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-ghost"}`}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="card p-12 text-center text-[var(--foreground-muted)]">
          No achievements match these filters.
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(([category, list]) => {
            const unlockedInGroup = list.filter((a) => unlocked[a.id]).length;
            const accent = CATEGORY_ACCENT[category] ?? "text-[var(--foreground-muted)] bg-[var(--card-hover)]";
            return (
              <section key={category} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex h-7 px-3 items-center rounded-md text-xs font-semibold uppercase tracking-wider ${accent}`}>
                      {category}
                    </span>
                    <span className="text-xs text-[var(--foreground-muted)] font-mono">
                      {unlockedInGroup} / {list.length}
                    </span>
                  </div>
                </div>
                <ul className="grid gap-3 grid-cols-1 md:grid-cols-2">
                  {list.map((a) => (
                    <AchievementCard
                      key={a.id}
                      achievement={a}
                      unlockedAt={unlocked[a.id]}
                      pop={justUnlocked === a.id}
                      onToggle={toggle}
                      readOnly={readOnly}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AchievementCard({
  achievement: a,
  unlockedAt,
  pop,
  onToggle,
  readOnly = false,
}: {
  achievement: Achievement;
  unlockedAt?: string;
  pop: boolean;
  onToggle: (a: Achievement) => void;
  readOnly?: boolean;
}) {
  const has = Boolean(unlockedAt);
  return (
    <li className={`card p-4 ${has ? "card-owned" : ""}`}>
      <div className="flex gap-3">
        {!readOnly && (
          <button
            onClick={() => onToggle(a)}
            aria-label={has ? "Lock" : "Unlock"}
            data-checked={has}
            className={`checkbox mt-0.5 ${pop ? "animate-pop" : ""}`}
          >
            {has && (
              <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}

        <AchievementIcon imageUrl={a.image_url} name={a.name} />

        <div className="flex-1 min-w-0">
          <h3 className={`font-medium leading-tight ${has ? "" : "text-[var(--foreground-muted)]"}`}>
            {a.name}
          </h3>
          {a.description && (
            <p className="text-xs text-[var(--foreground-muted)] mt-1 italic leading-relaxed line-clamp-2">
              {a.description}
            </p>
          )}
          <div className="mt-2 space-y-1">
            {a.requirement && (
              <div className="flex items-start gap-1.5 text-xs">
                <span className="text-[var(--foreground-faint)] font-mono uppercase tracking-wider text-[10px] mt-0.5 shrink-0">
                  Req
                </span>
                <span className="text-[var(--foreground)]/80">{a.requirement}</span>
              </div>
            )}
            {a.reward && (
              <div className="flex items-start gap-1.5 text-xs">
                <span className="text-amber-400/80 font-mono uppercase tracking-wider text-[10px] mt-0.5 shrink-0">
                  Rwd
                </span>
                <span className="text-[var(--foreground)]/80">{a.reward}</span>
              </div>
            )}
          </div>
          {unlockedAt && (
            <p className="text-[11px] text-[var(--foreground-faint)] mt-2 flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Unlocked {new Date(unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

function AchievementIcon({ imageUrl, name }: { imageUrl: string | null; name: string }) {
  const size = "h-14 w-14";
  if (!imageUrl) {
    return (
      <div className={`${size} shrink-0 rounded-lg bg-[var(--surface)] border-2 border-[var(--border)] flex items-center justify-center text-lg font-semibold text-[var(--foreground-muted)]`}>
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={imageUrl}
      alt={name}
      loading="lazy"
      className={`${size} shrink-0 rounded-lg object-contain border-2 border-[var(--border)] bg-[var(--surface)] p-1`}
    />
  );
}
