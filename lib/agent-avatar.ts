/**
 * VESSEL — Ultra-Premium Anime/Mech Agent Avatar Generator
 * 
 * Creates highly stylized, vector-perfect "2026 Web3 Anime" style mech busts.
 * Features:
 * - Grainy matte texture overlays (feTurbulence)
 * - HUD data rings & crosshairs
 * - Sharp, angular mecha faceplates & visors
 * - Studio lighting gradients
 * - Sleek typography overlays
 */

// ─── Deterministic RNG ─────────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
  let s = (seed ^ 0xdeadbeef) >>> 0;
  return () => {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= s >>> 16;
    return (s >>> 0) / 0xffffffff;
  };
}

function hashAgentId(id: string): number {
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h, 33) ^ id.charCodeAt(i);
  }
  return h >>> 0;
}

// ─── Color Palettes (Anime / Cyberpunk Themes) ──────────────────────────────

type Palette = {
  name: string;
  bgDark: string;
  bgLight: string;
  armorPrimary: string;
  armorSecondary: string;
  armorDark: string;
  visorGlow: string;
  accent: string;
  hudBase: string;
};

const PALETTES: Palette[] = [
  // GHOST (Stark White & Electric Blue - Shirow/Ghost in the Shell vibe)
  { name: "GHOST", bgDark: "#040508", bgLight: "#121826", armorPrimary: "#f8fafc", armorSecondary: "#cbd5e1", armorDark: "#1e293b", visorGlow: "#00f0ff", accent: "#3b82f6", hudBase: "#00f0ff" },
  // AKIRA (Crimson & Gold - Classic 80s/90s Anime)
  { name: "AKIRA", bgDark: "#0a0202", bgLight: "#1a0808", armorPrimary: "#e11d48", armorSecondary: "#be123c", armorDark: "#171717", visorGlow: "#fbbf24", accent: "#f59e0b", hudBase: "#f43f5e" },
  // UNIT-01 (Purple & Neon Green - Evangelion)
  { name: "UNIT-01", bgDark: "#05020a", bgLight: "#130826", armorPrimary: "#6d28d9", armorSecondary: "#4c1d95", armorDark: "#111827", visorGlow: "#22c55e", accent: "#fb923c", hudBase: "#22c55e" },
  // NIGHT_CITY (Obsidian & Yellow - Cyberpunk)
  { name: "KURO", bgDark: "#000000", bgLight: "#0f0f0f", armorPrimary: "#18181b", armorSecondary: "#27272a", armorDark: "#09090b", visorGlow: "#facc15", accent: "#eab308", hudBase: "#facc15" },
  // ASTRAL (Deep Space Blue & Neon Pink - Trigger Studio vibe)
  { name: "ASTRAL", bgDark: "#020617", bgLight: "#0f172a", armorPrimary: "#1d4ed8", armorSecondary: "#1e3a8a", armorDark: "#020617", visorGlow: "#f472b6", accent: "#ec4899", hudBase: "#f472b6" },
  // ZERO (Glazier White & Crimson)
  { name: "ZERO", bgDark: "#0a0a0c", bgLight: "#18181b", armorPrimary: "#e4e4e7", armorSecondary: "#a1a1aa", armorDark: "#27272a", visorGlow: "#ef4444", accent: "#dc2626", hudBase: "#ef4444" },
];

// ─── SVG Building Blocks ────────────────────────────────────────────────────

type RNG = () => number;

function drawBackground(p: Palette): string {
  return `
    <!-- Dark deep background -->
    <rect width="400" height="400" fill="${p.bgDark}"/>
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="${p.bgLight}"/>
      <stop offset="100%" stop-color="${p.bgDark}" stop-opacity="0.8"/>
    </radialGradient>
    <rect width="400" height="400" fill="url(#bgGrad)"/>
    
    <!-- Subtle Grid Base -->
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${p.hudBase}" stroke-width="0.5" opacity="0.05"/>
    </pattern>
    <rect width="400" height="400" fill="url(#grid)"/>
  `;
}

