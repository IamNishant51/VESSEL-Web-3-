/**
 * Cyber Character Generator
 * Generates unique cyberpunk character portraits for cNFT agents
 * Each character has unique: face shape, eyes, mouth, hair, cyber implants, accessories, etc.
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

  // Draw background first
  drawCyberBackground(ctx, { palette, size, seed: seed + 1000, rng });

  // Draw character body/shoulders
  drawCharacterBody(ctx, { cx, cy, size, palette, seed: seed + 2000, rng });

  // Draw head/face
  const faceType = rng.nextInt(0, 5);
  drawCharacterHead(ctx, { cx, cy, size, palette, seed: seed + 3000, rng, faceType });

  // Draw hair/headgear
  const hairType = rng.nextInt(0, 7);
  drawCharacterHair(ctx, { cx, cy, size, palette, seed: seed + 4000, rng, hairType });

  // Draw eyes
  const eyeType = rng.nextInt(0, 6);
  drawCharacterEyes(ctx, { cx, cy, size, palette, seed: seed + 5000, rng, eyeType });

  // Draw mouth
  const mouthType = rng.nextInt(0, 5);
  drawCharacterMouth(ctx, { cx, cy, size, palette, seed: seed + 6000, rng, mouthType });

  // Draw cyber implants
  const implantCount = Math.min(toolCount, 6);
  drawCyberImplants(ctx, { cx, cy, size, palette, seed: seed + 7000, rng, count: implantCount });

  // Draw accessories
  const accessoryType = rng.nextInt(0, 6);
  drawCharacterAccessories(ctx, { cx, cy, size, palette, seed: seed + 8000, rng, accessoryType });

  // Draw cyber effects/overlay
  drawCyberEffects(ctx, { cx, cy, size, palette, seed: seed + 9000, rng, name, personality });

  // Draw tech frame/border
  drawTechFrame(ctx, { size, palette, seed: seed + 10000, rng, riskLevel });
}

function drawCyberBackground(
  ctx: CanvasRenderingContext2D,
  { palette, size, seed, rng }: { palette: ColorPalette; size: number; seed: number; rng: SeededRandom }
): void {
  // Dark gradient background
  const bgGrad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.7);
  bgGrad.addColorStop(0, palette.primary + "15");
  bgGrad.addColorStop(0.5, palette.background + "80");
  bgGrad.addColorStop(1, "#0a0a0f");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // Grid pattern
  ctx.strokeStyle = palette.primary + "08";
  ctx.lineWidth = 0.5;
  const gridSize = size / 20;
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

  // Ambient glow behind character
  const glowGrad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size * 0.35);
  glowGrad.addColorStop(0, palette.accent + "20");
  glowGrad.addColorStop(0.5, palette.secondary + "10");
  glowGrad.addColorStop(1, "transparent");
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, size, size);

  // Scanlines
  ctx.fillStyle = "#00000008";
  for (let y = 0; y < size; y += 3) {
    ctx.fillRect(0, y, size, 1);
  }
}

function drawCharacterBody(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom }
): void {
  const bodyY = cy + size * 0.25;
  const shoulderWidth = size * rng.nextFloat(0.28, 0.38);

  // Body/shoulders
  ctx.beginPath();
  ctx.moveTo(cx - shoulderWidth, size);
  ctx.quadraticCurveTo(cx - shoulderWidth * 0.8, bodyY + size * 0.1, cx, bodyY - size * 0.05);
  ctx.quadraticCurveTo(cx + shoulderWidth * 0.8, bodyY + size * 0.1, cx + shoulderWidth, size);
  ctx.closePath();

  const bodyGrad = ctx.createLinearGradient(cx, bodyY, cx, size);
  bodyGrad.addColorStop(0, "#1a1a2e");
  bodyGrad.addColorStop(0.5, "#16162a");
  bodyGrad.addColorStop(1, "#0d0d1a");
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  // Body outline
  ctx.strokeStyle = palette.primary + "30";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Collar/neck detail
  const neckWidth = size * 0.06;
  ctx.beginPath();
  ctx.moveTo(cx - neckWidth, bodyY - size * 0.08);
  ctx.lineTo(cx - neckWidth * 1.5, bodyY + size * 0.05);
  ctx.lineTo(cx, bodyY + size * 0.02);
  ctx.lineTo(cx + neckWidth * 1.5, bodyY + size * 0.05);
  ctx.lineTo(cx + neckWidth, bodyY - size * 0.08);
  ctx.strokeStyle = palette.accent + "40";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cyber chest detail
  const chestLines = rng.nextInt(2, 4);
  for (let i = 0; i < chestLines; i++) {
    const y = bodyY + size * 0.05 + i * size * 0.04;
    const w = shoulderWidth * (0.6 - i * 0.1);
    ctx.beginPath();
    ctx.moveTo(cx - w, y);
    ctx.lineTo(cx + w, y);
    ctx.strokeStyle = palette.primary + "15";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
}

function drawCharacterHead(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng, faceType }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom; faceType: number }
): void {
  const headY = cy - size * 0.05;
  const headW = size * 0.14;
  const headH = size * 0.18;

  ctx.save();

  switch (faceType) {
    case 0: // Oval face
      ctx.beginPath();
      ctx.ellipse(cx, headY, headW, headH, 0, 0, Math.PI * 2);
      break;
    case 1: // Angular face
      ctx.beginPath();
      ctx.moveTo(cx, headY - headH);
      ctx.lineTo(cx + headW, headY - headH * 0.3);
      ctx.lineTo(cx + headW * 0.9, headY + headH * 0.5);
      ctx.lineTo(cx + headW * 0.5, headY + headH);
      ctx.lineTo(cx - headW * 0.5, headY + headH);
      ctx.lineTo(cx - headW * 0.9, headY + headH * 0.5);
      ctx.lineTo(cx - headW, headY - headH * 0.3);
      ctx.closePath();
      break;
    case 2: // Round face
      ctx.beginPath();
      ctx.arc(cx, headY, headW * 1.1, 0, Math.PI * 2);
      break;
    case 3: // Sharp/angular
      ctx.beginPath();
      ctx.moveTo(cx, headY - headH * 1.1);
      ctx.lineTo(cx + headW * 1.1, headY);
      ctx.lineTo(cx + headW * 0.7, headY + headH * 0.8);
      ctx.lineTo(cx, headY + headH);
      ctx.lineTo(cx - headW * 0.7, headY + headH * 0.8);
      ctx.lineTo(cx - headW * 1.1, headY);
      ctx.closePath();
      break;
    case 4: // Wide face
      ctx.beginPath();
      ctx.ellipse(cx, headY, headW * 1.2, headH * 0.9, 0, 0, Math.PI * 2);
      break;
    case 5: // Long face
      ctx.beginPath();
      ctx.ellipse(cx, headY, headW * 0.85, headH * 1.15, 0, 0, Math.PI * 2);
      break;
  }

  // Face fill
  const faceGrad = ctx.createRadialGradient(cx - headW * 0.2, headY - headH * 0.2, 0, cx, headY, headW * 1.2);
  faceGrad.addColorStop(0, "#2a2a3e");
  faceGrad.addColorStop(0.6, "#1e1e32");
  faceGrad.addColorStop(1, "#151528");
  ctx.fillStyle = faceGrad;
  ctx.fill();

  // Face outline
  ctx.strokeStyle = palette.primary + "25";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Jaw line
  ctx.beginPath();
  ctx.moveTo(cx - headW * 0.6, headY + headH * 0.3);
  ctx.quadraticCurveTo(cx, headY + headH * 0.7, cx + headW * 0.6, headY + headH * 0.3);
  ctx.strokeStyle = palette.primary + "15";
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.restore();
}

function drawCharacterHair(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng, hairType }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom; hairType: number }
): void {
  const headY = cy - size * 0.05;
  const headW = size * 0.14;
  const headH = size * 0.18;
  const hairColor = rng.pick([palette.primary, palette.secondary, palette.accent, "#2a2a4e", "#1a1a3e"]);

  ctx.save();

  switch (hairType) {
    case 0: // Spiky
      for (let i = 0; i < 7; i++) {
        const x = cx - headW * 0.8 + (i / 6) * headW * 1.6;
        const spikeH = headH * rng.nextFloat(0.5, 1);
        ctx.beginPath();
        ctx.moveTo(x - headW * 0.08, headY - headH * 0.6);
        ctx.lineTo(x, headY - headH - spikeH);
        ctx.lineTo(x + headW * 0.08, headY - headH * 0.6);
        ctx.closePath();
        ctx.fillStyle = hairColor + "60";
        ctx.fill();
        ctx.strokeStyle = hairColor + "40";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      break;

    case 1: // Sleek back
      ctx.beginPath();
      ctx.moveTo(cx - headW * 1.1, headY - headH * 0.3);
      ctx.quadraticCurveTo(cx - headW * 0.5, headY - headH * 1.3, cx, headY - headH * 1.1);
      ctx.quadraticCurveTo(cx + headW * 0.5, headY - headH * 1.3, cx + headW * 1.1, headY - headH * 0.3);
      ctx.quadraticCurveTo(cx + headW * 0.8, headY - headH * 0.8, cx, headY - headH * 0.7);
      ctx.quadraticCurveTo(cx - headW * 0.8, headY - headH * 0.8, cx - headW * 1.1, headY - headH * 0.3);
      ctx.closePath();
      ctx.fillStyle = hairColor + "50";
      ctx.fill();
      break;

    case 2: // Mohawk
      ctx.beginPath();
      ctx.moveTo(cx - headW * 0.15, headY - headH * 0.7);
      ctx.lineTo(cx - headW * 0.1, headY - headH * 1.5);
      ctx.lineTo(cx + headW * 0.1, headY - headH * 1.5);
      ctx.lineTo(cx + headW * 0.15, headY - headH * 0.7);
      ctx.closePath();
      ctx.fillStyle = hairColor + "70";
      ctx.fill();
      // Mohawk glow
      ctx.shadowColor = palette.highlight;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = palette.highlight + "40";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;

    case 3: // Short crop
      ctx.beginPath();
      ctx.ellipse(cx, headY - headH * 0.3, headW * 1.05, headH * 0.7, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = hairColor + "40";
      ctx.fill();
      break;

    case 4: // Long flowing
      ctx.beginPath();
      ctx.moveTo(cx - headW * 1.1, headY - headH * 0.3);
      ctx.quadraticCurveTo(cx - headW * 1.3, headY + headH * 0.3, cx - headW * 0.8, headY + headH * 1.2);
      ctx.lineTo(cx - headW * 0.5, headY + headH * 1.2);
      ctx.quadraticCurveTo(cx - headW * 0.7, headY + headH * 0.3, cx - headW * 0.6, headY - headH * 0.3);
      ctx.closePath();
      ctx.fillStyle = hairColor + "35";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + headW * 1.1, headY - headH * 0.3);
      ctx.quadraticCurveTo(cx + headW * 1.3, headY + headH * 0.3, cx + headW * 0.8, headY + headH * 1.2);
      ctx.lineTo(cx + headW * 0.5, headY + headH * 1.2);
      ctx.quadraticCurveTo(cx + headW * 0.7, headY + headH * 0.3, cx + headW * 0.6, headY - headH * 0.3);
      ctx.closePath();
      ctx.fillStyle = hairColor + "35";
      ctx.fill();
      break;

    case 5: // Cyber helmet
      ctx.beginPath();
      ctx.ellipse(cx, headY - headH * 0.2, headW * 1.15, headH * 0.85, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = "#1a1a2e";
      ctx.fill();
      ctx.strokeStyle = palette.accent + "50";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Helmet glow line
      ctx.beginPath();
      ctx.moveTo(cx - headW * 1.1, headY - headH * 0.2);
      ctx.lineTo(cx + headW * 1.1, headY - headH * 0.2);
      ctx.strokeStyle = palette.highlight + "30";
      ctx.lineWidth = 2;
      ctx.stroke();
      break;

    case 6: // Asymmetric
      // Left side long
      ctx.beginPath();
      ctx.moveTo(cx - headW * 0.3, headY - headH * 0.7);
      ctx.quadraticCurveTo(cx - headW * 1.2, headY - headH * 0.5, cx - headW * 1, headY + headH * 0.8);
      ctx.lineTo(cx - headW * 0.7, headY + headH * 0.8);
      ctx.quadraticCurveTo(cx - headW * 0.8, headY - headH * 0.3, cx - headW * 0.3, headY - headH * 0.5);
      ctx.closePath();
      ctx.fillStyle = hairColor + "45";
      ctx.fill();
      // Right side short
      ctx.beginPath();
      ctx.ellipse(cx + headW * 0.3, headY - headH * 0.5, headW * 0.6, headH * 0.4, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = hairColor + "35";
      ctx.fill();
      break;

    case 7: // Bald with cyber lines
      ctx.beginPath();
      ctx.ellipse(cx, headY - headH * 0.3, headW * 1.05, headH * 0.7, 0, Math.PI, Math.PI * 2);
      ctx.fillStyle = "#1e1e32";
      ctx.fill();
      // Cyber lines on head
      for (let i = 0; i < 3; i++) {
        const y = headY - headH * 0.5 + i * headH * 0.25;
        ctx.beginPath();
        ctx.moveTo(cx - headW * 0.8, y);
        ctx.lineTo(cx + headW * 0.8, y);
        ctx.strokeStyle = palette.accent + "20";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      break;
  }

  ctx.restore();
}

function drawCharacterEyes(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng, eyeType }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom; eyeType: number }
): void {
  const headY = cy - size * 0.05;
  const eyeY = headY - size * 0.02;
  const eyeSpacing = size * 0.06;
  const eyeW = size * 0.025;
  const eyeH = size * 0.012;
  const eyeColor = rng.pick([palette.highlight, palette.accent, palette.primary, "#00ff88", "#ff0066", "#00ccff"]);

  ctx.save();

  switch (eyeType) {
    case 0: // Normal eyes
      for (let side = -1; side <= 1; side += 2) {
        const ex = cx + side * eyeSpacing;
        // Eye white
        ctx.beginPath();
        ctx.ellipse(ex, eyeY, eyeW * 1.5, eyeH * 1.5, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#2a2a3e";
        ctx.fill();
        // Iris
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeW * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = eyeColor + "80";
        ctx.fill();
        // Pupil
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeW * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
        // Glow
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(ex, eyeY, eyeW * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = eyeColor + "40";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      break;

    case 1: // Glowing visor
      ctx.beginPath();
      ctx.moveTo(cx - eyeSpacing * 1.8, eyeY - eyeH);
      ctx.lineTo(cx + eyeSpacing * 1.8, eyeY - eyeH);
      ctx.lineTo(cx + eyeSpacing * 1.8, eyeY + eyeH * 0.5);
      ctx.quadraticCurveTo(cx, eyeY + eyeH * 1.5, cx - eyeSpacing * 1.8, eyeY + eyeH * 0.5);
      ctx.closePath();
      ctx.fillStyle = eyeColor + "60";
      ctx.fill();
      ctx.shadowColor = eyeColor;
      ctx.shadowBlur = 15;
      ctx.strokeStyle = eyeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
      break;

    case 2: // Cyber eyes (rectangular)
      for (let side = -1; side <= 1; side += 2) {
        const ex = cx + side * eyeSpacing;
        ctx.fillStyle = eyeColor + "70";
        ctx.fillRect(ex - eyeW * 1.2, eyeY - eyeH, eyeW * 2.4, eyeH * 2);
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 10;
        ctx.strokeStyle = eyeColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(ex - eyeW * 1.2, eyeY - eyeH, eyeW * 2.4, eyeH * 2);
        ctx.shadowBlur = 0;
      }
      break;

    case 3: // One eye covered
      // Left eye normal
      ctx.beginPath();
      ctx.ellipse(cx - eyeSpacing, eyeY, eyeW * 1.5, eyeH * 1.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#2a2a3e";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx - eyeSpacing, eyeY, eyeW * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = eyeColor + "80";
      ctx.fill();
      // Right eye covered with cyber patch
      ctx.beginPath();
      ctx.moveTo(cx + eyeSpacing - eyeW * 2, eyeY - eyeH * 2);
      ctx.lineTo(cx + eyeSpacing + eyeW * 2, eyeY - eyeH * 2);
      ctx.lineTo(cx + eyeSpacing + eyeW * 2.5, eyeY + eyeH * 2);
      ctx.lineTo(cx + eyeSpacing - eyeW * 2.5, eyeY + eyeH * 2);
      ctx.closePath();
      ctx.fillStyle = "#1a1a2e";
      ctx.fill();
      ctx.strokeStyle = palette.accent + "50";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Glowing dot on patch
      ctx.beginPath();
      ctx.arc(cx + eyeSpacing, eyeY, 3, 0, Math.PI * 2);
      ctx.fillStyle = eyeColor;
      ctx.shadowColor = eyeColor;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      break;

    case 4: // Three eyes (cyber mutation)
      for (let i = -1; i <= 1; i++) {
        const ex = cx + i * eyeSpacing * 0.7;
        const ey = eyeY + (i === 0 ? -size * 0.03 : 0);
        const r = i === 0 ? eyeW * 0.6 : eyeW * 0.8;
        ctx.beginPath();
        ctx.arc(ex, ey, r, 0, Math.PI * 2);
        ctx.fillStyle = eyeColor + "70";
        ctx.fill();
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(ex, ey, r * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      break;

    case 5: // Narrow/slit eyes
      for (let side = -1; side <= 1; side += 2) {
        const ex = cx + side * eyeSpacing;
        ctx.beginPath();
        ctx.moveTo(ex - eyeW * 2, eyeY);
        ctx.lineTo(ex + eyeW * 2, eyeY);
        ctx.strokeStyle = eyeColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = eyeColor;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
      break;

    case 6: // Data stream eyes
      for (let side = -1; side <= 1; side += 2) {
        const ex = cx + side * eyeSpacing;
        // Eye socket
        ctx.beginPath();
        ctx.ellipse(ex, eyeY, eyeW * 1.8, eyeH * 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = "#0a0a15";
        ctx.fill();
        // Data streams
        for (let d = 0; d < 5; d++) {
          const dy = eyeY - eyeH * 1.5 + d * eyeH * 0.7;
          const dw = rng.nextFloat(2, eyeW * 1.5);
          ctx.fillStyle = eyeColor + Math.round(rng.nextFloat(30, 80)).toString(16).padStart(2, "0");
          ctx.fillRect(ex - dw / 2, dy, dw, eyeH * 0.4);
        }
      }
      break;
  }

  ctx.restore();
}

function drawCharacterMouth(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng, mouthType }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom; mouthType: number }
): void {
  const headY = cy - size * 0.05;
  const mouthY = headY + size * 0.08;
  const mouthW = size * 0.04;

  ctx.save();

  switch (mouthType) {
    case 0: // Neutral line
      ctx.beginPath();
      ctx.moveTo(cx - mouthW, mouthY);
      ctx.lineTo(cx + mouthW, mouthY);
      ctx.strokeStyle = palette.primary + "40";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;

    case 1: // Slight smile
      ctx.beginPath();
      ctx.moveTo(cx - mouthW, mouthY);
      ctx.quadraticCurveTo(cx, mouthY + mouthW * 0.4, cx + mouthW, mouthY);
      ctx.strokeStyle = palette.primary + "40";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      break;

    case 2: // Cyber grill
      for (let i = 0; i < 4; i++) {
        const x = cx - mouthW * 0.8 + i * mouthW * 0.5;
        ctx.beginPath();
        ctx.moveTo(x, mouthY - mouthW * 0.3);
        ctx.lineTo(x, mouthY + mouthW * 0.3);
        ctx.strokeStyle = palette.accent + "50";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(cx - mouthW, mouthY - mouthW * 0.3);
      ctx.lineTo(cx + mouthW, mouthY - mouthW * 0.3);
      ctx.moveTo(cx - mouthW, mouthY + mouthW * 0.3);
      ctx.lineTo(cx + mouthW, mouthY + mouthW * 0.3);
      ctx.strokeStyle = palette.accent + "30";
      ctx.lineWidth = 0.5;
      ctx.stroke();
      break;

    case 3: // Glowing mouth line
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

    case 4: // No mouth (masked)
      ctx.beginPath();
      ctx.moveTo(cx - mouthW * 1.5, mouthY - mouthW * 0.2);
      ctx.lineTo(cx + mouthW * 1.5, mouthY - mouthW * 0.2);
      ctx.lineTo(cx + mouthW * 1.5, mouthY + mouthW * 0.5);
      ctx.lineTo(cx - mouthW * 1.5, mouthY + mouthW * 0.5);
      ctx.closePath();
      ctx.fillStyle = "#151528";
      ctx.fill();
      ctx.strokeStyle = palette.primary + "20";
      ctx.lineWidth = 0.5;
      ctx.stroke();
      break;

    case 5: // Data port mouth
      ctx.beginPath();
      ctx.ellipse(cx, mouthY, mouthW * 0.8, mouthW * 0.4, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#0a0a15";
      ctx.fill();
      ctx.strokeStyle = palette.accent + "60";
      ctx.lineWidth = 1;
      ctx.stroke();
      // Port details
      for (let i = 0; i < 3; i++) {
        const px = cx - mouthW * 0.4 + i * mouthW * 0.4;
        ctx.beginPath();
        ctx.arc(px, mouthY, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = palette.highlight + "60";
        ctx.fill();
      }
      break;
  }

  ctx.restore();
}

function drawCyberImplants(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng, count }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom; count: number }
): void {
  const headY = cy - size * 0.05;
  const implantColor = rng.pick([palette.highlight, palette.accent, palette.primary]);

  ctx.save();

  for (let i = 0; i < count; i++) {
    const implantType = rng.nextInt(0, 4);
    const side = rng.next() > 0.5 ? 1 : -1;

    switch (implantType) {
      case 0: // Face line implant
        const lx = cx + side * size * rng.nextFloat(0.08, 0.15);
        const ly = headY + size * rng.nextFloat(-0.1, 0.1);
        ctx.beginPath();
        ctx.moveTo(lx, ly - size * 0.03);
        ctx.lineTo(lx, ly + size * 0.03);
        ctx.strokeStyle = implantColor + "50";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(lx, ly, 2, 0, Math.PI * 2);
        ctx.fillStyle = implantColor;
        ctx.shadowColor = implantColor;
        ctx.shadowBlur = 5;
        ctx.fill();
        ctx.shadowBlur = 0;
        break;

      case 1: // Circuit pattern
        const sx = cx + side * size * rng.nextFloat(0.1, 0.18);
        const sy = headY + size * rng.nextFloat(-0.15, 0.05);
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx + side * size * 0.03, sy);
        ctx.lineTo(sx + side * size * 0.03, sy + size * 0.02);
        ctx.strokeStyle = implantColor + "40";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sx + side * size * 0.03, sy + size * 0.02, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = implantColor + "60";
        ctx.fill();
        break;

      case 2: // Barcode
        const bx = cx + side * size * rng.nextFloat(0.12, 0.2);
        const by = headY + size * rng.nextFloat(0, 0.15);
        for (let b = 0; b < 5; b++) {
          const bw = rng.nextFloat(1, 3);
          ctx.fillStyle = implantColor + Math.round(rng.nextFloat(20, 50)).toString(16).padStart(2, "0");
          ctx.fillRect(bx + b * 3, by, bw, size * 0.015);
        }
        break;

      case 3: // Node cluster
        const nx = cx + side * size * rng.nextFloat(0.1, 0.16);
        const ny = headY + size * rng.nextFloat(-0.08, 0.08);
        for (let n = 0; n < 3; n++) {
          const angle = (n / 3) * Math.PI * 2;
          const dist = size * 0.015;
          const px = nx + Math.cos(angle) * dist;
          const py = ny + Math.sin(angle) * dist;
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = implantColor + "60";
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(nx, ny, 2, 0, Math.PI * 2);
        ctx.fillStyle = implantColor;
        ctx.shadowColor = implantColor;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        break;

      case 4: // Scar/line
        const scarX = cx + side * size * rng.nextFloat(0.06, 0.14);
        const scarY = headY + size * rng.nextFloat(-0.12, 0.1);
        const scarAngle = rng.nextFloat(-0.5, 0.5);
        ctx.save();
        ctx.translate(scarX, scarY);
        ctx.rotate(scarAngle);
        ctx.beginPath();
        ctx.moveTo(-size * 0.02, 0);
        ctx.lineTo(size * 0.02, 0);
        ctx.strokeStyle = palette.primary + "30";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
        break;
    }
  }

  ctx.restore();
}

function drawCharacterAccessories(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng, accessoryType }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom; accessoryType: number }
): void {
  const headY = cy - size * 0.05;
  const headW = size * 0.14;
  const headH = size * 0.18;

  ctx.save();

  switch (accessoryType) {
    case 0: // Earpiece
      for (let side = -1; side <= 1; side += 2) {
        if (rng.next() > 0.5) {
          const ex = cx + side * headW * 1.1;
          const ey = headY;
          ctx.beginPath();
          ctx.ellipse(ex, ey, size * 0.015, size * 0.025, 0, 0, Math.PI * 2);
          ctx.fillStyle = "#1a1a2e";
          ctx.fill();
          ctx.strokeStyle = palette.accent + "50";
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(ex, ey, 2, 0, Math.PI * 2);
          ctx.fillStyle = palette.highlight + "60";
          ctx.fill();
        }
      }
      break;

    case 1: // Headband
      ctx.beginPath();
      ctx.moveTo(cx - headW * 1.15, headY - headH * 0.3);
      ctx.quadraticCurveTo(cx, headY - headH * 0.6, cx + headW * 1.15, headY - headH * 0.3);
      ctx.strokeStyle = palette.accent + "60";
      ctx.lineWidth = 3;
      ctx.stroke();
      // Headband detail
      ctx.beginPath();
      ctx.arc(cx, headY - headH * 0.55, 3, 0, Math.PI * 2);
      ctx.fillStyle = palette.highlight;
      ctx.shadowColor = palette.highlight;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      break;

    case 2: // Neck collar
      const collarY = headY + headH * 1.05;
      ctx.beginPath();
      ctx.moveTo(cx - headW * 0.8, collarY);
      ctx.quadraticCurveTo(cx, collarY + size * 0.02, cx + headW * 0.8, collarY);
      ctx.strokeStyle = palette.accent + "40";
      ctx.lineWidth = 2;
      ctx.stroke();
      break;

    case 3: // Shoulder armor
      const shoulderY = cy + size * 0.2;
      for (let side = -1; side <= 1; side += 2) {
        const sx = cx + side * size * 0.2;
        ctx.beginPath();
        ctx.moveTo(sx - side * size * 0.08, shoulderY - size * 0.03);
        ctx.lineTo(sx + side * size * 0.05, shoulderY - size * 0.06);
        ctx.lineTo(sx + side * size * 0.08, shoulderY);
        ctx.lineTo(sx - side * size * 0.05, shoulderY + size * 0.02);
        ctx.closePath();
        ctx.fillStyle = "#1a1a2e";
        ctx.fill();
        ctx.strokeStyle = palette.primary + "30";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      break;

    case 4: // Floating hologram
      const hx = cx + size * rng.nextFloat(-0.15, 0.15);
      const hy = headY - headH * 1.3;
      ctx.beginPath();
      ctx.arc(hx, hy, size * 0.02, 0, Math.PI * 2);
      ctx.fillStyle = palette.highlight + "20";
      ctx.fill();
      ctx.strokeStyle = palette.highlight + "40";
      ctx.lineWidth = 0.5;
      ctx.stroke();
      // Hologram lines
      for (let h = 0; h < 3; h++) {
        const ly = hy - size * 0.015 + h * size * 0.01;
        const lw = size * 0.01 * (1 - h * 0.2);
        ctx.beginPath();
        ctx.moveTo(hx - lw, ly);
        ctx.lineTo(hx + lw, ly);
        ctx.strokeStyle = palette.highlight + "30";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
      break;

    case 5: // Cyber mask
      ctx.beginPath();
      ctx.moveTo(cx - headW * 0.7, headY + headH * 0.2);
      ctx.quadraticCurveTo(cx, headY + headH * 0.6, cx + headW * 0.7, headY + headH * 0.2);
      ctx.lineTo(cx + headW * 0.5, headY + headH * 0.1);
      ctx.lineTo(cx - headW * 0.5, headY + headH * 0.1);
      ctx.closePath();
      ctx.fillStyle = "#151528";
      ctx.fill();
      ctx.strokeStyle = palette.accent + "30";
      ctx.lineWidth = 1;
      ctx.stroke();
      break;

    case 6: // No accessory - clean look
      break;
  }

  ctx.restore();
}

function drawCyberEffects(
  ctx: CanvasRenderingContext2D,
  { cx, cy, size, palette, seed, rng, name, personality }: { cx: number; cy: number; size: number; palette: ColorPalette; seed: number; rng: SeededRandom; name: string; personality: string }
): void {
  ctx.save();

  // Floating particles
  const particleCount = rng.nextInt(15, 40);
  for (let i = 0; i < particleCount; i++) {
    const x = rng.nextFloat(0, size);
    const y = rng.nextFloat(0, size);
    const r = rng.nextFloat(0.5, 2.5);
    const color = rng.pick([palette.highlight, palette.accent, palette.primary]);
    const opacity = rng.nextFloat(0.1, 0.4);

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color + Math.round(opacity * 255).toString(16).padStart(2, "0");
    ctx.fill();
  }

  // Data streams
  const streamCount = rng.nextInt(2, 5);
  for (let s = 0; s < streamCount; s++) {
    const x = rng.nextFloat(size * 0.1, size * 0.9);
    const startY = rng.nextFloat(0, size * 0.3);
    const length = rng.nextFloat(size * 0.1, size * 0.4);
    const color = rng.pick([palette.primary, palette.accent]);

    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, startY + length);
    ctx.strokeStyle = color + "10";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Stream dots
    const dotCount = rng.nextInt(3, 8);
    for (let d = 0; d < dotCount; d++) {
      const dy = startY + (d / dotCount) * length;
      ctx.beginPath();
      ctx.arc(x, dy, rng.nextFloat(0.5, 1.5), 0, Math.PI * 2);
      ctx.fillStyle = color + "20";
      ctx.fill();
    }
  }

  // Hexagonal pattern overlay
  if (rng.next() > 0.5) {
    const hexSize = size * 0.03;
    ctx.strokeStyle = palette.primary + "06";
    ctx.lineWidth = 0.5;
    for (let row = 0; row < size / (hexSize * 1.5); row++) {
      for (let col = 0; col < size / (hexSize * 1.73); col++) {
        const hx = col * hexSize * 1.73 + (row % 2 ? hexSize * 0.865 : 0);
        const hy = row * hexSize * 1.5;
        drawHexagon(ctx, hx, hy, hexSize * 0.5);
      }
    }
  }

  // Character name watermark
  ctx.font = `bold ${size * 0.025}px monospace`;
  ctx.fillStyle = palette.primary + "08";
  ctx.textAlign = "center";
  ctx.fillText(name.toUpperCase(), cx, size * 0.92);

  ctx.restore();
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
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

function drawTechFrame(
  ctx: CanvasRenderingContext2D,
  { size, palette, seed, rng, riskLevel }: { size: number; palette: ColorPalette; seed: number; rng: SeededRandom; riskLevel: string }
): void {
  ctx.save();

  const borderColor = riskLevel === "Aggressive" ? "#ff4444" : riskLevel === "Conservative" ? "#44ff88" : palette.primary;

  // Corner brackets
  const bracketSize = size * 0.04;
  const margin = size * 0.03;
  ctx.strokeStyle = borderColor + "40";
  ctx.lineWidth = 2;

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

  // ID text
  ctx.font = `${size * 0.015}px monospace`;
  ctx.fillStyle = borderColor + "30";
  ctx.textAlign = "left";
  ctx.fillText(`ID:${seed.toString(16).slice(0, 8).toUpperCase()}`, margin + 4, size - margin - 6);

  ctx.restore();
}
