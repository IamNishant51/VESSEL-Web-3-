/**
 * Premium Cyber Character Generator
 * Generates stunning, aesthetic cyberpunk character portraits for cNFT agents
 * Each character is unique with distinct features, colors, and cyber elements
 */

import { SeededRandom } from "./noise";
import type { ColorPalette } from "./palette";

export interface CharacterConfig {
  palette: ColorPalette;
  size: number;
  seed: number;
  name: string;
  personality: string;
  riskLevel: string;
  toolCount: number;
}

export function drawCyberCharacter(ctx: CanvasRenderingContext2D, config: CharacterConfig): void {
  const { palette, size, seed, name, personality, riskLevel, toolCount } = config;
  const rng = new SeededRandom(seed);

  const cx = size / 2;
  const cy = size / 2;

  // Layer 1: Premium background
  drawPremiumBackground(ctx, { palette, size, seed: seed + 100, rng, riskLevel });

  // Layer 2: Character body with cyber suit
  drawCyberBody(ctx, { cx, cy, size, palette, seed: seed + 200, rng });

  // Layer 3: Neck and collar
  drawCyberNeck(ctx, { cx, cy, size, palette, seed: seed + 300, rng });

  // Layer 4: Head shape and skin
  drawHead(ctx, { cx, cy, size, palette, seed: seed + 400, rng });

  // Layer 5: Hair style
  const hairType = rng.nextInt(0, 9);
  drawHair(ctx, { cx, cy, size, palette, seed: seed + 500, rng, hairType });

  // Layer 6: Eyes (most important feature)
  const eyeType = rng.nextInt(0, 7);
  drawEyes(ctx, { cx, cy, size, palette, seed: seed + 600, rng, eyeType });

  // Layer 7: Nose
  drawNose(ctx, { cx, cy, size, palette, seed: seed + 700, rng });

  // Layer 8: Mouth
  const mouthType = rng.nextInt(0, 5);
  drawMouth(ctx, { cx, cy, size, palette, seed: seed + 800, rng, mouthType });

  // Layer 9: Cyber face details (implants, markings, etc.)
  drawCyberFaceDetails(ctx, { cx, cy, size, palette, seed: seed + 900, rng, toolCount });

  // Layer 10: Cyber effects and particles
  drawCyberFX(ctx, { cx, cy, size, palette, seed: seed + 1000, rng, name });

  // Layer 11: Frame and UI elements
  drawFrame(ctx, { size, palette, seed: seed + 1100, rng, riskLevel, name });
}

function drawPremiumBackground(
  ctx: CanvasRenderingContext2D,
  { palette, size, seed, rng, riskLevel }: { palette: ColorPalette; size: number; seed: number; rng: SeededRandom; riskLevel: string }
): void {
  // Deep dark gradient
  const bgGrad = ctx.createRadialGradient(size / 2, size / 2.5, 0, size / 2, size / 2, size * 0.7);
  bgGrad.addColorStop(0, palette.primary + "12");
  bgGrad.addColorStop(0.4, "#0d0d1a");
  bgGrad.addColorStop(1, "#050508");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Subtle radial glow behind character
  const glowGrad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.4);
  glowGrad.addColorStop(0, palette.accent + "15");
  glowGrad.addColorStop(0.5, palette.secondary + "08");
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, size, size);

  // Fine grid
  ctx.strokeStyle = palette.primary + "06";
  ctx.lineWidth = 0.5;
  const gridSize = size / 24;
  for (let x = 0; x <= size; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 0; y <= size; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Subtle scanlines
  ctx.fillStyle = "#00000005";
  for (let y = 0; y < size; y += 2) {
    ctx.fillRect(0, y, size, 1);
  }

  // Diagonal accent lines
  ctx.strokeStyle = palette.accent + "04";
  ctx.lineWidth = 1;
  for (let i = -size; i < size * 2; i += size / 8) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + size, size);
    ctx.stroke();
  }
}

