"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
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
import { BIOMES, biomeByName } from "@/lib/biomes";
import { AuraDetailModal, ObtainmentBadge, COUNTER_RARITIES } from "@/components/AuraDetailModal";

// Dev / admin-spawn biomes are surfaced via the events view ("Admin Events"),
// so we exclude them from the biome filter and from the normal-view aura list
// to keep the rarity view focused on regularly rollable content.
const DEV_BIOME_NAMES = new Set(
  BIOMES.filter((b) => b.category === "dev").map((b) => b.name),
);

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
  "RIA event",
  "Halloween",
  "Winter",
  "Christmas",
  "Anniversary",
  "Admin Events",
];

function eventRank(name: string): number {
  const i = EVENT_ORDER.indexOf(name);
  return i === -1 ? 999 : i;
}

// Admin Events sub-grouping: each dev biome maps to a friendly label naming
// the developer responsible. Used in the events view to split the section
// into per-dev cards instead of the default per-year cards.
const ADMIN_EVENT_SUBGROUPS: Record<string, string> = {
  "The Citadel Of Orders": "Word's Admin Abuse — Citadel",
  "The Null's Existence": "Axis's Admin Abuse — Null's",
  "The Hyperspace Realm": "Xyz's Admin Abuse — Hyperspace",
};
const ADMIN_EVENT_SUBGROUP_ORDER = [
  "Word's Admin Abuse — Citadel",
  "Axis's Admin Abuse — Null's",
  "Xyz's Admin Abuse — Hyperspace",
  "Astrald's Easter Event",
];

function adminSubgroupLabel(biome: string | null): string {
  if (!biome) return "Other";
  return ADMIN_EVENT_SUBGROUPS[biome] ?? biome;
}

