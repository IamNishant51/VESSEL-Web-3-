/**
 * Main Generative Art Engine
 * Orchestrates all layers to create unique agent artwork
 */

import { SeededRandom } from "./noise";
import { generatePalette, type ColorPalette } from "./palette";
import { drawBackground, getBackgroundStyle, type BackgroundStyle } from "./backgrounds";
import { drawCore, getCoreStyle, type CoreStyle } from "./cores";
import { applyEffects } from "./effects";
import { generateTraits, type AgentTraits } from "./traits";

export interface GenerateArtParams {
  seed: number;
  name: string;
  personality: string;
  riskLevel: string;
  toolCount: number;
  size?: number;
}

export interface ArtResult {
  imageDataUrl: string;
  palette: ColorPalette;
  traits: AgentTraits;
  backgroundStyle: BackgroundStyle;
  coreStyle: CoreStyle;
  metadata: ArtMetadata;
}

export interface ArtMetadata {
  width: number;
  height: number;
  seed: number;
  generatedAt: string;
  version: string;
}

/**
 * Generate complete agent artwork as PNG data URL
 */
export function generateAgentArt(params: GenerateArtParams): ArtResult {
  const { seed, personality, riskLevel, toolCount, size = 2048 } = params;

  if (typeof document === "undefined") {
    // Server-side: return placeholder
    const traits = generateTraits({ seed, personality, riskLevel, toolCount });
    const palette = generatePalette({
      seed: seed + 1000,
      personality,
      riskLevel,
      toolCount,
    });
    const backgroundStyle = getBackgroundStyle(seed + 2000);
    const coreStyle = getCoreStyle(seed + 3000);

    return {
      imageDataUrl: "",
      palette,
      traits,
      backgroundStyle,
      coreStyle,
      metadata: {
        width: size,
        height: size,
        seed,
        generatedAt: new Date().toISOString(),
        version: "1.0.0",
      },
    };
  }

  // Generate traits
  const traits = generateTraits({ seed, personality, riskLevel, toolCount });

  // Generate palette
  const palette = generatePalette({
    seed: seed + 1000,
    personality,
    riskLevel,
    toolCount,
  });

  // Determine styles
  const backgroundStyle = getBackgroundStyle(seed + 2000);
  const coreStyle = getCoreStyle(seed + 3000);

  // Create canvas
  const canvas = document.createElement("canvas");

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Layer 1: Background
  drawBackground(ctx, {
    style: backgroundStyle,
    palette,
    size,
    seed: seed + 4000,
    complexity: traits.complexity,
  });

  // Layer 2: Core
  drawCore(ctx, {
    style: coreStyle,
    palette,
    size,
    seed: seed + 5000,
    complexity: traits.complexity,
    energy: traits.rarityScore,
  });

  // Layer 3: Effects
  applyEffects(ctx, {
    palette,
    size,
    seed: seed + 6000,
    complexity: traits.complexity,
    rarity: traits.rarityScore,
  });

  // Generate data URL
  const imageDataUrl = canvas.toDataURL("image/png", 0.95);

  return {
    imageDataUrl,
    palette,
    traits,
    backgroundStyle,
    coreStyle,
    metadata: {
      width: size,
      height: size,
      seed,
      generatedAt: new Date().toISOString(),
      version: "1.0.0",
    },
  };
}

/**
 * Generate a smaller preview image (for cards, lists)
 */
export function generateAgentPreview(params: GenerateArtParams): string {
  return generateAgentArt({ ...params, size: 512 }).imageDataUrl;
}

/**
 * Generate SVG version for fast loading
 */
