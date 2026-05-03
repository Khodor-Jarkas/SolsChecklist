"use client";

import { useState } from "react";
import { RARITY_CLASS, RARITY_LABEL, formatOdds } from "@/lib/rarity";
import type { Rarity } from "@/lib/supabase/types";
import { AuraDetailModal } from "@/components/AuraDetailModal";
import type { ModalAura } from "@/components/AuraDetailModal";

export type BiomeAura = ModalAura & { id: number };

export function BiomeAuraList({
  auras,
  ownedIds,
}: {
  auras: BiomeAura[];
  ownedIds: number[];
}) {
  const [selected, setSelected] = useState<BiomeAura | null>(null);
  const owned = new Set(ownedIds);

  return (
    <>
      <ul className="divide-y divide-[var(--border)]/60">
        {auras.map((a) => {
          const r = a.rarity as Rarity;
          const isOwned = owned.has(a.id);
          const rarityColor = RARITY_CLASS[r].split(" ")[0];
          return (
            <li
              key={a.id}
              onClick={() => setSelected(a)}
              className={`px-5 py-2.5 flex items-center gap-3 cursor-pointer transition-colors hover:bg-[var(--card-hover)]/50 ${isOwned ? "bg-[var(--card-hover)]/30" : ""}`}
            >
              {a.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/image?url=${encodeURIComponent(a.image_url)}`}
                  alt={a.name}
                  loading="lazy"
                  decoding="async"
                  className="h-10 w-10 shrink-0 rounded-md object-contain bg-[var(--surface)] border border-[var(--border)] p-0.5"
                />
              ) : (
                <div className={`h-10 w-10 shrink-0 rounded-md bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-sm font-semibold ${rarityColor}`}>
                  {a.name.replace(/[^A-Za-z★]/g, "").charAt(0).toUpperCase() || "?"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className={`text-sm truncate ${isOwned ? "" : "text-[var(--foreground-muted)]"}`}>
                  {a.name}
                </div>
                <div className="text-[11px] font-mono text-[var(--foreground-faint)]">
                  <span className={rarityColor}>{RARITY_LABEL[r]}</span>
                  {a.rarity_odds && <> · {formatOdds(a.rarity_odds)}</>}
                  {a.native_biome_odds && (
                    <span className={`ml-1 ${rarityColor}`}>
                      · {formatOdds(a.native_biome_odds)} native
                    </span>
                  )}
                </div>
              </div>
              {isOwned && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 text-[var(--accent)] shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </li>
          );
        })}
      </ul>

      {selected && (
        <AuraDetailModal
          aura={selected}
          ownedState={
            owned.has(selected.id)
              ? { count: 1, first_obtained_at: "" }
              : undefined
          }
          onClose={() => setSelected(null)}
          readOnly={true}
        />
      )}
    </>
  );
}
