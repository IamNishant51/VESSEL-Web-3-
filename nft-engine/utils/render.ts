import sharp from "sharp";
import path from "node:path";

import { ensureDir } from "./file";
import { createSeededRandom } from "./hash";

export const CANVAS_SIZE = 1024;

type EnhanceOptions = {
  seed: number;
  isBackground: boolean;
  size?: number;
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export async function renderSvgToPng(svg: string, outputPath: string, size = CANVAS_SIZE): Promise<void> {
  await ensureDir(path.dirname(outputPath));
  await sharp(Buffer.from(svg)).resize(size, size, { fit: "fill" }).png({ compressionLevel: 9, effort: 8 }).toFile(outputPath);
}

function buildGrainOverlay(size: number, seed: number, intensity: number): Uint8Array {
  const rng = createSeededRandom(seed);
  const data = new Uint8Array(size * size * 4);

  for (let index = 0; index < size * size; index += 1) {
    const value = Math.floor(96 + rng() * 144);
    const alpha = Math.floor(intensity * (0.6 + rng() * 0.4));
    const offset = index * 4;
    data[offset] = value;
    data[offset + 1] = value;
    data[offset + 2] = value;
    data[offset + 3] = alpha;
  }

  return data;
}

function buildBackgroundVignetteSvg(size: number): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <radialGradient id="v" cx="50%" cy="44%" r="66%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="60%" stop-color="#0a0d17" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#020309" stop-opacity="0.52"/>
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#v)"/>
    </svg>
  `;
}

function buildTopSpecularSvg(size: number): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.48"/>
          <stop offset="36%" stop-color="#d7f5ff" stop-opacity="0.22"/>
          <stop offset="72%" stop-color="#79c5ff" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#s)"/>
    </svg>
  `;
}

function buildAmbientOcclusionSvg(size: number): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <radialGradient id="ao" cx="50%" cy="58%" r="62%">
          <stop offset="0%" stop-color="#000" stop-opacity="0"/>
          <stop offset="72%" stop-color="#03060f" stop-opacity="0.16"/>
          <stop offset="100%" stop-color="#010205" stop-opacity="0.4"/>
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#ao)"/>
    </svg>
  `;
}

function buildHoloStreaksSvg(size: number): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <line x1="0" y1="${Math.floor(size * 0.36)}" x2="${size}" y2="${Math.floor(size * 0.36)}" stroke="#6ee9ff" stroke-width="2" opacity="0.12"/>
      <line x1="0" y1="${Math.floor(size * 0.52)}" x2="${size}" y2="${Math.floor(size * 0.52)}" stroke="#7cb8ff" stroke-width="2" opacity="0.1"/>
      <line x1="0" y1="${Math.floor(size * 0.68)}" x2="${size}" y2="${Math.floor(size * 0.68)}" stroke="#ff7fc0" stroke-width="2" opacity="0.1"/>
    </svg>
  `;
}