export function generateAgentSVG(params: GenerateArtParams): string {
  const { seed, personality, riskLevel, toolCount } = params;
  const palette = generatePalette({
    seed: seed + 1000,
    personality,
    riskLevel,
    toolCount,
  });
  const traits = generateTraits({ seed, personality, riskLevel, toolCount });

  const size = 512;
  const rng = new SeededRandom(seed);

  const backgroundStyle = getBackgroundStyle(seed + 2000);
  const coreStyle = getCoreStyle(seed + 3000);

  const defs: string[] = [];
  const elements: string[] = [];

  const bgGradId = `bg-${seed}`;
  const coreGradId = `core-${seed}`;
  const filterId = `glow-${seed}`;

  defs.push(`
    <radialGradient id="${bgGradId}" cx="${rng.nextFloat(20, 80)}%" cy="${rng.nextFloat(20, 80)}%" r="${rng.nextFloat(50, 90)}%">
      <stop offset="0%" stop-color="${palette.primary}" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="${palette.secondary}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="${palette.background}"/>
    </radialGradient>
  `);

  defs.push(`
    <radialGradient id="${coreGradId}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${palette.highlight}" stop-opacity="0.7"/>
      <stop offset="60%" stop-color="${palette.primary}" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="${palette.primary}" stop-opacity="0"/>
    </radialGradient>
  `);

  defs.push(`
    <filter id="${filterId}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${rng.nextFloat(2, 8)}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `);

  elements.push(`<rect width="${size}" height="${size}" fill="url(#${bgGradId})"/>`);

  const shapeType = rng.nextInt(0, 5);
  const cx = rng.nextFloat(size * 0.3, size * 0.7);
  const cy = rng.nextFloat(size * 0.3, size * 0.7);

  if (shapeType === 0) {
    elements.push(...generateGeometricCore(rng, size, cx, cy, palette, traits, coreGradId, filterId));
  } else if (shapeType === 1) {
    elements.push(...generateOrbitalCore(rng, size, cx, cy, palette, traits, filterId));
  } else if (shapeType === 2) {
    elements.push(...generateCrystalCore(rng, size, cx, cy, palette, traits, filterId));
  } else if (shapeType === 3) {
    elements.push(...generateWaveCore(rng, size, palette, traits, filterId));
  } else if (shapeType === 4) {
    elements.push(...generateConstellationCore(rng, size, palette, traits, filterId));
  } else {
    elements.push(...generateFractalCore(rng, size, cx, cy, palette, traits, filterId));
  }

  elements.push(...generateParticles(rng, size, palette, traits));
  elements.push(...generateGridPattern(rng, size, palette, traits));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>${defs.join("")}</defs>
    ${elements.join("")}
  </svg>`;
}

function generateGeometricCore(
  rng: SeededRandom,
  size: number,
  cx: number,
  cy: number,
  palette: ColorPalette,
  traits: AgentTraits,
  gradId: string,
  filterId: string
): string[] {
  const elements: string[] = [];
  const complexity = Math.floor(3 + traits.complexity * 8);
  const maxRadius = size * rng.nextFloat(0.15, 0.3);

  elements.push(`<circle cx="${cx}" cy="${cy}" r="${maxRadius * 1.5}" fill="url(#${gradId})" filter="url(#${filterId})"/>`);

  const sides = rng.nextInt(3, 8);
  for (let layer = 0; layer < complexity; layer++) {
    const radius = maxRadius * (1 - layer / complexity);
    const rotation = rng.nextFloat(0, 360);
    const color = rng.pick([palette.primary, palette.secondary, palette.accent, palette.highlight]);
    const opacity = rng.nextFloat(0.15, 0.6);
    const strokeWidth = rng.nextFloat(0.5, 2.5);

    const points: string[] = [];
    for (let i = 0; i < sides; i++) {
      const angle = ((360 / sides) * i + rotation) * (Math.PI / 180);
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      points.push(`${x},${y}`);
    }

    if (rng.next() > 0.4) {
      elements.push(`<polygon points="${points.join(" ")}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" opacity="${opacity}"/>`);
    } else {
      elements.push(`<polygon points="${points.join(" ")}" fill="${color}" opacity="${opacity * 0.3}"/>`);
    }
  }

  elements.push(`<circle cx="${cx}" cy="${cy}" r="${rng.nextFloat(4, 12)}" fill="${palette.highlight}" opacity="0.9" filter="url(#${filterId})"/>`);

  return elements;
}

function generateOrbitalCore(
  rng: SeededRandom,
  size: number,
  cx: number,
  cy: number,
  palette: ColorPalette,
  traits: AgentTraits,
  filterId: string
): string[] {
  const elements: string[] = [];
  const orbitCount = Math.floor(3 + traits.rarityScore * 8);

  elements.push(`<circle cx="${cx}" cy="${cy}" r="${size * 0.06}" fill="${palette.highlight}" filter="url(#${filterId})"/>`);

  for (let i = 0; i < orbitCount; i++) {
    const radius = size * rng.nextFloat(0.08, 0.35);
    const color = rng.pick([palette.primary, palette.secondary, palette.accent]);
    const opacity = rng.nextFloat(0.15, 0.5);
    const rx = radius * rng.nextFloat(0.6, 1);
    const ry = radius * rng.nextFloat(0.6, 1);
    const tilt = rng.nextFloat(0, 180);

    elements.push(`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${color}" stroke-width="${rng.nextFloat(0.5, 2)}" opacity="${opacity}" transform="rotate(${tilt} ${cx} ${cy})"/>`);

    const dotCount = rng.nextInt(1, 4);
    for (let d = 0; d < dotCount; d++) {
      const angle = rng.nextFloat(0, Math.PI * 2);
      const dx = cx + Math.cos(angle) * rx;
      const dy = cy + Math.sin(angle) * ry;
      elements.push(`<circle cx="${dx}" cy="${dy}" r="${rng.nextFloat(2, 5)}" fill="${palette.highlight}" opacity="${rng.nextFloat(0.5, 0.9)}"/>`);
    }
  }

  return elements;
}

