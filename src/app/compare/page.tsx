import type { Metadata } from "next";
import Link from "next/link";
import { createClient, getUser, getUserProfile } from "@/lib/supabase/server";
import { getAuraCatalog } from "@/lib/catalog";
import { CompareLists, type CompareAura } from "@/components/CompareLists";

export const metadata: Metadata = {
  title: "Compare collections",
  description: "Compare two Sol's RNG aura collections side by side — see what each of you is missing.",
};

type Side = {
  username: string;
  avatarUrl: string | null;
  status: "ok" | "missing" | "private";
  owned: Set<number>;
};

async function loadSide(
  supabase: Awaited<ReturnType<typeof createClient>>,
  username: string,
  viewerId: string | null,
): Promise<Side> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, is_private")
    .eq("username", username)
    .maybeSingle();
  if (!profile) return { username, avatarUrl: null, status: "missing", owned: new Set() };
  if (profile.is_private && profile.id !== viewerId) {
    return { username: profile.username, avatarUrl: profile.avatar_url, status: "private", owned: new Set() };
  }
  const { data: rows } = await supabase.from("user_auras").select("aura_id").eq("user_id", profile.id);
  return {
    username: profile.username,
    avatarUrl: profile.avatar_url,
    status: "ok",
    owned: new Set((rows ?? []).map((r) => r.aura_id)),
  };
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ a?: string; b?: string }>;
}) {
  const params = await searchParams;
  const [supabase, viewer] = await Promise.all([createClient(), getUser()]);
  const viewerProfile = viewer ? await getUserProfile(viewer.id) : null;

  const a = (params.a ?? viewerProfile?.username ?? "").trim();
  const b = (params.b ?? "").trim();

  const [sideA, sideB, catalog] =
    a && b
      ? await Promise.all([loadSide(supabase, a, viewer?.id ?? null), loadSide(supabase, b, viewer?.id ?? null), getAuraCatalog()])
      : [null, null, []];

  const ready = sideA?.status === "ok" && sideB?.status === "ok";
  const pick = (pred: (id: number) => boolean): CompareAura[] =>
    catalog
      .filter((x) => pred(x.id))
      .sort((x, y) => (y.rarity_odds ?? 0) - (x.rarity_odds ?? 0))
      .map((x) => ({
        id: x.id,
        name: x.name,
        rarity: x.rarity,
        rarity_odds: x.rarity_odds,
        image_url: x.image_url,
        isEvent: Boolean(x.event_name),
      }));

  const onlyA = ready ? pick((id) => sideA.owned.has(id) && !sideB.owned.has(id)) : [];
  const onlyB = ready ? pick((id) => sideB.owned.has(id) && !sideA.owned.has(id)) : [];
  const both = ready ? pick((id) => sideA.owned.has(id) && sideB.owned.has(id)) : [];

  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Compare collections</h1>
        <p className="text-sm text-[var(--foreground)]/70 mt-1">
          See which auras each of you has that the other is missing.
        </p>
      </header>

      <form className="card p-4 flex flex-wrap items-end gap-3" action="/compare">
        <label className="flex-1 min-w-[10rem] space-y-1">
          <span className="text-xs text-[var(--foreground-muted)]">First user</span>
          <input name="a" defaultValue={a} placeholder="username" className="input w-full" required />
        </label>
        <span className="pb-2 text-sm text-[var(--foreground-faint)]">vs</span>
        <label className="flex-1 min-w-[10rem] space-y-1">
          <span className="text-xs text-[var(--foreground-muted)]">Second user</span>
          <input name="b" defaultValue={b} placeholder="username" className="input w-full" required />
        </label>
        <button type="submit" className="btn btn-primary">
          Compare
        </button>
      </form>

      {sideA && sideB && !ready && (
        <div className="card p-6 space-y-1 text-sm">
          {[sideA, sideB]
            .filter((s) => s.status !== "ok")
            .map((s) => (
              <p key={s.username}>
                {s.status === "missing" ? (
                  <>No user named <span className="font-mono">@{s.username}</span>.</>
                ) : (
                  <>
                    <Link href={`/u/${encodeURIComponent(s.username)}`} className="font-mono hover:underline">@{s.username}</Link>
                    &apos;s collection is private.
                  </>
                )}
              </p>
            ))}
        </div>
      )}

      {ready && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Stat label={`Only @${sideA.username}`} value={onlyA.length} />
            <Stat label="Both have" value={both.length} />
            <Stat label={`Only @${sideB.username}`} value={onlyB.length} />
          </div>
          <CompareLists
            a={sideA.username}
            b={sideB.username}
            onlyA={onlyA}
            onlyB={onlyB}
            both={both}
          />
        </>
      )}

      {!a || !b ? (
        <p className="text-sm text-[var(--foreground-faint)]">
          {viewerProfile
            ? "Enter a username to compare with yours."
            : "Enter two usernames. Tip: open someone's profile while signed in and use “Compare with me”."}
        </p>
      ) : null}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-[var(--foreground-muted)] truncate">{label}</p>
    </div>
  );
}