// Crafting difficulty order (easiest → hardest) based on recipe cost / stat grant.
// Used as the sort key for the Crafting section instead of rarity_odds (which is
// null for all craftable auras and would otherwise show as "1 in 0").
const CRAFTABLE_ORDER: Record<string, number> = {
  "Eclipse":            1,
  "Cell Asteroides":    2,
  "Chromatic : Hyper":  3,
  "Atlas : A.T.L.A.S.": 4,
  "Matrix : Steampunk": 5,
  "MasterHand":         6,
};


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
  const [selectedAura, setSelectedAura] = useState<Aura | null>(null);
  const [justToggled, setJustToggled] = useState<number | null>(null);
  const [bulkPending, setBulkPending] = useState<Rarity | null>(null);
  const [, startTransition] = useTransition();

  const biomes = useMemo(() => {
    const set = new Set<string>();
    for (const a of auras) {
      if (!a.biome) continue;
      if (view === "rarity" && DEV_BIOME_NAMES.has(a.biome)) continue;
      // Events view: only include biomes that actually host event auras.
      if (view === "events" && !a.event_name) continue;
      set.add(a.biome);
    }
    return ["all", ...Array.from(set).sort()];
  }, [auras, view]);

  // If the persisted biome filter isn't valid in the current view (e.g. user
  // selected a dev biome under events, then switched to rarity), drop it back
  // to "all" so the visible aura list isn't silently empty.
  useEffect(() => {
    if (biome !== "all" && !biomes.includes(biome)) setBiome("all");
  }, [biome, biomes]);

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
      // Craft auras are always classified as "craftable" for filter purposes.
      const effectiveRarity = a.obtainment === "craft" ? "craftable" : a.rarity;
      if (rarity !== "all" && effectiveRarity !== rarity) return false;
      if (biome !== "all" && a.biome !== biome) return false;
      if (eventName !== "all" && a.event_name !== eventName) return false;
      if (
        obtainment !== "all" &&
        a.obtainment !== obtainment &&
        a.secondary_obtainment !== obtainment
      )
        return false;
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
      if (a.obtainment === "craft" && b.obtainment === "craft") {
        return (CRAFTABLE_ORDER[a.name] ?? 999) - (CRAFTABLE_ORDER[b.name] ?? 999);
      }
      return (a.rarity_odds ?? 0) - (b.rarity_odds ?? 0);
    },
    [sort],
  );

  // Group by rarity tier — sections. Craft auras always land in "craftable"
  // regardless of their underlying rarity value.
  const sections = useMemo(() => {
    const byTier = new Map<Rarity, Aura[]>();
    for (const a of filtered) {
      const t = (a.obtainment === "craft" ? "craftable" : a.rarity) as Rarity;
      if (!byTier.has(t)) byTier.set(t, []);
      byTier.get(t)!.push(a);
    }
    return RARITY_ORDER
      .filter((r) => byTier.has(r))
      .map((r) => ({ rarity: r, auras: byTier.get(r)!.slice().sort(sorter) }));
  }, [filtered, sorter]);

  // Group by event -> sub-section. For most events the sub-section is the
  // year (newest first). For "Admin Events" the sub-section is the dev who
  // ran it (mapped from the dev biome the aura spawns in).
  const eventSections = useMemo(() => {
    const byEvent = new Map<string, Map<string, Aura[]>>();
    for (const a of filtered) {
      if (!a.event_name) continue;
      const subKey =
        a.event_name === "Admin Events"
          ? adminSubgroupLabel(a.biome)
          : String(a.event_year ?? 0);
      if (!byEvent.has(a.event_name)) byEvent.set(a.event_name, new Map());
      const subMap = byEvent.get(a.event_name)!;
      if (!subMap.has(subKey)) subMap.set(subKey, []);
      subMap.get(subKey)!.push(a);
    }
    return Array.from(byEvent.entries())
      .sort(([a], [b]) => eventRank(a) - eventRank(b) || a.localeCompare(b))
      .map(([name, subMap]) => {
        const isAdmin = name === "Admin Events";
        const entries = Array.from(subMap.entries()).sort(([a], [b]) => {
          if (isAdmin) {
            const ai = ADMIN_EVENT_SUBGROUP_ORDER.indexOf(a);
            const bi = ADMIN_EVENT_SUBGROUP_ORDER.indexOf(b);
            return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
          }
          return Number(b) - Number(a); // years: newest first
        });
        return {
          name,
          subSections: entries.map(([key, list]) => ({
            key,
            label: isAdmin ? key : key === "0" ? "Undated" : key,
            auras: list.slice().sort(sorter),
          })),
        };
      });
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
          {sections.map(({ rarity: r, auras: list }, sectionIdx) => {
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
                  priorityCount={sectionIdx === 0 ? 6 : 0}
                  onSelect={setSelectedAura}
                />
              </section>
            );
          })}
        </div>
      ) : (
        <div className="space-y-12">
          {eventSections.map(({ name, subSections }) => {
            const allInEvent = subSections.flatMap((s) => s.auras);
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
                  {subSections.map(({ key, label, auras: list }) => {
                    const ownedInSub = list.filter((a) => owned[a.id]).length;
                    return (
                      <div key={key} className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
                            {label}
                          </h3>
                          <span className="text-xs font-mono text-[var(--foreground-faint)]">
                            {ownedInSub} / {list.length}
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
                          onSelect={setSelectedAura}
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

      {selectedAura && (
        <AuraDetailModal
          aura={selectedAura}
          ownedState={owned[selectedAura.id]}
          onClose={() => setSelectedAura(null)}
          onToggle={() => toggle(selectedAura)}
          onIncrementCount={(d) => incrementCount(selectedAura, d)}
          readOnly={readOnly}
        />
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
  priorityCount = 0,
  onSelect,
}: {
  list: Aura[];
  owned: OwnedState;
  justToggled: number | null;
  toggle: (a: Aura) => void;
  incrementCount: (a: Aura, d: number) => void;
  showRarity?: boolean;
  readOnly?: boolean;
  priorityCount?: number;
  onSelect?: (a: Aura) => void;
}) {
  return (
    <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((a, idx) => {
        const r = a.rarity as Rarity;
        const state = owned[a.id];
        const has = Boolean(state);
        const showCounter = COUNTER_RARITIES.has(r);
        const rarityColor = RARITY_CLASS[r].split(" ")[0];
        const isLimbo = a.biome === "The Limbo";
        return (
          <li
            key={a.id}
            onClick={() => onSelect?.(a)}
            className={[
              "card p-4 relative overflow-hidden transition-shadow",
              onSelect ? "cursor-pointer hover:ring-1 hover:ring-[var(--border-strong)]" : "",
              has ? "card-owned" : "",
              isLimbo ? "card-limbo" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {/* Gothic cross-hatch overlay for Limbo cards — sits behind content */}
            {isLimbo && <div className="limbo-ornament" aria-hidden />}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-rarity-${r}`} />

            <div className="flex gap-3 pl-2">
              {!readOnly && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggle(a); }}
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

              <AuraThumb aura={a} rarity={r} owned={has} priority={idx < priorityCount} />

              <div className="flex-1 min-w-0">
                <h3 className={`font-medium leading-tight ${has ? "" : "text-[var(--foreground-muted)]"}`}>
                  {a.name}
                </h3>

                <div className="text-xs text-[var(--foreground-faint)] mt-1 font-mono space-y-0.5">
                  {showRarity && <div className={rarityColor}>{RARITY_LABEL[r]}</div>}
                  <div>{formatOdds(a.rarity_odds)}</div>
                  {a.biome && (
                    <div>
                      <span
                        className={isLimbo ? "font-semibold tracking-wide" : ""}
                        style={{ color: biomeByName(a.biome)?.color ?? "var(--foreground-muted)" }}
                      >
                        {a.biome}
                      </span>
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

                {(() => {
                  const badges: Obtainment[] = [];
                  if (a.obtainment && a.obtainment !== "roll") badges.push(a.obtainment);
                  if (a.secondary_obtainment) badges.push(a.secondary_obtainment);
                  if (badges.length === 0) return null;
                  return (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {badges.map((m) => (
                        <ObtainmentBadge key={m} method={m} />
                      ))}
                    </div>
                  );
                })()}

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
                        onClick={(e) => { e.stopPropagation(); incrementCount(a, -1); }}
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
                        onClick={(e) => { e.stopPropagation(); incrementCount(a, 1); }}
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

function AuraThumb({
  aura,
  rarity,
  owned,
  priority = false,
}: {
  aura: Aura;
  rarity: Rarity;
  owned: boolean;
  priority?: boolean;
}) {
  const size = "h-20 w-20";
  const ring = owned
    ? `bg-rarity-${rarity}/15 border-rarity-${rarity}/60`
    : "bg-[var(--surface)] border-[var(--border)]";
  const classes = `${size} shrink-0 rounded-lg object-contain border-2 ${ring} p-1`;

  if (!aura.image_url) {
    return (
      <div
        className={`${size} shrink-0 rounded-lg border-2 flex items-center justify-center text-3xl font-semibold text-rarity-${rarity} ${ring}`}
      >
        {aura.name.replace(/[^A-Za-z★]/g, "").charAt(0).toUpperCase() || "?"}
      </div>
    );
  }

  const src = `/api/image?url=${encodeURIComponent(aura.image_url)}`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={aura.name}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fetchPriority={priority ? "high" : ("auto" as any)}
      className={classes}
    />
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