function drawCyberBody(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom }
): void {
  const bodyTop = cy + size * 0.22;
  const shoulderW = size * rng.nextFloat(0.3, 0.38);

  // Main body shape
  ctx.beginPath();
  ctx.moveTo(cx - shoulderW, size);
  ctx.bezierCurveTo(
    cx - shoulderW, bodyTop + size * 0.15,
    cx - shoulderW * 0.6, bodyTop,
    cx, bodyTop - size * 0.02
  );
  ctx.bezierCurveTo(
    cx + shoulderW * 0.6, bodyTop,
    cx + shoulderW, bodyTop + size * 0.15,
    cx + shoulderW, size
  );
  ctx.closePath();

  // Body gradient
  const bodyGrad = ctx.createLinearGradient(cx, bodyTop, cx, size);
  bodyGrad.addColorStop(0, "#1a1a2e");
  bodyGrad.addColorStop(0.3, "#16162a");
  bodyGrad.addColorStop(0.7, "#121225");
  bodyGrad.addColorStop(1, "#0a0a18");
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Body outline
  ctx.strokeStyle = palette.primary + "20";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Suit collar
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.08, bodyTop - size * 0.02);
  ctx.lineTo(cx - size * 0.12, bodyTop + size * 0.06);
  ctx.lineTo(cx, bodyTop + size * 0.03);
  ctx.lineTo(cx + size * 0.12, bodyTop + size * 0.06);
  ctx.lineTo(cx + size * 0.08, bodyTop - size * 0.02);
  ctx.closePath();
  ctx.fillStyle = "#1e1e35";
  ctx.fill();
  ctx.strokeStyle = palette.accent + "30";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Suit details - vertical lines
  for (let i = 0; i < 3; i++) {
    const x = cx + (i - 1) * size * 0.06;
    ctx.beginPath();
    ctx.moveTo(x, bodyTop + size * 0.05);
    ctx.lineTo(x, size);
    ctx.strokeStyle = palette.primary + "08";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Suit chest accent
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.04, bodyTop + size * 0.08);
  ctx.lineTo(cx, bodyTop + size * 0.12);
  ctx.lineTo(cx + size * 0.04, bodyTop + size * 0.08);
  ctx.strokeStyle = palette.accent + "25";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Shoulder armor hints
  for (let side = -1; side <= 1; side += 2) {
    const sx = cx + side * shoulderW * 0.85;
    ctx.beginPath();
    ctx.moveTo(sx - side * size * 0.04, bodyTop + size * 0.02);
    ctx.lineTo(sx + side * size * 0.06, bodyTop + size * 0.05);
    ctx.lineTo(sx + side * size * 0.04, bodyTop + size * 0.1);
    ctx.strokeStyle = palette.primary + "15";
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawCyberNeck(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom }
): void {
  const neckTop = cy + size * 0.12;
  const neckBottom = cy + size * 0.22;
  const neckW = size * 0.05;

  // Neck
  ctx.beginPath();
  ctx.moveTo(cx - neckW, neckTop);
  ctx.lineTo(cx - neckW * 0.9, neckBottom);
  ctx.lineTo(cx + neckW * 0.9, neckBottom);
  ctx.lineTo(cx + neckW, neckTop);
  ctx.closePath();
  ctx.fillStyle = "#1e1e32";
  ctx.fill();

  // Neck cyber ring
  ctx.beginPath();
  ctx.moveTo(cx - neckW * 1.1, neckBottom - size * 0.01);
  ctx.lineTo(cx + neckW * 1.1, neckBottom - size * 0.01);
  ctx.strokeStyle = palette.accent + "40";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Small nodes on neck
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.arc(cx + side * neckW * 0.7, neckBottom - size * 0.01, 2, 0, Math.PI * 2);
    ctx.fillStyle = palette.highlight + "60";
    ctx.fill();
  }
}

