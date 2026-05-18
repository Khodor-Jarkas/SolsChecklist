"use client";

import { useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Item = Database["public"]["Tables"]["items"]["Row"];
type OwnedState = Record<number, number>;

const KIND_ACCENT: Record<string, string> = {
  gear: "text-sky-400 bg-sky-500/10",
  potion: "text-emerald-400 bg-emerald-500/10",
  material: "text-amber-400 bg-amber-500/10",
};

export function CraftingChecklist({
  items,
  initialOwned,
  userId,
}: {
  items: Item[];
  initialOwned: OwnedState;
  userId?: string | null;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [owned, setOwned] = useState<OwnedState>(initialOwned);
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const i of items) {
      if (!map.has(i.kind)) map.set(i.kind, []);
      map.get(i.kind)!.push(i);
    }
    return Array.from(map.entries());
  }, [items]);

  async function resolveUid(): Promise<string | null> {
    if (userId) return userId;
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
  }

  async function setCount(item: Item, count: number) {
    const prev = owned;
    const next = { ...owned };
    if (count <= 0) delete next[item.id];
    else {
      next[item.id] = count;
      if (!owned[item.id]) {
        setJustAdded(item.id);
        setTimeout(() => setJustAdded(null), 300);
      }
    }
    setOwned(next);

    startTransition(async () => {
      const uid = await resolveUid();
      if (!uid) return setOwned(prev);

      if (count <= 0) {
        const { error } = await supabase.from("user_items").delete().eq("user_id", uid).eq("item_id", item.id);
        if (error) {
          setOwned(prev);
          console.error(error);
        }
        return;
      }

      const { error } = await supabase
        .from("user_items")
        .upsert({ user_id: uid, item_id: item.id, count }, { onConflict: "user_id,item_id" });
      if (error) {
        setOwned(prev);
        console.error(error);
      }
    });
  }

  return (
    <div className="space-y-8">
      {grouped.map(([kind, list]) => {
        const ownedInGroup = list.filter((i) => owned[i.id]).length;
        const accent = KIND_ACCENT[kind] ?? "text-[var(--foreground-muted)] bg-[var(--card-hover)]";
        return (
          <div key={kind} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className={`inline-flex h-8 px-3 items-center rounded-md text-xs font-semibold uppercase tracking-wider ${accent}`}>
                {kind}
              </span>
              <span className="text-xs text-[var(--foreground-muted)] font-mono">
                {ownedInGroup} / {list.length}
              </span>
            </div>
            <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((i) => {
                const count = owned[i.id] ?? 0;
                const has = count > 0;
                return (
                  <li key={i.id} className={`card p-4 ${has ? "card-owned" : ""}`}>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setCount(i, has ? 0 : 1)}
                        aria-label={has ? "Mark as none" : "Mark as crafted"}
                        data-checked={has}
                        className={`checkbox mt-0.5 ${justAdded === i.id ? "animate-pop" : ""}`}
                      >
                        {has && (
                          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium ${has ? "" : "text-[var(--foreground-muted)]"}`}>{i.name}</h3>
                        {i.description && (
                          <p className="text-xs text-[var(--foreground-muted)] mt-1 leading-relaxed">{i.description}</p>
                        )}
                        {has && (
                          <div className="mt-3 flex items-center gap-2 pt-3 border-t border-[var(--border)]">
                            <span className="text-xs text-[var(--foreground-muted)]">Owned</span>
                            <div className="flex items-center ml-auto gap-1">
                              <button
                                onClick={() => setCount(i, count - 1)}
                                className="h-6 w-6 rounded-md border border-[var(--border)] hover:bg-[var(--card-hover)] text-sm leading-none"
                                aria-label="Decrease"
                              >
                                −
                              </button>
                              <span className="text-sm font-mono font-semibold w-8 text-center tabular-nums">{count}×</span>
                              <button
                                onClick={() => setCount(i, count + 1)}
                                className="h-6 w-6 rounded-md border border-[var(--border)] hover:bg-[var(--card-hover)] text-sm leading-none"
                                aria-label="Increase"
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
          </div>
        );
      })}
    </div>
  );
}
