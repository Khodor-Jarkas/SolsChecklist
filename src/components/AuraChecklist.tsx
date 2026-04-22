"use client";

import { useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { RARITY_LABEL, RARITY_ORDER, RARITY_CLASS, formatOdds } from "@/lib/rarity";
import type { Database, Rarity } from "@/lib/supabase/types";

type Aura = Database["public"]["Tables"]["auras"]["Row"];
type OwnedState = Record<number, { count: number; first_obtained_at: string }>;

type Filter = "all" | "owned" | "missing";

export function AuraChecklist({
  auras,
  initialOwned,
}: {
  auras: Aura[];
  initialOwned: OwnedState;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [owned, setOwned] = useState<OwnedState>(initialOwned);
  const [rarity, setRarity] = useState<Rarity | "all">("all");
  const [biome, setBiome] = useState<string>("all");
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [, startTransition] = useTransition();

  const biomes = useMemo(() => {
    const set = new Set<string>();
    for (const a of auras) if (a.biome) set.add(a.biome);
    return ["all", ...Array.from(set).sort()];
  }, [auras]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return auras.filter((a) => {
      if (rarity !== "all" && a.rarity !== rarity) return false;
      if (biome !== "all" && a.biome !== biome) return false;
      const has = Boolean(owned[a.id]);
      if (filter === "owned" && !has) return false;
      if (filter === "missing" && has) return false;
      if (q && !a.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [auras, owned, rarity, biome, filter, query]);

  async function toggle(aura: Aura) {
    const has = Boolean(owned[aura.id]);
    const prev = owned;

    // Optimistic update
    const next: OwnedState = { ...owned };
    if (has) {
      delete next[aura.id];
    } else {
      next[aura.id] = { count: 1, first_obtained_at: new Date().toISOString() };
    }
    setOwned(next);

    startTransition(async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        setOwned(prev);
        return;
      }

      const { error } = has
        ? await supabase
            .from("user_auras")
            .delete()
            .eq("user_id", uid)
            .eq("aura_id", aura.id)
        : await supabase.from("user_auras").insert({
            user_id: uid,
            aura_id: aura.id,
            count: 1,
          });

      if (error) {
        setOwned(prev);
        console.error(error);
      }
    });
  }

  async function incrementCount(aura: Aura, delta: number) {
    const current = owned[aura.id];
    if (!current) return;
    const newCount = Math.max(1, current.count + delta);
    if (newCount === current.count) return;

    const prev = owned;
    setOwned({ ...owned, [aura.id]: { ...current, count: newCount } });

    startTransition(async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        setOwned(prev);
        return;
      }
      const { error } = await supabase
        .from("user_auras")
        .update({ count: newCount })
        .eq("user_id", uid)
        .eq("aura_id", aura.id);
      if (error) {
        setOwned(prev);
        console.error(error);
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <input
          placeholder="Search auras…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input max-w-xs"
        />

        <select
          value={rarity}
          onChange={(e) => setRarity(e.target.value as Rarity | "all")}
          className="input max-w-[10rem]"
        >
          <option value="all">All rarities</option>
          {RARITY_ORDER.map((r) => (
            <option key={r} value={r}>
              {RARITY_LABEL[r]}
            </option>
          ))}
        </select>

        {biomes.length > 1 && (
          <select
            value={biome}
            onChange={(e) => setBiome(e.target.value)}
            className="input max-w-[10rem]"
          >
            {biomes.map((b) => (
              <option key={b} value={b}>
                {b === "all" ? "All biomes" : b}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-1 ml-auto">
          {(["all", "owned", "missing"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`}
            >
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-[var(--foreground)]/60 py-16">No auras match.</p>
      ) : (
        <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => {
            const state = owned[a.id];
            const has = Boolean(state);
            const rarityClass = RARITY_CLASS[a.rarity as Rarity];
            return (
              <li
                key={a.id}
                className={`card p-4 flex gap-3 border-l-4 ${rarityClass} ${has ? "opacity-100" : "opacity-80"}`}
              >
                <button
                  onClick={() => toggle(a)}
                  aria-label={has ? "Mark as missing" : "Mark as owned"}
                  className={`h-6 w-6 shrink-0 rounded border-2 flex items-center justify-center transition mt-1 ${has ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent)]"}`}
                >
                  {has && (
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M3 8l3.5 3.5L13 5" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-medium truncate">{a.name}</h3>
                    <span className={`text-xs uppercase tracking-wide ${rarityClass.split(" ")[0]}`}>
                      {RARITY_LABEL[a.rarity as Rarity]}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--foreground)]/60 mt-0.5">
                    {formatOdds(a.rarity_odds)}
                    {a.biome && <span> • {a.biome}</span>}
                  </div>
                  {a.description && (
                    <p className="text-xs text-[var(--foreground)]/60 mt-2 line-clamp-2">
                      {a.description}
                    </p>
                  )}

                  {has && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-[var(--foreground)]/70">Count:</span>
                      <button
                        onClick={() => incrementCount(a, -1)}
                        className="h-6 w-6 rounded border border-[var(--border)] hover:bg-[var(--card-hover)] text-sm"
                        aria-label="Decrease count"
                      >
                        −
                      </button>
                      <span className="text-sm font-mono">{state.count}</span>
                      <button
                        onClick={() => incrementCount(a, 1)}
                        className="h-6 w-6 rounded border border-[var(--border)] hover:bg-[var(--card-hover)] text-sm"
                        aria-label="Increase count"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
