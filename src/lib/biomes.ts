// Biome metadata, hardcoded since the data is small, static, and doesn't
// belong in the user's progress DB. The `name` field matches the
// `auras.biome` value so the page can join in the database lookup.
//
// Source: https://sol-rng.fandom.com/wiki/Biomes (Eon 1-16 Update)

export type BiomeCategory = "time" | "normal" | "rare" | "dev";

export type Biome = {
  /** Matches auras.biome verbatim — used to join. */
  name: string;
  /** UI label, can differ for casing/formatting. */
  displayName: string;
  category: BiomeCategory;
  /** 1 in N spawn odds. null = special / dev-spawn only. */
  spawnOdds: number | null;
  multiplier: string;
  duration: string;
  /** Hex colour used to theme the card header / stripe. */
  color: string;
  notes?: string;
  /** Biome-exclusive item / material that drops here, if any. */
  material?: string;
};

export const BIOMES: Biome[] = [
  // ---------- Time ----------
  {
    name: "Daytime",
    displayName: "Daytime",
    category: "time",
    spawnOdds: null,
    multiplier: "10× Breakthrough",
    duration: "Cycles with Nighttime",
    color: "#f5ca49",
  },
  {
    name: "Nighttime",
    displayName: "Nighttime",
    category: "time",
    spawnOdds: null,
    multiplier: "10× Breakthrough",
    duration: "Cycles with Daytime",
    color: "#8a7ed6",
  },

  // ---------- Normal biomes ----------
  {
    name: "Windy",
    displayName: "Windy",
    category: "normal",
    spawnOdds: 500,
    multiplier: "3× Breakthrough",
    duration: "2 minutes",
    color: "#73fab2",
    material: "Wind Essence",
  },
  {
    name: "Snowy",
    displayName: "Snowy",
    category: "normal",
    spawnOdds: 600,
    multiplier: "3× Breakthrough",
    duration: "2 minutes",
    color: "#aaffff",
    material: "Icicle",
  },
  {
    name: "Rainy",
    displayName: "Rainy",
    category: "normal",
    spawnOdds: 750,
    multiplier: "4× Breakthrough",
    duration: "2 minutes",
    color: "#7aa4ff",
    material: "Rainy Bottle",
  },
  {
    name: "Sandstorm",
    displayName: "Sandstorm",
    category: "normal",
    spawnOdds: 3000,
    multiplier: "4× Breakthrough",
    duration: "650 seconds",
    color: "#e6c46a",
    material: "Hour Glass",
  },
  {
    name: "Hell",
    displayName: "Hell",
    category: "normal",
    spawnOdds: 6666,
    multiplier: "8× Breakthrough",
    duration: "666 seconds",
    color: "#ff5959",
    material: "Eternal Flame",
  },
  {
    name: "Starfall",
    displayName: "Starfall",
    category: "normal",
    spawnOdds: 7500,
    multiplier: "5× Breakthrough",
    duration: "650 seconds",
    color: "#60a5fa",
    material: "Piece of Star",
  },
  {
    name: "Heaven",
    displayName: "Heaven",
    category: "normal",
    spawnOdds: 7777,
    multiplier: "5× Breakthrough",
    duration: "240 seconds",
    color: "#fff19a",
    material: "Feather Vial",
  },
  {
    name: "Corruption",
    displayName: "Corruption",
    category: "normal",
    spawnOdds: 9000,
    multiplier: "5× Breakthrough",
    duration: "650 seconds",
    color: "#7e22ce",
    material: "Curruptaine",
  },
  {
    name: "Null",
    displayName: "Null",
    category: "normal",
    spawnOdds: 10100,
    multiplier: "1000× Breakthrough",
    duration: "99 seconds",
    color: "#6b6b6b",
    material: "NULL?",
  },

  // ---------- Rare biomes ----------
  {
    name: "Glitched",
    displayName: "Glitched",
    category: "rare",
    spawnOdds: 30000,
    multiplier: "No multiplier",
    duration: "164 seconds",
    color: "#4ade80",
    notes: "1 in 30,000 per biome change — not per second.",
  },
  {
    name: "Cyberspace",
    displayName: "Cyberspace",
    category: "rare",
    spawnOdds: 5000,
    multiplier: "2× Breakthrough",
    duration: "12 minutes",
    color: "#4faaff",
    notes: "Only from Strange Controller or Biome Randomizer.",
  },
  {
    name: "Dreamspace",
    displayName: "Dreamspace",
    category: "rare",
    spawnOdds: 3500000,
    multiplier: "No multiplier",
    duration: "192 seconds",
    color: "#ff8fcd",
    notes: "Auras from this biome cannot be obtained anywhere else.",
  },
  {
    name: "Singularity",
    displayName: "Singularity",
    category: "rare",
    spawnOdds: null,
    multiplier: "TBA",
    duration: "Ends when any player rolls Astraios",
    color: "#f97316",
    notes:
      "Spawned via the Singularity Catalyst or naturally. The biome ends immediately when a player rolls Astraios.",
  },
  {
    name: "The Limbo",
    displayName: "The Limbo",
    category: "rare",
    spawnOdds: null,
    multiplier: "Special",
    duration: "Until exit",
    color: "#ffffff",
    notes: "A separate dimension reached via the Portable Crack item.",
  },

  // ---------- Potion-triggered events ----------
  {
    name: "Oblivion Potion",
    displayName: "Oblivion Potion",
    category: "rare",
    spawnOdds: null,
    multiplier: "Special",
    duration: "Potion-triggered",
    color: "#6b21a8",
    notes: "Triggered by the Oblivion Potion item.",
  },
  {
    name: "Dune Potion",
    displayName: "Dune Potion",
    category: "rare",
    spawnOdds: null,
    multiplier: "Special",
    duration: "Potion-triggered",
    color: "#d97706",
    notes: "Triggered by the Dune Potion item.",
  },
  {
    name: "Red Moon Potion",
    displayName: "Red Moon Potion",
    category: "rare",
    spawnOdds: null,
    multiplier: "Special",
    duration: "Potion-triggered",
    color: "#ef4444",
    notes: "Triggered by the Red Moon Potion item.",
  },

  // ---------- Event-only biomes (auras have event_name set) ----------
  {
    name: "Pumpkin Moon",
    displayName: "Pumpkin Moon",
    category: "rare",
    spawnOdds: null,
    multiplier: "Special",
    duration: "Event-triggered",
    color: "#ea580c",
  },
  {
    name: "Graveyard",
    displayName: "Graveyard",
    category: "rare",
    spawnOdds: null,
    multiplier: "Special",
    duration: "Event-triggered",
    color: "#78716c",
  },
  {
    name: "Blood Rain",
    displayName: "Blood Rain",
    category: "rare",
    spawnOdds: null,
    multiplier: "Special",
    duration: "Event-triggered",
    color: "#991b1b",
  },
  {
    name: "Blazing Sun",
    displayName: "Blazing Sun",
    category: "rare",
    spawnOdds: null,
    multiplier: "Special",
    duration: "Event-triggered",
    color: "#f59e0b",
  },

  // ---------- Developer / Admin Abuse Biomes ----------
  {
    name: "The Citadel Of Orders",
    displayName: "The Citadel of Orders",
    category: "dev",
    spawnOdds: null,
    multiplier: "Dev-spawn only",
    duration: "Dev-controlled",
    color: "#fcd252",
    notes: "Admin-spawn only biome.",
  },
  {
    name: "The Null's Existence",
    displayName: "The Null's Existence",
    category: "dev",
    spawnOdds: null,
    multiplier: "Dev-spawn only",
    duration: "Dev-controlled",
    color: "#444444",
    notes: "Admin-spawn only biome.",
  },
  {
    name: "The Hyperspace Realm",
    displayName: "The Hyperspace Realm",
    category: "dev",
    spawnOdds: null,
    multiplier: "Dev-spawn only",
    duration: "Dev-controlled",
    color: "#39d3ff",
    notes: "Admin-spawn only biome.",
  },
];

export const BIOME_CATEGORIES: { key: BiomeCategory; label: string }[] = [
  { key: "time", label: "Time" },
  { key: "normal", label: "Biomes" },
  { key: "rare", label: "Rare Biomes" },
  { key: "dev", label: "Dev-only Biomes" },
];

export function biomeByName(name: string | null | undefined): Biome | undefined {
  if (!name) return undefined;
  return BIOMES.find((b) => b.name === name);
}

// Maps lowercase substrings that can appear in aura descriptions to the
// canonical biome name in BIOMES. Handles variant phrasings like
// "Potion of the Dune" vs "Dune Potion".
const POTION_DESC_MAP: [string, string][] = [
  ["red moon potion",    "Red Moon Potion"],
  ["oblivion potion",    "Oblivion Potion"],
  ["dune potion",        "Dune Potion"],
  ["potion of the dune", "Dune Potion"],
];

export function potionColorFromText(text: string | null | undefined): string | undefined {
  if (!text) return undefined;
  const lower = text.toLowerCase();
  for (const [needle, biomeName] of POTION_DESC_MAP) {
    if (lower.includes(needle)) return biomeByName(biomeName)?.color;
  }
  return undefined;
}
