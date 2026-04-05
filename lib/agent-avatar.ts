/**
 * Cyberpunk Agent Avatar Generator
 * Generates unique cyberpunk cNFT-style SVG avatars for each agent
 * No real photos, no humans - pure cyberpunk aesthetic
 */

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hashAgentId(agentId: string): number {
  let hash = 5381;
  for (let i = 0; i < agentId.length; i++) {
    hash = ((hash << 5) + hash) ^ agentId.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash;
}

const NEON_COLORS = [
  ["#00f5ff", "#c026d3", "#06b6d4"],
  ["#00ff88", "#8b5cf6", "#10b981"],
  ["#ff0066", "#00f5ff", "#ec4899"],
  ["#c026d3", "#00f5ff", "#a855f7"],
  ["#00ccff", "#ff00aa", "#0ea5e9"],
  ["#22d3ee", "#e879f9", "#14b8a6"],
  ["#f43f5e", "#06b6d4", "#f97316"],
  ["#8b5cf6", "#00f5ff", "#6366f1"],
  ["#10b981", "#c026d3", "#059669"],
  ["#f59e0b", "#00f5ff", "#d946ef"],
];

const HELMET_SHAPES = [
  (rng: () => number, neon: string[]): string => {
    const visorY = 140 + rng() * 30;
    const visorH = 35 + rng() * 25;
    return `
      <path d="M 120 ${visorY + visorH} L 120 ${visorY + 10} Q 120 ${visorY - 5} 135 ${visorY - 5} L 265 ${visorY - 5} Q 280 ${visorY - 5} 280 ${visorY + 10} L 280 ${visorY + visorH} Q 280 ${visorY + visorH + 10} 265 ${visorY + visorH + 10} L 135 ${visorY + visorH + 10} Q 120 ${visorY + visorH + 10} 120 ${visorY + visorH} Z" fill="#0a0a12" stroke="${neon[0]}" stroke-width="2" opacity="0.9"/>
      <rect x="130" y="${visorY}" width="140" height="${visorH}" rx="4" fill="${neon[0]}" opacity="0.15"/>
      <line x1="135" y1="${visorY + visorH / 2}" x2="265" y2="${visorY + visorH / 2}" stroke="${neon[0]}" stroke-width="1" opacity="0.6"/>
      <line x1="140" y1="${visorY + visorH * 0.3}" x2="260" y2="${visorY + visorH * 0.3}" stroke="${neon[0]}" stroke-width="0.5" opacity="0.4"/>
      <line x1="140" y1="${visorY + visorH * 0.7}" x2="260" y2="${visorY + visorH * 0.7}" stroke="${neon[0]}" stroke-width="0.5" opacity="0.4"/>
    `;
  },
  (rng: () => number, neon: string[]): string => {
    const cx = 200;
    const cy = 160 + rng() * 20;
    const r = 45 + rng() * 20;
    return `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="#0a0a12" stroke="${neon[0]}" stroke-width="2" opacity="0.9"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.7}" fill="${neon[0]}" opacity="0.1"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.4}" fill="${neon[0]}" opacity="0.2"/>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.15}" fill="${neon[0]}" opacity="0.8"/>
      <path d="M ${cx - r * 0.5} ${cy} L ${cx + r * 0.5} ${cy}" stroke="${neon[0]}" stroke-width="1" opacity="0.5"/>
      <path d="M ${cx} ${cy - r * 0.5} L ${cx} ${cy + r * 0.5}" stroke="${neon[0]}" stroke-width="1" opacity="0.5"/>
    `;
  },
  (rng: () => number, neon: string[]): string => {
    const visorY = 130 + rng() * 30;
    return `
      <path d="M 110 ${visorY + 50} L 110 ${visorY + 15} Q 110 ${visorY} 125 ${visorY} L 275 ${visorY} Q 290 ${visorY} 290 ${visorY + 15} L 290 ${visorY + 50} Q 290 ${visorY + 65} 275 ${visorY + 65} L 125 ${visorY + 65} Q 110 ${visorY + 65} 110 ${visorY + 50} Z" fill="#0a0a12" stroke="${neon[0]}" stroke-width="2"/>
      <path d="M 120 ${visorY + 10} L 280 ${visorY + 10} L 280 ${visorY + 55} L 120 ${visorY + 55} Z" fill="${neon[0]}" opacity="0.12"/>
      <rect x="140" y="${visorY + 20}" width="120" height="20" rx="3" fill="${neon[0]}" opacity="0.2" stroke="${neon[0]}" stroke-width="1"/>
      <text x="200" y="${visorY + 35}" text-anchor="middle" font-family="monospace" font-size="12" fill="${neon[0]}" opacity="0.8">SYS.ONLINE</text>
    `;
  },
  (rng: () => number, neon: string[]): string => {
    const eyeY = 150 + rng() * 20;
    const eyeSpacing = 40 + rng() * 15;
    return `
      <rect x="100" y="${eyeY - 30}" width="200" height="60" rx="8" fill="#0a0a12" stroke="${neon[0]}" stroke-width="2"/>
      <circle cx="${200 - eyeSpacing}" cy="${eyeY}" r="15" fill="${neon[0]}" opacity="0.3" stroke="${neon[0]}" stroke-width="1.5"/>
      <circle cx="${200 - eyeSpacing}" cy="${eyeY}" r="6" fill="${neon[0]}" opacity="0.9"/>
      <circle cx="${200 + eyeSpacing}" cy="${eyeY}" r="15" fill="${neon[0]}" opacity="0.3" stroke="${neon[0]}" stroke-width="1.5"/>
      <circle cx="${200 + eyeSpacing}" cy="${eyeY}" r="6" fill="${neon[0]}" opacity="0.9"/>
      <line x1="${200 - eyeSpacing - 20}" y1="${eyeY}" x2="${200 - eyeSpacing + 20}" y2="${eyeY}" stroke="${neon[0]}" stroke-width="0.5" opacity="0.4"/>
      <line x1="${200 + eyeSpacing - 20}" y1="${eyeY}" x2="${200 + eyeSpacing + 20}" y2="${eyeY}" stroke="${neon[0]}" stroke-width="0.5" opacity="0.4"/>
    `;
  },
  (rng: () => number, neon: string[]): string => {
    const visorY = 140 + rng() * 25;
    const visorH = 30 + rng() * 20;
    return `
      <polygon points="110,${visorY + visorH} 110,${visorY + 5} 130,${visorY} 270,${visorY} 290,${visorY + 5} 290,${visorY + visorH} 270,${visorY + visorH + 5} 130,${visorY + visorH + 5}" fill="#0a0a12" stroke="${neon[0]}" stroke-width="2"/>
      <polygon points="120,${visorY + visorH - 5} 120,${visorY + 10} 280,${visorY + 10} 280,${visorY + visorH - 5}" fill="${neon[0]}" opacity="0.15"/>
      <line x1="130" y1="${visorY + visorH / 2}" x2="270" y2="${visorY + visorH / 2}" stroke="${neon[0]}" stroke-width="2" opacity="0.7"/>
      <line x1="140" y1="${visorY + visorH / 2 - 8}" x2="260" y2="${visorY + visorH / 2 - 8}" stroke="${neon[0]}" stroke-width="0.5" opacity="0.4"/>
      <line x1="140" y1="${visorY + visorH / 2 + 8}" x2="260" y2="${visorY + visorH / 2 + 8}" stroke="${neon[0]}" stroke-width="0.5" opacity="0.4"/>
    `;
  },
];

const CIRCUIT_PATTERNS = [
  (rng: () => number, neon: string[]): string => {
    let paths = "";
    const count = 3 + Math.floor(rng() * 4);
    for (let i = 0; i < count; i++) {
      const x = 50 + rng() * 300;
      const y = 250 + rng() * 100;
      const w = 20 + rng() * 40;
      const h = 10 + rng() * 20;
      paths += `<path d="M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h}" fill="none" stroke="${neon[1]}" stroke-width="1" opacity="${0.2 + rng() * 0.3}"/>`;
      paths += `<circle cx="${x + w}" cy="${y + h}" r="2" fill="${neon[1]}" opacity="${0.3 + rng() * 0.4}"/>`;
    }
    return paths;
  },
  (rng: () => number, neon: string[]): string => {
    let paths = "";
    const count = 2 + Math.floor(rng() * 3);
    for (let i = 0; i < count; i++) {
      const x = 60 + rng() * 280;
      const y = 260 + rng() * 80;
      paths += `<rect x="${x}" y="${y}" width="${15 + rng() * 25}" height="${8 + rng() * 12}" fill="none" stroke="${neon[1]}" stroke-width="0.8" opacity="${0.15 + rng() * 0.25}"/>`;
      for (let j = 0; j < 3; j++) {
        paths += `<line x1="${x + j * 6}" y1="${y}" x2="${x + j * 6}" y2="${y + 8 + rng() * 12}" stroke="${neon[1]}" stroke-width="0.5" opacity="0.2"/>`;
      }
    }
    return paths;
  },
  (rng: () => number, neon: string[]): string => {
    let paths = "";
    const cx = 180 + rng() * 40;
    const cy = 280 + rng() * 40;
    const r = 30 + rng() * 20;
    paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${neon[1]}" stroke-width="1" opacity="0.3"/>`;
    paths += `<circle cx="${cx}" cy="${cy}" r="${r * 0.6}" fill="none" stroke="${neon[1]}" stroke-width="0.8" opacity="0.2"/>`;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x1 = cx + Math.cos(angle) * r * 0.6;
      const y1 = cy + Math.sin(angle) * r * 0.6;
      const x2 = cx + Math.cos(angle) * r;
      const y2 = cy + Math.sin(angle) * r;
      paths += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${neon[1]}" stroke-width="0.5" opacity="0.25"/>`;
    }
    paths += `<circle cx="${cx}" cy="${cy}" r="3" fill="${neon[1]}" opacity="0.5"/>`;
    return paths;
  },
];

