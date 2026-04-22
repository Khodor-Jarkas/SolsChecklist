"use client";

import { useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Achievement = Database["public"]["Tables"]["achievements"]["Row"];
type UnlockedState = Record<number, string>;

export function AchievementsChecklist({
  achievements,
  initialUnlocked,
}: {
  achievements: Achievement[];
  initialUnlocked: UnlockedState;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [unlocked, setUnlocked] = useState<UnlockedState>(initialUnlocked);
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
    else next[achievement.id] = new Date().toISOString();
    setUnlocked(next);

    startTransition(async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        setUnlocked(prev);
        return;
      }
      const { error } = has
        ? await supabase
            .from("user_achievements")
            .delete()
            .eq("user_id", uid)
            .eq("achievement_id", achievement.id)
        : await supabase.from("user_achievements").insert({
            user_id: uid,
            achievement_id: achievement.id,
          });
      if (error) {
        setUnlocked(prev);
        console.error(error);
      }
    });
  }

  return (
    <div className="space-y-8">
      {grouped.map(([category, list]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider text-[var(--foreground)]/60">
            {category}
          </h2>
          <ul className="grid gap-3 grid-cols-1 md:grid-cols-2">
            {list.map((a) => {
              const has = Boolean(unlocked[a.id]);
              return (
                <li key={a.id} className="card p-4 flex gap-3">
                  <button
                    onClick={() => toggle(a)}
                    aria-label={has ? "Lock" : "Unlock"}
                    className={`h-6 w-6 shrink-0 rounded border-2 flex items-center justify-center transition mt-0.5 ${has ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent)]"}`}
                  >
                    {has && (
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M3 8l3.5 3.5L13 5" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${has ? "" : "text-[var(--foreground)]/80"}`}>{a.name}</h3>
                    <p className="text-xs text-[var(--foreground)]/60 mt-1">{a.description}</p>
                    {has && unlocked[a.id] && (
                      <p className="text-[11px] text-[var(--foreground)]/50 mt-2">
                        Unlocked {new Date(unlocked[a.id]).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
