import { createClient, getUser } from "@/lib/supabase/server";
import { BIOMES, BIOME_CATEGORIES, type Biome } from "@/lib/biomes";
import { RARITY_LABEL } from "@/lib/rarity";
import type { Database } from "@/lib/supabase/types"; // Database used for ownedRows type inference
import { BiomeAuraList, type BiomeAura } from "@/components/BiomeAuraList";

type Aura = Database["public"]["Tables"]["auras"]["Row"];

export const metadata = {
  title: "Biomes — Sol's Checklist",
  description:
    "Every biome in Sol's RNG with spawn rate, breakthrough multiplier, duration, and the auras you can roll inside.",
};

export default async function BiomesPage() {
  const supabase = await createClient();
  const user = await getUser();

  // Pull only what we need to render the lists.
  const [{ data: auras }, { data: ownedRows }] = await Promise.all([
    supabase
      .from("auras")
      .select("id, name, rarity, rarity_odds, native_biome_odds, biome, event_name, event_year, description, obtainment, secondary_obtainment, image_url"),
    user
      ? supabase.from("user_auras").select("aura_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] as { aura_id: number }[] }),
  ]);

  const ownedIds = new Set((ownedRows ?? []).map((r) => r.aura_id));

  const aurasByBiome = new Map<string, BiomeAura[]>();
  for (const a of auras ?? []) {
    if (!a.biome) continue;
    const list = aurasByBiome.get(a.biome) ?? [];
    list.push(a as BiomeAura);
    aurasByBiome.set(a.biome, list);
  }
  for (const list of aurasByBiome.values()) {
    list.sort((a, b) => (a.rarity_odds ?? 0) - (b.rarity_odds ?? 0));
  }

  const totalAuras = (auras ?? []).filter((a) => a.biome).length;
  const ownedBiomeAuras = (auras ?? []).filter(
    (a) => a.biome && ownedIds.has(a.id),
  ).length;

  return (
    <section className="space-y-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Biomes</h1>
          <p className="text-sm text-[var(--foreground)]/70 mt-1">
            {user
              ? `${ownedBiomeAuras} / ${totalAuras} biome auras collected.`
              : `Every biome in the game and the auras you can roll inside.`}
          </p>
        </div>
      </header>

      {BIOME_CATEGORIES.map(({ key, label }) => {
        const biomes = BIOMES.filter((b) => b.category === key);
        if (biomes.length === 0) return null;
        return (
          <section key={key} className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground-muted)]">
              {label}
            </h2>
            <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
              {biomes.map((b) => (
                <BiomeCard
                  key={b.name}
                  biome={b}
                  auras={aurasByBiome.get(b.name) ?? []}
                  ownedIds={[...(ownedIds ?? new Set())]}
                />
              ))}
            </div>
          </section>
        );
      })}
    </section>
  );
}

function BiomeCard({
  biome,
  auras,
  ownedIds,
}: {
  biome: Biome;
  auras: BiomeAura[];
  ownedIds: number[];
}) {
  const ownedSet = new Set(ownedIds);
  const rolledHere = auras.length;
  const ownedHere = auras.filter((a) => ownedSet.has(a.id)).length;
  const isNew = biome.name === "Singularity";

  return (
    <article
      className="card overflow-hidden"
      style={{
        borderColor: `${biome.color}55`,
      }}
    >
      {/* Themed header */}
      <header
        className="relative px-5 py-4"
        style={{
          background: `linear-gradient(135deg, ${biome.color}22, transparent 70%), radial-gradient(ellipse at top right, ${biome.color}1f, transparent 60%)`,
        }}
      >
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ background: biome.color, boxShadow: `0 0 12px ${biome.color}99` }}
            />
            <h3
              className="text-lg font-semibold tracking-tight"
              style={{ color: biome.color }}
            >
              {biome.displayName}
            </h3>
            {isNew && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm bg-violet-500 text-white">
                New
              </span>
            )}
          </div>
          {biome.spawnOdds && (
            <span className="text-xs font-mono text-[var(--foreground-muted)]">
              1 in {biome.spawnOdds.toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[var(--foreground-muted)]">
          <span>
            <span className="text-[var(--foreground-faint)]">BT:</span>{" "}
            {biome.multiplier}
          </span>
          <span>
            <span className="text-[var(--foreground-faint)]">Lasts:</span>{" "}
            {biome.duration}
          </span>
          {biome.material && (
            <span>
              <span className="text-[var(--foreground-faint)]">Drops:</span>{" "}
              {biome.material}
            </span>
          )}
          {auras.length > 0 && (
            <span className="ml-auto font-mono">
              {ownedHere} / {rolledHere} auras
            </span>
          )}
        </div>
        {biome.notes && (
          <p className="mt-2 text-xs text-[var(--foreground)]/70 leading-relaxed italic">
            {biome.notes}
          </p>
        )}
      </header>

      {/* Aura list */}
      {rolledHere === 0 ? (
        <div className="px-5 py-4 text-xs text-[var(--foreground-faint)]">
          No auras catalogued for this biome yet.
        </div>
      ) : (
        <BiomeAuraList auras={auras} ownedIds={ownedIds} />
      )}
    </article>
  );
}