const SYMBOL_RUNES = [
  (rng: () => number, neon: string[]): string => {
    const x = 180 + rng() * 40;
    const y = 320 + rng() * 30;
    return `<text x="${x}" y="${y}" text-anchor="middle" font-family="monospace" font-size="10" fill="${neon[0]}" opacity="0.4">◆ ${Math.floor(rng() * 9999).toString(16).toUpperCase().padStart(4, "0")} ◆</text>`;
  },
  (rng: () => number, neon: string[]): string => {
    const x = 170 + rng() * 60;
    const y = 330 + rng() * 20;
    return `<text x="${x}" y="${y}" text-anchor="middle" font-family="monospace" font-size="9" fill="${neon[2]}" opacity="0.35">[${Math.floor(rng() * 999)}]</text>`;
  },
  (rng: () => number, neon: string[]): string => {
    const x = 190 + rng() * 20;
    const y = 325 + rng() * 25;
    return `<text x="${x}" y="${y}" text-anchor="middle" font-family="monospace" font-size="8" fill="${neon[1]}" opacity="0.3">0x${Math.floor(rng() * 65535).toString(16).padStart(4, "0")}</text>`;
  },
];

const BACKGROUND_GLOWS = [
  (rng: () => number, neon: string[]): string => {
    const cx = 180 + rng() * 40;
    const cy = 150 + rng() * 50;
    return `<radialGradient id="bgGlow" cx="${cx}" cy="${cy}" r="150" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${neon[0]}" stop-opacity="0.12"/>
      <stop offset="50%" stop-color="${neon[1]}" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#050508" stop-opacity="0"/>
    </radialGradient>
    <rect width="400" height="400" fill="url(#bgGlow)"/>`;
  },
  (rng: () => number, neon: string[]): string => {
    return `<radialGradient id="bgGlow" cx="200" cy="180" r="180" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${neon[0]}" stop-opacity="0.08"/>
      <stop offset="40%" stop-color="${neon[1]}" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#050508" stop-opacity="0"/>
    </radialGradient>
    <rect width="400" height="400" fill="url(#bgGlow)"/>`;
  },
];

