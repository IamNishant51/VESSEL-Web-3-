/**
 * Deterministic Color Palette Generator
 * Creates harmonious 5-color palettes from agent seed
 * Inspired by color theory: complementary, triadic, analogous schemes
 */

import { SeededRandom } from "./noise";

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  highlight: string;
  hex: string[];
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function hexToHSL(hex: string): HSL {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
}

/**
 * Color harmony schemes
 */
const harmonySchemes = [
  "complementary",
  "triadic",
  "analogous",
  "split-complementary",
  "tetradic",
] as const;

type HarmonyScheme = typeof harmonySchemes[number];

function generateHarmonyColors(
  baseHue: number,
  scheme: HarmonyScheme,
  rng: SeededRandom
): HSL[] {
  const saturation = rng.nextFloat(55, 85);
  const lightness = rng.nextFloat(35, 60);

  const base: HSL = { h: baseHue, s: saturation, l: lightness };

  switch (scheme) {
    case "complementary":
      return [
        base,
        { h: (baseHue + 180) % 360, s: saturation * 0.8, l: lightness * 0.9 },
        { h: (baseHue + 30) % 360, s: saturation * 0.6, l: lightness * 1.2 },
        { h: (baseHue + 210) % 360, s: saturation * 0.5, l: lightness * 0.7 },
        { h: (baseHue + 15) % 360, s: saturation * 0.4, l: lightness * 1.4 },
      ];
    case "triadic":
      return [
        base,
        { h: (baseHue + 120) % 360, s: saturation * 0.85, l: lightness },
        { h: (baseHue + 240) % 360, s: saturation * 0.75, l: lightness * 0.9 },
        { h: (baseHue + 60) % 360, s: saturation * 0.5, l: lightness * 1.3 },
        { h: (baseHue + 180) % 360, s: saturation * 0.6, l: lightness * 0.8 },
      ];
    case "analogous":
      return [
        base,
        { h: (baseHue + 30) % 360, s: saturation * 0.9, l: lightness * 0.95 },
        { h: (baseHue + 60) % 360, s: saturation * 0.8, l: lightness * 1.05 },
        { h: (baseHue - 30 + 360) % 360, s: saturation * 0.7, l: lightness * 0.85 },
        { h: (baseHue + 15) % 360, s: saturation * 0.5, l: lightness * 1.3 },
      ];
    case "split-complementary":
      return [
        base,
        { h: (baseHue + 150) % 360, s: saturation * 0.85, l: lightness },
        { h: (baseHue + 210) % 360, s: saturation * 0.8, l: lightness * 0.95 },
        { h: (baseHue + 30) % 360, s: saturation * 0.5, l: lightness * 1.2 },
        { h: (baseHue + 180) % 360, s: saturation * 0.6, l: lightness * 0.75 },
      ];
    case "tetradic":
      return [
        base,
        { h: (baseHue + 90) % 360, s: saturation * 0.8, l: lightness },
        { h: (baseHue + 180) % 360, s: saturation * 0.75, l: lightness * 0.9 },
        { h: (baseHue + 270) % 360, s: saturation * 0.7, l: lightness * 0.85 },
        { h: (baseHue + 45) % 360, s: saturation * 0.5, l: lightness * 1.3 },
      ];
  }
}

/**
 * Mood-based hue ranges
 * Maps agent personality to color temperature
 */
function getMoodHue(personality: string, riskLevel: string): number {
  const lower = personality.toLowerCase();
  let baseHue = 0;

  // Personality-driven hue
  if (lower.includes("aggress") || lower.includes("warrior") || lower.includes("bold")) {
    baseHue = 0; // Red
  } else if (lower.includes("calm") || lower.includes("peace") || lower.includes("zen")) {
    baseHue = 180; // Cyan
  } else if (lower.includes("wisdom") || lower.includes("sage") || lower.includes("analyt")) {
    baseHue = 220; // Blue
  } else if (lower.includes("creativ") || lower.includes("art") || lower.includes("myst")) {
    baseHue = 280; // Purple
  } else if (lower.includes("nature") || lower.includes("green") || lower.includes("grow")) {
    baseHue = 120; // Green
  } else if (lower.includes("sun") || lower.includes("gold") || lower.includes("bright")) {
    baseHue = 45; // Gold
  } else if (lower.includes("shadow") || lower.includes("dark") || lower.includes("stealth")) {
    baseHue = 260; // Deep purple
  } else if (lower.includes("ocean") || lower.includes("water") || lower.includes("flow")) {
    baseHue = 200; // Ocean blue
  } else if (lower.includes("fire") || lower.includes("flame") || lower.includes("burn")) {
    baseHue = 25; // Orange-red
  } else if (lower.includes("ice") || lower.includes("frost") || lower.includes("cold")) {
    baseHue = 195; // Ice blue
  } else if (lower.includes("trader") || lower.includes("profit") || lower.includes("yield")) {
    baseHue = 145; // Solana green
  } else if (lower.includes("social") || lower.includes("connect") || lower.includes("pulse")) {
    baseHue = 330; // Pink-magenta
  } else {
    baseHue = 210; // Default blue
  }

  // Risk level adjustment
  if (riskLevel === "Aggressive") {
    baseHue = (baseHue + 15) % 360;
  } else if (riskLevel === "Conservative") {
    baseHue = (baseHue - 15 + 360) % 360;
  }

  return baseHue;
}

/**
 * Generate a complete 5-color palette for an agent
 */
export function generatePalette(params: {
  seed: number;
  personality: string;
  riskLevel: string;
  toolCount: number;
}): ColorPalette {
  const rng = new SeededRandom(params.seed);
  const baseHue = getMoodHue(params.personality, params.riskLevel);
  const scheme = rng.pick([...harmonySchemes]);

  const colors = generateHarmonyColors(baseHue, scheme, rng);

  // Darken background for NFT art aesthetic
  const bgHue = colors[0].h;
  const background = hslToHex(bgHue, 20, 8);

  // Primary: most vibrant color
  const primary = hslToHex(colors[0].h, colors[0].s, colors[0].l);

  // Secondary: complementary color
  const secondary = hslToHex(colors[1].h, colors[1].s, colors[1].l);

  // Accent: bright highlight
  const accent = hslToHex(colors[2].h, Math.min(colors[2].s + 10, 95), Math.min(colors[2].l + 15, 75));

  // Highlight: lightest for glows
  const highlight = hslToHex(colors[4].h, colors[4].s * 0.6, Math.min(colors[4].l + 25, 85));

  return {
    primary,
    secondary,
    accent,
    background,
    highlight,
    hex: [primary, secondary, accent, background, highlight],
  };
}

/**
 * Generate a gradient CSS string from palette
 */
export function generateGradientCSS(palette: ColorPalette, angle: number = 135): string {
  return `linear-gradient(${angle}deg, ${palette.background} 0%, ${palette.primary}40 50%, ${palette.secondary}20 100%)`;
}

/**
 * Get CSS gradient class approximation for Tailwind
 */
export function getTailwindGradient(_palette: ColorPalette): string {
  return `bg-gradient-to-br`;
}
