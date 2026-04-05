/**
 * Premium Pixel Art Cyberpunk cNFT Avatars
 * Hand-crafted 16x16 pixel art sprites - each animal is clearly distinguishable
 * Vibrant gradient backgrounds, neon accents, cyberpunk aesthetic
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

const PALETTES = [
  { bg1: "#1a0a2e", bg2: "#4a1942", accent: "#ff0066", neon: "#00f5ff", dark: "#0a0a12", mid: "#2a1a4e" },
  { bg1: "#0a1628", bg2: "#1a3a5c", accent: "#00e5ff", neon: "#ff00aa", dark: "#050510", mid: "#0a2a4a" },
  { bg1: "#0d0d2b", bg2: "#1a237e", accent: "#7c4dff", neon: "#00ff88", dark: "#050515", mid: "#1a1a4e" },
  { bg1: "#1b0a2e", bg2: "#4a148c", accent: "#d500f9", neon: "#ff6b35", dark: "#0a0515", mid: "#3a1a5e" },
  { bg1: "#0a1a1a", bg2: "#004d40", accent: "#00e676", neon: "#ff0066", dark: "#050a0a", mid: "#0a3a3a" },
  { bg1: "#1a0a0a", bg2: "#b71c1c", accent: "#ff5252", neon: "#ffab40", dark: "#0a0505", mid: "#4a1a1a" },
  { bg1: "#0a0a2e", bg2: "#283593", accent: "#536dfe", neon: "#40c4ff", dark: "#050515", mid: "#1a1a5e" },
  { bg1: "#1a0a28", bg2: "#6a1b9a", accent: "#e040fb", neon: "#00f5ff", dark: "#0a0510", mid: "#3a1a4e" },
  { bg1: "#0d1b2a", bg2: "#1b5e20", accent: "#69f0ae", neon: "#ff0066", dark: "#050a0a", mid: "#1a3a1a" },
  { bg1: "#2a0a1a", bg2: "#c62828", accent: "#ff5252", neon: "#ff8a65", dark: "#0a0505", mid: "#5a1a2a" },
  { bg1: "#0a1a2e", bg2: "#0277bd", accent: "#00e5ff", neon: "#84ffff", dark: "#050a15", mid: "#0a3a5e" },
  { bg1: "#1a0a2e", bg2: "#6a1b9a", accent: "#ea80fc", neon: "#ff80ab", dark: "#0a0515", mid: "#3a1a5e" },
  { bg1: "#0a2a1a", bg2: "#2e7d32", accent: "#b9f6ca", neon: "#69f0ae", dark: "#050a05", mid: "#1a4a2a" },
  { bg1: "#2a1a0a", bg2: "#e65100", accent: "#ff9100", neon: "#ffab40", dark: "#0a0a05", mid: "#5a3a1a" },
  { bg1: "#0a0a1a", bg2: "#311b92", accent: "#7c4dff", neon: "#b388ff", dark: "#050510", mid: "#1a1a4e" },
];

// 16x16 pixel art sprites (hand-crafted for clear recognition)
// Format: array of 16 strings, each 16 chars
// Colors: .=bg, D=dark, M=mid, A=accent, N=neon, W=white
const SPRITES: Record<string, string[]> = {
  wolf: [
    "................",
    "......NN..NN....",
    ".....NNNN.NNNN...",
    "....NNNN..NNNN...",
    "....AAAA.AAAA....",
    "....AAAAAAAAA....",
    "...AAAAAAAAAAA...",
    "...AA.WW..WW.AA..",
    "...AA.WW..WW.AA..",
    "...AAAAAAAAAAA...",
    "....AAAAAAAAA....",
    ".....A.DD.A.....",
    "......AAAA......",
    ".......AA.......",
    "................",
    "................",
  ],
  cat: [
    "................",
    "....NN....NN....",
    "....NN....NN....",
    "....AA....AA....",
    "....AAAAAAAA....",
    "...AAAAAAAAAA...",
    "...AA.WW..WW.AA..",
    "...AA.WW..WW.AA..",
    "...AAAAAAAAAAA...",
    "....A.NNN.A.....",
    ".....AN.NA......",
    "......AAAA......",
    ".....NN..NN.....",
    "....NN....NN....",
    "................",
    "................",
  ],
  fox: [
    "................",
    ".....NN..NN.....",
    "....NNNNNNNN....",
    "....AAAAAAAA....",
    "...AAAAAAAAAA...",
    "...AA.WW..WW.AA..",
    "...AA.WW..WW.AA..",
    "...AAAAAAAAAAA...",
    "....AAAAAAAAA....",
    ".....A.DD.A.....",
    "......AAAA......",
    ".......AA.......",
    "......AAAA......",
    ".....AAAAAA.....",
    "................",
    "................",
  ],
  owl: [
    "................",
    "....NN....NN....",
    "....AA....AA....",
    "...AAAAAAAAAA...",
    "..AA.NNNN.NN.AA..",
    "..AA.NNNN.NN.AA..",
    "..AA.WWWW.WW.AA..",
    "..AA.WWWW.WW.AA..",
    "..AA.NNNN.NN.AA..",
    "..AA.NNNN.NN.AA..",
    "...AAAAAAAAAA...",
    "....A.NNN.A.....",
    ".....AAAAA......",
    "......AAA.......",
    "................",
    "................",
  ],
  dragon: [
    "................",
    "...NN......NN...",
    "..NNNN....NNNN..",
    "..AAAAAAAAAAAA..",
    "..AA.WW..WW.AA..",
    "..AA.WW..WW.AA..",
    "..AAAAAAAAAAAA..",
    "...A.DDDD.A.....",
    "....AAAAAA......",
    ".....NNNN.......",
    "....NN..NN......",
    "...NN....NN.....",
    "................",
    "................",
    "................",
    "................",
  ],
  panda: [
    "................",
    "....DD....DD....",
    "....DD....DD....",
    "...AAAAAAAAAA...",
    "..AA.DDDD.DD.AA..",
    "..AA.DN..ND.AA..",
    "..AA.DN..ND.AA..",
    "..AA.DDDD.DD.AA..",
    "..AA.A.NN.A.AA..",
    "...AAAAAAAAAA...",
    "....A.DD.A......",
    ".....AAAA.......",
    "......AA........",
    "................",
    "................",
    "................",
  ],
  lion: [
    "................",
    "...AAAAAAAAAA...",
    "..AAA.AAAA.AAA..",
    ".AA..AAAA..AA...",
    "..AA.AAAA.AA....",
    "..AA.WW..WW.AA..",
    "..AA.WW..WW.AA..",
    "..AA.AAAA.AA....",
    ".AA..AAAA..AA...",
    "..AAA.AAAA.AAA..",
    "...AAAAAAAAAA...",
    "....A.DD.A......",
    ".....AAAA.......",
    "......AA........",
    "................",
    "................",
  ],
  robot: [
    "................",
    "......NN........",
    "......AA........",
    "....AAAAAAAA....",
    "...ANNNNNNNA....",
    "...AN.WW.W.NA...",
    "...AN.WW.W.NA...",
    "...ANNNNNNNA....",
    "...A.NNNN.A.....",
    "...A.NNNN.A.....",
    "...AAAAAAAAAA...",
    "................",
    "................",
    "................",
    "................",
    "................",
  ],
  snake: [
    "................",
    "................",
    "................",
    ".....AAAAAA.....",
    "....AA.WW.AA....",
    "....AA.WW.AA....",
    ".....AAAAAA.....",
    "......AAAA......",
    "......A..A......",
    ".....AA..AA.....",
    ".....AA..AA.....",
    "....AAA..AAA....",
    "................",
    "................",
    "................",
    "................",
  ],
  eagle: [
    "................",
    "................",
    "...AA......AA...",
    "..AAAA....AAAA..",
    ".AAAAAAAAAAAAAA.",
    ".AA.WW....WW.AA.",
    ".AA.WW....WW.AA.",
    ".AAAAAAAAAAAAAA.",
    "..AA.AAAA.AA....",
    "...A.NNN.A......",
    "....AAAAAA......",
    ".....AAAA.......",
    "................",
    "................",
    "................",
    "................",
  ],
};

const ANIMAL_NAMES = Object.keys(SPRITES);

export function generateCyberpunkCNFT(agentId: string): string {
  if (typeof document === "undefined") return "";

  const hash = hashAgentId(agentId);
  const rng = seededRandom(hash);

  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d")!;

  const palette = PALETTES[Math.floor(rng() * PALETTES.length)];
  const animalName = ANIMAL_NAMES[Math.floor(rng() * ANIMAL_NAMES.length)];
  const sprite = SPRITES[animalName];
  const pixelSize = 400 / 16;

  // Pixelated gradient background
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const t = (x + y) / 32;
      const r1 = parseInt(palette.bg1.slice(1, 3), 16);
      const g1 = parseInt(palette.bg1.slice(3, 5), 16);
      const b1 = parseInt(palette.bg1.slice(5, 7), 16);
      const r2 = parseInt(palette.bg2.slice(1, 3), 16);
      const g2 = parseInt(palette.bg2.slice(3, 5), 16);
      const b2 = parseInt(palette.bg2.slice(5, 7), 16);
      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }

  // Pixel grid
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= 400; x += pixelSize) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 400); ctx.stroke();
  }
  for (let y = 0; y <= 400; y += pixelSize) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(400, y); ctx.stroke();
  }

  // Background glow
  for (let i = 0; i < 4; i++) {
    const gx = Math.floor(rng() * 16) * pixelSize;
    const gy = Math.floor(rng() * 16) * pixelSize;
    const gr = pixelSize * (2 + rng() * 4);
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    grad.addColorStop(0, palette.neon + "20");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);
  }

  // Target circles
  ctx.strokeStyle = palette.neon + "12";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath(); ctx.arc(200, 180, i * 50, 0, Math.PI * 2); ctx.stroke();
  }

  // Draw sprite pixels (centered, scaled up)
  const spriteOffsetX = 0;
  const spriteOffsetY = 0;

  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const char = sprite[y][x];
      if (char === ".") continue;

      let color: string;
      switch (char) {
        case "D": color = palette.dark; break;
        case "M": color = palette.mid; break;
        case "A": color = palette.accent; break;
        case "N": color = palette.neon; break;
        case "W": color = "#ffffff"; break;
        default: continue;
      }

      ctx.fillStyle = color;
      ctx.fillRect(
        (x + spriteOffsetX) * pixelSize,
        (y + spriteOffsetY) * pixelSize,
        pixelSize + 0.5,
        pixelSize + 0.5
      );
    }
  }

  // Pixel stars
  for (let i = 0; i < 8; i++) {
    const sx = Math.floor(rng() * 16) * pixelSize;
    const sy = Math.floor(rng() * 16) * pixelSize;
    ctx.fillStyle = rng() > 0.5 ? palette.neon : palette.accent;
    ctx.fillRect(sx - pixelSize * 0.5, sy, pixelSize * 2, pixelSize * 0.5);
    ctx.fillRect(sx, sy - pixelSize * 0.5, pixelSize * 0.5, pixelSize * 2);
  }

  // Animal name label
  ctx.fillStyle = palette.neon + "20";
  ctx.fillRect(120, 330, 160, 24);
  ctx.strokeStyle = palette.neon + "35";
  ctx.lineWidth = 1;
  ctx.strokeRect(120, 330, 160, 24);
  ctx.font = `bold ${Math.floor(pixelSize * 1.2)}px monospace`;
  ctx.fillStyle = palette.neon;
  ctx.textAlign = "center";
  ctx.fillText(animalName.toUpperCase(), 200, 348);

  // ID hash
  ctx.font = `${Math.floor(pixelSize * 0.8)}px monospace`;
  ctx.fillStyle = palette.neon + "30";
  ctx.fillText(`#${agentId.slice(0, 6).toUpperCase()}`, 200, 380);

  // Scanlines
  ctx.fillStyle = "#00000012";
  for (let y = 0; y < 400; y += pixelSize * 2) {
    ctx.fillRect(0, y, 400, pixelSize);
  }

  // Frame corners
  const m = 12, b = 20;
  ctx.strokeStyle = palette.neon + "35";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(m, m + b); ctx.lineTo(m, m); ctx.lineTo(m + b, m); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(400 - m - b, m); ctx.lineTo(400 - m, m); ctx.lineTo(400 - m, m + b); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(m, 400 - m - b); ctx.lineTo(m, 400 - m); ctx.lineTo(m + b, 400 - m); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(400 - m - b, 400 - m); ctx.lineTo(400 - m, 400 - m); ctx.lineTo(400 - m, 400 - m - b); ctx.stroke();

  return canvas.toDataURL("image/png", 0.95);
}
