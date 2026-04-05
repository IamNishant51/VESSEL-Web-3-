/**
 * Main Generative Art Engine
 * Creates unique cyber character cNFT artwork for agents
 */

import { SeededRandom } from "./noise";
import { generatePalette, type ColorPalette } from "./palette";
import { drawBackground, getBackgroundStyle, type BackgroundStyle } from "./backgrounds";
import { drawCyberCharacter, type CharacterConfig } from "./characters";
import { generateTraits, type AgentTraits } from "./traits";

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

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
  const backgroundStyle = getBackgroundStyle(seed + 2000);
  const traitHash = traits.traits.reduce((accumulator, trait) => {
    let hash = accumulator;
    const token = `${trait.name}:${trait.value}`;
    for (let index = 0; index < token.length; index += 1) {
      hash = (hash * 31 + token.charCodeAt(index)) >>> 0;
    }
    return hash;
  }, seed >>> 0);
  const compositionMode = traitHash % 4;
  const floatDuration = 11 + (traitHash % 7);
  const orbitCount = 2 + Math.min(3, Math.floor(traits.complexity * 3));
  const ambientCount = 4 + Math.min(8, Math.floor(traits.complexity * 10));
  const labelColor = riskLevel === "Aggressive" ? "#ff6b6b" : riskLevel === "Conservative" ? "#66ffb0" : palette.primary;
  const heroName = escapeSvgText((name || "Agent").toUpperCase().slice(0, 28));
  const heroArchetype = escapeSvgText(traits.archetype.toUpperCase());
  const heroEnergy = escapeSvgText(traits.energy.toUpperCase());
  const heroBackground = escapeSvgText(backgroundStyle.toUpperCase());

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

  defs.push(`
    <style>
      @keyframes vessel-float {
        0% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(0, -8px, 0) scale(1.015); }
        100% { transform: translate3d(0, 0, 0) scale(1); }
      }
      @keyframes vessel-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes vessel-pulse {
        0%, 100% { opacity: 0.28; }
        50% { opacity: 0.85; }
      }
      @keyframes vessel-drift {
        0% { transform: translate(-3px, 4px); }
        50% { transform: translate(4px, -4px); }
        100% { transform: translate(-3px, 4px); }
      }
      .float { animation: vessel-float ${floatDuration}s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
      .spin { animation: vessel-spin ${Math.max(12, 24 - traits.complexity * 8)}s linear infinite; transform-box: fill-box; transform-origin: center; }
      .pulse { animation: vessel-pulse ${6 + (traitHash % 4)}s ease-in-out infinite; }
      .drift { animation: vessel-drift ${8 + (traitHash % 5)}s ease-in-out infinite; }
      .flicker { animation: vessel-pulse 2.8s steps(2, end) infinite; }
    </style>
  `);

  // Background
  elements.push(`<rect width="${size}" height="${size}" fill="url(#${bgGradId})"/>`);

  // Grid
  elements.push(`<pattern id="grid-${seed}" width="${size / 20}" height="${size / 20}" patternUnits="userSpaceOnUse">
    <path d="M ${size / 20} 0 L 0 0 0 ${size / 20}" fill="none" stroke="${palette.primary}" stroke-width="0.3" opacity="0.08"/>
  </pattern>`);
  elements.push(`<rect width="${size}" height="${size}" fill="url(#grid-${seed})"/>`);

  // Ambient motion layers
  for (let i = 0; i < orbitCount; i += 1) {
    const radius = size * (0.18 + i * 0.06 + rng.nextFloat(-0.01, 0.01));
    const stroke = i % 3 === 0 ? palette.primary : i % 3 === 1 ? palette.secondary : palette.accent;
    elements.push(
      `<circle cx="${size / 2}" cy="${size / 2}" r="${radius}" fill="none" stroke="${stroke}" stroke-width="${1 + i * 0.25}" stroke-dasharray="${14 + i * 8} ${10 + i * 4}" opacity="${0.18 + i * 0.08}" class="spin" style="animation-duration:${16 + i * 4}s;animation-delay:${-i * 1.5}s"/>`
    );
  }

  for (let i = 0; i < ambientCount; i += 1) {
    const angle = (i / ambientCount) * Math.PI * 2;
    const radius = size * (0.14 + (i % 5) * 0.05);
    const x = size / 2 + Math.cos(angle + seed * 0.01) * radius;
    const y = size / 2 + Math.sin(angle * 1.1 + seed * 0.013) * radius;
    const accent = [palette.highlight, palette.accent, palette.primary][i % 3];

    elements.push(
      `<g class="pulse" style="animation-delay:${-(i * 0.4).toFixed(2)}s">`
      + `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(1.5 + (i % 4) * 0.9).toFixed(2)}" fill="${accent}" opacity="${0.18 + (i % 5) * 0.05}" filter="url(#${glowId})"/>`
      + `</g>`
    );
  }

  switch (backgroundStyle) {
    case "cosmic":
    case "nebula":
    case "aurora":
      elements.push(
        `<circle cx="${size * 0.28}" cy="${size * 0.28}" r="${size * 0.22}" fill="${palette.highlight}" opacity="0.06" class="drift"/>`
      );
      elements.push(
        `<circle cx="${size * 0.72}" cy="${size * 0.72}" r="${size * 0.18}" fill="${palette.primary}" opacity="0.05" class="drift"/>`
      );
      break;
    case "grid":
    case "geometric":
      elements.push(
        `<path d="M ${size * 0.12} ${size * 0.18} L ${size * 0.88} ${size * 0.82}" fill="none" stroke="${palette.primary}" stroke-width="1" opacity="0.08"/>`
      );
      elements.push(
        `<path d="M ${size * 0.88} ${size * 0.18} L ${size * 0.12} ${size * 0.82}" fill="none" stroke="${palette.secondary}" stroke-width="1" opacity="0.06"/>`
      );
      break;
    case "crystalline":
      elements.push(
        `<polygon points="${size * 0.16},${size * 0.34} ${size * 0.28},${size * 0.18} ${size * 0.36},${size * 0.32} ${size * 0.24},${size * 0.46}" fill="${palette.accent}" opacity="0.08" class="drift"/>`
      );
      elements.push(
        `<polygon points="${size * 0.82},${size * 0.34} ${size * 0.70},${size * 0.18} ${size * 0.62},${size * 0.32} ${size * 0.74},${size * 0.46}" fill="${palette.highlight}" opacity="0.08" class="drift"/>`
      );
      break;
    default:
      elements.push(
        `<circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.3}" fill="url(#${charGradId})" opacity="0.25" class="pulse"/>`
      );
      break;
  }

  // Character silhouette
  const cx = size / 2;
  const cy = size / 2;
  const bodyW = size * (0.23 + compositionMode * 0.025 + rng.nextFloat(0.015, 0.045));
  const headR = size * (0.095 + compositionMode * 0.008 + rng.nextFloat(0.008, 0.02));
  const headY = cy - size * 0.05;

  elements.push(`<g class="float">`);

  // Body
  elements.push(`<path d="M ${cx - bodyW} ${size} Q ${cx - bodyW * 0.7} ${cy + size * 0.15} ${cx} ${cy + size * 0.15} Q ${cx + bodyW * 0.7} ${cy + size * 0.15} ${cx + bodyW} ${size}" fill="#1a1a2e" stroke="${palette.primary}" stroke-width="1" opacity="0.6"/>`);

  // Head
  const faceType = (rng.nextInt(0, 2) + compositionMode) % 3;
  if (faceType === 0) {
    elements.push(`<ellipse cx="${cx}" cy="${headY}" rx="${headR}" ry="${headR * 1.2}" fill="#1e1e32" stroke="${palette.primary}" stroke-width="0.8" opacity="0.7"/>`);
  } else if (faceType === 1) {
    elements.push(`<circle cx="${cx}" cy="${headY}" r="${headR * 1.1}" fill="#1e1e32" stroke="${palette.primary}" stroke-width="0.8" opacity="0.7"/>`);
  } else {
    elements.push(`<polygon points="${cx},${headY - headR * 1.2} ${cx + headR},${headY} ${cx + headR * 0.6},${headY + headR} ${cx - headR * 0.6},${headY + headR} ${cx - headR},${headY}" fill="#1e1e32" stroke="${palette.primary}" stroke-width="0.8" opacity="0.7"/>`);
  }

  // Eyes
  const eyeType = (rng.nextInt(0, 3) + compositionMode) % 4;
  const eyeSpacing = size * (0.045 + compositionMode * 0.004);
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
  const frameColor = riskLevel === "Aggressive" ? "#ff4444" : riskLevel === "Conservative" ? "#44ff88" : palette.primary;
  elements.push(`<path d="M ${margin} ${margin + bracketSize} L ${margin} ${margin} L ${margin + bracketSize} ${margin}" fill="none" stroke="${frameColor}" stroke-width="2" opacity="0.4"/>`);
  elements.push(`<path d="M ${size - margin - bracketSize} ${margin} L ${size - margin} ${margin} L ${size - margin} ${margin + bracketSize}" fill="none" stroke="${frameColor}" stroke-width="2" opacity="0.4"/>`);
  elements.push(`<path d="M ${margin} ${size - margin - bracketSize} L ${margin} ${size - margin} L ${margin + bracketSize} ${size - margin}" fill="none" stroke="${frameColor}" stroke-width="2" opacity="0.4"/>`);
  elements.push(`<path d="M ${size - margin - bracketSize} ${size - margin} L ${size - margin} ${size - margin} L ${size - margin} ${size - margin - bracketSize}" fill="none" stroke="${frameColor}" stroke-width="2" opacity="0.4"/>`);

  // ID text
  elements.push(`<text x="${margin + 4}" y="${size - margin - 6}" font-family="monospace" font-size="${size * 0.015}" fill="${frameColor}" opacity="0.3">ID:${seed.toString(16).slice(0, 8).toUpperCase()}</text>`);
  elements.push(`<text x="${size - margin - 4}" y="${margin + 12}" font-family="monospace" font-size="${size * 0.012}" fill="${palette.highlight}" opacity="0.28" text-anchor="end">${heroArchetype}</text>`);
  elements.push(`<text x="${size - margin - 4}" y="${margin + 24}" font-family="monospace" font-size="${size * 0.01}" fill="${palette.primary}" opacity="0.24" text-anchor="end">${heroEnergy}</text>`);
  elements.push(`<text x="${margin + 4}" y="${margin + 12}" font-family="monospace" font-size="${size * 0.01}" fill="${palette.primary}" opacity="0.22">${heroBackground}</text>`);
  elements.push(`<text x="${margin + 4}" y="${size - margin - 18}" font-family="monospace" font-size="${size * 0.01}" fill="${labelColor}" opacity="0.22">${heroName}</text>`);

  elements.push(`</g>`);

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
