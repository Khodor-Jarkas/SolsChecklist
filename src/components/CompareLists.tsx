"use client";

import { useState } from "react";
import { RARITY_CLASS, RARITY_LABEL, formatOdds } from "@/lib/rarity";
import type { Rarity } from "@/lib/supabase/types";
import { ProxiedImg } from "@/components/ProxiedImg";

export type CompareAura = {
  id: number;
  name: string;
  rarity: Rarity;
  rarity_odds: number | null;
  image_url: string | null;
  isEvent: boolean;
};

type Tab = "onlyA" | "onlyB" | "both";

export function CompareLists({
  a,
  b,
  onlyA,
  onlyB,
  both,
}: {
  a: string;
  b: string;
  onlyA: CompareAura[];
  onlyB: CompareAura[];
  both: CompareAura[];
}) {
  const [tab, setTab] = useState<Tab>(onlyA.length === 0 && onlyB.length > 0 ? "onlyB" : "onlyA");
  const [eventsToo, setEventsToo] = useState(true);
  const tabs: { key: Tab; label: string; list: CompareAura[] }[] = [
    { key: "onlyA", label: `Only @${a}`, list: onlyA },
    { key: "onlyB", label: `Only @${b}`, list: onlyB },
    { key: "both", label: "Both", list: both },
  ];
  const current = tabs.find((t) => t.key === tab)!;
  const list = eventsToo ? current.list : current.list.filter((x) => !x.isEvent);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="card p-1 inline-flex gap-1" role="tablist" aria-label="Comparison">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`btn btn-sm ${tab === t.key ? "btn-primary" : "btn-ghost"}`}
            >
              {t.label} ({t.list.length})
            </button>
          ))}
        </div>
        <label className="ml-auto flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
          <input type="checkbox" checked={eventsToo} onChange={(e) => setEventsToo(e.target.checked)} />
          Include event auras
        </label>
      </div>

      {list.length === 0 ? (
        <div className="card p-8 text-center text-sm text-[var(--foreground-muted)]">Nothing here.</div>
      ) : (
        <ul className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" role="tabpanel">
          {list.map((x) => {
            const color = RARITY_CLASS[x.rarity].split(" ")[0];
            const letter = (
              <div className={`h-10 w-10 shrink-0 rounded-md bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-sm font-semibold ${color}`}>
                {x.name.replace(/[^A-Za-z★]/g, "").charAt(0).toUpperCase() || "?"}
              </div>
            );
            return (
              <li key={x.id} className="card px-3 py-2 flex items-center gap-3">
                {x.image_url ? (
                  <ProxiedImg
                    url={x.image_url}
                    alt={x.name}
                    className="h-10 w-10 shrink-0 rounded-md object-contain bg-[var(--surface)] border border-[var(--border)] p-0.5"
                    fallback={letter}
                  />
                ) : (
                  letter
                )}
                <div className="min-w-0">
                  <p className="text-sm truncate">{x.name}</p>
                  <p className="text-[11px] font-mono text-[var(--foreground-faint)]">
                    <span className={color}>{RARITY_LABEL[x.rarity]}</span>
                    {x.rarity_odds ? <> · {formatOdds(x.rarity_odds)}</> : null}
                    {x.isEvent ? " · Event" : ""}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
