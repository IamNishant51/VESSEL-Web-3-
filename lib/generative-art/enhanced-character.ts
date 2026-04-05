/**
 * Enhanced cNFT Character Generator v2
 * Produces premium, unique cyberpunk agent portraits with:
 * - 12+ trait layers (body, eyes, hair, cyberware, effects, etc.)
 * - Deterministic generation from seed
 * - Canvas-based rendering at 1024x1024
 * - Optimized for ImageKit upload
 */

import { SeededRandom } from "./noise";
import type { ColorPalette } from "./palette";

export interface EnhancedCharacterConfig {
  palette: ColorPalette;
  size: number;
  seed: number;
  name: string;
  personality: string;
  riskLevel: string;
  toolCount: number;
  agentId: string;
}

export interface EnhancedCharacterResult {
  imageDataUrl: string;
  traits: Record<string, string>;
  rarity: string;
  rarityScore: number;
}

export function generateEnhancedCharacter(
  config: EnhancedCharacterConfig
): EnhancedCharacterResult {
  const canvas = document.createElement("canvas");
  canvas.width = config.size;
  canvas.height = config.size;
  const ctx = canvas.getContext("2d")!;

  const traits = drawEnhancedCharacter(ctx, config);

  const imageDataUrl = canvas.toDataURL("image/png", 0.95);

  const rarityScore = calculateRarityScore(traits);
  const rarity = getRarityFromScore(rarityScore);

  return { imageDataUrl, traits, rarity, rarityScore };
}

function drawEnhancedCharacter(
  ctx: CanvasRenderingContext2D,
  config: EnhancedCharacterConfig
): Record<string, string> {
  const { palette, size, seed, name, personality, riskLevel, toolCount } = config;
  const rng = new SeededRandom(seed);

  const cx = size / 2;
  const cy = size / 2;
  const traits: Record<string, string> = {};

  // Layer 1: Background
  const bgStyle = drawEnhancedBackground(ctx, { palette, size, seed: seed + 100, rng, riskLevel });
  traits.background = `bg-${bgStyle}`;

  // Layer 2: Ambient particles/atmosphere
  drawAtmosphere(ctx, { palette, size, seed: seed + 150, rng });

  // Layer 3: Body/silhouette
  const bodyStyle = drawEnhancedBody(ctx, { cx, cy, size, palette, seed: seed + 200, rng });
  traits.body = `body-${bodyStyle}`;

  // Layer 4: Cyber suit/armor
  const suitStyle = drawCyberSuit(ctx, { cx, cy, size, palette, seed: seed + 250, rng });
  traits.suit = `suit-${suitStyle}`;

  // Layer 5: Neck and collar
  drawEnhancedNeck(ctx, { cx, cy, size, palette, seed: seed + 300, rng });

  // Layer 6: Head shape
  const headStyle = drawEnhancedHead(ctx, { cx, cy, size, palette, seed: seed + 400, rng });
  traits.head = `head-${headStyle}`;

  // Layer 7: Hair/headgear
  const hairStyle = drawEnhancedHair(ctx, { cx, cy, size, palette, seed: seed + 500, rng });
  traits.hair = `hair-${hairStyle}`;

  // Layer 8: Eyes (most distinctive feature)
  const eyeStyle = drawEnhancedEyes(ctx, { cx, cy, size, palette, seed: seed + 600, rng });
  traits.eyes = `eye-${eyeStyle}`;

  // Layer 9: Nose and mid-face
  drawEnhancedNose(ctx, { cx, cy, size, palette, seed: seed + 700, rng });

  // Layer 10: Mouth
  const mouthStyle = drawEnhancedMouth(ctx, { cx, cy, size, palette, seed: seed + 800, rng });
  traits.mouth = `mouth-${mouthStyle}`;

  // Layer 11: Cyber implants and markings
  const implantStyle = drawCyberImplants(ctx, { cx, cy, size, palette, seed: seed + 900, rng, toolCount });
  traits.implants = `implant-${implantStyle}`;

  // Layer 12: Energy effects and particles
  const effectStyle = drawEnhancedEffects(ctx, { cx, cy, size, palette, seed: seed + 1000, rng, name, riskLevel });
  traits.effects = `fx-${effectStyle}`;

  // Layer 13: Frame and UI overlay
  drawEnhancedFrame(ctx, { size, palette, seed: seed + 1100, rng, riskLevel, name });

  return traits;
}

