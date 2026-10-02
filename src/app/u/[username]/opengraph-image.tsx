import { ImageResponse } from "next/og";
import { anonClient } from "@/lib/supabase/anon";
import { getAuraCatalog } from "@/lib/catalog";
import { RARITY_LABEL, formatOdds } from "@/lib/rarity";

// Preview card shown when a /u/<username> link is pasted into Discord, X, etc.
export const alt = "Sol's Checklist profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 600;

const BG = "#0a0a13";
const CARD = "#15162a";
const BORDER = "#2a2b47";
const FG = "#ececf4";
const MUTED = "#a1a1b3";
const ACCENT = "#a855f7";

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username: raw } = await params;
  const username = decodeURIComponent(raw);
  const supabase = anonClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, is_private")
    .eq("username", username)
    .maybeSingle();

  let body: React.ReactNode;
  if (!profile || profile.is_private) {
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>{`@${profile?.username ?? username}`}</div>
        <div style={{ display: "flex", fontSize: 36, color: MUTED }}>
          {profile ? "This collection is private." : "Track your Sol's RNG collection."}
        </div>
      </div>
    );
  } else {
    const [catalog, { data: owned }, { count: achCount }] = await Promise.all([
      getAuraCatalog(),
      supabase.from("user_auras").select("aura_id").eq("user_id", profile.id),
      supabase.from("user_achievements").select("achievement_id", { count: "exact", head: true }).eq("user_id", profile.id),
    ]);
    const ownedIds = new Set((owned ?? []).map((r) => r.aura_id));
    const total = catalog.length;
    const have = catalog.filter((x) => ownedIds.has(x.id));
    const pct = total > 0 ? Math.round((have.length / total) * 100) : 0;
    const rarest = have
      .filter((x) => x.rarity_odds)
      .sort((x, y) => (y.rarity_odds ?? 0) - (x.rarity_odds ?? 0))[0];

    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 28, width: "100%" }}>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>{`@${profile.username}`}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <span style={{ fontSize: 96, fontWeight: 800 }}>{String(have.length)}</span>
          <span style={{ fontSize: 40, color: MUTED }}>{`/ ${total} auras · ${pct}%`}</span>
        </div>
        <div style={{ display: "flex", height: 18, width: "100%", background: BG, borderRadius: 9 }}>
          <div style={{ display: "flex", width: `${Math.max(pct, 1)}%`, background: ACCENT, borderRadius: 9 }} />
        </div>
        <div style={{ display: "flex", gap: 48, fontSize: 30, color: MUTED }}>
          {rarest && (
            <span style={{ display: "flex" }}>
              <span>Rarest:&nbsp;</span>
              <span style={{ color: FG }}>{rarest.name}</span>
              <span>{`\u00a0(${RARITY_LABEL[rarest.rarity]}, ${formatOdds(rarest.rarity_odds)})`}</span>
            </span>
          )}
          <span style={{ display: "flex" }}>
            <span style={{ color: FG }}>{String(achCount ?? 0)}</span>
            <span>{`\u00a0achievement${achCount === 1 ? "" : "s"}`}</span>
          </span>
        </div>
      </div>
    );
  }

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: BG, padding: 48, color: FG, fontFamily: "sans-serif" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: CARD,
            border: `2px solid ${BORDER}`,
            borderRadius: 32,
            padding: 56,
          }}
        >
          <div style={{ display: "flex", fontSize: 32, fontWeight: 600 }}>
            <span style={{ color: ACCENT }}>Sol&apos;s</span>
            <span>&nbsp;Checklist</span>
          </div>
          {body}
        </div>
      </div>
    ),
    size,
  );
}
