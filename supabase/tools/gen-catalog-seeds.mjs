// Generates seed_achievements.sql and seed_items.sql (plus image seeds) from
// scraped wiki data in tmp-classify/*.json.
//
// The tmp-classify/ directory is gitignored and populated by a one-off
// scrape of the Sol's RNG wiki (Achievements, Items, and Runes pages via
// action=parse&prop=wikitext). If you want to refresh the catalog, re-run
// the scrape + parser to regenerate the JSONs, then this script.
//
// Output SQL is idempotent:
//   - achievements/items rows use INSERT ... ON CONFLICT (name) DO UPDATE
//     so re-running refreshes description/category/kind/image_url in place.
//
// Run with:
//   node supabase/tools/gen-catalog-seeds.mjs

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const achievementsJson = JSON.parse(
  fs.readFileSync("tmp-classify/achievements.json", "utf8"),
);
const itemsJson = JSON.parse(fs.readFileSync("tmp-classify/items.json", "utf8"));
const runesJson = JSON.parse(fs.readFileSync("tmp-classify/runes.json", "utf8"));

function urlFor(filename) {
  // MediaWiki normalises filenames to underscores before hashing/serving.
  const normalised = filename.replace(/ /g, "_");
  const h = crypto.createHash("md5").update(normalised).digest("hex");
  return `https://static.wikia.nocookie.net/sol-rng/images/${h[0]}/${h.slice(
    0,
    2,
  )}/${encodeURIComponent(normalised).replace(/'/g, "%27")}`;
}

