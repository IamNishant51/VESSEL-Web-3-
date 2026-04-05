/**
 * Core Shape Generators
 * Central visual element that represents the agent's "soul"
 */

import { SeededRandom, simplex2 } from "./noise";
import type { ColorPalette } from "./palette";

export type CoreStyle =
  | "sacred-geometry"
  | "neural-network"
  | "crystal"
  | "orbital"
  | "mandala"
  | "fractal-tree"
  | "wave-form"
  | "energy-core";

export interface CoreConfig {
  style: CoreStyle;
  palette: ColorPalette;
  size: number;
  seed: number;
  complexity: number;
  energy: number; // 0-1, how dynamic
}

/**
 * Sacred geometry - Flower of Life / Metatron's Cube variants
 */
function drawSacredGeometry(ctx: CanvasRenderingContext2D, config: CoreConfig): void {
  const { palette, size, seed, complexity } = config;
  const rng = new SeededRandom(seed);
  const cx = size / 2;
  const cy = size / 2;
  const baseRadius = size * (0.1 + complexity * 0.15);
  const layers = Math.floor(2 + complexity * 4);

  ctx.save();
  ctx.translate(cx, cy);

  for (let layer = 0; layer < layers; layer++) {
    const radius = baseRadius * (layer + 1);
    const sides = rng.pick([6, 8, 12]);
    const rotation = (layer * Math.PI) / sides + rng.nextFloat(0, Math.PI / 12);
    const color = layer % 3 === 0 ? palette.primary : layer % 3 === 1 ? palette.secondary : palette.accent;

    ctx.strokeStyle = color + Math.round(60 + layer * 20).toString(16).padStart(2, "0");
    ctx.lineWidth = 1.5 - layer * 0.15;

    // Draw polygon
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + rotation;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Connect to center
    if (layer === 0) {
      ctx.strokeStyle = palette.highlight + "20";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + rotation;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        ctx.stroke();
      }
    }

    // Inner circles at vertices
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 + rotation;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const circleRadius = radius * 0.3;

      ctx.beginPath();
      ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
      ctx.strokeStyle = color + "15";
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
  }

  // Center glow
  const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, baseRadius * 0.5);
  centerGrad.addColorStop(0, palette.highlight + "40");
  centerGrad.addColorStop(1, palette.highlight + "00");
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(0, 0, baseRadius * 0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Neural network visualization
 */
function drawNeuralNetwork(ctx: CanvasRenderingContext2D, config: CoreConfig): void {
  const { palette, size, seed, complexity } = config;
  const rng = new SeededRandom(seed);
  const cx = size / 2;
  const cy = size / 2;

  // Generate nodes
  const nodeCount = Math.floor(15 + complexity * 40);
  const nodes: { x: number; y: number; r: number }[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const angle = rng.nextFloat(0, Math.PI * 2);
    const dist = rng.nextFloat(size * 0.05, size * 0.35);
    nodes.push({
      x: cx + Math.cos(angle) * dist,
      y: cy + Math.sin(angle) * dist,
      r: rng.nextFloat(2, 6),
    });
  }

  // Add center node
  nodes.unshift({ x: cx, y: cy, r: 8 });

  // Draw connections
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < size * 0.25) {
        const alpha = Math.round((1 - dist / (size * 0.25)) * 40).toString(16).padStart(2, "0");
        ctx.strokeStyle = palette.accent + alpha;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[j].x, nodes[j].y);
        ctx.stroke();
      }
    }
  }

  // Draw nodes
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const color = i === 0 ? palette.highlight : i % 3 === 0 ? palette.primary : palette.secondary;

    // Glow
    const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 3);
    glow.addColorStop(0, color + "40");
    glow.addColorStop(1, color + "00");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r * 3, 0, Math.PI * 2);
    ctx.fill();

    // Node
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

/**
 * Crystal structure
 */
