import type { Palette } from "../types";

const PALETTES: Palette[] = [
  {
    name: "cyan-noir",
    background: ["#050814", "#0b1224", "#10192d"],
    glow: ["#00f5ff", "#4f7cff", "#ff4fd8"],
    accent: ["#12f7ff", "#7c4dff", "#ff7bf7"],
    ink: "#0a0f1f",
    highlight: "#ecfeff",
    shimmer: "#7dd3fc",
  },
  {
    name: "violet-flux",
    background: ["#060511", "#131026", "#1a1533"],
    glow: ["#c026d3", "#7c3aed", "#22d3ee"],
    accent: ["#d946ef", "#8b5cf6", "#67e8f9"],
    ink: "#100b20",
    highlight: "#fae8ff",
    shimmer: "#f0abfc",
  },
  {
    name: "aurora-steel",
    background: ["#05070b", "#101826", "#172132"],
    glow: ["#10b981", "#38bdf8", "#a855f7"],
    accent: ["#34d399", "#60a5fa", "#c084fc"],
    ink: "#0d1117",
    highlight: "#ecfdf5",
    shimmer: "#bae6fd",
  },
  {
    name: "solar-ink",
    background: ["#070608", "#17111b", "#26142b"],
    glow: ["#f97316", "#f43f5e", "#22d3ee"],
    accent: ["#fb7185", "#fdba74", "#67e8f9"],
    ink: "#120b12",
    highlight: "#fff7ed",
    shimmer: "#fca5a5",
  },
  {
    name: "emerald-night",
    background: ["#050b09", "#0f1f18", "#152c22"],
    glow: ["#34d399", "#14b8a6", "#60a5fa"],
    accent: ["#6ee7b7", "#5eead4", "#93c5fd"],
    ink: "#08120d",
    highlight: "#f0fdf4",
    shimmer: "#99f6e4",
  },
  {
    name: "royal-pulse",
    background: ["#04050d", "#111225", "#1c1f39"],
    glow: ["#6366f1", "#ec4899", "#22d3ee"],
    accent: ["#818cf8", "#f472b6", "#67e8f9"],
    ink: "#090b16",
    highlight: "#eef2ff",
    shimmer: "#c4b5fd",
  },
];

export function getPalette(seed: number): Palette {
  return PALETTES[seed % PALETTES.length] ?? PALETTES[0];
}

export function mixColor(hex: string, opacity: number): string {
  return hex.replace("#", "#") + Math.round(opacity * 255).toString(16).padStart(2, "0");
}

export function colorStops(colors: string[]): string {
  return colors.join(", ");
}
