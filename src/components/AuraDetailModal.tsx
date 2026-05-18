"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { RARITY_CLASS, RARITY_LABEL, OBTAINMENT_LABEL, formatOdds } from "@/lib/rarity";
import type { Obtainment, Rarity } from "@/lib/supabase/types";
import { biomeByName, potionHighlightParts } from "@/lib/biomes";

// Rarities where showing "rolled N×" is meaningful.
export const COUNTER_RARITIES = new Set<Rarity>([
  "glorious",
  "transcendent",
  "challenged",
  "challenged_plus",
  "craftable",
]);

// Minimal aura shape the modal needs — a subset of the full DB row.
export type ModalAura = {
  name: string;
  rarity: Rarity;
  rarity_odds: number | null;
  native_biome_odds: number | null;
  biome: string | null;
  event_name: string | null;
  event_year: number | null;
  description: string | null;
  obtainment: Obtainment | null;
  secondary_obtainment: Obtainment | null;
  image_url: string | null;
};

const OBTAINMENT_STYLE: Record<Obtainment, string> = {
  roll:        "bg-purple-500/10 text-purple-300 border-purple-500/30",
  craft:       "bg-sky-500/10 text-sky-300 border-sky-500/30",
  shop:        "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  battle_pass: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  quest:       "bg-pink-500/10 text-pink-300 border-pink-500/30",
  wheel:       "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

export function ObtainmentBadge({ method }: { method: Obtainment }) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${OBTAINMENT_STYLE[method]}`}
    >
      {OBTAINMENT_LABEL[method]}
    </span>
  );
}

export function AuraDetailModal({
  aura,
  ownedState,
  onClose,
  onToggle,
  onIncrementCount,
  readOnly,
}: {
  aura: ModalAura;
  ownedState: { count: number; first_obtained_at: string } | undefined;
  onClose: () => void;
  onToggle?: () => void;
  onIncrementCount?: (d: number) => void;
  readOnly: boolean;
}) {
  const r = aura.rarity;
  const has = Boolean(ownedState);
  const rarityColor = RARITY_CLASS[r].split(" ")[0];
  const showCounter = COUNTER_RARITIES.has(r);
  const isLimbo = aura.biome === "The Limbo";

  const badges: Obtainment[] = [];
  if (aura.obtainment && aura.obtainment !== "roll") badges.push(aura.obtainment);
  if (aura.secondary_obtainment) badges.push(aura.secondary_obtainment);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div
        className={[
          "relative z-10 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-2xl",
          "border border-[var(--border-strong)]",
          isLimbo ? "card-limbo" : "bg-[var(--card)]",
        ].join(" ")}
        onClick={(e) => e.stopPropagation()}
      >
        {isLimbo && <div className="limbo-ornament" aria-hidden />}

        <div className={`h-1 w-full bg-rarity-${r} relative z-10`} />

        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative z-10 p-6 flex flex-col sm:flex-row gap-6">
          <div
            className={`shrink-0 mx-auto sm:mx-0 w-44 h-44 rounded-xl border-2 border-rarity-${r}/50 bg-black/20 flex items-center justify-center overflow-hidden`}
          >
            {aura.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/image?url=${encodeURIComponent(aura.image_url)}&size=large`}
                alt={aura.name}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <span className={`text-5xl font-bold ${rarityColor}`}>
                {aura.name.replace(/[^A-Za-z★]/g, "").charAt(0).toUpperCase() || "?"}
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h2 className={`text-xl font-bold leading-tight ${rarityColor}`}>{aura.name}</h2>
              <span className={`text-sm font-medium ${rarityColor} opacity-70`}>{RARITY_LABEL[r]}</span>
            </div>

            <dl className="space-y-1.5 text-sm">
              {aura.rarity_odds && (
                <div className="flex gap-2">
                  <dt className="text-[var(--foreground-muted)] w-20 shrink-0">Odds</dt>
                  <dd className="font-mono">{formatOdds(aura.rarity_odds)}</dd>
                </div>
              )}
              {aura.native_biome_odds && (
                <div className="flex gap-2">
                  <dt className="text-[var(--foreground-muted)] w-20 shrink-0">In biome</dt>
                  <dd className={`font-mono ${rarityColor}`}>{formatOdds(aura.native_biome_odds)}</dd>
                </div>
              )}
              {aura.biome && (
                <div className="flex gap-2">
                  <dt className="text-[var(--foreground-muted)] w-20 shrink-0">Biome</dt>
                  <dd
                    className={isLimbo ? "font-semibold" : ""}
                    style={{ color: biomeByName(aura.biome)?.color }}
                  >
                    {aura.biome}
                  </dd>
                </div>
              )}
              {aura.event_name && (
                <div className="flex gap-2">
                  <dt className="text-[var(--foreground-muted)] w-20 shrink-0">Event</dt>
                  <dd>{aura.event_name}{aura.event_year ? ` ${aura.event_year}` : ""}</dd>
                </div>
              )}
            </dl>

            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {badges.map((m) => <ObtainmentBadge key={m} method={m} />)}
              </div>
            )}

            {aura.description && (() => {
              const parts = potionHighlightParts(aura.description);
              return (
                <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                  {parts ? (
                    <>{parts.before}<span style={{ color: parts.color }}>{parts.match}</span>{parts.after}</>
                  ) : aura.description}
                </p>
              );
            })()}
          </div>
        </div>

        <div className="relative z-10 px-6 pb-6 pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3 flex-wrap">
          <p className="text-sm text-[var(--foreground-muted)]">
            {has
              ? `First obtained ${new Date(ownedState!.first_obtained_at).toLocaleDateString()}`
              : "Not yet obtained"}
          </p>
          <div className="flex items-center gap-2">
            {has && showCounter && onIncrementCount && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onIncrementCount(-1)}
                  disabled={ownedState!.count <= 1}
                  className="h-7 w-7 rounded-md border border-[var(--border)] hover:bg-[var(--card-hover)] text-sm leading-none disabled:opacity-40"
                  aria-label="Decrease count"
                >−</button>
                <span className="text-sm font-mono font-semibold w-8 text-center tabular-nums">
                  {ownedState!.count}×
                </span>
                <button
                  onClick={() => onIncrementCount(1)}
                  className="h-7 w-7 rounded-md border border-[var(--border)] hover:bg-[var(--card-hover)] text-sm leading-none"
                  aria-label="Increase count"
                >+</button>
              </div>
            )}
            {!readOnly && onToggle && (
              <button
                onClick={onToggle}
                className={`btn btn-sm ${has ? "btn-ghost" : "btn-primary"}`}
              >
                {has ? "Mark as missing" : "Mark as owned"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
