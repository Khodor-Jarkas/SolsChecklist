"use client";

import { useMemo, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type Item = Database["public"]["Tables"]["items"]["Row"];
type OwnedState = Record<number, number>;

export function CraftingChecklist({
  items,
  initialOwned,
}: {
  items: Item[];
  initialOwned: OwnedState;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [owned, setOwned] = useState<OwnedState>(initialOwned);
  const [, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const i of items) {
      if (!map.has(i.kind)) map.set(i.kind, []);
      map.get(i.kind)!.push(i);
    }
    return Array.from(map.entries());
  }, [items]);

  async function setCount(item: Item, count: number) {
    const prev = owned;
    const next = { ...owned };
    if (count <= 0) delete next[item.id];
    else next[item.id] = count;
    setOwned(next);

    startTransition(async () => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) {
        setOwned(prev);
        return;
      }

      if (count <= 0) {
        const { error } = await supabase
          .from("user_items")
          .delete()
          .eq("user_id", uid)
          .eq("item_id", item.id);
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
      {grouped.map(([kind, list]) => (
        <div key={kind} className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider text-[var(--foreground)]/60">{kind}</h2>
          <ul className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((i) => {
              const count = owned[i.id] ?? 0;
              const has = count > 0;
              return (
                <li key={i.id} className={`card p-4 flex gap-3 ${has ? "" : "opacity-70"}`}>
                  <button
                    onClick={() => setCount(i, has ? 0 : 1)}
                    aria-label={has ? "Mark as none" : "Mark as crafted"}
                    className={`h-6 w-6 shrink-0 rounded border-2 flex items-center justify-center transition mt-1 ${has ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent)]"}`}
                  >
                    {has && (
                      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M3 8l3.5 3.5L13 5" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{i.name}</h3>
                    {i.description && (
                      <p className="text-xs text-[var(--foreground)]/60 mt-1">{i.description}</p>
                    )}
                    {has && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => setCount(i, count - 1)}
                          className="h-6 w-6 rounded border border-[var(--border)] hover:bg-[var(--card-hover)] text-sm"
                          aria-label="Decrease"
                        >
                          −
                        </button>
                        <span className="text-sm font-mono w-8 text-center">{count}</span>
                        <button
                          onClick={() => setCount(i, count + 1)}
                          className="h-6 w-6 rounded border border-[var(--border)] hover:bg-[var(--card-hover)] text-sm"
                          aria-label="Increase"
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
        </div>
      ))}
    </div>
  );
}
