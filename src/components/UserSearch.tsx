"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Hit = { username: string; avatar_url: string | null };

export function UserSearch() {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  // Debounced lookup.
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    const t = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("username, avatar_url")
        .ilike("username", `${q}%`)
        .order("username")
        .limit(8);
      if (cancelled) return;
      setHits(data ?? []);
      setActive(0);
    }, 180);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, supabase]);

  // Click-outside to close.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function go(username: string) {
    setOpen(false);
    setQuery("");
    startTransition(() => {
      router.push(`/u/${encodeURIComponent(username)}`);
    });
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (hits[active]) go(hits[active].username);
      else if (query.trim()) go(query.trim()); // direct navigate to exact-match username
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKey}
        placeholder="Find a user…"
        aria-label="Find a user"
        className="input h-8 w-44 md:w-56 text-sm"
      />
      {open && hits.length > 0 && (
        <div className="absolute top-full mt-1 right-0 w-64 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-lg z-30 overflow-hidden">
          {hits.map((h, i) => (
            <Link
              key={h.username}
              href={`/u/${encodeURIComponent(h.username)}`}
              onClick={() => {
                setOpen(false);
                setQuery("");
              }}
              onMouseEnter={() => setActive(i)}
              className={`flex items-center gap-2 px-3 py-2 text-sm ${
                i === active ? "bg-[var(--card-hover)]" : ""
              } hover:bg-[var(--card-hover)]`}
            >
              {h.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={h.avatar_url}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-semibold text-white">
                  {h.username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="truncate">@{h.username}</span>
            </Link>
          ))}
        </div>
      )}
      {open && query.trim().length >= 2 && hits.length === 0 && (
        <div className="absolute top-full mt-1 right-0 w-64 rounded-md border border-[var(--border)] bg-[var(--card)] shadow-lg z-30 p-3 text-xs text-[var(--foreground-muted)]">
          No user found. Press Enter to try @{query.trim()} anyway.
        </div>
      )}
    </div>
  );
}
