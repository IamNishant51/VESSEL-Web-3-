/**
 * Background Layer Generators
 * Creates unique backgrounds for agent art using various techniques
 */

import { SeededRandom, fbm, simplex2 } from "./noise";
import type { ColorPalette } from "./palette";

export type BackgroundStyle =
  | "cosmic"
  | "geometric"
  | "nebula"
  | "grid"
  | "radial"
  | "noise"
  | "crystalline"
  | "aurora";

export interface BackgroundConfig {
  style: BackgroundStyle;
  palette: ColorPalette;
  size: number;
  seed: number;
  complexity: number; // 0-1, how intricate
}

/**
 * Draw cosmic/starfield background
 */
function drawCosmic(ctx: CanvasRenderingContext2D, config: BackgroundConfig): void {
  const { palette, size, seed, complexity } = config;
  const rng = new SeededRandom(seed);

  // Base gradient
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.7);
  grad.addColorStop(0, palette.primary + "30");
  grad.addColorStop(0.5, palette.background);
  grad.addColorStop(1, palette.background);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  // Stars
  const starCount = Math.floor(100 + complexity * 300);
  for (let i = 0; i < starCount; i++) {
    const x = rng.nextFloat(0, size);
    const y = rng.nextFloat(0, size);
    const r = rng.nextFloat(0.3, 2.5);
    const alpha = rng.nextFloat(0.2, 0.9);
    const color = rng.pick([palette.highlight, palette.accent, "#ffffff"]);

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, "0");
    ctx.fill();
  }

  // Nebula clouds
  const cloudCount = Math.floor(2 + complexity * 4);
  for (let i = 0; i < cloudCount; i++) {
    const x = rng.nextFloat(size * 0.1, size * 0.9);
    const y = rng.nextFloat(size * 0.1, size * 0.9);
    const radius = rng.nextFloat(size * 0.1, size * 0.35);
    const color = rng.pick([palette.primary, palette.secondary, palette.accent]);

    const cloudGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    cloudGrad.addColorStop(0, color + "25");
    cloudGrad.addColorStop(0.5, color + "10");
    cloudGrad.addColorStop(1, color + "00");
    ctx.fillStyle = cloudGrad;
    ctx.fillRect(0, 0, size, size);
  }
}

/**
 * Draw geometric pattern background
 */