function generateCrystalCore(
  rng: SeededRandom,
  size: number,
  cx: number,
  cy: number,
  palette: ColorPalette,
  traits: AgentTraits,
  filterId: string
): string[] {
  const elements: string[] = [];
  const crystalCount = Math.floor(3 + traits.complexity * 6);

  for (let i = 0; i < crystalCount; i++) {
    const angle = rng.nextFloat(0, Math.PI * 2);
    const dist = rng.nextFloat(size * 0.05, size * 0.25);
    const px = cx + Math.cos(angle) * dist;
    const py = cy + Math.sin(angle) * dist;
    const w = rng.nextFloat(10, 40);
    const h = rng.nextFloat(20, 80);
    const rotation = rng.nextFloat(0, 360);
    const color = rng.pick([palette.primary, palette.secondary, palette.accent, palette.highlight]);
    const opacity = rng.nextFloat(0.2, 0.7);

    elements.push(`<rect x="${px - w / 2}" y="${py - h / 2}" width="${w}" height="${h}" rx="${rng.nextFloat(1, 8)}" fill="${color}" opacity="${opacity}" transform="rotate(${rotation} ${px} ${py})" filter="url(#${filterId})"/>`);
  }

  elements.push(`<circle cx="${cx}" cy="${cy}" r="${size * 0.04}" fill="${palette.highlight}" opacity="0.9"/>`);

  return elements;
}

function generateWaveCore(
  rng: SeededRandom,
  size: number,
  palette: ColorPalette,
  traits: AgentTraits,
  filterId: string
): string[] {
  const elements: string[] = [];
  const waveCount = Math.floor(4 + traits.complexity * 6);

  for (let w = 0; w < waveCount; w++) {
    const yBase = size * rng.nextFloat(0.1, 0.9);
    const amplitude = rng.nextFloat(10, 50);
    const frequency = rng.nextFloat(0.01, 0.04);
    const phase = rng.nextFloat(0, Math.PI * 2);
    const color = rng.pick([palette.primary, palette.secondary, palette.accent]);
    const opacity = rng.nextFloat(0.15, 0.5);
    const strokeWidth = rng.nextFloat(1, 3);

    let path = `M 0 ${yBase}`;
    for (let x = 0; x <= size; x += 8) {
      const y = yBase + Math.sin(x * frequency + phase) * amplitude;
      path += ` L ${x} ${y}`;
    }

    elements.push(`<path d="${path}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" opacity="${opacity}" filter="url(#${filterId})"/>`);
  }

  return elements;
}

function generateConstellationCore(
  rng: SeededRandom,
  size: number,
  palette: ColorPalette,
  traits: AgentTraits,
  filterId: string
): string[] {
  const elements: string[] = [];
  const pointCount = Math.floor(8 + traits.rarityScore * 30);
  const points: { x: number; y: number }[] = [];

  for (let i = 0; i < pointCount; i++) {
    const x = rng.nextFloat(size * 0.1, size * 0.9);
    const y = rng.nextFloat(size * 0.1, size * 0.9);
    const r = rng.nextFloat(2, 6);
    const color = rng.pick([palette.highlight, palette.accent, palette.primary]);
    points.push({ x, y });

    elements.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${rng.nextFloat(0.4, 0.9)}" filter="url(#${filterId})"/>`);
  }

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dx = points[i].x - points[j].x;
      const dy = points[i].y - points[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < size * 0.2) {
        const opacity = (1 - dist / (size * 0.2)) * 0.3;
        elements.push(`<line x1="${points[i].x}" y1="${points[i].y}" x2="${points[j].x}" y2="${points[j].y}" stroke="${palette.primary}" stroke-width="0.5" opacity="${opacity}"/>`);
      }
    }
  }

  return elements;
}