function drawHUD(rng: RNG, p: Palette): string {
  // Generate random data strings for the HUD
  const data1 = (rng() * 10000).toFixed(2);
  const data2 = Math.floor(rng() * 999);
  
  return `
    <g opacity="0.4" font-family="monospace" font-size="8" fill="${p.hudBase}">
      <!-- Outer HUD Rings -->
      <circle cx="200" cy="200" r="140" fill="none" stroke="${p.hudBase}" stroke-width="0.5" opacity="0.3" stroke-dasharray="2 6"/>
      <circle cx="200" cy="200" r="145" fill="none" stroke="${p.hudBase}" stroke-width="1" opacity="0.1"/>
      
      <!-- Tech crosshairs -->
      <path d="M200 45 L200 55 M200 345 L200 355 M45 200 L55 200 M345 200 L355 200" stroke="${p.hudBase}" stroke-width="1.5" opacity="0.6"/>
      
      <!-- Side data blocks -->
      <text x="30" y="80">SYS.ON</text>
      <text x="30" y="92">SYNC: ${data1}</text>
      <path d="M30 100 L70 100 L80 110 L80 150" fill="none" stroke="${p.hudBase}" stroke-width="0.8" opacity="0.5"/>
      <circle cx="30" cy="100" r="2" fill="${p.hudBase}"/>

      <text x="370" y="320" text-anchor="end">OPR:${data2}</text>
      <text x="370" y="332" text-anchor="end">READY</text>
      <path d="M370 300 L330 300 L320 290 L320 250" fill="none" stroke="${p.hudBase}" stroke-width="0.8" opacity="0.5"/>
      <circle cx="370" cy="300" r="2" fill="${p.hudBase}"/>
    </g>
  `;
}

// ─── Mecha Head Designs (Angular, Sharp, Anime Style) ────────────────────────