function drawGeometric(ctx: CanvasRenderingContext2D, config: BackgroundConfig): void {
  const { palette, size, seed, complexity } = config;
  const rng = new SeededRandom(seed);

  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, size, size);

  // Hexagonal grid
  const hexSize = Math.floor(30 + (1 - complexity) * 60);
  const hexH = hexSize * 2;
  const hexW = Math.sqrt(3) * hexSize;

  ctx.strokeStyle = palette.primary + "15";
  ctx.lineWidth = 1;

  for (let row = -1; row < size / hexH + 1; row++) {
    for (let col = -1; col < size / (hexW * 0.75) + 1; col++) {
      const x = col * hexW * 0.75;
      const y = row * hexH + (col % 2 === 0 ? 0 : hexH / 2);

      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const hx = x + hexSize * 0.5 * Math.cos(angle);
        const hy = y + hexSize * 0.5 * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Accent dots at intersections
  const dotCount = Math.floor(complexity * 50);
  for (let i = 0; i < dotCount; i++) {
    const x = rng.nextFloat(0, size);
    const y = rng.nextFloat(0, size);
    const r = rng.nextFloat(1, 4);
    const color = rng.pick([palette.accent, palette.highlight]);

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color + "40";
    ctx.fill();
  }
}

/**
 * Draw nebula background
 */
function drawNebula(ctx: CanvasRenderingContext2D, config: BackgroundConfig): void {
  const { palette, size, seed, complexity } = config;

  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, size, size);

  // Multiple overlapping radial gradients for nebula effect
  const layerCount = Math.floor(3 + complexity * 5);
  for (let i = 0; i < layerCount; i++) {
    const t = i / layerCount;
    const x = size * (0.3 + 0.4 * Math.sin(t * Math.PI * 2 + seed * 0.01));
    const y = size * (0.3 + 0.4 * Math.cos(t * Math.PI * 2.7 + seed * 0.013));
    const radius = size * (0.2 + 0.3 * Math.sin(t * Math.PI * 3 + seed * 0.007));
    const color = i % 3 === 0 ? palette.primary : i % 3 === 1 ? palette.secondary : palette.accent;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, color + "20");
    grad.addColorStop(0.4, color + "10");
    grad.addColorStop(0.7, color + "05");
    grad.addColorStop(1, color + "00");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  // Noise overlay for texture
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  const noiseScale = 0.005;

  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const noise = fbm(x * noiseScale, y * noiseScale, 4) * 0.5 + 0.5;
      const idx = (y * size + x) * 4;
      const intensity = Math.floor(noise * 15);
      data[idx] = Math.min(255, data[idx] + intensity);
      data[idx + 1] = Math.min(255, data[idx + 1] + intensity);
      data[idx + 2] = Math.min(255, data[idx + 2] + intensity);
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Draw grid background
 */
function drawGrid(ctx: CanvasRenderingContext2D, config: BackgroundConfig): void {
  const { palette, size, seed, complexity } = config;
  const rng = new SeededRandom(seed);

  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, size, size);

  const gridSize = Math.floor(20 + (1 - complexity) * 40);

  // Perspective grid lines
  ctx.strokeStyle = palette.primary + "12";
  ctx.lineWidth = 0.5;

  // Horizontal lines
  for (let y = 0; y < size; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Vertical lines
  for (let x = 0; x < size; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }

  // Glowing intersections
  const glowCount = Math.floor(complexity * 30);
  for (let i = 0; i < glowCount; i++) {
    const x = Math.floor(rng.nextFloat(0, size / gridSize)) * gridSize;
    const y = Math.floor(rng.nextFloat(0, size / gridSize)) * gridSize;
    const glowRadius = rng.nextFloat(5, 20);

    const grad = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
    grad.addColorStop(0, palette.accent + "30");
    grad.addColorStop(1, palette.accent + "00");
    ctx.fillStyle = grad;
    ctx.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);
  }
}

/**
 * Draw radial burst background
 */
function drawRadial(ctx: CanvasRenderingContext2D, config: BackgroundConfig): void {
  const { palette, size, seed, complexity } = config;
  const rng = new SeededRandom(seed);

  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2 + rng.nextFloat(-size * 0.1, size * 0.1);
  const cy = size / 2 + rng.nextFloat(-size * 0.1, size * 0.1);
  const rayCount = Math.floor(12 + complexity * 36);

  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    const length = size * (0.3 + rng.nextFloat(0.1, 0.5));
    const width = (Math.PI * 2 / rayCount) * 0.4;

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, length);
    const color = i % 3 === 0 ? palette.primary : i % 3 === 1 ? palette.secondary : palette.accent;
    grad.addColorStop(0, color + "15");
    grad.addColorStop(1, color + "00");

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, length, angle - width, angle + width);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  // Center glow
  const centerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.15);
  centerGrad.addColorStop(0, palette.highlight + "30");
  centerGrad.addColorStop(1, palette.highlight + "00");
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw noise texture background
 */
