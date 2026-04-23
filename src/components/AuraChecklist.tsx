"use client";

import { useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { RARITY_LABEL, RARITY_ORDER, RARITY_CLASS, formatOdds } from "@/lib/rarity";
import type { Database, Rarity } from "@/lib/supabase/types";

type Aura = Database["public"]["Tables"]["auras"]["Row"];
type OwnedState = Record<number, { count: number; first_obtained_at: string }>;

type Filter = "all" | "owned" | "missing";
type Sort = "rarity" | "name" | "odds";

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
  const [sort, setSort] = useState<Sort>("rarity");
  const [query, setQuery] = useState("");
  const [justToggled, setJustToggled] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const biomes = useMemo(() => {
    const set = new Set<string>();
    for (const a of auras) if (a.biome) set.add(a.biome);
    return ["all", ...Array.from(set).sort()];
  }, [auras]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = auras.filter((a) => {
      if (rarity !== "all" && a.rarity !== rarity) return false;
      if (biome !== "all" && a.biome !== biome) return false;
      const has = Boolean(owned[a.id]);
      if (filter === "owned" && !has) return false;
      if (filter === "missing" && has) return false;
      if (q && !a.name.toLowerCase().includes(q)) return false;
      return true;
    });

    return list.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "odds") return (b.rarity_odds ?? 0) - (a.rarity_odds ?? 0);
      // rarity (default)
      const r = RARITY_ORDER.indexOf(a.rarity as Rarity) - RARITY_ORDER.indexOf(b.rarity as Rarity);
      if (r !== 0) return r;
      return (a.rarity_odds ?? 0) - (b.rarity_odds ?? 0);
    });
  }, [auras, owned, rarity, biome, filter, query, sort]);

  const stats = useMemo(() => {
    const ownedCount = Object.keys(owned).length;
    const pct = auras.length > 0 ? Math.round((ownedCount / auras.length) * 100) : 0;
    return { ownedCount, total: auras.length, pct };
  }, [owned, auras]);

  async function toggle(aura: Aura) {
    const has = Boolean(owned[aura.id]);
    const prev = owned;
    const next: OwnedState = { ...owned };
    if (has) delete next[aura.id];
    else next[aura.id] = { count: 1, first_obtained_at: new Date().toISOString() };
    setOwned(next);

    if (!has) {
      setJustToggled(aura.id);
      setTimeout(() => setJustToggled(null), 300);
    }

    startTransition(async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return setOwned(prev);

      const { error } = has
        ? await supabase.from("user_auras").delete().eq("user_id", uid).eq("aura_id", aura.id)
        : await supabase.from("user_auras").insert({ user_id: uid, aura_id: aura.id, count: 1 });
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
      if (!uid) return setOwned(prev);
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
    <div className="space-y-5">
      {/* Progress bar */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--foreground-muted)]">Overall progress</span>
          <span className="font-mono text-[var(--foreground)]">
            {stats.ownedCount} / {stats.total}
            <span className="text-[var(--foreground-muted)] ml-2">({stats.pct}%)</span>
          </span>
        </div>
        <div className="h-2 rounded-full bg-[var(--surface)] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-400 transition-all duration-500"
            style={{ width: `${stats.pct}%` }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-2.5 items-center">
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
            <option key={r} value={r}>{RARITY_LABEL[r]}</option>
          ))}
        </select>

        {biomes.length > 1 && (
          <select
            value={biome}
            onChange={(e) => setBiome(e.target.value)}
            className="input max-w-[10rem]"
          >
            {biomes.map((b) => (
              <option key={b} value={b}>{b === "all" ? "All biomes" : b}</option>
            ))}
          </select>
        )}

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="input max-w-[10rem]"
        >
          <option value="rarity">Sort: rarity</option>
          <option value="name">Sort: A–Z</option>
          <option value="odds">Sort: rarest first</option>
        </select>

        <div className="flex items-center gap-1 ml-auto">
          {(["all", "owned", "missing"] as const).map((f) => (
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => {
            const state = owned[a.id];
            const has = Boolean(state);
            const r = a.rarity as Rarity;
            const rarityColor = RARITY_CLASS[r].split(" ")[0];
            return (
              <li
                key={a.id}
                className={`card p-4 relative overflow-hidden ${has ? "card-owned" : ""}`}
              >
                {/* Rarity accent bar on left edge */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-rarity-${r}`} />

                <div className="flex gap-3 pl-2">
                  <button
                    onClick={() => toggle(a)}
                    aria-label={has ? "Mark as missing" : "Mark as owned"}
                    data-checked={has}
                    className={`checkbox mt-0.5 ${justToggled === a.id ? "animate-pop" : ""}`}
                  >
                    {has && (
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  <AuraThumb aura={a} rarity={r} owned={has} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`font-medium truncate ${has ? "" : "text-[var(--foreground-muted)]"}`}>{a.name}</h3>
                      <span className={`badge ${rarityColor} shrink-0`}>
                        {RARITY_LABEL[r]}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--foreground-faint)] mt-1 font-mono">
                      {formatOdds(a.rarity_odds)}
                      {a.biome && <span> • {a.biome}</span>}
                    </div>
                    {a.description && (
                      <p className="text-xs text-[var(--foreground-muted)] mt-2 line-clamp-2 leading-relaxed">
                        {a.description}
                      </p>
                    )}

                    {has && (
                      <div className="mt-3 flex items-center gap-2 pt-3 border-t border-[var(--border)]">
                        <span className="text-xs text-[var(--foreground-muted)]">Rolled</span>
                        <div className="flex items-center ml-auto gap-1">
                          <button
                            onClick={() => incrementCount(a, -1)}
                            className="h-6 w-6 rounded-md border border-[var(--border)] hover:bg-[var(--card-hover)] text-sm leading-none disabled:opacity-40"
                            disabled={state.count <= 1}
                            aria-label="Decrease count"
                          >
                            −
                          </button>
                          <span className="text-sm font-mono font-semibold w-8 text-center tabular-nums">
                            {state.count}×
                          </span>
                          <button
                            onClick={() => incrementCount(a, 1)}
                            className="h-6 w-6 rounded-md border border-[var(--border)] hover:bg-[var(--card-hover)] text-sm leading-none"
                            aria-label="Increase count"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function AuraThumb({
  aura,
  rarity,
  owned,
}: {
  aura: Aura;
  rarity: Rarity;
  owned: boolean;
}) {
  const size = "h-12 w-12";
  const ring = owned
    ? `bg-rarity-${rarity}/15 border-rarity-${rarity}/60`
    : "bg-[var(--surface)] border-[var(--border)]";

  if (aura.image_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={aura.image_url}
        alt={aura.name}
        loading="lazy"
        className={`${size} shrink-0 rounded-md object-cover border ${ring}`}
      />
    );
  }

  // Fallback: first letter on a rarity-tinted tile.
  return (
    <div
      className={`${size} shrink-0 rounded-md border flex items-center justify-center text-lg font-semibold text-rarity-${rarity} ${ring}`}
    >
      {aura.name.replace(/[^A-Za-z★]/g, "").charAt(0).toUpperCase() || "?"}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card p-12 text-center space-y-2">
      <div className="mx-auto h-12 w-12 rounded-full bg-[var(--card-hover)] flex items-center justify-center text-[var(--foreground-faint)]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" strokeLinecap="round" />
        </svg>
      </div>
      <p className="text-[var(--foreground-muted)]">No auras match these filters.</p>
      <p className="text-xs text-[var(--foreground-faint)]">Try clearing the search or switching to &quot;All&quot;.</p>
    </div>
  );
}
