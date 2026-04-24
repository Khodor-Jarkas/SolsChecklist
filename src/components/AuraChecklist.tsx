"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  RARITY_LABEL,
  RARITY_ORDER,
  RARITY_CLASS,
  OBTAINMENT_LABEL,
  OBTAINMENT_ORDER,
  formatOdds,
} from "@/lib/rarity";
import type { Database, Obtainment, Rarity } from "@/lib/supabase/types";

type Aura = Database["public"]["Tables"]["auras"]["Row"];
type OwnedState = Record<number, { count: number; first_obtained_at: string }>;

type Filter = "all" | "owned" | "missing";
type Sort = "rarity" | "name" | "odds";
type View = "rarity" | "events";

// Rough calendar order so event sections don't land alphabetical.
const EVENT_ORDER = [
  "Valentine's Day",
  "April Fools",
  "Easter",
  "Summer",
  "Innovator",
  "Halloween",
  "Winter",
  "Christmas",
  "Anniversary",
];

function eventRank(name: string): number {
  const i = EVENT_ORDER.indexOf(name);
  return i === -1 ? 999 : i;
}

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
  readOnly = false,
}: {
  auras: Aura[];
  initialOwned: OwnedState;
  readOnly?: boolean;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [owned, setOwned] = useState<OwnedState>(initialOwned);
  // Persisted filter/sort prefs — hydrated from localStorage after mount so
  // SSR stays deterministic. Defaults: "rarity" sort (easiest → hardest within
  // each tier, tiers already flow common → transcendent).
  const [rarity, setRarity] = useState<Rarity | "all">("all");
  const [biome, setBiome] = useState<string>("all");
  const [eventName, setEventName] = useState<string>("all");
  const [obtainment, setObtainment] = useState<Obtainment | "all">("all");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("rarity");
  const [view, setView] = useState<View>("rarity");
  const [query, setQuery] = useState("");
  const [prefsHydrated, setPrefsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("auras:prefs:v1");
      if (raw) {
        const p = JSON.parse(raw);
        if (p.rarity) setRarity(p.rarity);
        if (p.biome) setBiome(p.biome);
        if (p.eventName) setEventName(p.eventName);
        if (p.obtainment) setObtainment(p.obtainment);
        if (p.filter) setFilter(p.filter);
        if (p.sort) setSort(p.sort);
        if (p.view) setView(p.view);
      }
    } catch { /* ignore corrupt prefs */ }
    setPrefsHydrated(true);
  }, []);

  useEffect(() => {
    if (!prefsHydrated) return;
    try {
      localStorage.setItem(
        "auras:prefs:v1",
        JSON.stringify({ rarity, biome, eventName, obtainment, filter, sort, view }),
      );
    } catch { /* localStorage disabled */ }
  }, [prefsHydrated, rarity, biome, eventName, obtainment, filter, sort, view]);
  const [justToggled, setJustToggled] = useState<number | null>(null);
  const [bulkPending, setBulkPending] = useState<Rarity | null>(null);
  const [, startTransition] = useTransition();

  const biomes = useMemo(() => {
    const set = new Set<string>();
    for (const a of auras) if (a.biome) set.add(a.biome);
    return ["all", ...Array.from(set).sort()];
  }, [auras]);

  const eventNames = useMemo(() => {
    const set = new Set<string>();
    for (const a of auras) if (a.event_name) set.add(a.event_name);
    return ["all", ...Array.from(set).sort((a, b) => eventRank(a) - eventRank(b))];
  }, [auras]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return auras.filter((a) => {
      // Normal view: hide every event aura. Event view: hide every non-event aura.
      if (view === "events" && !a.event_name) return false;
      if (view === "rarity" && a.event_name) return false;
      if (rarity !== "all" && a.rarity !== rarity) return false;
      if (biome !== "all" && a.biome !== biome) return false;
      if (eventName !== "all" && a.event_name !== eventName) return false;
      if (obtainment !== "all" && a.obtainment !== obtainment) return false;
      const has = Boolean(owned[a.id]);
      if (filter === "owned" && !has) return false;
      if (filter === "missing" && has) return false;
      if (q && !a.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [auras, owned, rarity, biome, eventName, obtainment, filter, query, view]);

  const sorter = useMemo(
    () => (a: Aura, b: Aura) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "odds") return (b.rarity_odds ?? 0) - (a.rarity_odds ?? 0);
      return (a.rarity_odds ?? 0) - (b.rarity_odds ?? 0); // rarity: within-tier, easiest first
    },
    [sort],
  );

  // Group by rarity tier — sections. Within each, sort by `sort`.
  const sections = useMemo(() => {
    const byTier = new Map<Rarity, Aura[]>();
    for (const a of filtered) {
      const t = a.rarity as Rarity;
      if (!byTier.has(t)) byTier.set(t, []);
      byTier.get(t)!.push(a);
    }
    return RARITY_ORDER
      .filter((r) => byTier.has(r))
      .map((r) => ({ rarity: r, auras: byTier.get(r)!.slice().sort(sorter) }));
  }, [filtered, sorter]);

  // Group by event -> year. Years sorted newest first within each event.
  const eventSections = useMemo(() => {
    const byEvent = new Map<string, Map<number, Aura[]>>();
    for (const a of filtered) {
      if (!a.event_name) continue;
      const year = a.event_year ?? 0;
      if (!byEvent.has(a.event_name)) byEvent.set(a.event_name, new Map());
      const yearMap = byEvent.get(a.event_name)!;
      if (!yearMap.has(year)) yearMap.set(year, []);
      yearMap.get(year)!.push(a);
    }
    return Array.from(byEvent.entries())
      .sort(([a], [b]) => eventRank(a) - eventRank(b) || a.localeCompare(b))
      .map(([name, yearMap]) => ({
        name,
        years: Array.from(yearMap.entries())
          .sort(([a], [b]) => b - a)
          .map(([year, list]) => ({ year, auras: list.slice().sort(sorter) })),
      }));
  }, [filtered, sorter]);

  const stats = useMemo(() => {
    let normalTotal = 0, normalOwned = 0, eventTotal = 0, eventOwned = 0;
    for (const a of auras) {
      const isEvent = Boolean(a.event_name);
      if (isEvent) eventTotal++; else normalTotal++;
      if (owned[a.id]) {
        if (isEvent) eventOwned++; else normalOwned++;
      }
    }
    const pct = (o: number, t: number) => (t > 0 ? Math.round((o / t) * 100) : 0);
    return {
      normalOwned, normalTotal, normalPct: pct(normalOwned, normalTotal),
      eventOwned, eventTotal, eventPct: pct(eventOwned, eventTotal),
      totalOwned: normalOwned + eventOwned,
      total: normalTotal + eventTotal,
    };
  }, [owned, auras]);

  async function toggle(aura: Aura) {
    if (readOnly) return;
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
    if (readOnly) return;
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
    if (readOnly) return;
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
      {/* Progress for the current view only */}
      {!readOnly && (
        <div className="card p-4">
          {view === "rarity" ? (
            <ProgressBar
              label="Normal auras"
              owned={stats.normalOwned}
              total={stats.normalTotal}
              pct={stats.normalPct}
              gradient="from-purple-500 to-pink-400"
            />
          ) : (
            <ProgressBar
              label="Event auras"
              owned={stats.eventOwned}
              total={stats.eventTotal}
              pct={stats.eventPct}
              gradient="from-amber-400 to-rose-500"
            />
          )}
        </div>
      )}

      {/* View toggle */}
      <div className="card p-1 inline-flex gap-1">
        {([
          { key: "rarity" as const, label: "Show Normal" },
          { key: "events" as const, label: "Show Event" },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`btn btn-sm ${view === key ? "btn-primary" : "btn-ghost"}`}
          >
            {label}
          </button>
        ))}
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

        {view === "events" && eventNames.length > 1 && (
          <select
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="input max-w-[12rem]"
          >
            {eventNames.map((e) => (
              <option key={e} value={e}>{e === "all" ? "All events" : e}</option>
            ))}
          </select>
        )}

        <select
          value={obtainment}
          onChange={(e) => setObtainment(e.target.value as Obtainment | "all")}
          className="input max-w-[11rem]"
        >
          <option value="all">All sources</option>
          {OBTAINMENT_ORDER.map((o) => (
            <option key={o} value={o}>{OBTAINMENT_LABEL[o]}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="input max-w-[11rem]"
        >
          <option value="rarity">Sort: easiest first</option>
          <option value="odds">Sort: rarest first</option>
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
      {(view === "rarity" ? sections.length : eventSections.length) === 0 ? (
        <EmptyState />
      ) : view === "rarity" ? (
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
                  {!readOnly && (
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
                  )}
                </div>
                <AuraGrid
                  list={list}
                  owned={owned}
                  justToggled={justToggled}
                  toggle={toggle}
                  incrementCount={incrementCount}
                  showRarity={false}
                  readOnly={readOnly}
                />
              </section>
            );
          })}
        </div>
      ) : (
        <div className="space-y-12">
          {eventSections.map(({ name, years }) => {
            const allInEvent = years.flatMap((y) => y.auras);
            const ownedInEvent = allInEvent.filter((a) => owned[a.id]).length;
            return (
              <section key={name} className="space-y-5">
                <div className="flex items-center gap-3 flex-wrap border-b border-[var(--border)] pb-2">
                  <h2 className="text-xl font-semibold tracking-tight">{name}</h2>
                  <span className="text-xs font-mono text-[var(--foreground-muted)]">
                    {ownedInEvent} / {allInEvent.length}
                  </span>
                </div>
                <div className="space-y-8">
                  {years.map(({ year, auras: list }) => {
                    const ownedInYear = list.filter((a) => owned[a.id]).length;
                    return (
                      <div key={year} className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                            {year || "Undated"}
                          </h3>
                          <span className="text-xs font-mono text-[var(--foreground-faint)]">
                            {ownedInYear} / {list.length}
                          </span>
                        </div>
                        <AuraGrid
                          list={list}
                          owned={owned}
                          justToggled={justToggled}
                          toggle={toggle}
                          incrementCount={incrementCount}
                          showRarity
                          readOnly={readOnly}
                        />
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AuraGrid({
  list,
  owned,
  justToggled,
  toggle,
  incrementCount,
  showRarity = false,
  readOnly = false,
}: {
  list: Aura[];
  owned: OwnedState;
  justToggled: number | null;
  toggle: (a: Aura) => void;
  incrementCount: (a: Aura, d: number) => void;
  showRarity?: boolean;
  readOnly?: boolean;
}) {
  return (
    <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((a) => {
        const r = a.rarity as Rarity;
        const state = owned[a.id];
        const has = Boolean(state);
        const showCounter = COUNTER_RARITIES.has(r);
        const rarityColor = RARITY_CLASS[r].split(" ")[0];
        return (
          <li
            key={a.id}
            className={`card p-4 relative overflow-hidden ${has ? "card-owned" : ""}`}
          >
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-rarity-${r}`} />

            <div className="flex gap-3 pl-2">
              {!readOnly && (
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
              )}

              <AuraThumb aura={a} rarity={r} owned={has} />

              <div className="flex-1 min-w-0">
                <h3 className={`font-medium leading-tight ${has ? "" : "text-[var(--foreground-muted)]"}`}>
                  {a.name}
                </h3>

                <div className="text-xs text-[var(--foreground-faint)] mt-1 font-mono space-y-0.5">
                  {showRarity && <div className={rarityColor}>{RARITY_LABEL[r]}</div>}
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
                  {a.event_name && (
                    <div className="text-[var(--foreground-muted)]">
                      {a.event_name}
                      {a.event_year ? ` ${a.event_year}` : ""}
                    </div>
                  )}
                </div>

                {a.obtainment && a.obtainment !== "roll" && (
                  <div className="mt-2">
                    <ObtainmentBadge method={a.obtainment} />
                  </div>
                )}

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
  const isLimbo = aura.biome === "The Limbo";
  const size = "h-20 w-20";
  const ringByTier = owned
    ? `bg-rarity-${rarity}/15 border-rarity-${rarity}/60`
    : "bg-[var(--surface)] border-[var(--border)]";
  // Limbo auras get a distinctive purple-violet ring that overrides the tier
  // colour so they stand out at a glance.
  const ring = isLimbo
    ? "bg-[#14091f] border-violet-400 shadow-[0_0_0_1px_rgba(139,92,246,0.35),0_0_14px_rgba(139,92,246,0.35)]"
    : ringByTier;
  const classes = `${size} shrink-0 rounded-lg object-contain border-2 ${ring} p-1 relative`;

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [staticSrc, setStaticSrc] = useState<string | null>(
    aura.image_url ? (frameCache.get(aura.image_url) ?? null) : null,
  );

  // Capture the first frame only AFTER the browser's native lazy-load
  // actually fetches the image — no preemptive `new Image()` spam on mount.
  function handleLoaded() {
    const url = aura.image_url;
    if (!url || frameCache.has(url)) return;
    const el = imgRef.current;
    if (!el) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = el.naturalWidth || 150;
      canvas.height = el.naturalHeight || 150;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(el, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");
      frameCache.set(url, dataUrl);
      setStaticSrc(dataUrl);
    } catch {
      // Tainted canvas — stays on live GIF.
    }
  }

  if (!aura.image_url) {
    return (
      <div
        className={`${size} shrink-0 rounded-lg border-2 flex items-center justify-center text-3xl font-semibold text-rarity-${rarity} ${ring}`}
      >
        {aura.name.replace(/[^A-Za-z★]/g, "").charAt(0).toUpperCase() || "?"}
      </div>
    );
  }

  // Show the live GIF while hovering or while the first-frame capture is
  // still pending. Freeze to the captured PNG otherwise.
  const shownSrc = hovered || !staticSrc ? aura.image_url : staticSrc;

  return (
    <div className="relative shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={shownSrc}
        alt={aura.name}
        loading="lazy"
        decoding="async"
        crossOrigin="anonymous"
        onLoad={handleLoaded}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={classes}
      />
      {isLimbo && (
        <span
          className="absolute -top-1 -right-1 text-[8px] font-bold uppercase tracking-wider px-1 py-0.5 rounded-sm bg-violet-500 text-white shadow"
          title="Found in The Limbo"
        >
          Limbo
        </span>
      )}
    </div>
  );
}

function ProgressBar({
  label,
  owned,
  total,
  pct,
  gradient,
}: {
  label: string;
  owned: number;
  total: number;
  pct: number;
  gradient: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[var(--foreground-muted)]">{label}</span>
        <span className="font-mono text-[var(--foreground)]">
          {owned} / {total}
          <span className="text-[var(--foreground-muted)] ml-2">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-[var(--surface)] overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const OBTAINMENT_STYLE: Record<Obtainment, string> = {
  roll:        "bg-purple-500/10 text-purple-300 border-purple-500/30",
  craft:       "bg-sky-500/10 text-sky-300 border-sky-500/30",
  shop:        "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  battle_pass: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  quest:       "bg-pink-500/10 text-pink-300 border-pink-500/30",
  wheel:       "bg-rose-500/10 text-rose-300 border-rose-500/30",
  ugc:         "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  login:       "bg-teal-500/10 text-teal-300 border-teal-500/30",
};

function ObtainmentBadge({ method }: { method: Obtainment }) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full border ${OBTAINMENT_STYLE[method]}`}
    >
      {OBTAINMENT_LABEL[method]}
    </span>
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