function drawNoise(ctx: CanvasRenderingContext2D, config: BackgroundConfig): void {
  const { palette, size, seed, complexity } = config;

  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  const scale = 0.003 + complexity * 0.005;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = x * scale;
      const ny = y * scale;

      const n1 = fbm(nx, ny, 6);
      const n2 = fbm(nx * 2 + 100, ny * 2 + 100, 4) * 0.5;
      const combined = (n1 + n2) * 0.5 + 0.5;

      const idx = (y * size + x) * 4;
      const colorIdx = Math.floor(combined * 4) % 4;
      const colors = [palette.primary, palette.secondary, palette.accent, palette.background];
      const baseColor = hexToRgb(colors[colorIdx]);

      const intensity = combined * 0.3 + 0.1;
      data[idx] = Math.floor(baseColor.r * intensity);
      data[idx + 1] = Math.floor(baseColor.g * intensity);
      data[idx + 2] = Math.floor(baseColor.b * intensity);
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Draw crystalline background
 */
function drawCrystalline(ctx: CanvasRenderingContext2D, config: BackgroundConfig): void {
  const { palette, size, seed, complexity } = config;
  const rng = new SeededRandom(seed);

  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, size, size);

  // Voronoi-like cells
  const cellCount = Math.floor(8 + complexity * 24);
  const cells: { x: number; y: number; color: string }[] = [];

  for (let i = 0; i < cellCount; i++) {
    cells.push({
      x: rng.nextFloat(0, size),
      y: rng.nextFloat(0, size),
      color: rng.pick([palette.primary, palette.secondary, palette.accent]),
    });
  }

  const resolution = 4;
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  for (let y = 0; y < size; y += resolution) {
    for (let x = 0; x < size; x += resolution) {
      let minDist = Infinity;
      let secondMinDist = Infinity;
      let closestColor = palette.primary;

      for (const cell of cells) {
        const dx = x - cell.x;
        const dy = y - cell.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDist) {
          secondMinDist = minDist;
          minDist = dist;
          closestColor = cell.color;
        } else if (dist < secondMinDist) {
          secondMinDist = dist;
        }
      }

      const edge = secondMinDist - minDist;
      const isEdge = edge < 3;
      const rgb = hexToRgb(closestColor);
      const alpha = isEdge ? 0.6 : 0.15;

      for (let dy = 0; dy < resolution && y + dy < size; dy++) {
        for (let dx = 0; dx < resolution && x + dx < size; dx++) {
          const idx = ((y + dy) * size + (x + dx)) * 4;
          data[idx] = Math.floor(rgb.r * alpha);
          data[idx + 1] = Math.floor(rgb.g * alpha);
          data[idx + 2] = Math.floor(rgb.b * alpha);
          data[idx + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Draw aurora borealis background
 */
function drawAurora(ctx: CanvasRenderingContext2D, config: BackgroundConfig): void {
  const { palette, size, seed, complexity } = config;

  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, size, size);

  // Aurora waves
  const waveCount = Math.floor(3 + complexity * 5);
  for (let w = 0; w < waveCount; w++) {
    const color = w % 3 === 0 ? palette.primary : w % 3 === 1 ? palette.secondary : palette.accent;
    const baseY = size * (0.3 + w * 0.1);
    const amplitude = size * (0.05 + complexity * 0.1);

    ctx.beginPath();
    ctx.moveTo(0, size);

    for (let x = 0; x <= size; x += 2) {
      const noise = simplex2(x * 0.003 + w * 10, w * 5) * amplitude;
      const y = baseY + noise + Math.sin(x * 0.01 + w) * amplitude * 0.5;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(size, size);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, baseY - amplitude, 0, baseY + amplitude * 3);
    grad.addColorStop(0, color + "00");
    grad.addColorStop(0.3, color + "20");
    grad.addColorStop(0.5, color + "35");
    grad.addColorStop(0.7, color + "15");
    grad.addColorStop(1, color + "00");
    ctx.fillStyle = grad;
    ctx.fill();
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

/**
 * Main background generator
 */
export function drawBackground(
  ctx: CanvasRenderingContext2D,
  config: BackgroundConfig
): void {
  const generators: Record<BackgroundStyle, typeof drawCosmic> = {
    cosmic: drawCosmic,
    geometric: drawGeometric,
    nebula: drawNebula,
    grid: drawGrid,
    radial: drawRadial,
    noise: drawNoise,
    crystalline: drawCrystalline,
    aurora: drawAurora,
  };

  const generator = generators[config.style];
  generator(ctx, config);
}

/**
 * Get random background style from seed
 */
export function getBackgroundStyle(seed: number): BackgroundStyle {
  const styles: BackgroundStyle[] = [
    "cosmic", "geometric", "nebula", "grid", "radial", "noise", "crystalline", "aurora",
  ];
  const rng = new SeededRandom(seed);
  return rng.pick(styles);
}