function generateFractalCore(
  rng: SeededRandom,
  size: number,
  cx: number,
  cy: number,
  palette: ColorPalette,
  traits: AgentTraits,
  filterId: string
): string[] {
  const elements: string[] = [];
  const branches = Math.floor(3 + traits.complexity * 5);
  const depth = Math.floor(3 + traits.rarityScore * 3);

  function branch(x: number, y: number, angle: number, length: number, d: number) {
    if (d > depth || length < 3) return;

    const x2 = x + Math.cos(angle) * length;
    const y2 = y + Math.sin(angle) * length;
    const color = rng.pick([palette.primary, palette.secondary, palette.accent]);
    const opacity = rng.nextFloat(0.2, 0.6);
    const sw = rng.nextFloat(0.5, 2.5) * (1 - d / (depth + 1));

    elements.push(`<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="${sw}" opacity="${opacity}" stroke-linecap="round"/>`);

    const spread = rng.nextFloat(0.3, 0.8);
    branch(x2, y2, angle - spread, length * rng.nextFloat(0.6, 0.8), d + 1);
    branch(x2, y2, angle + spread, length * rng.nextFloat(0.6, 0.8), d + 1);

    if (rng.next() > 0.6) {
      branch(x2, y2, angle, length * rng.nextFloat(0.5, 0.7), d + 1);
    }
  }

  for (let i = 0; i < branches; i++) {
    const angle = (Math.PI * 2 / branches) * i + rng.nextFloat(-0.2, 0.2);
    branch(cx, cy, angle, size * rng.nextFloat(0.08, 0.15), 0);
  }

  elements.push(`<circle cx="${cx}" cy="${cy}" r="${rng.nextFloat(4, 10)}" fill="${palette.highlight}" opacity="0.8" filter="url(#${filterId})"/>`);

  return elements;
}

function generateParticles(
  rng: SeededRandom,
  size: number,
  palette: ColorPalette,
  traits: AgentTraits
): string[] {
  const elements: string[] = [];
  const count = Math.floor(15 + traits.rarityScore * 60);

  for (let i = 0; i < count; i++) {
    const x = rng.nextFloat(0, size);
    const y = rng.nextFloat(0, size);
    const r = rng.nextFloat(0.5, 3);
    const color = rng.pick([palette.highlight, palette.accent, palette.primary]);
    const opacity = rng.nextFloat(0.1, 0.5);
    elements.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"/>`);
  }

  return elements;
}

function generateGridPattern(
  rng: SeededRandom,
  size: number,
  palette: ColorPalette,
  traits: AgentTraits
): string[] {
  if (rng.next() > 0.3) return [];

  const elements: string[] = [];
  const spacing = rng.nextFloat(20, 60);
  const opacity = rng.nextFloat(0.03, 0.1);

  for (let x = 0; x <= size; x += spacing) {
    elements.push(`<line x1="${x}" y1="0" x2="${x}" y2="${size}" stroke="${palette.primary}" stroke-width="0.3" opacity="${opacity}"/>`);
  }
  for (let y = 0; y <= size; y += spacing) {
    elements.push(`<line x1="0" y1="${y}" x2="${size}" y2="${y}" stroke="${palette.primary}" stroke-width="0.3" opacity="${opacity}"/>`);
  }

  return elements;
}

/**
 * Get agent visual summary (for display without generating full image)
 */
export function getAgentVisualSummary(params: {
  seed: number;
  name: string;
  personality: string;
  riskLevel: string;
  toolCount: number;
}) {
  const palette = generatePalette({
    seed: params.seed + 1000,
    personality: params.personality,
    riskLevel: params.riskLevel,
    toolCount: params.toolCount,
  });
  const traits = generateTraits(params);
  const backgroundStyle = getBackgroundStyle(params.seed + 2000);
  const coreStyle = getCoreStyle(params.seed + 3000);

  return {
    palette,
    traits,
    backgroundStyle,
    coreStyle,
    gradientCSS: `linear-gradient(135deg, ${palette.background} 0%, ${palette.primary}40 50%, ${palette.secondary}20 100%)`,
  };
}