const GRID_PATTERNS = [
  (rng: () => number): string => {
    const spacing = 20 + Math.floor(rng() * 15);
    return `<pattern id="grid" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
      <path d="M ${spacing} 0 L 0 0 0 ${spacing}" fill="none" stroke="#ffffff" stroke-width="0.3" opacity="0.04"/>
    </pattern>
    <rect width="400" height="400" fill="url(#grid)"/>`;
  },
  (rng: () => number): string => {
    const spacing = 25 + Math.floor(rng() * 10);
    return `<pattern id="grid" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
      <path d="M ${spacing} 0 L 0 0 0 ${spacing}" fill="none" stroke="#ffffff" stroke-width="0.2" opacity="0.03"/>
    </pattern>
    <rect width="400" height="400" fill="url(#grid)"/>`;
  },
];

const PARTICLE_EFFECTS = [
  (rng: () => number, neon: string[]): string => {
    let particles = "";
    const count = 15 + Math.floor(rng() * 20);
    for (let i = 0; i < count; i++) {
      const x = rng() * 400;
      const y = rng() * 400;
      const r = 0.5 + rng() * 2;
      const color = rng() > 0.5 ? neon[0] : neon[1];
      const opacity = 0.1 + rng() * 0.3;
      particles += `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" opacity="${opacity}"/>`;
    }
    return particles;
  },
  (rng: () => number, neon: string[]): string => {
    let particles = "";
    const count = 10 + Math.floor(rng() * 15);
    for (let i = 0; i < count; i++) {
      const x = rng() * 400;
      const y = rng() * 400;
      const color = neon[Math.floor(rng() * neon.length)];
      const opacity = 0.08 + rng() * 0.2;
      particles += `<rect x="${x}" y="${y}" width="${1 + rng() * 3}" height="${1 + rng() * 3}" fill="${color}" opacity="${opacity}"/>`;
    }
    return particles;
  },
];

