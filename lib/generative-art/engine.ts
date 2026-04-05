/**
 * Main Generative Art Engine
 * Creates unique cyber character cNFT artwork for agents
 */

import { SeededRandom } from "./noise";
import { generatePalette, type ColorPalette } from "./palette";
import { drawBackground, getBackgroundStyle, type BackgroundStyle } from "./backgrounds";
import { drawCyberCharacter, type CharacterConfig } from "./characters";
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
  const { seed, name, personality, riskLevel, toolCount, size = 1024 } = params;

  if (typeof document === "undefined") {
    const traits = generateTraits({ seed, personality, riskLevel, toolCount });
    const palette = generatePalette({
      seed: seed + 1000,
      personality,
      riskLevel,
      toolCount,
    });
    const backgroundStyle = getBackgroundStyle(seed + 2000);

    return {
      imageDataUrl: "",
      palette,
      traits,
      backgroundStyle,
      metadata: {
        width: size,
        height: size,
        seed,
        generatedAt: new Date().toISOString(),
        version: "2.0.0",
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

  // Determine background style
  const backgroundStyle = getBackgroundStyle(seed + 2000);

  // Create canvas
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;

  // Draw cyber character (includes background, body, face, hair, eyes, mouth, implants, accessories, effects, frame)
  drawCyberCharacter(ctx, {
    palette,
    size,
    seed,
    name,
    personality,
    riskLevel,
    toolCount,
  });

  // Generate data URL
  const imageDataUrl = canvas.toDataURL("image/png", 0.95);

  return {
    imageDataUrl,
    palette,
    traits,
    backgroundStyle,
    metadata: {
      width: size,
      height: size,
      seed,
      generatedAt: new Date().toISOString(),
      version: "2.0.0",
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
  const { seed, name, personality, riskLevel, toolCount } = params;
  const palette = generatePalette({
    seed: seed + 1000,
    personality,
    riskLevel,
    toolCount,
  });
  const traits = generateTraits({ seed, personality, riskLevel, toolCount });

  const size = 512;
  const rng = new SeededRandom(seed);

  const defs: string[] = [];
  const elements: string[] = [];

  const bgGradId = `bg-${seed}`;
  const charGradId = `char-${seed}`;
  const glowId = `glow-${seed}`;

  defs.push(`
    <radialGradient id="${bgGradId}" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${palette.primary}" stop-opacity="0.15"/>
      <stop offset="50%" stop-color="${palette.background}"/>
      <stop offset="100%" stop-color="#0a0a0f"/>
    </radialGradient>
  `);

  defs.push(`
    <radialGradient id="${charGradId}" cx="45%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${palette.highlight}" stop-opacity="0.6"/>
      <stop offset="40%" stop-color="${palette.primary}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${palette.primary}" stop-opacity="0"/>
    </radialGradient>
  `);

  defs.push(`
    <filter id="${glowId}" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="${rng.nextFloat(3, 8)}" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `);

  // Background
  elements.push(`<rect width="${size}" height="${size}" fill="url(#${bgGradId})"/>`);

  // Grid
  elements.push(`<pattern id="grid-${seed}" width="${size / 20}" height="${size / 20}" patternUnits="userSpaceOnUse">
    <path d="M ${size / 20} 0 L 0 0 0 ${size / 20}" fill="none" stroke="${palette.primary}" stroke-width="0.3" opacity="0.08"/>
  </pattern>`);
  elements.push(`<rect width="${size}" height="${size}" fill="url(#grid-${seed})"/>`);

  // Character silhouette
  const cx = size / 2;
  const cy = size / 2;
  const bodyW = size * rng.nextFloat(0.25, 0.35);
  const headR = size * rng.nextFloat(0.1, 0.15);
  const headY = cy - size * 0.05;

  // Body
  elements.push(`<path d="M ${cx - bodyW} ${size} Q ${cx - bodyW * 0.7} ${cy + size * 0.15} ${cx} ${cy + size * 0.15} Q ${cx + bodyW * 0.7} ${cy + size * 0.15} ${cx + bodyW} ${size}" fill="#1a1a2e" stroke="${palette.primary}" stroke-width="1" opacity="0.6"/>`);

  // Head
  const faceType = rng.nextInt(0, 2);
  if (faceType === 0) {
    elements.push(`<ellipse cx="${cx}" cy="${headY}" rx="${headR}" ry="${headR * 1.2}" fill="#1e1e32" stroke="${palette.primary}" stroke-width="0.8" opacity="0.7"/>`);
  } else if (faceType === 1) {
    elements.push(`<circle cx="${cx}" cy="${headY}" r="${headR * 1.1}" fill="#1e1e32" stroke="${palette.primary}" stroke-width="0.8" opacity="0.7"/>`);
  } else {
    elements.push(`<polygon points="${cx},${headY - headR * 1.2} ${cx + headR},${headY} ${cx + headR * 0.6},${headY + headR} ${cx - headR * 0.6},${headY + headR} ${cx - headR},${headY}" fill="#1e1e32" stroke="${palette.primary}" stroke-width="0.8" opacity="0.7"/>`);
  }

  // Eyes
  const eyeType = rng.nextInt(0, 3);
  const eyeSpacing = size * 0.05;
  const eyeY = headY - size * 0.01;
  const eyeColor = rng.pick([palette.highlight, palette.accent, "#00ff88", "#ff0066", "#00ccff"]);

  if (eyeType === 0) {
    // Normal eyes
    for (let side = -1; side <= 1; side += 2) {
      const ex = cx + side * eyeSpacing;
      elements.push(`<circle cx="${ex}" cy="${eyeY}" r="${size * 0.015}" fill="${eyeColor}" opacity="0.7" filter="url(#${glowId})"/>`);
      elements.push(`<circle cx="${ex}" cy="${eyeY}" r="${size * 0.006}" fill="#000"/>`);
    }
  } else if (eyeType === 1) {
    // Visor
    elements.push(`<rect x="${cx - eyeSpacing * 1.5}" y="${eyeY - size * 0.008}" width="${eyeSpacing * 3}" height="${size * 0.016}" rx="2" fill="${eyeColor}" opacity="0.5" filter="url(#${glowId})"/>`);
  } else if (eyeType === 2) {
    // Rectangular eyes
    for (let side = -1; side <= 1; side += 2) {
      const ex = cx + side * eyeSpacing;
      elements.push(`<rect x="${ex - size * 0.02}" y="${eyeY - size * 0.008}" width="${size * 0.04}" height="${size * 0.016}" fill="${eyeColor}" opacity="0.6" filter="url(#${glowId})"/>`);
    }
  } else {
    // Single glowing eye
    elements.push(`<circle cx="${cx}" cy="${eyeY}" r="${size * 0.02}" fill="${eyeColor}" opacity="0.8" filter="url(#${glowId})"/>`);
  }

  // Cyber implants
  const implantCount = Math.min(toolCount, 4);
  for (let i = 0; i < implantCount; i++) {
    const side = rng.next() > 0.5 ? 1 : -1;
    const ix = cx + side * size * rng.nextFloat(0.08, 0.18);
    const iy = headY + size * rng.nextFloat(-0.1, 0.1);
    elements.push(`<circle cx="${ix}" cy="${iy}" r="${rng.nextFloat(1, 3)}" fill="${palette.accent}" opacity="${rng.nextFloat(0.3, 0.6)}"/>`);
  }

  // Particles
  const particleCount = rng.nextInt(10, 30);
  for (let i = 0; i < particleCount; i++) {
    const x = rng.nextFloat(0, size);
    const y = rng.nextFloat(0, size);
    const r = rng.nextFloat(0.5, 2);
    const color = rng.pick([palette.highlight, palette.accent, palette.primary]);
    elements.push(`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${rng.nextFloat(0.1, 0.3)}"/>`);
  }

  // Tech frame corners
  const bracketSize = size * 0.04;
  const margin = size * 0.03;
  const borderColor = riskLevel === "Aggressive" ? "#ff4444" : riskLevel === "Conservative" ? "#44ff88" : palette.primary;
  elements.push(`<path d="M ${margin} ${margin + bracketSize} L ${margin} ${margin} L ${margin + bracketSize} ${margin}" fill="none" stroke="${borderColor}" stroke-width="2" opacity="0.4"/>`);
  elements.push(`<path d="M ${size - margin - bracketSize} ${margin} L ${size - margin} ${margin} L ${size - margin} ${margin + bracketSize}" fill="none" stroke="${borderColor}" stroke-width="2" opacity="0.4"/>`);
  elements.push(`<path d="M ${margin} ${size - margin - bracketSize} L ${margin} ${size - margin} L ${margin + bracketSize} ${size - margin}" fill="none" stroke="${borderColor}" stroke-width="2" opacity="0.4"/>`);
  elements.push(`<path d="M ${size - margin - bracketSize} ${size - margin} L ${size - margin} ${size - margin} L ${size - margin} ${size - margin - bracketSize}" fill="none" stroke="${borderColor}" stroke-width="2" opacity="0.4"/>`);

  // ID text
  elements.push(`<text x="${margin + 4}" y="${size - margin - 6}" font-family="monospace" font-size="${size * 0.015}" fill="${borderColor}" opacity="0.3">ID:${seed.toString(16).slice(0, 8).toUpperCase()}</text>`);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>${defs.join("")}</defs>
    ${elements.join("")}
  </svg>`;
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

  return {
    palette,
    traits,
    backgroundStyle,
    gradientCSS: `linear-gradient(135deg, ${palette.background} 0%, ${palette.primary}40 50%, ${palette.secondary}20 100%)`,
  };
}