function drawEnhancedBackground(
  ctx: CanvasRenderingContext2D,
  { palette, size, seed, rng, riskLevel }: { palette: ColorPalette; size: number; seed: number; rng: SeededRandom; riskLevel: string }
): string {
  const styles = ["nebula", "circuit", "void", "matrix", "aurora", "crystal"];
  const style = styles[rng.nextInt(0, styles.length - 1)];

  // Base dark gradient
  const bgGrad = ctx.createRadialGradient(size / 2, size / 2.5, 0, size / 2, size / 2, size * 0.75);
  bgGrad.addColorStop(0, palette.primary + "18");
  bgGrad.addColorStop(0.3, "#0a0a14");
  bgGrad.addColorStop(0.7, "#06060c");
  bgGrad.addColorStop(1, "#020204");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Style-specific rendering
  switch (style) {
    case "nebula":
      for (let i = 0; i < 5; i++) {
        const x = rng.nextFloat(0, 1) * size;
        const y = rng.nextFloat(0, 1) * size;
        const r = rng.nextFloat(0, 1) * size * 0.3 + size * 0.1;
        const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
        const colors = [palette.primary, palette.secondary, palette.accent];
        grad.addColorStop(0, colors[i % 3] + "0c");
        grad.addColorStop(0.5, colors[(i + 1) % 3] + "06");
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
      }
      break;

    case "circuit":
      ctx.strokeStyle = palette.primary + "0a";
      ctx.lineWidth = 1;
      const gridSize = size / 16;
      for (let x = 0; x <= size; x += gridSize) {
        for (let y = 0; y <= size; y += gridSize) {
          if (rng.nextFloat(0, 1) > 0.7) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + gridSize, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x + gridSize, y);
            ctx.lineTo(x + gridSize, y + gridSize);
            ctx.stroke();
            ctx.fillStyle = palette.primary + "15";
            ctx.beginPath();
            ctx.arc(x + gridSize, y + gridSize, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      break;

    case "matrix":
      ctx.font = `${size / 40}px monospace`;
      ctx.fillStyle = palette.primary + "08";
      for (let i = 0; i < 200; i++) {
        const x = rng.nextFloat(0, 1) * size;
        const y = rng.nextFloat(0, 1) * size;
        const char = String.fromCharCode(0x30A0 + rng.nextInt(0, 96));
        ctx.fillText(char, x, y);
      }
      break;

    case "aurora":
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        const yBase = rng.nextFloat(0, 1) * size * 0.6 + size * 0.1;
        ctx.moveTo(0, yBase);
        for (let x = 0; x <= size; x += 10) {
          const y = yBase + Math.sin(x / 60 + i * 0.5) * 30 + Math.sin(x / 30 + i) * 15;
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = palette.primary + "06";
        ctx.lineWidth = rng.nextFloat(0, 1) * 20 + 10;
        ctx.stroke();
      }
      break;

    case "crystal":
      for (let i = 0; i < 12; i++) {
        const x = rng.nextFloat(0, 1) * size;
        const y = rng.nextFloat(0, 1) * size;
        const s = rng.nextFloat(0, 1) * 60 + 20;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rng.nextFloat(0, 1) * Math.PI);
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2;
          const px = Math.cos(angle) * s;
          const py = Math.sin(angle) * s;
          j === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = palette.primary + "0a";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
      break;

    case "void":
    default:
      const voidGrad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.5);
      voidGrad.addColorStop(0, palette.accent + "10");
      voidGrad.addColorStop(0.3, palette.primary + "08");
      voidGrad.addColorStop(1, "transparent");
      ctx.fillStyle = voidGrad;
      ctx.fillRect(0, 0, size, size);
      break;
  }

  // Subtle vignette
  const vignette = ctx.createRadialGradient(size / 2, size / 2, size * 0.25, size / 2, size / 2, size * 0.7);
  vignette.addColorStop(0, "transparent");
  vignette.addColorStop(1, "rgba(0,0,0,0.5)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);

  return style;
}

function drawAtmosphere(
  ctx: CanvasRenderingContext2D,
  { palette, size, seed, rng }: { palette: ColorPalette; size: number; seed: number; rng: SeededRandom }
): void {
  // Floating particles
  for (let i = 0; i < 40; i++) {
    const x = rng.nextFloat(0, 1) * size;
    const y = rng.nextFloat(0, 1) * size;
    const r = rng.nextFloat(0, 1) * 2 + 0.5;
    const alpha = rng.nextFloat(0, 1) * 0.3 + 0.05;

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = palette.primary + Math.floor(alpha * 255).toString(16).padStart(2, "0");
    ctx.fill();
  }

  // Light rays
  const rayCount = rng.nextInt(2, 4);
  for (let i = 0; i < rayCount; i++) {
    const x = rng.nextFloat(0, 1) * size;
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x - 40, size);
    ctx.lineTo(x + 40, size);
    ctx.closePath();
    ctx.fillStyle = palette.primary;
    ctx.fill();
    ctx.restore();
  }
}

function drawEnhancedBody(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom }
): string {
  const styles = ["athletic", "broad", "slim", "armored", "ethereal"];
  const style = styles[rng.nextInt(0, styles.length - 1)];

  const shoulderWidth = size * (style === "broad" ? 0.42 : style === "slim" ? 0.3 : 0.36);
  const bodyTop = cy + size * 0.12;
  const bodyBottom = size * 0.95;

  // Body gradient
  const bodyGrad = ctx.createLinearGradient(cx - shoulderWidth, bodyTop, cx + shoulderWidth, bodyBottom);
  bodyGrad.addColorStop(0, "#1a1a2e");
  bodyGrad.addColorStop(0.5, "#16213e");
  bodyGrad.addColorStop(1, "#0f0f1a");

  ctx.beginPath();
  ctx.moveTo(cx - shoulderWidth * 0.3, bodyTop);
  ctx.quadraticCurveTo(cx - shoulderWidth * 1.1, bodyTop + size * 0.05, cx - shoulderWidth, bodyTop + size * 0.15);
  ctx.quadraticCurveTo(cx - shoulderWidth * 0.9, bodyBottom * 0.6, cx - shoulderWidth * 0.6, bodyBottom);
  ctx.lineTo(cx + shoulderWidth * 0.6, bodyBottom);
  ctx.quadraticCurveTo(cx + shoulderWidth * 0.9, bodyBottom * 0.6, cx + shoulderWidth, bodyTop + size * 0.15);
  ctx.quadraticCurveTo(cx + shoulderWidth * 1.1, bodyTop + size * 0.05, cx + shoulderWidth * 0.3, bodyTop);
  ctx.closePath();
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Body outline
  ctx.strokeStyle = palette.primary + "30";
  ctx.lineWidth = 2;
  ctx.stroke();

  return style;
}