function esc(s) {
  return (s ?? "").replace(/'/g, "''");
}

function cleanTitle(raw) {
  // `{{Aura|Glitch|-Flaws in the World-}}` -> "Flaws in the World"
  // `{{Aura|Sol|Spotted the [[Sol]]}}`     -> "Spotted the Sol"
  let t = raw;
  const auraTpl = t.match(/\{\{Aura\|[^|}]+\|([^}]+)\}\}/);
  if (auraTpl) t = auraTpl[1];
  return t
    .replace(/\[\[(?:[^|\]]+\|)?([^\]]+)\]\]/g, "$1")
    .replace(/^-+|-+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// -------------------- Achievements --------------------

const achievements = [];
for (const [category, rows] of Object.entries(achievementsJson)) {
  for (const r of rows) {
    const name = cleanTitle(r.title);
    if (!name) continue;
    const desc = [r.desc, r.req && `Requirement: ${r.req}`, r.reward && `Reward: ${r.reward}`]
      .filter(Boolean)
      .join(" • ");
    achievements.push({
      name,
      description: desc,
      category,
      image: r.image && r.image !== "Placeholder.png" ? r.image : null,
    });
  }
}

// -------------------- Items --------------------

const items = [];

const kindMap = {
  Potions: "potion",
  Equippables: "gear",
  Other: "misc",
  "Biome-Exclusive": "material",
  Runes: "rune",
};

for (const [tab, rows] of Object.entries(itemsJson)) {
  if (tab === "Unobtainable") continue;
  const kind = kindMap[tab] || "misc";
  if (tab === "Biome-Exclusive" || tab === "Runes") continue; // handled from separate sources
  for (const r of rows) {
    if (!r.name) continue;
    // Dedupe — "Random Potion Sack" appears twice with one empty row.
    if (items.find((x) => x.name === r.name) && !r.effect) continue;
    const desc = [r.effect, r.obtainment && `Obtained from: ${r.obtainment}`]
      .filter(Boolean)
      .join(" • ")
      .slice(0, 1000);
    items.push({ name: r.name, kind, description: desc, image: r.image });
  }
}

// Runes from Runes_full parse
for (const [runeName, data] of Object.entries(runesJson)) {
  items.push({
    name: runeName,
    kind: "rune",
    description: data.description
      ?.replace(/^=\s*/, "")
      ?.replace(/=== Appearance.*/is, "")
      ?.trim()
      ?.slice(0, 800),
    image: data.image,
  });
}
// Add Rune of Everything (present in Runes page but parser split missed it).
items.push({
  name: "Rune of Everything",
  kind: "rune",
  description:
    "A powerful stone containing the magic of all runes put together. Gives you 5 minutes of all rune effects at once.",
  image: null,
});

// Biome-Exclusive materials — parsed image data from per-item pages.
const biomeMaterials = [
  ["Wind Essence", "WindEssenceRender.png", "Spawns in one of the spawn locations at the start of Windy weather. Used for crafting."],
  ["Icicle", "Iciclerender.png", "Spawns in one of the spawn locations at the start of Snowy weather. Used for crafting."],
  ["Rainy Bottle", "RainyBottleRender.png", "Spawns in one of the spawn locations at the start of Rainy weather. Used for crafting."],
  ["Hour Glass", "HourglassInventory.png", "Spawns in one of the spawn locations at the start of the Sandstorm biome. Used for crafting."],
  ["Eternal Flame", "Endless_fire.png", "Spawns in one of the spawn locations at the start of the Hell biome. Used for crafting."],
  ["Piece of Star", "PieceofStarRender.png", "Spawns in one of the spawn locations at the start of the Starfall biome. Used for crafting."],
  ["Feather Vial", "FeatherVialRender.png", "Spawns in one of the spawn locations at the start of the Heaven biome. Used for crafting."],
  ["Curruptaine", "CurruptaineRender.png", "Spawns in one of the spawn locations at the start of the Corruption biome. Used for crafting."],
  ["NULL?", "NULL??.png", "Spawns in one of the spawn locations at the start of the Null biome. Used for crafting."],
];
for (const [name, image, description] of biomeMaterials) {
  items.push({ name, kind: "material", description, image });
}

// -------------------- Emit SQL --------------------

function emit(rows, table, columns, path) {
  const lines = [];
  lines.push(
    `-- Sol's Checklist — ${table} seed. Generated by gen-catalog-seeds.mjs.`,
  );
  lines.push(`-- Idempotent: re-run to refresh descriptions / images.`);
  lines.push("");

  const cols = columns.join(", ");
  const updates = columns.filter((c) => c !== "name").map((c) => `${c} = excluded.${c}`);
  for (const r of rows) {
    const vals = columns
      .map((c) => {
        const v = r[c];
        if (v == null) return "null";
        if (typeof v === "number") return String(v);
        return `'${esc(String(v))}'`;
      })
      .join(", ");
    lines.push(
      `insert into public.${table} (${cols}) values (${vals}) on conflict (name) do update set ${updates.join(", ")};`,
    );
  }
  fs.writeFileSync(path, lines.join("\n") + "\n");
  console.log(`${path}: ${rows.length} rows`);
}

const achievementRows = achievements.map((a) => ({
  name: a.name,
  description: a.description,
  category: a.category,
}));
const achievementImageRows = achievements
  .filter((a) => a.image)
  .map((a) => ({ name: a.name, image_url: urlFor(a.image) }));

const itemRows = items.map((i) => ({
  name: i.name,
  kind: i.kind,
  description: i.description,
}));
const itemImageRows = items
  .filter((i) => i.image)
  .map((i) => ({ name: i.name, image_url: urlFor(i.image) }));

emit(
  achievementRows,
  "achievements",
  ["name", "description", "category"],
  "supabase/seed_achievements.sql",
);

// Image seeds use UPDATE since conflict-target on image-only is pointless.
function emitImages(rows, table, path) {
  const lines = [];
  lines.push(`-- Sol's Checklist — ${table} images. Generated by gen-catalog-seeds.mjs.`);
  lines.push(`-- Run AFTER seed_${table}.sql. Idempotent.`);
  lines.push("");
  for (const r of rows) {
    lines.push(
      `update public.${table} set image_url = '${esc(r.image_url)}' where name = '${esc(r.name)}';`,
    );
  }
  fs.writeFileSync(path, lines.join("\n") + "\n");
  console.log(`${path}: ${rows.length} rows`);
}

emitImages(achievementImageRows, "achievements", "supabase/seed_achievements_images.sql");
emit(itemRows, "items", ["name", "kind", "description"], "supabase/seed_items.sql");
emitImages(itemImageRows, "items", "supabase/seed_items_images.sql");
