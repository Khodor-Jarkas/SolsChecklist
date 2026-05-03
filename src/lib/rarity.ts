import type { Obtainment, Rarity } from "./supabase/types";

export const OBTAINMENT_ORDER: Obtainment[] = [
  "roll",
  "craft",
  "shop",
  "battle_pass",
  "quest",
  "wheel",
];

export const OBTAINMENT_LABEL: Record<Obtainment, string> = {
  roll: "Roll",
  craft: "Craftable",
  shop: "Shop",
  battle_pass: "Battle Pass",
  quest: "Quest",
  wheel: "Wheel",
  ugc: "UGC",
  login: "Login",
};

export const RARITY_ORDER: Rarity[] = [
  "common",
  "epic",
  "unique",
  "legendary",
  "mythic",
  "exalted",
  "glorious",
  "transcendent",
  "challenged",
  "challenged_plus",
  "craftable",
];

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  epic: "Epic",
  unique: "Unique",
  legendary: "Legendary",
  mythic: "Mythic",
  exalted: "Exalted",
  glorious: "Glorious",
  transcendent: "Transcendent",
  challenged: "Challenged",
  challenged_plus: "Challenged+",
  craftable: "Crafting",
};

// Text colour + a matching border tint (at 40% opacity) for card accents.
// Keep these in sync with tailwind.config.ts rarity palette.
export const RARITY_CLASS: Record<Rarity, string> = {
  common:          "text-rarity-common border-rarity-common/40",
  epic:            "text-rarity-epic border-rarity-epic/40",
  unique:          "text-rarity-unique border-rarity-unique/40",
  legendary:       "text-rarity-legendary border-rarity-legendary/40",
  mythic:          "text-rarity-mythic border-rarity-mythic/40",
  exalted:         "text-rarity-exalted border-rarity-exalted/40",
  glorious:        "text-rarity-glorious border-rarity-glorious/40",
  transcendent:    "text-rarity-transcendent border-rarity-transcendent/40",
  challenged:      "text-rarity-challenged border-rarity-challenged/40",
  challenged_plus: "text-rarity-challenged_plus border-rarity-challenged_plus/40",
  craftable:       "text-rarity-craftable border-rarity-craftable/40",
};

// Derive an odds-based rarity tier. Returns null for auras without odds
// (challenged, challenged_plus, craftable) — those must be set explicitly.
export function rarityFromOdds(odds: number | null): Rarity | null {
  if (odds == null || odds <= 0) return null;
  if (odds < 1_000) return "common";
  if (odds < 10_000) return "epic";
  if (odds < 100_000) return "unique";
  if (odds < 1_000_000) return "legendary";
  if (odds <= 10_000_000) return "mythic";
  if (odds < 99_900_000) return "exalted";
  if (odds < 1_000_000_000) return "glorious";
  return "transcendent";
}

export function formatOdds(odds: number | null): string {
  if (!odds) return "";
  return `1 in ${odds.toLocaleString()}`;
}
