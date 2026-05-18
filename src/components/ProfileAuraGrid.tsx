"use client";

import { useMemo, useState } from "react";
import { RARITY_CLASS, RARITY_LABEL, formatOdds } from "@/lib/rarity";
import type { Rarity } from "@/lib/supabase/types";
import { AuraDetailModal } from "@/components/AuraDetailModal";
import type { ModalAura } from "@/components/AuraDetailModal";
import type { OwnedAuraItem } from "@/components/ProfileView";

type Selected = { aura: ModalAura; ownedState: { count: number; first_obtained_at: string } };

export function ProfileAuraGrid({ ownedAuras }: { ownedAuras: OwnedAuraItem[] }) {
  const [selected, setSelected] = useState<Selected | null>(null);

  const sorted = useMemo(
    () => [...ownedAuras].sort((a, b) => (b.aura.rarity_odds ?? 0) - (a.aura.rarity_odds ?? 0)),
    [ownedAuras],
  );

  return (
    <>
      <ul className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {sorted.map((o) => {
          const r = o.aura.rarity as Rarity;
          const rarityColor = RARITY_CLASS[r].split(" ")[0];
          return (
            <li
              key={o.aura.id}
              className="group relative cursor-pointer"
              onClick={() =>
                setSelected({
                  aura: o.aura as ModalAura,
                  ownedState: { count: o.count, first_obtained_at: o.first_obtained_at },
                })
              }
            >
              <div
                className={`aspect-square rounded-lg bg-[var(--surface)] border-2 border-rarity-${r}/40 p-1 flex items-center justify-center overflow-hidden transition-all hover:border-rarity-${r}/80 hover:scale-105`}
              >
                {o.aura.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`/api/image?url=${encodeURIComponent(o.aura.image_url)}`}
                    alt={o.aura.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className={`text-lg font-semibold ${rarityColor}`}>
                    {o.aura.name.replace(/[^A-Za-z★]/g, "").charAt(0).toUpperCase() || "?"}
                  </span>
                )}
                {o.count > 1 && (
                  <span className="absolute top-1 right-1 text-[10px] font-mono bg-black/60 backdrop-blur text-white px-1 rounded">
                    ×{o.count}
                  </span>
                )}
              </div>
              <p className={`mt-1 text-[11px] font-medium truncate text-center ${rarityColor}`}>
                {o.aura.name}
              </p>
              <p className="text-[10px] text-[var(--foreground-faint)] font-mono text-center">
                {formatOdds(o.aura.rarity_odds) || RARITY_LABEL[r]}
              </p>
            </li>
          );
        })}
      </ul>

      {selected && (
        <AuraDetailModal
          aura={selected.aura}
          ownedState={selected.ownedState}
          onClose={() => setSelected(null)}
          readOnly={true}
        />
      )}
    </>
  );
}
