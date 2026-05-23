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
};

export const RARITY_ORDER: Rarity[] = [
  "basic",
  "epic",
  "unique",
  "legendary",
  "mythic",
  "exalted",
  "glorious",
  "transcendent",
  "dimensional",
  "challenged",
  "challenged_plus",
  "craftable",
];

export const RARITY_LABEL: Record<Rarity, string> = {
  basic: "Basic",
  epic: "Epic",
  unique: "Unique",
  legendary: "Legendary",
  mythic: "Mythic",
  exalted: "Exalted",
  glorious: "Glorious",
  transcendent: "Transcendent",
  dimensional: "Dimensional",
  challenged: "Challenged",
  challenged_plus: "Challenged+",
  craftable: "Crafting",
};

// Text colour + a matching border tint (at 40% opacity) for card accents.
// Keep these in sync with tailwind.config.ts rarity palette.
export const RARITY_CLASS: Record<Rarity, string> = {
  basic:           "text-rarity-basic border-rarity-basic/40",
  epic:            "text-rarity-epic border-rarity-epic/40",
  unique:          "text-rarity-unique border-rarity-unique/40",
  legendary:       "text-rarity-legendary border-rarity-legendary/40",
  mythic:          "text-rarity-mythic border-rarity-mythic/40",
  exalted:         "text-rarity-exalted border-rarity-exalted/40",
  glorious:        "text-rarity-glorious border-rarity-glorious/40",
  transcendent:    "text-rarity-transcendent border-rarity-transcendent/40",
  dimensional:     "text-rarity-dimensional border-rarity-dimensional/40",
  challenged:      "text-rarity-challenged border-rarity-challenged/40",
  challenged_plus: "text-rarity-challenged_plus border-rarity-challenged_plus/40",
  craftable:       "text-rarity-craftable border-rarity-craftable/40",
};

export function formatOdds(odds: number | null): string {
  if (!odds) return "";
  return `1 in ${odds.toLocaleString()}`;
}