function drawCrystal(ctx: CanvasRenderingContext2D, config: CoreConfig): void {
  const { palette, size, seed, complexity } = config;
  const rng = new SeededRandom(seed);
  const cx = size / 2;
  const cy = size / 2;
  const facets = Math.floor(6 + complexity * 12);

  ctx.save();
  ctx.translate(cx, cy);

  // Generate crystal points
  const points: { x: number; y: number; color: string }[] = [];
  for (let i = 0; i < facets; i++) {
    const angle = (i / facets) * Math.PI * 2 + rng.nextFloat(-0.1, 0.1);
    const dist = size * rng.nextFloat(0.1, 0.3);
    points.push({
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist,
      color: rng.pick([palette.primary, palette.secondary, palette.accent]),
    });
  }

  // Draw facets
  for (let i = 0; i < points.length; i++) {
    const next = points[(i + 1) % points.length];
    const color = points[i].color;

    // Facet triangle
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(points[i].x, points[i].y);
    ctx.lineTo(next.x, next.y);
    ctx.closePath();

    const grad = ctx.createLinearGradient(0, 0, (points[i].x + next.x) / 2, (points[i].y + next.y) / 2);
    grad.addColorStop(0, color + "30");
    grad.addColorStop(1, color + "10");
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = color + "50";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Center highlight
  const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.05);
  centerGrad.addColorStop(0, palette.highlight + "60");
  centerGrad.addColorStop(1, palette.highlight + "00");
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.05, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Orbital system
 */
function drawOrbital(ctx: CanvasRenderingContext2D, config: CoreConfig): void {
  const { palette, size, seed, complexity } = config;
  const rng = new SeededRandom(seed);
  const cx = size / 2;
  const cy = size / 2;
  const orbitCount = Math.floor(2 + complexity * 4);

  ctx.save();
  ctx.translate(cx, cy);

  // Draw orbits
  for (let i = 0; i < orbitCount; i++) {
    const radius = size * (0.08 + i * 0.07);
    const tilt = rng.nextFloat(-0.3, 0.3);
    const color = i % 3 === 0 ? palette.primary : i % 3 === 1 ? palette.secondary : palette.accent;

    ctx.save();
    ctx.rotate(tilt);

    // Orbit ring
    ctx.beginPath();
    ctx.ellipse(0, 0, radius, radius * 0.3, 0, 0, Math.PI * 2);
    ctx.strokeStyle = color + "30";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Orbiting body
    const bodyAngle = rng.nextFloat(0, Math.PI * 2);
    const bodyX = Math.cos(bodyAngle) * radius;
    const bodyY = Math.sin(bodyAngle) * radius * 0.3;
    const bodyR = rng.nextFloat(3, 8);

    const bodyGlow = ctx.createRadialGradient(bodyX, bodyY, 0, bodyX, bodyY, bodyR * 3);
    bodyGlow.addColorStop(0, color + "50");
    bodyGlow.addColorStop(1, color + "00");
    ctx.fillStyle = bodyGlow;
    ctx.beginPath();
    ctx.arc(bodyX, bodyY, bodyR * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(bodyX, bodyY, bodyR, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    ctx.restore();
  }

  // Core
  const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.06);
  coreGrad.addColorStop(0, palette.highlight + "80");
  coreGrad.addColorStop(0.5, palette.primary + "40");
  coreGrad.addColorStop(1, palette.primary + "00");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.06, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Mandala pattern
 */
function drawMandala(ctx: CanvasRenderingContext2D, config: CoreConfig): void {
  const { palette, size, seed, complexity } = config;
  const rng = new SeededRandom(seed);
  const cx = size / 2;
  const cy = size / 2;
  const symmetry = rng.pick([6, 8, 12, 16]);
  const layers = Math.floor(3 + complexity * 5);

  ctx.save();
  ctx.translate(cx, cy);

  for (let layer = 0; layer < layers; layer++) {
    const radius = size * (0.05 + layer * 0.06);
    const color = layer % 3 === 0 ? palette.primary : layer % 3 === 1 ? palette.secondary : palette.accent;

    for (let i = 0; i < symmetry; i++) {
      const angle = (i / symmetry) * Math.PI * 2;

      ctx.save();
      ctx.rotate(angle);

      // Petal shape
      ctx.beginPath();
      ctx.moveTo(radius * 0.3, 0);
      ctx.quadraticCurveTo(radius * 0.6, -radius * 0.15, radius, 0);
      ctx.quadraticCurveTo(radius * 0.6, radius * 0.15, radius * 0.3, 0);
      ctx.closePath();

      const petalGrad = ctx.createLinearGradient(radius * 0.3, 0, radius, 0);
      petalGrad.addColorStop(0, color + "30");
      petalGrad.addColorStop(1, color + "10");
      ctx.fillStyle = petalGrad;
      ctx.fill();

      ctx.strokeStyle = color + "40";
      ctx.lineWidth = 0.5;
      ctx.stroke();

      ctx.restore();
    }

    // Ring
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color + "15";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Center
  const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.04);
  centerGrad.addColorStop(0, palette.highlight + "50");
  centerGrad.addColorStop(1, palette.highlight + "00");
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.04, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Fractal tree
 */
function drawFractalTree(ctx: CanvasRenderingContext2D, config: CoreConfig): void {
  const { palette, size, seed, complexity } = config;
  const rng = new SeededRandom(seed);
  const cx = size / 2;
  const cy = size * 0.7;
  const maxDepth = Math.floor(4 + complexity * 4);

  function branch(x: number, y: number, angle: number, length: number, depth: number) {
    if (depth > maxDepth || length < 2) return;

    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    const color = depth < maxDepth * 0.5 ? palette.primary : palette.accent;
    const alpha = Math.round((1 - depth / maxDepth) * 60).toString(16).padStart(2, "0");

    ctx.strokeStyle = color + alpha;
    ctx.lineWidth = Math.max(0.5, (maxDepth - depth) * 0.8);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    const branchCount = rng.nextInt(2, 3);
    for (let i = 0; i < branchCount; i++) {
      const newAngle = angle + rng.nextFloat(-0.6, 0.6);
      const newLength = length * rng.nextFloat(0.6, 0.8);
      branch(endX, endY, newAngle, newLength, depth + 1);
    }
  }

  branch(cx, cy, -Math.PI / 2, size * 0.15, 0);
}

/**
 * Wave form
 */
function drawWaveForm(ctx: CanvasRenderingContext2D, config: CoreConfig): void {
  const { palette, size, seed, complexity, energy } = config;
  const cx = size / 2;
  const cy = size / 2;
  const waveCount = Math.floor(3 + complexity * 6);

  ctx.save();
  ctx.translate(cx, cy);

  for (let w = 0; w < waveCount; w++) {
    const color = w % 3 === 0 ? palette.primary : w % 3 === 1 ? palette.secondary : palette.accent;
    const amplitude = size * (0.03 + energy * 0.08);
    const frequency = 0.02 + w * 0.005;
    const yOffset = (w - waveCount / 2) * size * 0.04;

    ctx.beginPath();
    for (let x = -size / 2; x <= size / 2; x += 2) {
      const noise = simplex2(x * frequency + w * 10, w * 3) * amplitude;
      const y = yOffset + Math.sin(x * frequency * 3 + w) * amplitude + noise;

      if (x === -size / 2) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }

    ctx.strokeStyle = color + Math.round(40 + w * 10).toString(16).padStart(2, "0");
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Energy core - pulsating central energy
 */
function drawEnergyCore(ctx: CanvasRenderingContext2D, config: CoreConfig): void {
  const { palette, size, seed, complexity, energy } = config;
  const rng = new SeededRandom(seed);
  const cx = size / 2;
  const cy = size / 2;
  const coreRadius = size * (0.05 + energy * 0.08);

  // Outer rings
  const ringCount = Math.floor(2 + complexity * 4);
  for (let i = ringCount; i >= 0; i--) {
    const radius = coreRadius * (1 + i * 0.8);
    const color = i % 3 === 0 ? palette.primary : i % 3 === 1 ? palette.secondary : palette.accent;

    const ringGrad = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius);
    ringGrad.addColorStop(0, color + "00");
    ringGrad.addColorStop(0.7, color + "15");
    ringGrad.addColorStop(1, color + "00");
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();

    // Ring outline
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = color + "20";
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Core
  const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
  coreGrad.addColorStop(0, palette.highlight + "90");
  coreGrad.addColorStop(0.3, palette.primary + "60");
  coreGrad.addColorStop(0.7, palette.secondary + "30");
  coreGrad.addColorStop(1, palette.secondary + "00");
  ctx.fillStyle = coreGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
  ctx.fill();

  // Energy particles
  const particleCount = Math.floor(20 + complexity * 60);
  for (let i = 0; i < particleCount; i++) {
    const angle = rng.nextFloat(0, Math.PI * 2);
    const dist = rng.nextFloat(coreRadius, coreRadius * 3);
    const x = cx + Math.cos(angle) * dist;
    const y = cy + Math.sin(angle) * dist;
    const r = rng.nextFloat(0.5, 2);
    const color = rng.pick([palette.highlight, palette.accent, palette.primary]);

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color + Math.round(rng.nextFloat(30, 80)).toString(16).padStart(2, "0");
    ctx.fill();
  }
}

/**
 * Main core generator
 */
export function drawCore(
  ctx: CanvasRenderingContext2D,
  config: CoreConfig
): void {
  const generators: Record<CoreStyle, typeof drawSacredGeometry> = {
    "sacred-geometry": drawSacredGeometry,
    "neural-network": drawNeuralNetwork,
    crystal: drawCrystal,
    orbital: drawOrbital,
    mandala: drawMandala,
    "fractal-tree": drawFractalTree,
    "wave-form": drawWaveForm,
    "energy-core": drawEnergyCore,
  };

  const generator = generators[config.style];
  generator(ctx, config);
}

/**
 * Get core style from seed
 */
export function getCoreStyle(seed: number): CoreStyle {
  const styles: CoreStyle[] = [
    "sacred-geometry", "neural-network", "crystal", "orbital",
    "mandala", "fractal-tree", "wave-form", "energy-core",
  ];
  const rng = new SeededRandom(seed);
  return rng.pick(styles);
}
