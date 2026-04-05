/**
 * Premium Pixel Art Cyberpunk cNFT Avatars
 * Authentic retro pixel art style with vibrant gradients and neon elements
 * Procedurally generates unique pixel art animals on colorful gradient backgrounds
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

type PixelGrid = number[][];
const BG = 0, DARK = 1, MID = 2, ACCENT = 3, NEON = 4, WHITE = 5;

function makeGrid(): PixelGrid {
  return Array.from({ length: 32 }, () => Array(32).fill(BG));
}

function drawEllipse(grid: PixelGrid, cx: number, cy: number, rx: number, ry: number, color: number): void {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
        grid[y][x] = color;
      }
    }
  }
}

function drawRect(grid: PixelGrid, x: number, y: number, w: number, h: number, color: number): void {
  for (let row = y; row < y + h && row < 32; row++) {
    for (let col = x; col < x + w && col < 32; col++) {
      if (row >= 0 && col >= 0) grid[row][col] = color;
    }
  }
}

function drawCircle(grid: PixelGrid, cx: number, cy: number, r: number, color: number): void {
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) grid[y][x] = color;
    }
  }
}

function drawPixelAnimal(grid: PixelGrid, type: number, p: typeof PALETTES[0], rng: () => number): void {
  const cx = 16, cy = 14;
  
  switch (type) {
    case 0: { // Wolf
      // Ears (pointy triangles)
      for (let y = 3; y < 10; y++) {
        const w = Math.max(1, 5 - Math.floor((y - 3) / 2));
        for (let x = cx - 10 - w; x <= cx - 10 + w; x++) {
          if (x >= 0 && x < 32) grid[y][x] = ACCENT;
        }
        for (let x = cx + 10 - w; x <= cx + 10 + w; x++) {
          if (x >= 0 && x < 32) grid[y][x] = ACCENT;
        }
      }
      // Inner ears
      for (let y = 4; y < 9; y++) {
        for (let x = cx - 11; x <= cx - 9; x++) if (x >= 0) grid[y][x] = NEON;
        for (let x = cx + 9; x <= cx + 11; x++) if (x < 32) grid[y][x] = NEON;
      }
      // Head
      drawEllipse(grid, cx, cy, 12, 10, MID);
      drawEllipse(grid, cx, cy, 12, 10, ACCENT);
      drawEllipse(grid, cx, cy, 10, 8, MID);
      // Snout
      drawEllipse(grid, cx, cy + 6, 6, 4, MID);
      // Nose
      drawRect(grid, cx - 3, cy + 9, 6, 3, DARK);
      // Eyes
      drawCircle(grid, cx - 5, cy - 2, 3, NEON);
      drawCircle(grid, cx + 5, cy - 2, 3, NEON);
      drawRect(grid, cx - 6, cy - 2, 2, 2, DARK);
      drawRect(grid, cx + 5, cy - 2, 2, 2, DARK);
      // Cyber lines
      grid[cy - 5][cx - 9] = NEON; grid[cy - 4][cx - 9] = NEON;
      grid[cy - 5][cx + 9] = NEON; grid[cy - 4][cx + 9] = NEON;
      break;
    }
    case 1: { // Fox
      // Pointy ears
      for (let y = 2; y < 11; y++) {
        const w = Math.max(1, 6 - Math.floor((y - 2) / 2));
        for (let x = cx - 8 - w; x <= cx - 8 + w; x++) if (x >= 0 && x < 32) grid[y][x] = ACCENT;
        for (let x = cx + 8 - w; x <= cx + 8 + w; x++) if (x >= 0 && x < 32) grid[y][x] = ACCENT;
      }
      // Head (triangular)
      for (let y = 8; y < 24; y++) {
        const w = Math.max(2, 14 - Math.floor((y - 8) / 2));
        for (let x = cx - w; x <= cx + w; x++) if (x >= 0 && x < 32) grid[y][x] = MID;
      }
      // Face
      for (let y = 10; y < 20; y++) {
        const w = Math.max(1, 10 - Math.floor((y - 10) / 2));
        for (let x = cx - w; x <= cx + w; x++) if (x >= 0 && x < 32) grid[y][x] = ACCENT;
      }
      // Eyes
      drawCircle(grid, cx - 6, cy - 2, 3, NEON);
      drawCircle(grid, cx + 6, cy - 2, 3, NEON);
      for (let y = cy - 3; y < cy + 1; y++) { grid[y][cx - 6] = DARK; grid[y][cx + 6] = DARK; }
      // Nose
      grid[cy + 10][cx - 1] = DARK; grid[cy + 10][cx] = DARK;
      grid[cy + 10][cx + 1] = DARK;
      // Cyber markings
      grid[cy - 6][cx - 10] = NEON; grid[cy - 5][cx - 10] = NEON;
      grid[cy - 6][cx + 10] = NEON; grid[cy - 5][cx + 10] = NEON;
      break;
    }
    case 2: { // Owl
      // Ear tufts
      drawRect(grid, cx - 9, 3, 5, 7, ACCENT);
      drawRect(grid, cx + 5, 3, 5, 7, ACCENT);
      // Round body
      drawEllipse(grid, cx, cy + 2, 13, 14, MID);
      // Face disc
      drawEllipse(grid, cx, cy - 2, 10, 8, ACCENT);
      // Big eyes
      drawCircle(grid, cx - 5, cy - 3, 5, NEON);
      drawCircle(grid, cx + 5, cy - 3, 5, NEON);
      drawCircle(grid, cx - 5, cy - 3, 3, DARK);
      drawCircle(grid, cx + 5, cy - 3, 3, DARK);
      drawRect(grid, cx - 6, cy - 4, 2, 2, WHITE);
      drawRect(grid, cx + 5, cy - 4, 2, 2, WHITE);
      // Beak
      drawRect(grid, cx - 1, cy + 2, 3, 4, NEON);
      // Cyber circuit
      for (let y = 5; y < 10; y++) { grid[y][cx - 11] = NEON; grid[y][cx + 11] = NEON; }
      break;
    }
    case 3: { // Dragon
      // Horns
      for (let y = 1; y < 10; y++) {
        const w = Math.max(1, 4 - Math.floor((y - 1) / 2));
        for (let x = cx - 10 - w; x <= cx - 10 + w; x++) if (x >= 0) grid[y][x] = ACCENT;
        for (let x = cx + 10 - w; x <= cx + 10 + w; x++) if (x < 32) grid[y][x] = ACCENT;
      }
      // Head
      drawEllipse(grid, cx, cy, 12, 10, MID);
      // Snout
      drawEllipse(grid, cx, cy + 7, 8, 5, ACCENT);
      // Nostrils
      grid[cy + 11][cx - 4] = DARK; grid[cy + 11][cx - 3] = DARK;
      grid[cy + 11][cx + 3] = DARK; grid[cy + 11][cx + 4] = DARK;
      // Eyes
      drawCircle(grid, cx - 5, cy - 2, 4, NEON);
      drawCircle(grid, cx + 5, cy - 2, 4, NEON);
      for (let y = cy - 3; y < cy + 1; y++) { grid[y][cx - 5] = DARK; grid[y][cx + 5] = DARK; }
      // Fire breath
      for (let y = cy + 12; y < cy + 16; y++) {
        for (let x = cx - 5; x < cx + 5; x++) {
          if (rng() > 0.3) grid[y][x] = NEON;
        }
      }
      // Scales
      for (let i = 0; i < 4; i++) {
        const y = cy - 6 + i * 4;
        for (let x = cx - 8; x < cx + 8; x += 4) grid[y][x] = NEON;
      }
      break;
    }
    case 4: { // Cat
      // Pointy ears
      for (let y = 2; y < 11; y++) {
        const w = Math.max(1, 5 - Math.floor((y - 2) / 2));
        for (let x = cx - 9 - w; x <= cx - 9 + w; x++) if (x >= 0) grid[y][x] = ACCENT;
        for (let x = cx + 9 - w; x <= cx + 9 + w; x++) if (x < 32) grid[y][x] = ACCENT;
      }
      // Inner ears
      for (let y = 4; y < 9; y++) {
        for (let x = cx - 10; x <= cx - 8; x++) if (x >= 0) grid[y][x] = NEON;
        for (let x = cx + 8; x <= cx + 10; x++) if (x < 32) grid[y][x] = NEON;
      }
      // Round head
      drawEllipse(grid, cx, cy, 11, 9, MID);
      // Face
      drawEllipse(grid, cx, cy + 1, 8, 6, ACCENT);
      // Big eyes
      drawCircle(grid, cx - 5, cy - 2, 4, NEON);
      drawCircle(grid, cx + 5, cy - 2, 4, NEON);
      for (let y = cy - 4; y < cy + 2; y++) { grid[y][cx - 5] = DARK; grid[y][cx + 5] = DARK; }
      // Nose
      grid[cy + 5][cx - 1] = NEON; grid[cy + 5][cx] = NEON; grid[cy + 5][cx + 1] = NEON;
      // Whiskers
      for (let i = 0; i < 3; i++) {
        grid[cy + 3 + i][cx - 9] = NEON; grid[cy + 3 + i][cx - 10] = NEON;
        grid[cy + 3 + i][cx + 9] = NEON; grid[cy + 3 + i][cx + 10] = NEON;
      }
      break;
    }
    case 5: { // Panda
      // Round ears
      drawCircle(grid, cx - 9, 7, 5, DARK);
      drawCircle(grid, cx + 9, 7, 5, DARK);
      // Round head
      drawEllipse(grid, cx, cy, 12, 11, ACCENT);
      // Eye patches
      drawEllipse(grid, cx - 5, cy - 1, 5, 4, DARK);
      drawEllipse(grid, cx + 5, cy - 1, 5, 4, DARK);
      // Glowing eyes
      drawCircle(grid, cx - 5, cy - 1, 2, NEON);
      drawCircle(grid, cx + 5, cy - 1, 2, NEON);
      drawRect(grid, cx - 6, cy - 2, 2, 2, DARK);
      drawRect(grid, cx + 5, cy - 2, 2, 2, DARK);
      // Nose
      drawRect(grid, cx - 2, cy + 5, 4, 3, DARK);
      // Mouth
      grid[cy + 8][cx - 1] = DARK; grid[cy + 8][cx] = DARK; grid[cy + 8][cx + 1] = DARK;
      grid[cy + 9][cx - 2] = DARK; grid[cy + 9][cx - 1] = DARK; grid[cy + 9][cx] = DARK;
      grid[cy + 9][cx + 1] = DARK; grid[cy + 9][cx + 2] = DARK;
      // Cyber circuit
      for (let y = 5; y < 9; y++) { grid[y][cx - 11] = NEON; grid[y][cx + 11] = NEON; }
      break;
    }
    case 6: { // Lion
      // Mane (spiky circle)
      for (let y = 2; y < 28; y++) {
        for (let x = 2; x < 30; x++) {
          const dx = x - cx;
          const dy = y - 15;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist <= 14 && dist >= 10) grid[y][x] = ACCENT;
          if (dist < 10) grid[y][x] = MID;
        }
      }
      // Face
      drawEllipse(grid, cx, cy, 8, 7, ACCENT);
      // Eyes
      drawCircle(grid, cx - 4, cy - 2, 3, NEON);
      drawCircle(grid, cx + 4, cy - 2, 3, NEON);
      for (let y = cy - 3; y < cy + 1; y++) { grid[y][cx - 4] = DARK; grid[y][cx + 4] = DARK; }
      // Nose
      drawRect(grid, cx - 2, cy + 3, 4, 3, DARK);
      // Mouth
      grid[cy + 6][cx - 1] = DARK; grid[cy + 6][cx] = DARK; grid[cy + 6][cx + 1] = DARK;
      grid[cy + 7][cx - 2] = DARK; grid[cy + 7][cx - 1] = DARK; grid[cy + 7][cx] = DARK;
      grid[cy + 7][cx + 1] = DARK; grid[cy + 7][cx + 2] = DARK;
      // Cyber crown
      grid[4][cx - 4] = NEON; grid[4][cx - 3] = NEON; grid[4][cx + 3] = NEON; grid[4][cx + 4] = NEON;
      grid[3][cx - 3] = NEON; grid[3][cx + 3] = NEON;
      break;
    }
    case 7: { // Robot
      // Square head
      drawRect(grid, 6, 5, 20, 20, MID);
      // Face plate
      drawRect(grid, 8, 7, 16, 16, ACCENT);
      // Antenna
      drawRect(grid, 14, 1, 4, 4, ACCENT);
      drawRect(grid, 13, 0, 6, 2, NEON);
      // Rectangular eyes
      drawRect(grid, 8, 9, 7, 6, NEON);
      drawRect(grid, 17, 9, 7, 6, NEON);
      drawRect(grid, 9, 10, 5, 4, DARK);
      drawRect(grid, 18, 10, 5, 4, DARK);
      // Mouth grill
      drawRect(grid, 9, 17, 14, 5, DARK);
      for (let i = 0; i < 6; i++) {
        drawRect(grid, 10 + i * 2, 17, 1, 5, NEON);
      }
      // Bolts
      grid[6][7] = NEON; grid[6][24] = NEON; grid[24][7] = NEON; grid[24][24] = NEON;
      break;
    }
    case 8: { // Snake
      // Head
      drawEllipse(grid, cx, 9, 7, 5, MID);
      // Coiled body
      drawEllipse(grid, cx, 18, 7, 5, ACCENT);
      drawEllipse(grid, cx, 25, 5, 4, ACCENT);
      // Eyes (slit)
      drawCircle(grid, cx - 4, 8, 3, NEON);
      drawCircle(grid, cx + 4, 8, 3, NEON);
      for (let y = 6; y < 11; y++) { grid[y][cx - 4] = DARK; grid[y][cx + 4] = DARK; }
      // Tongue
      grid[12][cx - 1] = NEON; grid[12][cx] = NEON; grid[12][cx + 1] = NEON;
      grid[13][cx - 2] = NEON; grid[13][cx + 2] = NEON;
      // Scales
      for (let i = 0; i < 4; i++) {
        const y = 14 + i * 3;
        for (let x = cx - 5; x < cx + 5; x += 3) grid[y][x] = NEON;
      }
      break;
    }
    case 9: { // Eagle
      // Wings spread
      drawEllipse(grid, cx - 10, 14, 8, 7, ACCENT);
      drawEllipse(grid, cx + 10, 14, 8, 7, ACCENT);
      // Wing feathers
      for (let i = 0; i < 4; i++) {
        grid[20][2 + i * 3] = NEON; grid[21][2 + i * 3] = NEON;
        grid[20][30 - i * 3] = NEON; grid[21][30 - i * 3] = NEON;
      }
      // Head
      drawEllipse(grid, cx, 10, 7, 6, MID);
      // Beak
      drawRect(grid, cx - 2, 12, 5, 4, NEON);
      // Eyes
      drawCircle(grid, cx - 4, 9, 2, NEON);
      drawCircle(grid, cx + 4, 9, 2, NEON);
      for (let y = 8; y < 11; y++) { grid[y][cx - 4] = DARK; grid[y][cx + 4] = DARK; }
      // Cyber markings
      grid[7][cx - 7] = NEON; grid[8][cx - 7] = NEON;
      grid[7][cx + 7] = NEON; grid[8][cx + 7] = NEON;
      break;
    }
  }
}

export function generateCyberpunkCNFT(agentId: string): string {
  if (typeof document === "undefined") return "";

  const hash = hashAgentId(agentId);
  const rng = seededRandom(hash);

  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext("2d")!;

  const palette = PALETTES[Math.floor(rng() * PALETTES.length)];
  const animalType = Math.floor(rng() * 10);
  const pixelSize = 400 / 32;

  // Pixelated gradient background
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const t = (x + y) / 64;
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
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= 400; x += pixelSize * 2) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 400); ctx.stroke();
  }
  for (let y = 0; y <= 400; y += pixelSize * 2) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(400, y); ctx.stroke();
  }

  // Background glow
  for (let i = 0; i < 3; i++) {
    const gx = Math.floor(rng() * 32) * pixelSize;
    const gy = Math.floor(rng() * 32) * pixelSize;
    const gr = pixelSize * (4 + rng() * 6);
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    grad.addColorStop(0, palette.neon + "15");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);
  }

  // Target circles
  ctx.strokeStyle = palette.neon + "10";
  ctx.lineWidth = 1;
  for (let i = 1; i <= 3; i++) {
    ctx.beginPath(); ctx.arc(200, 180, i * 50, 0, Math.PI * 2); ctx.stroke();
  }

  // Generate and draw animal
  const grid = makeGrid();
  drawPixelAnimal(grid, animalType, palette, rng);

  // Render pixels
  for (let y = 0; y < 32; y++) {
    for (let x = 0; x < 32; x++) {
      const c = grid[y][x];
      if (c === BG) continue;
      let color: string;
      switch (c) {
        case DARK: color = palette.dark; break;
        case MID: color = palette.mid; break;
        case ACCENT: color = palette.accent; break;
        case NEON: color = palette.neon; break;
        case WHITE: color = "#ffffff"; break;
        default: color = palette.dark;
      }
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize + 0.5, pixelSize + 0.5);
    }
  }

  // Pixel stars
  for (let i = 0; i < 10; i++) {
    const sx = Math.floor(rng() * 32) * pixelSize;
    const sy = Math.floor(rng() * 32) * pixelSize;
    ctx.fillStyle = rng() > 0.5 ? palette.neon : palette.accent;
    ctx.fillRect(sx - pixelSize, sy, pixelSize * 3, pixelSize);
    ctx.fillRect(sx, sy - pixelSize, pixelSize, pixelSize * 3);
  }

  // SYS.ONLINE box
  ctx.fillStyle = palette.neon + "15";
  ctx.fillRect(140, 340, 120, 20);
  ctx.strokeStyle = palette.neon + "30";
  ctx.lineWidth = 1;
  ctx.strokeRect(140, 340, 120, 20);
  ctx.font = `${Math.floor(pixelSize)}px monospace`;
  ctx.fillStyle = palette.neon;
  ctx.textAlign = "center";
  ctx.fillText("SYS.ONLINE", 200, 355);

  // ID hash
  ctx.font = `${Math.floor(pixelSize * 0.8)}px monospace`;
  ctx.fillStyle = palette.neon + "30";
  ctx.fillText(`#${agentId.slice(0, 6).toUpperCase()}`, 200, 385);

  // Scanlines
  ctx.fillStyle = "#00000010";
  for (let y = 0; y < 400; y += pixelSize * 2) {
    ctx.fillRect(0, y, 400, pixelSize);
  }

  // Frame corners
  const m = 15, b = 25;
  ctx.strokeStyle = palette.neon + "30";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(m, m + b); ctx.lineTo(m, m); ctx.lineTo(m + b, m); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(400 - m - b, m); ctx.lineTo(400 - m, m); ctx.lineTo(400 - m, m + b); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(m, 400 - m - b); ctx.lineTo(m, 400 - m); ctx.lineTo(m + b, 400 - m); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(400 - m - b, 400 - m); ctx.lineTo(400 - m, 400 - m); ctx.lineTo(400 - m, 400 - m - b); ctx.stroke();

  return canvas.toDataURL("image/png", 0.95);
}
