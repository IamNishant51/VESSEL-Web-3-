/**
 * Effects & Post-Processing
 * Adds finishing touches to agent art
 */

import { SeededRandom } from "./noise";
import type { ColorPalette } from "./palette";

export interface EffectsConfig {
  palette: ColorPalette;
  size: number;
  seed: number;
  complexity: number;
  rarity: number; // 0-1, 1 = legendary
}

/**
 * Add light rays / lens flare
 */
export function addLightRays(ctx: CanvasRenderingContext2D, config: EffectsConfig): void {
  const { palette, size, seed } = config;
  const rng = new SeededRandom(seed + 9999);
  const cx = size / 2;
  const cy = size / 2;
  const rayCount = rng.nextInt(6, 16);

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2 + rng.nextFloat(-0.1, 0.1);
    const length = size * rng.nextFloat(0.3, 0.8);
    const width = rng.nextFloat(0.005, 0.02);

    const grad = ctx.createLinearGradient(
      cx, cy,
      cx + Math.cos(angle) * length,
      cy + Math.sin(angle) * length
    );
    grad.addColorStop(0, palette.highlight + "20");
    grad.addColorStop(1, palette.highlight + "00");

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + Math.cos(angle - width) * length,
      cy + Math.sin(angle - width) * length
    );
    ctx.lineTo(
      cx + Math.cos(angle + width) * length,
      cy + Math.sin(angle + width) * length
    );
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add particle field
 */
export function addParticles(ctx: CanvasRenderingContext2D, config: EffectsConfig): void {
  const { palette, size, seed, rarity } = config;
  const rng = new SeededRandom(seed + 7777);
  const particleCount = Math.floor(30 + rarity * 100 + config.complexity * 50);

  for (let i = 0; i < particleCount; i++) {
    const x = rng.nextFloat(0, size);
    const y = rng.nextFloat(0, size);
    const r = rng.nextFloat(0.5, 3);
    const alpha = rng.nextFloat(0.1, 0.6);
    const color = rng.pick([
      palette.highlight,
      palette.accent,
      palette.primary,
      "#ffffff",
    ]);

    // Glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, r * 4);
    glow.addColorStop(0, color + Math.round(alpha * 255).toString(16).padStart(2, "0"));
    glow.addColorStop(1, color + "00");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, r * 4, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color + Math.round(alpha * 255).toString(16).padStart(2, "0");
    ctx.fill();
  }
}

/**
 * Add scan lines / tech effect
 */
export function addScanLines(ctx: CanvasRenderingContext2D, config: EffectsConfig): void {
  const { size, seed } = config;
  const rng = new SeededRandom(seed + 5555);
  const lineSpacing = rng.nextInt(2, 6);

  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  for (let y = 0; y < size; y += lineSpacing) {
    ctx.fillRect(0, y, size, 1);
  }
}

/**
 * Add noise/grain overlay
 */
export function addGrain(ctx: CanvasRenderingContext2D, config: EffectsConfig): void {
  const { size, seed } = config;
  const rng = new SeededRandom(seed + 3333);
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const noise = (rng.next() - 0.5) * 20;
    data[i] = Math.max(0, Math.min(255, data[i] + noise));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Add holographic shimmer effect
 */
export function addHolographic(ctx: CanvasRenderingContext2D, config: EffectsConfig): void {
  const { size, rarity } = config;
  if (rarity < 0.7) return; // Only for rare+

  ctx.save();
  ctx.globalCompositeOperation = "overlay";

  const holographicColors = [
    "rgba(255, 0, 128, 0.08)",
    "rgba(0, 255, 128, 0.08)",
    "rgba(0, 128, 255, 0.08)",
    "rgba(255, 255, 0, 0.08)",
    "rgba(128, 0, 255, 0.08)",
  ];

  const stripeWidth = size / holographicColors.length;
  for (let i = 0; i < holographicColors.length; i++) {
    ctx.fillStyle = holographicColors[i];
    ctx.fillRect(i * stripeWidth, 0, stripeWidth, size);
  }

  ctx.restore();
}

/**
 * Add vignette
 */
export function addVignette(ctx: CanvasRenderingContext2D, config: EffectsConfig): void {
  const { size } = config;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.7;

  const grad = ctx.createRadialGradient(cx, cy, radius * 0.4, cx, cy, radius);
  grad.addColorStop(0, "rgba(0, 0, 0, 0)");
  grad.addColorStop(0.7, "rgba(0, 0, 0, 0.1)");
  grad.addColorStop(1, "rgba(0, 0, 0, 0.5)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
}

/**
 * Add signature watermark
 */
export function addSignature(ctx: CanvasRenderingContext2D, config: EffectsConfig): void {
  const { size } = config;

  ctx.save();
  ctx.font = `${Math.max(10, size * 0.015)}px monospace`;
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText("VESSEL", size - size * 0.03, size - size * 0.03);
  ctx.restore();
}

/**
 * Add border frame
 */
export function addBorder(ctx: CanvasRenderingContext2D, config: EffectsConfig): void {
  const { palette, size, rarity } = config;
  const borderWidth = Math.max(2, size * 0.005);
  const inset = size * 0.02;

  ctx.strokeStyle = rarity > 0.8 ? palette.highlight + "60" : palette.primary + "30";
  ctx.lineWidth = borderWidth;
  ctx.strokeRect(inset, inset, size - inset * 2, size - inset * 2);

  // Corner accents
  const cornerSize = size * 0.04;
  ctx.strokeStyle = rarity > 0.8 ? palette.highlight + "80" : palette.accent + "40";
  ctx.lineWidth = borderWidth * 1.5;

  const corners = [
    [inset, inset],
    [size - inset, inset],
    [inset, size - inset],
    [size - inset, size - inset],
  ];

  for (const [cx, cy] of corners) {
    const dx = cx < size / 2 ? 1 : -1;
    const dy = cy < size / 2 ? 1 : -1;

    ctx.beginPath();
    ctx.moveTo(cx + dx * cornerSize, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx, cy + dy * cornerSize);
    ctx.stroke();
  }
}

/**
 * Apply all effects
 */
export function applyEffects(
  ctx: CanvasRenderingContext2D,
  config: EffectsConfig
): void {
  addLightRays(ctx, config);
  addParticles(ctx, config);

  if (config.complexity > 0.5) {
    addScanLines(ctx, config);
  }

  if (config.rarity > 0.7) {
    addHolographic(ctx, config);
  }

  addVignette(ctx, config);
  addBorder(ctx, config);
  addGrain(ctx, config);
  addSignature(ctx, config);
}