function drawCyberSuit(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom }
): string {
  const styles = ["tactical", "stealth", "command", "assault", "recon"];
  const style = styles[rng.nextInt(0, styles.length - 1)];

  const shoulderWidth = size * 0.36;
  const suitTop = cy + size * 0.14;

  // Suit panels
  ctx.save();
  ctx.globalAlpha = 0.6;

  // Center chest panel
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.06, suitTop);
  ctx.lineTo(cx + size * 0.06, suitTop);
  ctx.lineTo(cx + size * 0.1, suitTop + size * 0.15);
  ctx.lineTo(cx, suitTop + size * 0.2);
  ctx.lineTo(cx - size * 0.1, suitTop + size * 0.15);
  ctx.closePath();
  ctx.fillStyle = palette.primary + "20";
  ctx.fill();
  ctx.strokeStyle = palette.primary + "40";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Shoulder armor
  if (style === "tactical" || style === "assault" || style === "command") {
    [-1, 1].forEach(side => {
      ctx.beginPath();
      const sx = cx + side * shoulderWidth * 0.7;
      ctx.moveTo(sx - side * size * 0.08, suitTop + size * 0.02);
      ctx.quadraticCurveTo(sx, suitTop - size * 0.02, sx + side * size * 0.08, suitTop + size * 0.02);
      ctx.lineTo(sx + side * size * 0.06, suitTop + size * 0.08);
      ctx.lineTo(sx - side * size * 0.06, suitTop + size * 0.08);
      ctx.closePath();
      ctx.fillStyle = "#2a2a3e";
      ctx.fill();
      ctx.strokeStyle = palette.accent + "30";
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  // Glowing chest emblem
  const emblemY = suitTop + size * 0.1;
  const emblemGrad = ctx.createRadialGradient(cx, emblemY, 0, cx, emblemY, size * 0.04);
  emblemGrad.addColorStop(0, palette.accent + "80");
  emblemGrad.addColorStop(0.5, palette.accent + "30");
  emblemGrad.addColorStop(1, "transparent");
  ctx.fillStyle = emblemGrad;
  ctx.beginPath();
  ctx.arc(cx, emblemY, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  return style;
}

function drawEnhancedNeck(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom }
): void {
  const neckWidth = size * 0.08;
  const neckTop = cy - size * 0.02;
  const neckBottom = cy + size * 0.14;

  // Neck
  ctx.beginPath();
  ctx.moveTo(cx - neckWidth, neckTop);
  ctx.lineTo(cx - neckWidth * 1.3, neckBottom);
  ctx.lineTo(cx + neckWidth * 1.3, neckBottom);
  ctx.lineTo(cx + neckWidth, neckTop);
  ctx.closePath();
  ctx.fillStyle = "#1e1e30";
  ctx.fill();

  // Cyber collar
  ctx.beginPath();
  ctx.moveTo(cx - neckWidth * 1.5, neckBottom);
  ctx.quadraticCurveTo(cx, neckBottom + size * 0.03, cx + neckWidth * 1.5, neckBottom);
  ctx.strokeStyle = palette.primary + "50";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Neck implant lines
  for (let i = 0; i < 3; i++) {
    const y = neckTop + (neckBottom - neckTop) * (i + 1) / 4;
    ctx.beginPath();
    ctx.moveTo(cx - neckWidth * 0.8, y);
    ctx.lineTo(cx + neckWidth * 0.8, y);
    ctx.strokeStyle = palette.primary + "15";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawEnhancedHead(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom }
): string {
  const styles = ["angular", "oval", "diamond", "square", "elongated"];
  const style = styles[rng.nextInt(0, styles.length - 1)];

  const headTop = cy - size * 0.28;
  const headBottom = cy + size * 0.12;
  const headWidth = size * 0.18;

  // Head shape
  ctx.beginPath();
  switch (style) {
    case "angular":
      ctx.moveTo(cx, headTop);
      ctx.lineTo(cx + headWidth, headTop + size * 0.08);
      ctx.lineTo(cx + headWidth * 0.9, headBottom);
      ctx.quadraticCurveTo(cx, headBottom + size * 0.04, cx - headWidth * 0.9, headBottom);
      ctx.lineTo(cx - headWidth, headTop + size * 0.08);
      break;
    case "diamond":
      ctx.moveTo(cx, headTop - size * 0.02);
      ctx.quadraticCurveTo(cx + headWidth * 1.1, headTop + size * 0.1, cx + headWidth * 0.8, cy);
      ctx.quadraticCurveTo(cx + headWidth * 0.6, headBottom, cx, headBottom + size * 0.02);
      ctx.quadraticCurveTo(cx - headWidth * 0.6, headBottom, cx - headWidth * 0.8, cy);
      ctx.quadraticCurveTo(cx - headWidth * 1.1, headTop + size * 0.1, cx, headTop - size * 0.02);
      break;
    case "square":
      ctx.moveTo(cx - headWidth * 0.8, headTop + size * 0.04);
      ctx.lineTo(cx + headWidth * 0.8, headTop + size * 0.04);
      ctx.lineTo(cx + headWidth * 0.9, headBottom);
      ctx.quadraticCurveTo(cx, headBottom + size * 0.04, cx - headWidth * 0.9, headBottom);
      break;
    case "elongated":
      ctx.ellipse(cx, cy - size * 0.04, headWidth * 0.85, size * 0.22, 0, 0, Math.PI * 2);
      break;
    case "oval":
    default:
      ctx.ellipse(cx, cy, headWidth, size * 0.2, 0, 0, Math.PI * 2);
      break;
  }
  ctx.closePath();

  // Head gradient
  const headGrad = ctx.createRadialGradient(cx, cy - size * 0.05, 0, cx, cy, size * 0.22);
  headGrad.addColorStop(0, "#2a2a3e");
  headGrad.addColorStop(0.6, "#1e1e30");
  headGrad.addColorStop(1, "#14142a");
  ctx.fillStyle = headGrad;
  ctx.fill();

  // Head outline
  ctx.strokeStyle = palette.primary + "25";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  return style;
}

function drawEnhancedHair(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom }
): string {
  const styles = ["spiky", "sleek", "mohawk", "buzz", "long", "helmet", "asymmetric", "undercut", "dreads", "bald"];
  const style = styles[rng.nextInt(0, styles.length - 1)];

  const headTop = cy - size * 0.28;
  const headWidth = size * 0.18;

  if (style === "bald") {
    // Cyber scalp implants
    for (let i = 0; i < 5; i++) {
      const x = cx - headWidth * 0.5 + (headWidth * i / 4);
      const y = headTop + size * 0.05;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = palette.accent + "40";
      ctx.fill();
    }
    return style;
  }

  const hairColor = rng.nextFloat(0, 1) > 0.5 ? palette.primary : palette.secondary;

  ctx.save();
  switch (style) {
    case "spiky":
      for (let i = 0; i < 8; i++) {
        const x = cx - headWidth * 0.7 + (headWidth * 1.4 * i / 7);
        const spikeH = rng.nextFloat(0, 1) * size * 0.12 + size * 0.04;
        ctx.beginPath();
        ctx.moveTo(x - size * 0.02, headTop + size * 0.05);
        ctx.lineTo(x, headTop - spikeH);
        ctx.lineTo(x + size * 0.02, headTop + size * 0.05);
        ctx.closePath();
        ctx.fillStyle = hairColor + "80";
        ctx.fill();
      }
      break;

    case "mohawk":
      ctx.beginPath();
      ctx.moveTo(cx - size * 0.03, headTop + size * 0.05);
      ctx.quadraticCurveTo(cx - size * 0.02, headTop - size * 0.15, cx, headTop - size * 0.18);
      ctx.quadraticCurveTo(cx + size * 0.02, headTop - size * 0.15, cx + size * 0.03, headTop + size * 0.05);
      ctx.closePath();
      ctx.fillStyle = hairColor + "90";
      ctx.fill();
      break;

    case "long":
      ctx.beginPath();
      ctx.moveTo(cx - headWidth, headTop + size * 0.05);
      ctx.quadraticCurveTo(cx - headWidth * 1.2, cy, cx - headWidth * 0.8, cy + size * 0.2);
      ctx.lineTo(cx + headWidth * 0.8, cy + size * 0.2);
      ctx.quadraticCurveTo(cx + headWidth * 1.2, cy, cx + headWidth, headTop + size * 0.05);
      ctx.closePath();
      ctx.fillStyle = hairColor + "50";
      ctx.fill();
      break;

    case "helmet":
      ctx.beginPath();
      ctx.ellipse(cx, cy - size * 0.05, headWidth * 1.1, size * 0.22, 0, Math.PI, 0);
      ctx.fillStyle = "#2a2a3e";
      ctx.fill();
      ctx.strokeStyle = palette.accent + "40";
      ctx.lineWidth = 2;
      ctx.stroke();
      break;

    case "asymmetric":
      ctx.beginPath();
      ctx.moveTo(cx - headWidth * 0.5, headTop + size * 0.05);
      ctx.quadraticCurveTo(cx, headTop - size * 0.1, cx + headWidth * 0.8, headTop + size * 0.02);
      ctx.lineTo(cx + headWidth * 0.6, cy + size * 0.05);
      ctx.lineTo(cx - headWidth * 0.3, cy + size * 0.05);
      ctx.closePath();
      ctx.fillStyle = hairColor + "70";
      ctx.fill();
      break;

    case "undercut":
      ctx.beginPath();
      ctx.moveTo(cx - headWidth * 0.6, headTop + size * 0.05);
      ctx.quadraticCurveTo(cx, headTop - size * 0.08, cx + headWidth * 0.6, headTop + size * 0.05);
      ctx.closePath();
      ctx.fillStyle = hairColor + "80";
      ctx.fill();
      break;

    case "dreads":
      for (let i = 0; i < 6; i++) {
        const x = cx - headWidth * 0.5 + (headWidth * i / 5);
        ctx.beginPath();
        ctx.moveTo(x - size * 0.015, headTop + size * 0.05);
        ctx.quadraticCurveTo(x - size * 0.02, cy + size * 0.1, x + rng.nextFloat(0, 1) * 10 - 5, cy + size * 0.25);
        ctx.lineTo(x + size * 0.015, headTop + size * 0.05);
        ctx.closePath();
        ctx.fillStyle = hairColor + "60";
        ctx.fill();
      }
      break;

    case "sleek":
    default:
      ctx.beginPath();
      ctx.ellipse(cx, headTop + size * 0.04, headWidth * 0.9, size * 0.06, 0, Math.PI, 0);
      ctx.fillStyle = hairColor + "60";
      ctx.fill();
      break;
  }
  ctx.restore();

  return style;
}

function drawEnhancedEyes(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom }
): string {
  const styles = ["glowing", "visor", "angular", "eyepatch", "data-stream", "slit", "heterochromia", "hollow"];
  const style = styles[rng.nextInt(0, styles.length - 1)];

  const eyeY = cy - size * 0.06;
  const eyeSpacing = size * 0.07;
  const eyeSize = size * 0.025;

  const drawEye = (x: number, y: number, color: string, s: string) => {
    switch (s) {
      case "glowing":
        const glowGrad = ctx.createRadialGradient(x, y, 0, x, y, eyeSize * 2);
        glowGrad.addColorStop(0, color);
        glowGrad.addColorStop(0.5, color + "60");
        glowGrad.addColorStop(1, "transparent");
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(x, y, eyeSize * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x, y, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "visor":
        ctx.beginPath();
        ctx.moveTo(x - eyeSize * 2, y - eyeSize * 0.5);
        ctx.lineTo(x + eyeSize * 2, y - eyeSize * 0.5);
        ctx.lineTo(x + eyeSize * 2.5, y + eyeSize * 0.3);
        ctx.lineTo(x - eyeSize * 2.5, y + eyeSize * 0.3);
        ctx.closePath();
        ctx.fillStyle = color + "80";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.stroke();
        break;

      case "angular":
        ctx.beginPath();
        ctx.moveTo(x - eyeSize * 1.5, y - eyeSize * 0.8);
        ctx.lineTo(x + eyeSize * 1.5, y - eyeSize * 0.3);
        ctx.lineTo(x + eyeSize * 1.2, y + eyeSize * 0.6);
        ctx.lineTo(x - eyeSize * 1.2, y + eyeSize * 0.3);
        ctx.closePath();
        ctx.fillStyle = color + "70";
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x, y, eyeSize * 0.3, 0, Math.PI * 2);
        ctx.fill();
        break;

      case "slit":
        ctx.beginPath();
        ctx.ellipse(x, y, eyeSize * 0.4, eyeSize * 1.2, 0, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x, y, eyeSize * 0.15, eyeSize * 0.8, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
        break;

      case "hollow":
        ctx.beginPath();
        ctx.arc(x, y, eyeSize * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.strokeStyle = color + "40";
        ctx.lineWidth = 1;
        ctx.stroke();
        break;

      case "data-stream":
        ctx.fillStyle = color + "80";
        for (let i = 0; i < 5; i++) {
          const dy = y - eyeSize * 2 + (eyeSize * 4 * i / 4);
          ctx.fillRect(x - eyeSize * 0.3, dy, eyeSize * 0.6, eyeSize * 0.3);
        }
        break;

      default:
        ctx.beginPath();
        ctx.arc(x, y, eyeSize, 0, Math.PI * 2);
        ctx.fillStyle = color + "80";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, eyeSize * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
        break;
    }
  };

  if (style === "eyepatch") {
    // Left eye normal
    drawEye(cx - eyeSpacing, eyeY, palette.accent, "glowing");
    // Right eye patch
    ctx.beginPath();
    ctx.moveTo(cx + eyeSpacing - eyeSize * 2, eyeY - eyeSize);
    ctx.lineTo(cx + eyeSpacing + eyeSize * 2, eyeY - eyeSize * 0.5);
    ctx.lineTo(cx + eyeSpacing + eyeSize * 2.5, eyeY + eyeSize * 0.8);
    ctx.lineTo(cx + eyeSpacing - eyeSize * 1.5, eyeY + eyeSize);
    ctx.closePath();
    ctx.fillStyle = "#1a1a1a";
    ctx.fill();
    ctx.strokeStyle = palette.accent + "40";
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (style === "heterochromia") {
    drawEye(cx - eyeSpacing, eyeY, palette.primary, "glowing");
    drawEye(cx + eyeSpacing, eyeY, palette.accent, "slit");
  } else if (style === "visor") {
    // Draw single visor across both eyes
    drawEye(cx, eyeY, palette.accent, "visor");
  } else {
    drawEye(cx - eyeSpacing, eyeY, palette.accent, style);
    drawEye(cx + eyeSpacing, eyeY, palette.accent, style);
  }

  return style;
}

function drawEnhancedNose(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom }
): void {
  const noseY = cy + size * 0.02;
  const noseWidth = size * 0.03;

  // Minimal cyber nose
  ctx.beginPath();
  ctx.moveTo(cx, noseY - size * 0.03);
  ctx.lineTo(cx - noseWidth, noseY + size * 0.02);
  ctx.lineTo(cx + noseWidth, noseY + size * 0.02);
  ctx.closePath();
  ctx.strokeStyle = palette.primary + "30";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Nose bridge highlight
  ctx.beginPath();
  ctx.moveTo(cx, noseY - size * 0.04);
  ctx.lineTo(cx, noseY);
  ctx.strokeStyle = "#ffffff10";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawEnhancedMouth(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom }
): string {
  const styles = ["neutral", "smirk", "grill", "glowing-line", "closed", "data-port"];
  const style = styles[rng.nextInt(0, styles.length - 1)];

  const mouthY = cy + size * 0.07;
  const mouthWidth = size * 0.08;

  switch (style) {
    case "smirk":
      ctx.beginPath();
      ctx.moveTo(cx - mouthWidth, mouthY);
      ctx.quadraticCurveTo(cx, mouthY + size * 0.02, cx + mouthWidth * 0.8, mouthY - size * 0.01);
      ctx.strokeStyle = palette.primary + "50";
      ctx.lineWidth = 2;
      ctx.stroke();
      break;

    case "grill":
      for (let i = 0; i < 4; i++) {
        const x = cx - mouthWidth + (mouthWidth * 2 * i / 3);
        ctx.beginPath();
        ctx.moveTo(x, mouthY - size * 0.01);
        ctx.lineTo(x, mouthY + size * 0.01);
        ctx.strokeStyle = palette.accent + "60";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx - mouthWidth, mouthY);
      ctx.lineTo(cx + mouthWidth, mouthY);
      ctx.strokeStyle = palette.primary + "40";
      ctx.lineWidth = 1;
      ctx.stroke();
      break;

    case "glowing-line":
      const lineGrad = ctx.createLinearGradient(cx - mouthWidth, mouthY, cx + mouthWidth, mouthY);
      lineGrad.addColorStop(0, "transparent");
      lineGrad.addColorStop(0.3, palette.accent);
      lineGrad.addColorStop(0.7, palette.accent);
      lineGrad.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.moveTo(cx - mouthWidth, mouthY);
      ctx.lineTo(cx + mouthWidth, mouthY);
      ctx.strokeStyle = lineGrad;
      ctx.lineWidth = 2;
      ctx.stroke();
      break;

    case "data-port":
      ctx.beginPath();
      ctx.ellipse(cx, mouthY, mouthWidth * 0.5, size * 0.015, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a14";
      ctx.fill();
      ctx.strokeStyle = palette.accent + "50";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Port pins
      for (let i = 0; i < 3; i++) {
        const px = cx - mouthWidth * 0.3 + (mouthWidth * 0.6 * i / 2);
        ctx.beginPath();
        ctx.arc(px, mouthY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = palette.accent + "80";
        ctx.fill();
      }
      break;

    case "closed":
    default:
      ctx.beginPath();
      ctx.moveTo(cx - mouthWidth, mouthY);
      ctx.quadraticCurveTo(cx, mouthY + size * 0.01, cx + mouthWidth, mouthY);
      ctx.strokeStyle = palette.primary + "40";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;
  }

  return style;
}

function drawCyberImplants(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng, toolCount }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom; toolCount: number }
): string {
  const styles = ["minimal", "circuit", "barcode", "triangle", "scar", "runic"];
  const style = styles[rng.nextInt(0, styles.length - 1)];

  const implantCount = Math.min(Math.floor(toolCount / 2) + 1, 5);

  switch (style) {
    case "circuit":
      for (let i = 0; i < implantCount; i++) {
        const startX = cx + (rng.nextFloat(0, 1) - 0.5) * size * 0.2;
        const startY = cy - size * 0.15 + rng.nextFloat(0, 1) * size * 0.2;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        const segments = rng.nextInt(2, 4);
        let currX = startX;
        let currY = startY;
        for (let j = 0; j < segments; j++) {
          if (rng.nextFloat(0, 1) > 0.5) {
            currX += (rng.nextFloat(0, 1) - 0.5) * size * 0.06;
          } else {
            currY += (rng.nextFloat(0, 1) - 0.5) * size * 0.04;
          }
          ctx.lineTo(currX, currY);
        }
        ctx.strokeStyle = palette.accent + "30";
        ctx.lineWidth = 1;
        ctx.stroke();
        // Node at end
        ctx.beginPath();
        ctx.arc(currX, currY, 2, 0, Math.PI * 2);
        ctx.fillStyle = palette.accent + "50";
        ctx.fill();
      }
      break;

    case "barcode":
      const bcX = cx + size * 0.1;
      const bcY = cy - size * 0.05;
      for (let i = 0; i < 8; i++) {
        const w = rng.nextFloat(0, 1) > 0.5 ? 2 : 1;
        ctx.fillStyle = palette.primary + "25";
        ctx.fillRect(bcX + i * 3, bcY, w, size * 0.04);
      }
      break;

    case "triangle":
      [-1, 1].forEach(side => {
        const tx = cx + side * size * 0.12;
        const ty = cy - size * 0.02;
        ctx.beginPath();
        ctx.moveTo(tx, ty - size * 0.02);
        ctx.lineTo(tx - size * 0.015, ty + size * 0.01);
        ctx.lineTo(tx + size * 0.015, ty + size * 0.01);
        ctx.closePath();
        ctx.strokeStyle = palette.accent + "40";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      break;

    case "scar":
      ctx.beginPath();
      const scarX = cx - size * 0.08;
      const scarY = cy - size * 0.1;
      ctx.moveTo(scarX, scarY);
      ctx.quadraticCurveTo(scarX + size * 0.02, scarY + size * 0.03, scarX + size * 0.01, scarY + size * 0.05);
      ctx.strokeStyle = palette.accent + "35";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;

    case "runic":
      const runeX = cx;
      const runeY = cy - size * 0.18;
      ctx.beginPath();
      ctx.moveTo(runeX, runeY - size * 0.02);
      ctx.lineTo(runeX, runeY + size * 0.02);
      ctx.moveTo(runeX, runeY - size * 0.01);
      ctx.lineTo(runeX - size * 0.015, runeY + size * 0.005);
      ctx.moveTo(runeX, runeY);
      ctx.lineTo(runeX + size * 0.015, runeY + size * 0.01);
      ctx.strokeStyle = palette.accent + "40";
      ctx.lineWidth = 1;
      ctx.stroke();
      break;

    case "minimal":
    default:
      break;
  }

  return style;
}

function drawEnhancedEffects(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng, name, riskLevel }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom; name: string; riskLevel: string }
): string {
  const styles = ["particles", "energy-aura", "hex-grid", "data-rain", "glitch", "none"];
  const style = styles[rng.nextInt(0, styles.length - 1)];

  switch (style) {
    case "particles":
      for (let i = 0; i < 30; i++) {
        const x = cx + (rng.nextFloat(0, 1) - 0.5) * size * 0.5;
        const y = cy + (rng.nextFloat(0, 1) - 0.5) * size * 0.5;
        const r = rng.nextFloat(0, 1) * 2 + 0.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = palette.accent + Math.floor(rng.nextFloat(0, 1) * 80 + 20).toString(16).padStart(2, "0");
        ctx.fill();
      }
      break;

    case "energy-aura":
      for (let i = 0; i < 3; i++) {
        const auraR = size * (0.25 + i * 0.05);
        ctx.beginPath();
        ctx.ellipse(cx, cy, auraR, auraR * 1.1, 0, 0, Math.PI * 2);
        ctx.strokeStyle = palette.accent + Math.floor(15 - i * 4).toString(16).padStart(2, "0");
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      break;

    case "hex-grid":
      ctx.strokeStyle = palette.primary + "0a";
      ctx.lineWidth = 0.5;
      const hexSize = size / 30;
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 20; col++) {
          if (rng.nextFloat(0, 1) > 0.85) {
            const hx = col * hexSize * 1.5;
            const hy = row * hexSize * 1.7 + (col % 2 ? hexSize * 0.85 : 0);
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * Math.PI * 2 - Math.PI / 6;
              const px = hx + Math.cos(angle) * hexSize * 0.4;
              const py = hy + Math.sin(angle) * hexSize * 0.4;
              i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.stroke();
          }
        }
      }
      break;

    case "data-rain":
      ctx.font = `${size / 50}px monospace`;
      for (let i = 0; i < 50; i++) {
        const x = rng.nextFloat(0, 1) * size;
        const y = rng.nextFloat(0, 1) * size;
        ctx.fillStyle = palette.primary + Math.floor(rng.nextFloat(0, 1) * 20 + 5).toString(16).padStart(2, "0");
        ctx.fillText(String.fromCharCode(0x30A0 + rng.nextInt(0, 96)), x, y);
      }
      break;

    case "glitch":
      for (let i = 0; i < 8; i++) {
        const y = rng.nextFloat(0, 1) * size;
        const h = rng.nextFloat(0, 1) * 3 + 1;
        const shift = (rng.nextFloat(0, 1) - 0.5) * 20;
        ctx.fillStyle = palette.primary + "15";
        ctx.fillRect(shift, y, size, h);
      }
      break;

    case "none":
    default:
      break;
  }

  return style;
}

function drawEnhancedFrame(
  ctx: CanvasRenderingContext2D,
  { size, palette, seed, rng, riskLevel, name }: { size: number; palette: ColorPalette; seed: number; rng: SeededRandom; riskLevel: string; name: string }
): void {
  const m = size * 0.03;

  // Corner brackets
  const bracketLen = size * 0.06;
  ctx.strokeStyle = palette.primary + "40";
  ctx.lineWidth = 2;

  // Top-left
  ctx.beginPath();
  ctx.moveTo(m, m + bracketLen);
  ctx.lineTo(m, m);
  ctx.lineTo(m + bracketLen, m);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(size - m - bracketLen, m);
  ctx.lineTo(size - m, m);
  ctx.lineTo(size - m, m + bracketLen);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(m, size - m - bracketLen);
  ctx.lineTo(m, size - m);
  ctx.lineTo(m + bracketLen, size - m);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(size - m - bracketLen, size - m);
  ctx.lineTo(size - m, size - m);
  ctx.lineTo(size - m, size - m - bracketLen);
  ctx.stroke();

  // Agent name at bottom
  ctx.font = `bold ${size / 32}px monospace`;
  ctx.fillStyle = palette.primary + "60";
  ctx.textAlign = "center";
  ctx.fillText(name.toUpperCase().slice(0, 16), size / 2, size - m - size * 0.02);

  // Risk indicator
  const riskColors: Record<string, string> = {
    Conservative: "#10b981",
    Balanced: "#f59e0b",
    Aggressive: "#ef4444",
  };
  const riskColor = riskColors[riskLevel] || palette.accent;
  ctx.font = `${size / 40}px monospace`;
  ctx.fillStyle = riskColor + "80";
  ctx.textAlign = "right";
  ctx.fillText(riskLevel.toUpperCase(), size - m - size * 0.02, size - m - size * 0.02);

  // VESSEL watermark
  ctx.font = `bold ${size / 50}px monospace`;
  ctx.fillStyle = "#ffffff08";
  ctx.textAlign = "left";
  ctx.fillText("VESSEL", m + size * 0.02, m + size * 0.03);
}

function calculateRarityScore(traits: Record<string, string>): number {
  const rarityWeights: Record<string, number> = {
    nebula: 3, circuitBg: 4, void: 2, matrix: 5, aurora: 4, crystal: 3,
    athletic: 2, broad: 2, slim: 2, armored: 4, ethereal: 5,
    tactical: 3, stealth: 4, command: 3, assault: 3, recon: 4,
    angularHead: 3, oval: 2, diamond: 4, square: 3, elongated: 3,
    spiky: 3, sleek: 2, mohawk: 4, buzz: 2, long: 3, helmet: 4,
    asymmetric: 4, undercut: 3, dreads: 3, bald: 2,
    glowing: 3, visor: 4, angularEye: 3, eyepatch: 5, "data-stream": 5,
    slit: 4, heterochromia: 5, hollow: 4,
    neutral: 2, smirk: 3, grill: 4, "glowing-line": 4, closed: 2, "data-port": 5,
    minimal: 1, circuitImplant: 3, barcode: 3, triangle: 3, scar: 4, runic: 4,
    particles: 3, "energy-aura": 4, "hex-grid": 4, "data-rain": 5, glitch: 4, none: 1,
  };

  let score = 0;
  let count = 0;
  for (const [key, value] of Object.entries(traits)) {
    score += rarityWeights[value] || 2;
    count++;
  }

  return count > 0 ? score / count : 0;
}

function getRarityFromScore(score: number): string {
  if (score >= 4.5) return "legendary";
  if (score >= 3.8) return "epic";
  if (score >= 3.0) return "rare";
  if (score >= 2.2) return "uncommon";
  return "common";
}