const FRAME_STYLES = [
  (rng: () => number, neon: string[]): string => {
    const m = 15 + rng() * 5;
    const b = 25 + rng() * 15;
    return `
      <path d="M ${m} ${m + b} L ${m} ${m} L ${m + b} ${m}" fill="none" stroke="${neon[0]}" stroke-width="2" opacity="0.4"/>
      <path d="M ${400 - m - b} ${m} L ${400 - m} ${m} L ${400 - m} ${m + b}" fill="none" stroke="${neon[0]}" stroke-width="2" opacity="0.4"/>
      <path d="M ${m} ${400 - m - b} L ${m} ${400 - m} L ${m + b} ${400 - m}" fill="none" stroke="${neon[0]}" stroke-width="2" opacity="0.4"/>
      <path d="M ${400 - m - b} ${400 - m} L ${400 - m} ${400 - m} L ${400 - m} ${400 - m - b}" fill="none" stroke="${neon[0]}" stroke-width="2" opacity="0.4"/>
    `;
  },
  (rng: () => number, neon: string[]): string => {
    const m = 12 + rng() * 8;
    return `
      <line x1="${m}" y1="${m}" x2="${m + 30}" y2="${m}" stroke="${neon[0]}" stroke-width="1.5" opacity="0.3"/>
      <line x1="${m}" y1="${m}" x2="${m}" y2="${m + 30}" stroke="${neon[0]}" stroke-width="1.5" opacity="0.3"/>
      <line x1="${400 - m}" y1="${m}" x2="${400 - m - 30}" y2="${m}" stroke="${neon[0]}" stroke-width="1.5" opacity="0.3"/>
      <line x1="${400 - m}" y1="${m}" x2="${400 - m}" y2="${m + 30}" stroke="${neon[0]}" stroke-width="1.5" opacity="0.3"/>
      <line x1="${m}" y1="${400 - m}" x2="${m + 30}" y2="${400 - m}" stroke="${neon[0]}" stroke-width="1.5" opacity="0.3"/>
      <line x1="${m}" y1="${400 - m}" x2="${m}" y2="${400 - m - 30}" stroke="${neon[0]}" stroke-width="1.5" opacity="0.3"/>
      <line x1="${400 - m}" y1="${400 - m}" x2="${400 - m - 30}" y2="${400 - m}" stroke="${neon[0]}" stroke-width="1.5" opacity="0.3"/>
      <line x1="${400 - m}" y1="${400 - m}" x2="${400 - m}" y2="${400 - m - 30}" stroke="${neon[0]}" stroke-width="1.5" opacity="0.3"/>
    `;
  },
];

