"use client";

import { useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Achievement = Database["public"]["Tables"]["achievements"]["Row"];
type UnlockedState = Record<number, string>;

const CATEGORY_ACCENT: Record<string, string> = {
  rolling: "text-purple-400 bg-purple-500/10",
  collection: "text-pink-400 bg-pink-500/10",
  exploration: "text-sky-400 bg-sky-500/10",
  crafting: "text-amber-400 bg-amber-500/10",
};

export function AchievementsChecklist({
  achievements,
  initialUnlocked,
}: {
  achievements: Achievement[];
  initialUnlocked: UnlockedState;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [unlocked, setUnlocked] = useState<UnlockedState>(initialUnlocked);
  const [justUnlocked, setJustUnlocked] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const map = new Map<string, Achievement[]>();
    for (const a of achievements) {
      const key = a.category ?? "other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return Array.from(map.entries());
  }, [achievements]);

  async function toggle(achievement: Achievement) {
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
    <div className="space-y-8">
      {grouped.map(([category, list]) => {
        const unlockedInGroup = list.filter((a) => unlocked[a.id]).length;
        const accent = CATEGORY_ACCENT[category] ?? "text-[var(--foreground-muted)] bg-[var(--card-hover)]";
        return (
          <div key={category} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={`inline-flex h-8 px-3 items-center rounded-md text-xs font-semibold uppercase tracking-wider ${accent}`}>
                  {category}
                </span>
                <span className="text-xs text-[var(--foreground-muted)] font-mono">
                  {unlockedInGroup} / {list.length}
                </span>
              </div>
            </div>
            <ul className="grid gap-3 grid-cols-1 md:grid-cols-2">
              {list.map((a) => {
                const has = Boolean(unlocked[a.id]);
                return (
                  <li key={a.id} className={`card p-4 ${has ? "card-owned" : ""}`}>
                    <div className="flex gap-3">
                      <button
                        onClick={() => toggle(a)}
                        aria-label={has ? "Lock" : "Unlock"}
                        data-checked={has}
                        className={`checkbox mt-0.5 ${justUnlocked === a.id ? "animate-pop" : ""}`}
                      >
                        {has && (
                          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium ${has ? "" : "text-[var(--foreground-muted)]"}`}>
                          {a.name}
                        </h3>
                        <p className="text-xs text-[var(--foreground-muted)] mt-1 leading-relaxed">{a.description}</p>
                        {has && unlocked[a.id] && (
                          <p className="text-[11px] text-[var(--foreground-faint)] mt-2 flex items-center gap-1">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Unlocked {new Date(unlocked[a.id]).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