const MECH_HEADS = [
  // STYLE 0: EVANGELION / DRAGOON (Sharp chin, tall horn, glowing V visor)
  (p: Palette) => `
    <!-- Neck -->
    <path d="M160 280 L160 360 L240 360 L240 280 Z" fill="${p.armorDark}"/>
    <path d="M170 280 L170 360 M185 280 L185 360 M215 280 L215 360 M230 280 L230 360" stroke="${p.bgDark}" stroke-width="3"/>
    
    <!-- Jaw & Lower Faceplate -->
    <path d="M150 240 L170 290 L200 310 L230 290 L250 240 L200 250 Z" fill="${p.armorSecondary}"/>
    <path d="M170 290 L200 310 L230 290 L200 270 Z" fill="${p.armorDark}"/>
    
    <!-- Main Helmet Dome -->
    <path d="M130 160 Q200 80 270 160 L280 220 L240 260 L160 260 L120 220 Z" fill="${p.armorPrimary}"/>
    
    <!-- Helmet Highlights / Cutlines -->
    <path d="M160 140 Q200 100 240 140" fill="none" stroke="${p.armorSecondary}" stroke-width="2"/>
    <path d="M200 105 L200 160" fill="none" stroke="${p.armorSecondary}" stroke-width="2"/>
    
    <!-- Cheek Armor Plates -->
    <path d="M120 210 L150 260 L160 280 L140 250 L110 210 Z" fill="${p.accent}"/>
    <path d="M280 210 L250 260 L240 280 L260 250 L290 210 Z" fill="${p.accent}"/>
    
    <!-- V-Visor Glow -->
    <g filter="url(#intenseGlow)">
      <path d="M140 210 L200 250 L260 210 L240 190 L200 220 L160 190 Z" fill="${p.visorGlow}"/>
    </g>
    <!-- Visor Core (White hot center) -->
    <path d="M150 210 L200 240 L250 210 L240 200 L200 220 L160 200 Z" fill="#ffffff" opacity="0.8"/>
    
    <!-- Center Horn -->
    <path d="M195 160 L200 60 L205 160 Z" fill="${p.accent}"/>
    <path d="M200 60 L205 160 L200 160 Z" fill="${p.armorDark}" opacity="0.3"/>
  `,

  // STYLE 1: RONIN (Wide cyber-brim, single horizontal eye slit)
  (p: Palette) => `
    <!-- Neck/Collar completely encasing -->
    <path d="M140 250 L140 370 L120 380 L280 380 L260 370 L260 250 Z" fill="${p.armorDark}"/>
    <!-- Collar internal details-->
    <path d="M150 280 L200 320 L250 280" fill="none" stroke="${p.armorSecondary}" stroke-width="8"/>
    
    <!-- Lower Face (Mouth-plate mask) -->
    <path d="M155 230 L165 290 L200 310 L235 290 L245 230 Z" fill="${p.armorPrimary}"/>
    <!-- Vent slits on mouth -->
    <line x1="180" y1="270" x2="220" y2="270" stroke="${p.armorDark}" stroke-width="3"/>
    <line x1="185" y1="285" x2="215" y2="285" stroke="${p.armorDark}" stroke-width="3"/>

    <!-- Wide Brim Cyber Hat / Upper Helmet -->
    <path d="M60 190 Q200 130 340 190 L320 220 Q200 160 80 220 Z" fill="${p.armorDark}"/>
    <path d="M80 180 Q200 110 320 180 L200 150 Z" fill="${p.armorSecondary}"/>
    
    <!-- Dome under hat -->
    <path d="M160 160 Q200 90 240 160 Z" fill="${p.armorPrimary}"/>

    <!-- Horizontal Glowing Visor -->
    <g filter="url(#intenseGlow)">
      <rect x="150" y="215" width="100" height="12" rx="4" fill="${p.visorGlow}"/>
    </g>
    <rect x="155" y="217" width="90" height="8" rx="2" fill="#ffffff" opacity="0.9"/>
    
    <!-- Single optic sensor in the visor -->
    <circle cx="200" cy="221" r="5" fill="${p.armorDark}"/>
    <circle cx="200" cy="221" r="2" fill="${p.accent}"/>
  `,

  // STYLE 2: GUNDAM / VALKYRIE (Aerodynamic, complex multi-color framing, double eyes)
  (p: Palette) => `
    <!-- Neck -->
    <path d="M165 260 L165 350 L235 350 L235 260 Z" fill="${p.armorSecondary}"/>
    
    <!-- Chin block -->
    <path d="M185 285 L200 310 L215 285 L200 270 Z" fill="${p.accent}"/>
    
    <!-- Cheeks Base -->
    <path d="M140 220 L170 290 L200 270 L230 290 L260 220 Z" fill="${p.armorPrimary}"/>
    
    <!-- Helmet Crown -->
    <path d="M140 150 C140 80 260 80 260 150 L280 200 L240 210 L160 210 L120 200 Z" fill="${p.armorPrimary}"/>
    <path d="M150 150 C150 90 250 90 250 150 L200 130 Z" fill="${p.armorSecondary}"/>
    
    <!-- V-Fin (Antenna) -->
    <path d="M200 160 L130 90 L145 85 L200 140 L255 85 L270 90 Z" fill="${p.accent}"/>
    <path d="M200 160 L200 140 L270 90 L255 85 Z" fill="${p.armorDark}" opacity="0.4"/>

    <!-- Angry Eyes (Visors) -->
    <g filter="url(#intenseGlow)">
      <path d="M155 190 L195 200 L195 185 L150 180 Z" fill="${p.visorGlow}"/>
      <path d="M245 190 L205 200 L205 185 L250 180 Z" fill="${p.visorGlow}"/>
    </g>
    <!-- Eye cores -->
    <path d="M165 190 L190 195 L190 188 Z" fill="#ffffff" opacity="0.9"/>
    <path d="M235 190 L210 195 L210 188 Z" fill="#ffffff" opacity="0.9"/>
    
    <!-- Center Noseplate overlapping eyes -->
    <path d="M195 170 L205 170 L210 220 L200 230 L190 220 Z" fill="${p.armorDark}"/>
  `,

  // STYLE 3: TITAN (Heavy blocky front, thick armor, horizontal slit)
  (p: Palette) => `
    <!-- Massive Neck / Traps -->
    <path d="M100 360 L140 250 L260 250 L300 360 Z" fill="${p.armorDark}"/>
    <path d="M120 360 L150 270 L180 340 Z" fill="${p.armorSecondary}" opacity="0.5"/>
    <path d="M280 360 L250 270 L220 340 Z" fill="${p.armorSecondary}" opacity="0.5"/>

    <!-- Heavy Jaw Profile -->
    <path d="M130 220 L130 290 L170 320 L230 320 L270 290 L270 220 Z" fill="${p.armorPrimary}"/>
    <path d="M160 290 L160 380 M240 290 L240 380" stroke="${p.armorSecondary}" stroke-width="4"/>

    <!-- Blocky Helmet Top -->
    <path d="M130 140 L270 140 L280 200 L250 230 L150 230 L120 200 Z" fill="${p.armorPrimary}"/>
    <!-- Top Armor Plating details -->
    <path d="M150 140 L160 100 L240 100 L250 140 Z" fill="${p.armorSecondary}"/>
    <rect x="180" y="110" width="40" height="20" fill="${p.accent}"/>

    <!-- Helmet Side Vents -->
    <rect x="110" y="170" width="20" height="60" rx="4" fill="${p.armorDark}"/>
    <rect x="270" y="170" width="20" height="60" rx="4" fill="${p.armorDark}"/>

    <!-- Deep Glowing Slit Visor -->
    <rect x="140" y="200" width="120" height="18" fill="${p.armorDark}"/>
    <g filter="url(#intenseGlow)">
      <rect x="150" y="206" width="100" height="6" fill="${p.visorGlow}"/>
    </g>
    <rect x="160" y="207" width="80" height="4" fill="#ffffff" opacity="0.9"/>
  `
];