export function getCyberpunkAgentSVG(agentId: string): string {
  const hash = hashAgentId(agentId);
  const rng = seededRandom(hash);

  const neonSet = NEON_COLORS[Math.floor(rng() * NEON_COLORS.length)];
  const helmetIdx = Math.floor(rng() * HELMET_SHAPES.length);
  const circuitIdx = Math.floor(rng() * CIRCUIT_PATTERNS.length);
  const symbolIdx = Math.floor(rng() * SYMBOL_RUNES.length);
  const bgGlowIdx = Math.floor(rng() * BACKGROUND_GLOWS.length);
  const gridIdx = Math.floor(rng() * GRID_PATTERNS.length);
  const particleIdx = Math.floor(rng() * PARTICLE_EFFECTS.length);
  const frameIdx = Math.floor(rng() * FRAME_STYLES.length);

  const helmet = HELMET_SHAPES[helmetIdx](rng, neonSet);
  const circuit = CIRCUIT_PATTERNS[circuitIdx](rng, neonSet);
  const symbol = SYMBOL_RUNES[symbolIdx](rng, neonSet);
  const bgGlow = BACKGROUND_GLOWS[bgGlowIdx](rng, neonSet);
  const grid = GRID_PATTERNS[gridIdx](rng);
  const particles = PARTICLE_EFFECTS[particleIdx](rng, neonSet);
  const frame = FRAME_STYLES[frameIdx](rng, neonSet);

  const scanlines = Array.from({ length: 200 }, (_, i) => {
    const y = i * 2;
    return `<line x1="0" y1="${y}" x2="400" y2="${y}" stroke="#000000" stroke-width="0.5" opacity="0.03"/>`;
  }).join("");

  const idHash = agentId.slice(0, 8).toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
    <defs>
      <filter id="glow">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a1a2e"/>
        <stop offset="50%" stop-color="#121225"/>
        <stop offset="100%" stop-color="#0a0a18"/>
      </linearGradient>
    </defs>
    
    <rect width="400" height="400" fill="#050508"/>
    ${bgGlow}
    ${grid}
    ${scanlines}
    
    <path d="M 100 400 L 100 300 Q 100 280 120 270 L 200 260 L 280 270 Q 300 280 300 300 L 300 400 Z" fill="url(#bodyGrad)" stroke="${neonSet[0]}" stroke-width="1" opacity="0.6"/>
    <path d="M 140 270 L 130 290 L 200 280 L 270 290 L 260 270" fill="none" stroke="${neonSet[1]}" stroke-width="1" opacity="0.3"/>
    
    ${helmet}
    ${circuit}
    ${particles}
    ${symbol}
    ${frame}
    
    <text x="200" y="385" text-anchor="middle" font-family="monospace" font-size="8" fill="${neonSet[0]}" opacity="0.25">ID:${idHash}</text>
  </svg>`;
}
