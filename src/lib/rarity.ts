import type { Rarity } from "./supabase/types";

export const RARITY_ORDER: Rarity[] = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
  "exalted",
  "celestial",
  "transcendent",
];

export const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Mythic",
  exalted: "Exalted",
  celestial: "Celestial",
  transcendent: "Transcendent",
};

export const RARITY_CLASS: Record<Rarity, string> = {
  common: "text-rarity-common border-rarity-common/40",
  uncommon: "text-rarity-uncommon border-rarity-uncommon/40",
  rare: "text-rarity-rare border-rarity-rare/40",
  epic: "text-rarity-epic border-rarity-epic/40",
  legendary: "text-rarity-legendary border-rarity-legendary/40",
  mythic: "text-rarity-mythic border-rarity-mythic/40",
  exalted: "text-rarity-exalted border-rarity-exalted/40",
  celestial: "text-rarity-celestial border-rarity-celestial/40",
  transcendent: "text-rarity-transcendent border-rarity-transcendent/40",
};

export function formatOdds(odds: number | null): string {
  if (!odds) return "";
  return `1 in ${odds.toLocaleString()}`;
}