function drawHead(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom }
): void {
  const headY = cy - size * 0.02;
  const headW = size * 0.13;
  const headH = size * 0.17;

  // Head shape
  ctx.beginPath();
  ctx.ellipse(cx, headY, headW, headH, 0, 0, Math.PI * 2);

  // Skin gradient
  const skinGrad = ctx.createRadialGradient(cx - headW * 0.15, headY - headH * 0.2, 0, cx, headY, headW * 1.1);
  skinGrad.addColorStop(0, "#2a2a42");
  skinGrad.addColorStop(0.5, "#222238");
  skinGrad.addColorStop(1, "#1a1a2e");
  ctx.fillStyle = skinGrad;
  ctx.fill();

  // Subtle outline
  ctx.strokeStyle = palette.primary + "15";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Face contour lines
  ctx.strokeStyle = palette.primary + "08";
  ctx.lineWidth = 0.5;

  // Jaw line
  ctx.beginPath();
  ctx.moveTo(cx - headW * 0.65, headY + headH * 0.25);
  ctx.quadraticCurveTo(cx, headY + headH * 0.65, cx + headW * 0.65, headY + headH * 0.25);
  ctx.stroke();

  // Cheek lines
  for (let side = -1; side <= 1; side += 2) {
    ctx.beginPath();
    ctx.moveTo(cx + side * headW * 0.3, headY + headH * 0.1);
    ctx.quadraticCurveTo(cx + side * headW * 0.5, headY + headH * 0.3, cx + side * headW * 0.4, headY + headH * 0.5);
    ctx.stroke();
  }

  // Forehead line
  ctx.beginPath();
  ctx.moveTo(cx - headW * 0.5, headY - headH * 0.5);
  ctx.quadraticCurveTo(cx, headY - headH * 0.6, cx + headW * 0.5, headY - headH * 0.5);
  ctx.stroke();

  // Subtle nose shadow
  ctx.beginPath();
  ctx.moveTo(cx, headY);
  ctx.lineTo(cx, headY + headH * 0.25);
  ctx.strokeStyle = palette.primary + "06";
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

function drawHair(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng, hairType }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom; hairType: number }
): void {
  const headY = cy - size * 0.02;
  const headW = size * 0.13;
  const headH = size * 0.17;
  const hairColor = rng.pick([palette.primary, palette.secondary, palette.accent, "#2a2a4e", "#1a1a3e", "#3a2a4e", "#2a3a4e"]);

  ctx.save();

  switch (hairType) {
    case 0: // Spiky cyber hair
      for (let i = 0; i < 8; i++) {
        const x = cx - headW * 0.9 + (i / 7) * headW * 1.8;
        const spikeH = headH * rng.nextFloat(0.4, 0.9);
        const spikeW = headW * 0.12;
        ctx.beginPath();
        ctx.moveTo(x - spikeW, headY - headH * 0.5);
        ctx.lineTo(x, headY - headH - spikeH);
        ctx.lineTo(x + spikeW, headY - headH * 0.5);
        ctx.closePath();
        const spikeGrad = ctx.createLinearGradient(x, headY - headH * 0.5, x, headY - headH - spikeH);
        spikeGrad.addColorStop(0, hairColor + "50");
        spikeGrad.addColorStop(1, hairColor + "20");
        ctx.fillStyle = spikeGrad;
        ctx.fill();
        ctx.strokeStyle = hairColor + "30";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      break;

    case 1: // Sleek back
      ctx.beginPath();
      ctx.moveTo(cx - headW * 1.15, headY - headH * 0.2);
      ctx.quadraticCurveTo(cx - headW * 0.6, headY - headH * 1.4, cx, headY - headH * 1.2);
      ctx.quadraticCurveTo(cx + headW * 0.6, headY - headH * 1.4, cx + headW * 1.15, headY - headH * 0.2);
      ctx.quadraticCurveTo(cx + headW * 0.8, headY - headH * 0.7, cx, headY - headH * 0.6);
      ctx.quadraticCurveTo(cx - headW * 0.8, headY - headH * 0.7, cx - headW * 1.15, headY - headH * 0.2);
      ctx.closePath();
      const sleekGrad = ctx.createRadialGradient(cx, headY - headH * 0.8, 0, cx, headY - headH * 0.5, headW * 1.2);
      sleekGrad.addColorStop(0, hairColor + "60");
      sleekGrad.addColorStop(1, hairColor + "30");
      ctx.fillStyle = sleekGrad;
      ctx.fill();
      break;

    case 2: // Cyber mohawk
      const mohawkW = headW * 0.12;
      const mohawkH = headH * 1.6;
      ctx.beginPath();
      ctx.moveTo(cx - mohawkW, headY - headH * 0.6);
      ctx.quadraticCurveTo(cx - mohawkW * 0.5, headY - headH - mohawkH * 0.5, cx, headY - headH - mohawkH);
      ctx.quadraticCurveTo(cx + mohawkW * 0.5, headY - headH - mohawkH * 0.5, cx + mohawkW, headY - headH * 0.6);
      ctx.closePath();
      const mohawkGrad = ctx.createLinearGradient(cx, headY - headH * 0.6, cx, headY - headH - mohawkH);
      mohawkGrad.addColorStop(0, hairColor + "70");
      mohawkGrad.addColorStop(0.5, palette.highlight + "50");
      mohawkGrad.addColorStop(1, hairColor + "30");
      ctx.fillStyle = mohawkGrad;
      ctx.fill();
      ctx.shadowColor = palette.highlight;
      ctx.shadowBlur = 12;
      ctx.strokeStyle = palette.highlight + "40";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;

    case 3: // Short buzz cut
      ctx.beginPath();
      ctx.ellipse(cx, headY - headH * 0.25, headW * 1.08, headH * 0.65, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = hairColor + "35";
      ctx.fill();
      break;

    case 4: // Long flowing sides
      // Left side
      ctx.beginPath();
      ctx.moveTo(cx - headW * 1.1, headY - headH * 0.2);
      ctx.quadraticCurveTo(cx - headW * 1.4, headY + headH * 0.2, cx - headW * 1, headY + headH * 1.3);
      ctx.quadraticCurveTo(cx - headW * 0.7, headY + headH * 1.3, cx - headW * 0.6, headY + headH * 1);
      ctx.quadraticCurveTo(cx - headW * 0.8, headY + headH * 0.2, cx - headW * 0.6, headY - headH * 0.2);
      ctx.closePath();
      ctx.fillStyle = hairColor + "40";
      ctx.fill();
      // Right side
      ctx.beginPath();
      ctx.moveTo(cx + headW * 1.1, headY - headH * 0.2);
      ctx.quadraticCurveTo(cx + headW * 1.4, headY + headH * 0.2, cx + headW * 1, headY + headH * 1.3);
      ctx.quadraticCurveTo(cx + headW * 0.7, headY + headH * 1.3, cx + headW * 0.6, headY + headH * 1);
      ctx.quadraticCurveTo(cx + headW * 0.8, headY + headH * 0.2, cx + headW * 0.6, headY - headH * 0.2);
      ctx.closePath();
      ctx.fillStyle = hairColor + "40";
      ctx.fill();
      // Top
      ctx.beginPath();
      ctx.ellipse(cx, headY - headH * 0.3, headW * 1.05, headH * 0.6, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = hairColor + "30";
      ctx.fill();
      break;

    case 5: // Cyber helmet
      ctx.beginPath();
      ctx.ellipse(cx, headY - headH * 0.15, headW * 1.18, headH * 0.9, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = "#12122a";
      ctx.fill();
      ctx.strokeStyle = palette.accent + "50";
      ctx.lineWidth = 2;
      ctx.stroke();
      // Visor line
      ctx.beginPath();
      ctx.moveTo(cx - headW * 1.15, headY - headH * 0.15);
      ctx.lineTo(cx + headW * 1.15, headY - headH * 0.15);
      ctx.strokeStyle = palette.highlight + "50";
      ctx.lineWidth = 2;
      ctx.shadowColor = palette.highlight;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;

    case 6: // Asymmetric sweep
      // Top volume
      ctx.beginPath();
      ctx.ellipse(cx - headW * 0.2, headY - headH * 0.3, headW * 1.1, headH * 0.65, -0.2, Math.PI, Math.PI * 2);
      ctx.fillStyle = hairColor + "45";
      ctx.fill();
      // Side sweep
      ctx.beginPath();
      ctx.moveTo(cx + headW * 0.5, headY - headH * 0.5);
      ctx.quadraticCurveTo(cx + headW * 1.3, headY, cx + headW * 0.9, headY + headH * 1);
      ctx.quadraticCurveTo(cx + headW * 0.6, headY + headH * 0.8, cx + headW * 0.5, headY + headH * 0.5);
      ctx.quadraticCurveTo(cx + headW * 0.7, headY, cx + headW * 0.3, headY - headH * 0.3);
      ctx.closePath();
      ctx.fillStyle = hairColor + "35";
      ctx.fill();
      break;

    case 7: // Undercut
      // Top long
      ctx.beginPath();
      ctx.ellipse(cx, headY - headH * 0.35, headW * 1.05, headH * 0.7, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = hairColor + "50";
      ctx.fill();
      // Side short
      for (let side = -1; side <= 1; side += 2) {
        ctx.beginPath();
        ctx.moveTo(cx + side * headW * 0.8, headY - headH * 0.1);
        ctx.lineTo(cx + side * headW * 1.1, headY + headH * 0.3);
        ctx.lineTo(cx + side * headW * 0.6, headY + headH * 0.3);
        ctx.lineTo(cx + side * headW * 0.5, headY - headH * 0.1);
        ctx.closePath();
        ctx.fillStyle = "#1a1a2e";
        ctx.fill();
      }
      break;

    case 8: // Dreadlocks/braids
      for (let i = 0; i < 6; i++) {
        const x = cx - headW * 0.8 + (i / 5) * headW * 1.6;
        const startY = headY - headH * 0.4;
        const endY = headY + headH * (0.8 + rng.nextFloat(0, 0.6));
        const wave = rng.nextFloat(-size * 0.02, size * 0.02);
        ctx.beginPath();
        ctx.moveTo(x - 3, startY);
        ctx.quadraticCurveTo(x + wave, (startY + endY) / 2, x + 3, endY);
        ctx.quadraticCurveTo(x + wave + 3, (startY + endY) / 2, x - 3, startY);
        ctx.closePath();
        ctx.fillStyle = hairColor + "45";
        ctx.fill();
      }
      // Top
      ctx.beginPath();
      ctx.ellipse(cx, headY - headH * 0.35, headW * 1, headH * 0.5, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = hairColor + "40";
      ctx.fill();
      break;

    case 9: // Bald with cyber lines
      ctx.beginPath();
      ctx.ellipse(cx, headY - headH * 0.2, headW * 1.05, headH * 0.6, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = "#1e1e32";
      ctx.fill();
      // Cyber circuit lines on head
      for (let i = 0; i < 4; i++) {
        const y = headY - headH * 0.5 + i * headH * 0.25;
        ctx.beginPath();
        ctx.moveTo(cx - headW * 0.7, y);
        ctx.lineTo(cx + headW * 0.7, y);
        ctx.strokeStyle = palette.accent + "15";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      // Center line
      ctx.beginPath();
      ctx.moveTo(cx, headY - headH * 0.6);
      ctx.lineTo(cx, headY + headH * 0.3);
      ctx.strokeStyle = palette.accent + "20";
      ctx.lineWidth = 1;
      ctx.stroke();
      break;
  }

  ctx.restore();
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng, eyeType }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom; eyeType: number }
): void {
  const headY = cy - size * 0.02;
  const eyeY = headY - size * 0.01;
  const eyeSpacing = size * 0.055;
  const eyeColor = rng.pick([palette.highlight, palette.accent, "#00ff88", "#ff0066", "#00ccff", "#ffaa00", "#aa44ff"]);

  ctx.save();

  switch (eyeType) {
    case 0: // Intense glowing eyes
      for (let side = -1; side <= 1; side += 2) {
        const ex = cx + side * eyeSpacing;
        // Eye socket
        ctx.beginPath();
        ctx.ellipse(ex, eyeY, size * 0.022, size * 0.012, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#0a0a15";
        ctx.fill();
        // Iris
        ctx.beginPath();
        ctx.arc(ex, eyeY, size * 0.012, 0, Math.PI * 2);
        const irisGrad = ctx.createRadialGradient(ex, eyeY, 0, ex, eyeY, size * 0.012);
        irisGrad.addColorStop(0, eyeColor);
        irisGrad.addColorStop(0.7, eyeColor + "80");
        irisGrad.addColorStop(1, eyeColor + "40");
        ctx.fillStyle = irisGrad;
        ctx.fill();
        // Pupil
        ctx.beginPath();
        ctx.arc(ex, eyeY, size * 0.005, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
        // Glow
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(ex, eyeY, size * 0.008, 0, Math.PI * 2);
        ctx.fillStyle = eyeColor + "30";
        ctx.fill();
        ctx.shadowBlur = 0;
        // Highlight
        ctx.beginPath();
        ctx.arc(ex + size * 0.003, eyeY - size * 0.003, size * 0.003, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff80";
        ctx.fill();
      }
      break;

    case 1: // Cyber visor
      ctx.beginPath();
      ctx.moveTo(cx - eyeSpacing * 1.8, eyeY - size * 0.01);
      ctx.lineTo(cx + eyeSpacing * 1.8, eyeY - size * 0.01);
      ctx.lineTo(cx + eyeSpacing * 1.8, eyeY + size * 0.005);
      ctx.quadraticCurveTo(cx, eyeY + size * 0.015, cx - eyeSpacing * 1.8, eyeY + size * 0.005);
      ctx.closePath();
      const visorGrad = ctx.createLinearGradient(cx - eyeSpacing * 1.8, eyeY, cx + eyeSpacing * 1.8, eyeY);
      visorGrad.addColorStop(0, eyeColor + "20");
      visorGrad.addColorStop(0.3, eyeColor + "60");
      visorGrad.addColorStop(0.7, eyeColor + "60");
      visorGrad.addColorStop(1, eyeColor + "20");
      ctx.fillStyle = visorGrad;
      ctx.fill();
      ctx.shadowColor = eyeColor;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = eyeColor;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.shadowBlur = 0;
      // Visor data lines
      for (let i = 0; i < 5; i++) {
        const lx = cx - eyeSpacing * 1.5 + i * eyeSpacing * 0.75;
        ctx.beginPath();
        ctx.moveTo(lx, eyeY - size * 0.005);
        ctx.lineTo(lx, eyeY + size * 0.003);
        ctx.strokeStyle = eyeColor + "40";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      break;

    case 2: // Sharp angular eyes
      for (let side = -1; side <= 1; side += 2) {
        const ex = cx + side * eyeSpacing;
        ctx.beginPath();
        ctx.moveTo(ex - size * 0.025, eyeY);
        ctx.lineTo(ex, eyeY - size * 0.012);
        ctx.lineTo(ex + size * 0.025, eyeY);
        ctx.lineTo(ex, eyeY + size * 0.008);
        ctx.closePath();
        ctx.fillStyle = eyeColor + "70";
        ctx.fill();
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 12;
        ctx.strokeStyle = eyeColor;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Inner glow
        ctx.beginPath();
        ctx.arc(ex, eyeY, size * 0.004, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }
      break;

    case 3: // One eye covered (eyepatch)
      // Left eye normal
      const ex1 = cx - eyeSpacing;
      ctx.beginPath();
      ctx.ellipse(ex1, eyeY, size * 0.02, size * 0.01, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a15";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex1, eyeY, size * 0.01, 0, Math.PI * 2);
      ctx.fillStyle = eyeColor + "80";
      ctx.fill();
      ctx.shadowColor = eyeColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(ex1, eyeY, size * 0.005, 0, Math.PI * 2);
      ctx.fillStyle = eyeColor + "40";
      ctx.fill();
      ctx.shadowBlur = 0;
      // Right eye - cyber patch
      const ex2 = cx + eyeSpacing;
      ctx.beginPath();
      ctx.moveTo(ex2 - size * 0.025, eyeY - size * 0.015);
      ctx.lineTo(ex2 + size * 0.025, eyeY - size * 0.015);
      ctx.lineTo(ex2 + size * 0.03, eyeY + size * 0.012);
      ctx.lineTo(ex2 - size * 0.03, eyeY + size * 0.012);
      ctx.closePath();
      ctx.fillStyle = "#12122a";
      ctx.fill();
      ctx.strokeStyle = palette.accent + "50";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Glowing sensor
      ctx.beginPath();
      ctx.arc(ex2, eyeY, size * 0.006, 0, Math.PI * 2);
      ctx.fillStyle = eyeColor;
      ctx.shadowColor = eyeColor;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;
      break;

    case 4: // Data stream eyes
      for (let side = -1; side <= 1; side += 2) {
        const ex = cx + side * eyeSpacing;
        // Eye socket
        ctx.beginPath();
        ctx.ellipse(ex, eyeY, size * 0.02, size * 0.015, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#050510";
        ctx.fill();
        // Data streams
        for (let d = 0; d < 6; d++) {
          const dy = eyeY - size * 0.012 + d * size * 0.005;
          const dw = rng.nextFloat(size * 0.005, size * 0.015);
          ctx.fillStyle = eyeColor + Math.round(rng.nextFloat(40, 90)).toString(16).padStart(2, "0");
          ctx.fillRect(ex - dw / 2, dy, dw, size * 0.003);
        }
        // Glow
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ex, eyeY, size * 0.008, 0, Math.PI * 2);
        ctx.fillStyle = eyeColor + "20";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      break;

    case 5: // Glowing slit eyes
      for (let side = -1; side <= 1; side += 2) {
        const ex = cx + side * eyeSpacing;
        ctx.beginPath();
        ctx.moveTo(ex - size * 0.025, eyeY);
        ctx.lineTo(ex + size * 0.025, eyeY);
        ctx.strokeStyle = eyeColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 15;
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Outer glow
        ctx.beginPath();
        ctx.moveTo(ex - size * 0.03, eyeY);
        ctx.lineTo(ex + size * 0.03, eyeY);
        ctx.strokeStyle = eyeColor + "30";
        ctx.lineWidth = 6;
        ctx.stroke();
      }
      break;

    case 6: // Heterochromia (different colored eyes)
      const color1 = rng.pick([palette.highlight, "#00ff88", "#ff0066"]);
      const color2 = rng.pick([palette.accent, "#00ccff", "#ffaa00"]);
      for (let side = -1; side <= 1; side += 2) {
        const ex = cx + side * eyeSpacing;
        const c = side === -1 ? color1 : color2;
        ctx.beginPath();
        ctx.ellipse(ex, eyeY, size * 0.02, size * 0.012, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#0a0a15";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex, eyeY, size * 0.012, 0, Math.PI * 2);
        ctx.fillStyle = c + "80";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(ex, eyeY, size * 0.005, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.shadowColor = c;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(ex, eyeY, size * 0.006, 0, Math.PI * 2);
        ctx.fillStyle = c + "30";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      break;

    case 7: // Hollow dark eyes
      for (let side = -1; side <= 1; side += 2) {
        const ex = cx + side * eyeSpacing;
        ctx.beginPath();
        ctx.ellipse(ex, eyeY, size * 0.022, size * 0.014, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
        // Tiny glow point
        ctx.beginPath();
        ctx.arc(ex + size * 0.005, eyeY - size * 0.003, size * 0.003, 0, Math.PI * 2);
        ctx.fillStyle = eyeColor + "60";
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      break;
  }

  ctx.restore();
}

function drawNose(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom }
): void {
  const headY = cy - size * 0.02;
  const noseY = headY + size * 0.06;

  ctx.save();

  // Subtle nose
  ctx.beginPath();
  ctx.moveTo(cx, headY + size * 0.02);
  ctx.lineTo(cx, noseY);
  ctx.strokeStyle = palette.primary + "12";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Nose tip
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.012, noseY);
  ctx.quadraticCurveTo(cx, noseY + size * 0.008, cx + size * 0.012, noseY);
  ctx.strokeStyle = palette.primary + "10";
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.restore();
}

function drawMouth(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng, mouthType }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom; mouthType: number }
): void {
  const headY = cy - size * 0.02;
  const mouthY = headY + size * 0.12;
  const mouthW = size * 0.035;

  ctx.save();

  switch (mouthType) {
    case 0: // Neutral
      ctx.beginPath();
      ctx.moveTo(cx - mouthW, mouthY);
      ctx.lineTo(cx + mouthW, mouthY);
      ctx.strokeStyle = palette.primary + "35";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;

    case 1: // Slight smirk
      ctx.beginPath();
      ctx.moveTo(cx - mouthW, mouthY);
      ctx.quadraticCurveTo(cx + mouthW * 0.3, mouthY + mouthW * 0.3, cx + mouthW, mouthY - mouthW * 0.1);
      ctx.strokeStyle = palette.primary + "35";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;

    case 2: // Cyber grill
      for (let i = 0; i < 5; i++) {
        const x = cx - mouthW * 0.8 + i * mouthW * 0.4;
        ctx.beginPath();
        ctx.moveTo(x, mouthY - mouthW * 0.25);
        ctx.lineTo(x, mouthY + mouthW * 0.25);
        ctx.strokeStyle = palette.accent + "45";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx - mouthW, mouthY - mouthW * 0.25);
      ctx.lineTo(cx + mouthW, mouthY - mouthW * 0.25);
      ctx.moveTo(cx - mouthW, mouthY + mouthW * 0.25);
      ctx.lineTo(cx + mouthW, mouthY + mouthW * 0.25);
      ctx.strokeStyle = palette.accent + "30";
      ctx.lineWidth = 0.8;
      ctx.stroke();
      break;

    case 3: // Glowing line
      ctx.beginPath();
      ctx.moveTo(cx - mouthW * 1.2, mouthY);
      ctx.lineTo(cx + mouthW * 1.2, mouthY);
      ctx.strokeStyle = palette.highlight;
      ctx.lineWidth = 2;
      ctx.shadowColor = palette.highlight;
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;

    case 4: // Closed/serious
      ctx.beginPath();
      ctx.moveTo(cx - mouthW, mouthY);
      ctx.quadraticCurveTo(cx, mouthY + mouthW * 0.15, cx + mouthW, mouthY);
      ctx.strokeStyle = palette.primary + "30";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;

    case 5: // Data port
      ctx.beginPath();
      ctx.ellipse(cx, mouthY, mouthW * 0.7, mouthW * 0.3, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a15";
      ctx.fill();
      ctx.strokeStyle = palette.accent + "50";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Port details
      for (let i = 0; i < 3; i++) {
        const px = cx - mouthW * 0.35 + i * mouthW * 0.35;
        ctx.beginPath();
        ctx.arc(px, mouthY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = palette.highlight + "50";
        ctx.fill();
      }
      break;
  }

  ctx.restore();
}

function drawCyberFaceDetails(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng, toolCount }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom; toolCount: number }
): void {
  const headY = cy - size * 0.02;
  const headW = size * 0.13;
  const headH = size * 0.17;
  const implantColor = rng.pick([palette.highlight, palette.accent, palette.primary]);
  const implantCount = Math.min(toolCount, 5);

  ctx.save();

  for (let i = 0; i < implantCount; i++) {
    const implantType = rng.nextInt(0, 4);
    const side = rng.next() > 0.5 ? 1 : -1;

    switch (implantType) {
      case 0: // Face line with node
        const lx = cx + side * size * rng.nextFloat(0.07, 0.14);
        const ly = headY + size * rng.nextFloat(-0.08, 0.08);
        ctx.beginPath();
        ctx.moveTo(lx, ly - size * 0.025);
        ctx.lineTo(lx, ly + size * 0.025);
        ctx.strokeStyle = implantColor + "40";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = implantColor;
        ctx.shadowColor = implantColor;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        break;

      case 1: // Circuit trace
        const sx = cx + side * size * rng.nextFloat(0.08, 0.16);
        const sy = headY + size * rng.nextFloat(-0.12, 0.04);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + side * size * 0.025, sy);
        ctx.lineTo(sx + side * size * 0.025, sy + size * 0.015);
        ctx.lineTo(sx + side * size * 0.04, sy + size * 0.015);
        ctx.strokeStyle = implantColor + "35";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sx + side * size * 0.04, sy + size * 0.015, 2, 0, Math.PI * 2);
        ctx.fillStyle = implantColor + "50";
        ctx.fill();
        break;

      case 2: // Barcode
        const bx = cx + side * size * rng.nextFloat(0.1, 0.18);
        const by = headY + size * rng.nextFloat(-0.05, 0.12);
        for (let b = 0; b < 6; b++) {
          const bw = rng.nextFloat(1, 2.5);
          ctx.fillStyle = implantColor + Math.round(rng.nextFloat(15, 40)).toString(16).padStart(2, "0");
          ctx.fillRect(bx + b * 2.5, by, bw, size * 0.012);
        }
        break;

      case 3: // Triangle mark
        const tx = cx + side * size * rng.nextFloat(0.06, 0.14);
        const ty = headY + size * rng.nextFloat(-0.1, 0.1);
        const ts = size * 0.008;
        ctx.beginPath();
        ctx.moveTo(tx, ty - ts);
        ctx.lineTo(tx - ts, ty + ts);
        ctx.lineTo(tx + ts, ty + ts);
        ctx.closePath();
        ctx.fillStyle = implantColor + "30";
        ctx.fill();
        ctx.strokeStyle = implantColor + "50";
        ctx.lineWidth = 0.5;
        ctx.stroke();
        break;

      case 4: // Scar/mark
        const scarX = cx + side * size * rng.nextFloat(0.05, 0.12);
        const scarY = headY + size * rng.nextFloat(-0.1, 0.1);
        const scarAngle = rng.nextFloat(-0.4, 0.4);
        ctx.save();
        ctx.translate(scarX, scarY);
        ctx.rotate(scarAngle);
        ctx.beginPath();
        ctx.moveTo(-size * 0.015, 0);
        ctx.lineTo(size * 0.015, 0);
        ctx.strokeStyle = palette.primary + "25";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        break;
    }
  }

  ctx.restore();
}

function drawCyberFX(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng, name }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom; name: string }
): void {
  ctx.save();

  // Floating particles
  const particleCount = rng.nextInt(20, 50);
  for (let i = 0; i < particleCount; i++) {
    const x = rng.nextFloat(0, size);
    const y = rng.nextFloat(0, size);
    const r = rng.nextFloat(0.5, 3);
    const color = rng.pick([palette.highlight, palette.accent, palette.primary]);
    const opacity = rng.nextFloat(0.08, 0.35);

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color + Math.round(opacity * 255).toString(16).padStart(2, "0");
    ctx.fill();
  }

  // Data streams
  const streamCount = rng.nextInt(3, 6);
  for (let s = 0; s < streamCount; s++) {
    const x = rng.nextFloat(size * 0.05, size * 0.95);
    const startY = rng.nextFloat(0, size * 0.2);
    const length = rng.nextFloat(size * 0.15, size * 0.5);
    const color = rng.pick([palette.primary, palette.accent]);

    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, startY + length);
    ctx.strokeStyle = color + "08";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Stream dots
    const dotCount = rng.nextInt(4, 10);
    for (let d = 0; d < dotCount; d++) {
      const dy = startY + (d / dotCount) * length;
      ctx.beginPath();
      ctx.arc(x, dy, rng.nextFloat(0.5, 2), 0, Math.PI * 2);
      ctx.fillStyle = color + "15";
      ctx.fill();
    }
  }

  // Hexagonal pattern
  if (rng.next() > 0.4) {
    const hexSize = size * 0.025;
    ctx.strokeStyle = palette.primary + "04";
    ctx.lineWidth = 0.5;
    for (let row = 0; row < size / (hexSize * 1.5); row++) {
      for (let col = 0; col < size / (hexSize * 1.73); col++) {
        const hx = col * hexSize * 1.73 + (row % 2 ? hexSize * 0.865 : 0);
        const hy = row * hexSize * 1.5;
        if (hx > size * 0.1 && hx < size * 0.9 && hy > size * 0.1 && hy < size * 0.9) {
          drawHex(ctx, hx, hy, hexSize * 0.45);
        }
      }
    }
  }

  // Name watermark
  ctx.font = `bold ${size * 0.02}px monospace`;
  ctx.fillStyle = palette.primary + "06";
  ctx.textAlign = "center";
  ctx.fillText(name.toUpperCase(), cx, size * 0.93);

  ctx.restore();
}

function drawHex(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const hx = x + Math.cos(angle) * r;
    const hy = y + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  { size, palette, seed, rng, riskLevel, name }: { size: number; palette: ColorPalette; seed: number; rng: SeededRandom; riskLevel: string; name: string }
): void {
  ctx.save();

  const borderColor = riskLevel === "Aggressive" ? "#ff4444" : riskLevel === "Conservative" ? "#44ff88" : palette.primary;
  const margin = size * 0.025;
  const bracketSize = size * 0.035;

  // Corner brackets
  ctx.strokeStyle = borderColor + "35";
  ctx.lineWidth = 2;
  ctx.lineCap = "square";

  // Top-left
  ctx.beginPath();
  ctx.moveTo(margin, margin + bracketSize);
  ctx.lineTo(margin, margin);
  ctx.lineTo(margin + bracketSize, margin);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(size - margin - bracketSize, margin);
  ctx.lineTo(size - margin, margin);
  ctx.lineTo(size - margin, margin + bracketSize);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(margin, size - margin - bracketSize);
  ctx.lineTo(margin, size - margin);
  ctx.lineTo(margin + bracketSize, size - margin);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(size - margin - bracketSize, size - margin);
  ctx.lineTo(size - margin, size - margin);
  ctx.lineTo(size - margin, size - margin - bracketSize);
  ctx.stroke();

  // Top center line
  ctx.beginPath();
  ctx.moveTo(size * 0.3, margin);
  ctx.lineTo(size * 0.7, margin);
  ctx.strokeStyle = borderColor + "15";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Bottom center line
  ctx.beginPath();
  ctx.moveTo(size * 0.3, size - margin);
  ctx.lineTo(size * 0.7, size - margin);
  ctx.stroke();

  // ID text
  ctx.font = `${size * 0.012}px monospace`;
  ctx.fillStyle = borderColor + "25";
  ctx.textAlign = "left";
  ctx.fillText(`ID:${seed.toString(16).slice(0, 8).toUpperCase()}`, margin + 4, size - margin - 6);

  // Risk indicator
  ctx.textAlign = "right";
  ctx.fillText(riskLevel.toUpperCase(), size - margin - 4, margin + 12);

  ctx.restore();
}
