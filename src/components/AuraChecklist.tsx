"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { RARITY_LABEL, RARITY_ORDER, RARITY_CLASS, formatOdds } from "@/lib/rarity";
import type { Database, Rarity } from "@/lib/supabase/types";

type Aura = Database["public"]["Tables"]["auras"]["Row"];
type OwnedState = Record<number, { count: number; first_obtained_at: string }>;

type Filter = "all" | "owned" | "missing";
type Sort = "rarity" | "name" | "odds";

// Only show the "Rolled x N" counter for these rarities — for common/epic/etc
// tracking counts is noisy; for rarities this high, it's actually interesting.
const COUNTER_RARITIES = new Set<Rarity>([
  "glorious",
  "transcendent",
  "challenged",
  "challenged_plus",
  "craftable",
]);

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
  const [sort, setSort] = useState<Sort>("odds");
  const [query, setQuery] = useState("");
  const [justToggled, setJustToggled] = useState<number | null>(null);
  const [bulkPending, setBulkPending] = useState<Rarity | null>(null);
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

  // Group by rarity tier — sections. Within each, sort by `sort`.
  const sections = useMemo(() => {
    const byTier = new Map<Rarity, Aura[]>();
    for (const a of filtered) {
      const t = a.rarity as Rarity;
      if (!byTier.has(t)) byTier.set(t, []);
      byTier.get(t)!.push(a);
    }
    const sorter = (a: Aura, b: Aura) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "odds") return (b.rarity_odds ?? 0) - (a.rarity_odds ?? 0);
      return (a.rarity_odds ?? 0) - (b.rarity_odds ?? 0); // rarity: within-tier, easiest first
    };
    return RARITY_ORDER
      .filter((r) => byTier.has(r))
      .map((r) => ({ rarity: r, auras: byTier.get(r)!.slice().sort(sorter) }));
  }, [filtered, sort]);

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

  async function bulkMark(sectionAuras: Aura[], tier: Rarity) {
    const missing = sectionAuras.filter((a) => !owned[a.id]);
    if (missing.length === 0) return;

    setBulkPending(tier);
    const prev = owned;
    const next: OwnedState = { ...owned };
    const now = new Date().toISOString();
    for (const a of missing) next[a.id] = { count: 1, first_obtained_at: now };
    setOwned(next);

    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) {
      setOwned(prev);
      setBulkPending(null);
      return;
    }

    const rows = missing.map((a) => ({ user_id: uid, aura_id: a.id, count: 1 }));
    const { error } = await supabase.from("user_auras").insert(rows);
    if (error) {
      setOwned(prev);
      console.error(error);
    }
    setBulkPending(null);
  }

  return (
    <div className="space-y-5">
      {/* Overall progress */}
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
          className="input max-w-[11rem]"
        >
          <option value="odds">Sort: rarest first</option>
          <option value="rarity">Sort: easiest first</option>
          <option value="name">Sort: A–Z</option>
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

      {/* Sections */}
      {sections.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-10">
          {sections.map(({ rarity: r, auras: list }) => {
            const ownedInSection = list.filter((a) => owned[a.id]).length;
            const allOwned = ownedInSection === list.length;
            const rarityColor = RARITY_CLASS[r].split(" ")[0];
            return (
              <section key={r} className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className={`h-1.5 w-8 rounded-full bg-rarity-${r}`} />
                  <h2 className={`text-lg font-semibold ${rarityColor}`}>
                    {RARITY_LABEL[r]}
                  </h2>
                  <span className="text-xs font-mono text-[var(--foreground-muted)]">
                    {ownedInSection} / {list.length}
                  </span>
                  <button
                    onClick={() => bulkMark(list, r)}
                    disabled={allOwned || bulkPending === r}
                    className="btn btn-sm btn-ghost ml-auto"
                  >
                    {allOwned
                      ? "All marked"
                      : bulkPending === r
                        ? "Marking…"
                        : `Mark all ${RARITY_LABEL[r]}`}
                  </button>
                </div>

                <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((a) => {
                    const state = owned[a.id];
                    const has = Boolean(state);
                    const showCounter = COUNTER_RARITIES.has(r);
                    return (
                      <li
                        key={a.id}
                        className={`card p-4 relative overflow-hidden ${has ? "card-owned" : ""}`}
                      >
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
                            <h3 className={`font-medium leading-tight ${has ? "" : "text-[var(--foreground-muted)]"}`}>
                              {a.name}
                            </h3>

                            <div className="text-xs text-[var(--foreground-faint)] mt-1 font-mono space-y-0.5">
                              <div>{formatOdds(a.rarity_odds)}</div>
                              {a.biome && (
                                <div>
                                  <span className="text-[var(--foreground-muted)]">{a.biome}</span>
                                  {a.native_biome_odds && (
                                    <span className={`ml-1 ${rarityColor}`}>
                                      · {formatOdds(a.native_biome_odds)} native
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {a.description && (
                              <p className="text-xs text-[var(--foreground-muted)] mt-2 line-clamp-2 leading-relaxed">
                                {a.description}
                              </p>
                            )}

                            {has && showCounter && (
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
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Per-URL cache so the same GIF is only captured once across remounts.
const frameCache = new Map<string, string>();

function AuraThumb({
  aura,
  rarity,
  owned,
}: {
  aura: Aura;
  rarity: Rarity;
  owned: boolean;
}) {
  const size = "h-20 w-20";
  const ring = owned
    ? `bg-rarity-${rarity}/15 border-rarity-${rarity}/60`
    : "bg-[var(--surface)] border-[var(--border)]";
  const classes = `${size} shrink-0 rounded-lg object-contain border-2 ${ring} p-1`;

  const [hovered, setHovered] = useState(false);
  const [staticSrc, setStaticSrc] = useState<string | null>(
    aura.image_url ? (frameCache.get(aura.image_url) ?? null) : null,
  );

  // Capture the first frame of the GIF once, so it can render frozen by default.
  // Requires CORS (Fandom's static.wikia.nocookie.net sends Access-Control-Allow-Origin: *);
  // if the canvas gets tainted for any reason we silently fall back to the live GIF.
  useEffect(() => {
    const url = aura.image_url;
    if (!url || frameCache.has(url)) return;

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => {
      if (cancelled) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 150;
        canvas.height = img.naturalHeight || 150;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        frameCache.set(url, dataUrl);
        setStaticSrc(dataUrl);
      } catch {
        // Tainted canvas — stays on live GIF.
      }
    };
    img.src = url;
    return () => {
      cancelled = true;
    };
  }, [aura.image_url]);

  if (!aura.image_url) {
    return (
      <div
        className={`${size} shrink-0 rounded-lg border-2 flex items-center justify-center text-3xl font-semibold text-rarity-${rarity} ${ring}`}
      >
        {aura.name.replace(/[^A-Za-z★]/g, "").charAt(0).toUpperCase() || "?"}
      </div>
    );
  }

  // Show the live GIF while hovering, or while the first-frame capture is
  // still pending. Freeze to the captured PNG otherwise.
  const shownSrc = hovered || !staticSrc ? aura.image_url : staticSrc;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={shownSrc}
      alt={aura.name}
      loading="lazy"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={classes}
    />
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