// ─── Shoulders / Torso Armor (Mech plating) ──────────────────────────────────

const MECH_TORSO = [
  // Heavy angular pauldrons
  (p: Palette) => `
    <path d="M0 400 L0 320 L80 280 L160 340 L160 400 Z" fill="${p.armorPrimary}"/>
    <path d="M400 400 L400 320 L320 280 L240 340 L240 400 Z" fill="${p.armorPrimary}"/>
    
    <!-- Pauldron accents -->
    <path d="M20 330 L80 295 L140 345 L140 400 L20 400 Z" fill="${p.armorSecondary}"/>
    <path d="M380 330 L320 295 L260 345 L260 400 L380 400 Z" fill="${p.armorSecondary}"/>
    
    <!-- Glowing joint nodes -->
    <circle cx="80" cy="320" r="15" fill="${p.armorDark}"/>
    <circle cx="80" cy="320" r="6" fill="${p.accent}" filter="url(#intenseGlow)"/>
    <circle cx="320" cy="320" r="15" fill="${p.armorDark}"/>
    <circle cx="320" cy="320" r="6" fill="${p.accent}" filter="url(#intenseGlow)"/>
  `,
  // Sleek aerodynamic wings/shoulders
  (p: Palette) => `
    <path d="M150 400 L120 310 L40 340 L0 300 L0 400 Z" fill="${p.armorPrimary}"/>
    <path d="M250 400 L280 310 L360 340 L400 300 L400 400 Z" fill="${p.armorPrimary}"/>
    
    <path d="M110 320 L140 400 L0 400 Z" fill="${p.armorDark}"/>
    <path d="M290 320 L260 400 L400 400 Z" fill="${p.armorDark}"/>
    
    <!-- Neon stripes -->
    <line x1="100" y1="330" x2="40" y2="350" stroke="${p.visorGlow}" stroke-width="4" filter="url(#glow)"/>
    <line x1="300" y1="330" x2="360" y2="350" stroke="${p.visorGlow}" stroke-width="4" filter="url(#glow)"/>
  `
];

// ─── Post-processing & UI Overlays ──────────────────────────────────────────