function buildMicroDetailSvg(size: number, seed: number): string {
  const rng = createSeededRandom(seed ^ 0x9e3779b9);
  const fragments: string[] = [];

  for (let i = 0; i < 60; i += 1) {
    const x = Math.floor(rng() * size);
    const y = Math.floor(rng() * size);
    const len = 22 + Math.floor(rng() * 80);
    const angle = (rng() - 0.5) * 1.1;
    const x2 = Math.floor(x + Math.cos(angle) * len);
    const y2 = Math.floor(y + Math.sin(angle) * len);
    const stroke = rng() > 0.55 ? "#7de2ff" : "#ff9ed0";
    const opacity = (0.05 + rng() * 0.12).toFixed(3);
    const width = (1 + rng() * 1.5).toFixed(2);
    fragments.push(`<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" opacity="${opacity}"/>`);
  }

  for (let i = 0; i < 42; i += 1) {
    const cx = Math.floor(rng() * size);
    const cy = Math.floor(rng() * size);
    const r = (1.2 + rng() * 3.0).toFixed(2);
    const fill = rng() > 0.5 ? "#b6efff" : "#ffd7ef";
    const opacity = (0.04 + rng() * 0.1).toFixed(3);
    fragments.push(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${opacity}"/>`);
  }

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${fragments.join("")}
    </svg>
  `;
}

function buildMaterialToneSvg(size: number): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#1f2f4f" stop-opacity="0.56"/>
          <stop offset="42%" stop-color="#0f1f39" stop-opacity="0.34"/>
          <stop offset="100%" stop-color="#050b16" stop-opacity="0.66"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#steel)"/>
    </svg>
  `;
}

async function buildDirectionalShadeOverlay(inputPath: string, seed: number): Promise<Buffer> {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;
  const out = new Uint8Array(width * height * 4);

  const lightX = -0.42;
  const lightY = -0.48;
  const lightZ = 0.77;
  const halfX = -0.18;
  const halfY = -0.24;
  const halfZ = 0.95;

  function sampleHeight(x: number, y: number): number {
    const sx = Math.max(0, Math.min(width - 1, x));
    const sy = Math.max(0, Math.min(height - 1, y));
    const index = (sy * width + sx) * channels;
    const r = data[index] ?? 0;
    const g = data[index + 1] ?? 0;
    const b = data[index + 2] ?? 0;
    const a = data[index + 3] ?? 0;
    const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luma * 0.78 + (a / 255) * 0.22;
  }

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * channels;
      const alpha = (data[index + 3] ?? 0) / 255;

      if (alpha <= 0.001) {
        continue;
      }

      const hL = sampleHeight(x - 1, y);
      const hR = sampleHeight(x + 1, y);
      const hU = sampleHeight(x, y - 1);
      const hD = sampleHeight(x, y + 1);

      const nx0 = -(hR - hL) * 2.1;
      const ny0 = -(hD - hU) * 2.1;
      const nz0 = 1;
      const nLen = Math.hypot(nx0, ny0, nz0) || 1;
      const nx = nx0 / nLen;
      const ny = ny0 / nLen;
      const nz = nz0 / nLen;

      const lambert = clamp01(nx * lightX + ny * lightY + nz * lightZ);
      const spec = Math.pow(clamp01(nx * halfX + ny * halfY + nz * halfZ), 26);

      const seedFactor = ((seed >>> 2) % 37) / 37;
      const baseShade = 0.34 + lambert * 0.58;
      const cool = 0.54 + seedFactor * 0.18;

      const r = Math.round(clamp01((0.18 + baseShade * 0.52 + spec * 0.28) * (0.9 + seedFactor * 0.1)) * 255);
      const g = Math.round(clamp01((0.24 + baseShade * 0.64 + spec * 0.3) * cool) * 255);
      const b = Math.round(clamp01((0.32 + baseShade * 0.78 + spec * 0.34) * (1.02 + seedFactor * 0.08)) * 255);

      const outIndex = (y * width + x) * 4;
      out[outIndex] = r;
      out[outIndex + 1] = g;
      out[outIndex + 2] = b;
      out[outIndex + 3] = Math.round(alpha * 165);
    }
  }

  return sharp(out, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
}

