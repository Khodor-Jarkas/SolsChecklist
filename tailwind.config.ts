import type { Config } from "tailwindcss";

const RARITIES = [
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

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  safelist: [
    ...RARITIES.map((r) => `text-rarity-${r}`),
    ...RARITIES.map((r) => `bg-rarity-${r}`),
    ...RARITIES.map((r) => `border-rarity-${r}`),
    ...RARITIES.map((r) => `border-rarity-${r}/40`),
    ...RARITIES.map((r) => `border-rarity-${r}/50`),
    ...RARITIES.map((r) => `border-rarity-${r}/60`),
    ...RARITIES.map((r) => `border-rarity-${r}/80`),
    ...RARITIES.map((r) => `bg-rarity-${r}/15`),
    ...RARITIES.map((r) => `bg-rarity-${r}/60`),
  ],
  theme: {
    extend: {
      colors: {
        rarity: {
          basic:           "#e5e7eb", // light grey
          epic:            "#a855f7", // purple
          unique:          "#f97316", // orange
          legendary:       "#facc15", // yellow
          mythic:          "#ec4899", // pink
          exalted:         "#1e3a8a", // dark blue
          glorious:        "#991b1b", // dark red
          transcendent:    "#14b8a6", // teal
          dimensional:     "#818cf8", // indigo
          challenged:      "#9ca3af", // grey
          challenged_plus: "#4b5563", // dark grey
          craftable:       "#38bdf8", // sky blue
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
