"use client";

import { useState } from "react";
import { RARITY_LABEL, RARITY_ORDER } from "@/lib/rarity";
import type { Rarity } from "@/lib/supabase/types";

const pct = (o: number, t: number) => (t > 0 ? Math.round((o / t) * 100) : 0);

export function RarityBreakdown({
  byRarityNormal,
  byRarityEvent,
  catalogByRarityNormal,
  catalogByRarityEvent,
}: {
  byRarityNormal: Record<string, number>;
  byRarityEvent: Record<string, number>;
  catalogByRarityNormal: Record<string, number>;
  catalogByRarityEvent: Record<string, number>;
}) {
  const [view, setView] = useState<"normal" | "event">("normal");

  const byRarity       = view === "normal" ? byRarityNormal       : byRarityEvent;
  const catalogByRarity = view === "normal" ? catalogByRarityNormal : catalogByRarityEvent;

  return (
    <div className="pt-2 border-t border-[var(--border)]">
      {/* Header row */}
      <div className="flex items-center justify-between pt-4 pb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
          By rarity
        </h3>
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden text-xs font-medium">
          {(["normal", "event"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={[
                "px-3 py-1 transition-colors",
                view === v
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)]",
              ].join(" ")}
            >
              {v[0].toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {RARITY_ORDER.map((r: Rarity) => {
          const owned     = byRarity[r] ?? 0;
          const tierTotal = catalogByRarity[r] ?? 0;
          if (tierTotal === 0) return null;
          const tierPct = pct(owned, tierTotal);
          return (
            <div key={r} className="flex items-center gap-3">
              <span className={`w-28 shrink-0 text-sm text-rarity-${r} font-medium`}>
                {RARITY_LABEL[r]}
              </span>
              <div className="flex-1 h-2 rounded-full bg-[var(--surface)] overflow-hidden">
                <div
                  className={`h-full rounded-full bg-rarity-${r} transition-all duration-500`}
                  style={{ width: `${tierPct}%` }}
                />
              </div>
              <span className={`w-16 shrink-0 text-sm font-mono tabular-nums text-right ${owned > 0 ? "text-[var(--foreground)]" : "text-[var(--foreground-faint)]"}`}>
                {owned} / {tierTotal}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
