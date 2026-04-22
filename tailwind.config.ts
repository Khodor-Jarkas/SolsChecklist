import type { Config } from "tailwindcss";

const RARITIES = [
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

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  safelist: [
    ...RARITIES.map((r) => `text-rarity-${r}`),
    ...RARITIES.map((r) => `bg-rarity-${r}`),
    ...RARITIES.map((r) => `border-rarity-${r}`),
    ...RARITIES.map((r) => `border-rarity-${r}/40`),
  ],
  theme: {
    extend: {
      colors: {
        rarity: {
          common: "#9ca3af",
          uncommon: "#10b981",
          rare: "#3b82f6",
          epic: "#a855f7",
          legendary: "#f59e0b",
          mythic: "#ef4444",
          exalted: "#ec4899",
          celestial: "#38bdf8",
          transcendent: "#f472b6",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
} satisfies Config;