export async function enhanceTraitPng(inputPath: string, outputPath: string, options: EnhanceOptions): Promise<void> {
  const size = options.size ?? CANVAS_SIZE;
  const grainRaw = buildGrainOverlay(size, options.seed, options.isBackground ? 16 : 20);
  const grainPng = await sharp(grainRaw, {
    raw: { width: size, height: size, channels: 4 },
  })
    .png()
    .toBuffer();

  const blurred = await sharp(inputPath)
    .blur(options.isBackground ? 7 : 5)
    .modulate({ brightness: options.isBackground ? 1.2 : 1.17, saturation: options.isBackground ? 1.28 : 1.3 })
    .png()
    .toBuffer();

  if (options.isBackground) {
    const vignette = Buffer.from(buildBackgroundVignetteSvg(size));
    await sharp(inputPath)
      .composite([
        { input: blurred, blend: "screen", opacity: 0.28 },
        { input: grainPng, blend: "soft-light", opacity: 1 },
        { input: vignette, blend: "multiply", opacity: 1 },
      ])
      .modulate({ brightness: 1.03, saturation: 1.22 })
      .gamma(1.06)
      .sharpen({ sigma: 1.0, m1: 1.2, m2: 2.0, x1: 2.0, y2: 10.0, y3: 18.0 })
      .png({ compressionLevel: 9, effort: 8 })
      .toFile(outputPath);
    return;
  }

  const alpha = await sharp(inputPath).ensureAlpha().extractChannel("alpha").png().toBuffer();
  const edgeExpanded = await sharp(alpha).dilate(2).blur(1.0).png().toBuffer();
  const edgeInner = await sharp(alpha).erode(2).blur(0.8).png().toBuffer();
  const edgeMask = await sharp(edgeExpanded)
    .composite([{ input: edgeInner, blend: "dest-out" }])
    .png()
    .toBuffer();

  const innerMask = await sharp(alpha).erode(7).blur(4.8).png().toBuffer();

  const edgeGlow = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 72, g: 214, b: 255 },
    },
  })
    .joinChannel(edgeMask)
    .png()
    .toBuffer();

  const magentaRim = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 255, g: 102, b: 188 },
    },
  })
    .joinChannel(edgeMask)
    .png()
    .toBuffer();

  const innerLight = await sharp({
    create: {
      width: size,
      height: size,
      channels: 3,
      background: { r: 148, g: 224, b: 255 },
    },
  })
    .joinChannel(innerMask)
    .png()
    .toBuffer();

  const embossedHighlight = await sharp(inputPath)
    .removeAlpha()
    .greyscale()
    .convolve({
      width: 3,
      height: 3,
      kernel: [-2, -1, 0, -1, 1, 1, 0, 1, 2],
    })
    .normalize()
    .tint("#8de7ff")
    .png()
    .toBuffer();

  const embossedShadow = await sharp(inputPath)
    .removeAlpha()
    .greyscale()
    .convolve({
      width: 3,
      height: 3,
      kernel: [2, 1, 0, 1, -1, -1, 0, -1, -2],
    })
    .normalize()
    .tint("#081327")
    .png()
    .toBuffer();

  const topSpecular = Buffer.from(buildTopSpecularSvg(size));
  const ambientOcclusion = Buffer.from(buildAmbientOcclusionSvg(size));
  const holoStreaks = Buffer.from(buildHoloStreaksSvg(size));
  const microDetail = Buffer.from(buildMicroDetailSvg(size, options.seed));
  const materialTone = Buffer.from(buildMaterialToneSvg(size));
  const directionalShade = await buildDirectionalShadeOverlay(inputPath, options.seed);

  const enhancedRgb = await sharp(inputPath)
    .removeAlpha()
    .composite([
      { input: blurred, blend: "screen", opacity: 0.14 },
      { input: embossedHighlight, blend: "screen", opacity: 0.1 },
      { input: embossedShadow, blend: "multiply", opacity: 0.44 },
      { input: materialTone, blend: "multiply", opacity: 0.82 },
      { input: directionalShade, blend: "overlay", opacity: 0.68 },
      { input: edgeGlow, blend: "screen", opacity: 0.3 },
      { input: magentaRim, blend: "screen", opacity: 0.12 },
      { input: innerLight, blend: "soft-light", opacity: 0.08 },
      { input: topSpecular, blend: "screen", opacity: 0.07 },
      { input: ambientOcclusion, blend: "multiply", opacity: 0.68 },
      { input: holoStreaks, blend: "screen", opacity: 0.18 },
      { input: microDetail, blend: "soft-light", opacity: 0.36 },
      { input: grainPng, blend: "soft-light", opacity: 1 },
    ])
    .modulate({ brightness: 0.86, saturation: 1.36 })
    .linear(1.16, -16)
    .gamma(1.03)
    .sharpen({ sigma: 1.15, m1: 1.25, m2: 2.25, x1: 2.0, y2: 12.0, y3: 22.0 })
    .png({ compressionLevel: 9, effort: 8 })
    .toBuffer();

  await sharp(enhancedRgb)
    .joinChannel(alpha)
    .png({ compressionLevel: 9, effort: 8 })
    .toFile(outputPath);
}

export async function compositePngLayers(layerPaths: string[], outputPath: string, size = CANVAS_SIZE): Promise<void> {
  await ensureDir(path.dirname(outputPath));
  const [firstLayer, ...restLayers] = layerPaths;
  if (!firstLayer) {
    throw new Error("No layer paths supplied");
  }

  const base = sharp(firstLayer).resize(size, size, { fit: "fill" });
  const metadata = await base.metadata();
  const flattenTarget = metadata.hasAlpha === false ? base : base;

  await flattenTarget
    .composite(restLayers.map((input) => ({ input })))
    .png({ compressionLevel: 9, effort: 8 })
    .toFile(outputPath);
}

export function safeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-{2,}/g, "-");
}