function drawTexturesAndUI(rng: RNG, p: Palette, archetype: string): string {
  const hash = (rng() * 0xffffff | 0).toString(16).toUpperCase().padStart(6, "0");
  const rank = ["S", "A", "B", "C"][Math.floor(rng() * 4)];
  
  return `
    <!-- Film Grain / Matte Texture Overlay -->
    <rect width="400" height="400" fill="url(#noise)" opacity="0.45" style="mix-blend-mode: overlay; pointer-events: none;"/>
    
    <!-- Scanlines -->
    <pattern id="scanlines" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="2" fill="#000000" opacity="0.15"/>
    </pattern>
    <rect width="400" height="400" fill="url(#scanlines)" style="pointer-events: none;"/>

    <!-- Premium Holographic Frame & Borders -->
    <rect x="10" y="10" width="380" height="380" fill="none" stroke="${p.hudBase}" stroke-width="1.5" opacity="0.3"/>
    <!-- Corner brackets -->
    <path d="M10 40 L10 10 L40 10" fill="none" stroke="${p.visorGlow}" stroke-width="3" opacity="0.8"/>
    <path d="M390 40 L390 10 L360 10" fill="none" stroke="${p.visorGlow}" stroke-width="3" opacity="0.8"/>
    <path d="M10 360 L10 390 L40 390" fill="none" stroke="${p.visorGlow}" stroke-width="3" opacity="0.8"/>
    <path d="M390 360 L390 390 L360 390" fill="none" stroke="${p.visorGlow}" stroke-width="3" opacity="0.8"/>
    
    <!-- Vertical Typography (Very Anime/Editorial) -->
    <text x="-370" y="28" transform="rotate(-90)" font-family="sans-serif" font-weight="900" font-size="14" fill="${p.hudBase}" opacity="0.4" letter-spacing="4">NEURAL // ARCHITECTURE</text>
    
    <!-- Agent Name & Stats Block (Bottom) -->
    <rect x="10" y="340" width="380" height="50" fill="${p.bgDark}" opacity="0.85"/>
    <line x1="10" y1="340" x2="390" y2="340" stroke="${p.accent}" stroke-width="2"/>
    
    <text x="25" y="365" font-family="sans-serif" font-weight="900" font-size="20" fill="#ffffff" letter-spacing="1">${archetype}</text>
    <text x="25" y="380" font-family="monospace" font-size="10" fill="${p.visorGlow}">UNIT ID: 0x${hash}</text>
    
    <!-- Rank Badge -->
    <rect x="345" y="350" width="30" height="30" fill="${p.accent}"/>
    <text x="360" y="372" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="22" fill="${p.bgDark}">${rank}</text>
    <text x="360" y="345" text-anchor="middle" font-family="monospace" font-size="8" fill="${p.hudBase}">CLASS</text>
  `;
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export function getCyberpunkAgentSVG(agentId: string): string {
  const hash = hashAgentId(agentId || "vessel-agent");
  const rng = seededRandom(hash);

  const p = PALETTES[Math.floor(rng() * PALETTES.length)];
  const headFn = MECH_HEADS[Math.floor(rng() * MECH_HEADS.length)];
  const torsoFn = MECH_TORSO[Math.floor(rng() * MECH_TORSO.length)];

  // For the display name on the card
  const archetypes = ["STRIKER", "PHANTOM", "ORACLE", "NEXUS", "WARDEN", "CIPHER"];
  const archetype = archetypes[Math.floor(rng() * archetypes.length)];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <!-- Studio Lighting Filters -->
    <filter id="intenseGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" result="blur1"/>
      <feGaussianBlur stdDeviation="15" result="blur2"/>
      <feMerge>
        <feMergeNode in="blur2"/>
        <feMergeNode in="blur1"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    
    <!-- Premium Matte Anime Texture Overlay -->
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch"/>
    </filter>
    <pattern id="noise" width="400" height="400" patternUnits="userSpaceOnUse">
      <rect width="400" height="400" filter="url(#noiseFilter)"/>
    </pattern>
    <clipPath id="frame"><rect width="400" height="400"/></clipPath>
  </defs>

  <g clip-path="url(#frame)">
    ${drawBackground(p)}
    ${drawHUD(rng, p)}
    
    <!-- Mecha Character Group -->
    <g transform="translate(0, 15)">
      ${torsoFn(p)}
      ${headFn(p)}
    </g>

    ${drawTexturesAndUI(rng, p, archetype)}
  </g>
</svg>`;
}

export function getCyberpunkAgentDataUrl(agentId: string): string {
  const svg = getCyberpunkAgentSVG(agentId || "fallback-agent");
  // Encode carefully to handle `#` avoiding manual escapes if possible, 
  // but encodeURIComponent easily covers everything
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
