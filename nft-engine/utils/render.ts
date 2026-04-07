import sharp, { Blend } from "sharp";
import path from "node:path";

import { ensureDir } from "./file";
import { createSeededRandom } from "./hash";

export const CANVAS_SIZE = 1024;

type EnhanceOptions = {
  seed: number;
  isBackground: boolean;
  size?: number;
};

type ColorGradePreset = "anime" | "cyberpunk" | "pastel" | "noir" | "vibrant";

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

function buildFilmGrainOverlay(size: number, seed: number): Uint8Array {
  const rng = createSeededRandom(seed + 5000);
  const data = new Uint8Array(size * size * 4);

  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const noise = Math.floor(rng() * 48);
      const alpha = Math.floor(12 + rng() * 20);
      const offset = (y * size + x) * 4;
      data[offset] = noise;
      data[offset + 1] = noise;
      data[offset + 2] = noise;
      data[offset + 3] = alpha;
    }
  }

  return data;
}

function buildChromaticAberrationBuffer(size: number, seed: number, intensity: number): { r: Uint8Array; g: Uint8Array; b: Uint8Array } {
  const rng = createSeededRandom(seed + 1000);
  const r = new Uint8Array(size * size * 4);
  const g = new Uint8Array(size * size * 4);
  const b = new Uint8Array(size * size * 4);

  const centerX = size / 2;
  const centerY = size / 2;
  const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
  const offset = Math.floor(size * 0.015 * intensity);

  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
      const falloff = Math.pow(dist, 1.5);
      const shift = Math.floor(offset * falloff * (0.8 + rng() * 0.4));

      const rOffset = ((y * size + Math.min(size - 1, x + shift)) * 4);
      const gOffset = ((y * size + x) * 4);
      const bOffset = ((y * size + Math.max(0, x - shift)) * 4);

      r[rOffset] = rOffset;
      r[rOffset + 1] = rOffset;
      r[rOffset + 2] = rOffset;
      r[rOffset + 3] = Math.floor(64 * falloff);

      g[gOffset] = gOffset;
      g[gOffset + 1] = gOffset;
      g[gOffset + 2] = gOffset;
      g[gOffset + 3] = Math.floor(64 * falloff);

      b[bOffset] = bOffset;
      b[bOffset + 1] = bOffset;
      b[bOffset + 2] = bOffset;
      b[bOffset + 3] = Math.floor(64 * falloff);
    }
  }

  return { r, g, b };
}

function buildBackgroundVignetteSvg(size: number, seed: number): string {
  const rng = createSeededRandom(seed + 2000);
  const intensity = 0.3 + rng() * 0.25;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <radialGradient id="v" cx="50%" cy="44%" r="66%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="60%" stop-color="#0a0d17" stop-opacity="${intensity * 0.7}"/>
          <stop offset="100%" stop-color="#020309" stop-opacity="${intensity}"/>
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#v)"/>
    </svg>
  `;
}

function buildThreePointLightingSvg(size: number, seed: number): string {
  const rng = createSeededRandom(seed + 3000);
  const keyIntensity = 0.7 + rng() * 0.3;
  const fillIntensity = 0.2 + rng() * 0.15;
  const rimIntensity = 0.4 + rng() * 0.3;
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="keyLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="${keyIntensity}"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="fillLight" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#a8d4ff" stop-opacity="${fillIntensity}"/>
          <stop offset="100%" stop-color="#a8d4ff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="rimLight" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stop-color="#ffb8d4" stop-opacity="${rimIntensity}"/>
          <stop offset="50%" stop-color="#ffffff" stop-opacity="${rimIntensity * 0.5}"/>
          <stop offset="100%" stop-color="#ffb8d4" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#keyLight)"/>
      <rect width="${size}" height="${size}" fill="url(#fillLight)"/>
      <rect width="${size}" height="${size}" fill="url(#rimLight)"/>
    </svg>
  `;
}

function buildSubsurfaceScatteringSvg(size: number): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <radialGradient id="sss" cx="40%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#ffb8a8" stop-opacity="0.25"/>
          <stop offset="40%" stop-color="#ff9080" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#ff6050" stop-opacity="0"/>
        </radialGradient>
        <filter id="sssBlur">
          <feGaussianBlur stdDeviation="24"/>
        </filter>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#sss)" filter="url(#sssBlur)"/>
    </svg>
  `;
}

function buildSoftFocusOverlay(size: number): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <filter id="softFocus" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="1.5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      <rect width="${size}" height="${size}" fill="#ffffff" opacity="0.03" filter="url(#softFocus)"/>
    </svg>
  `;
}

function buildColorGradeOverlay(size: number, preset: ColorGradePreset): string {
  const presets = {
    anime: { shadows: "#1a2a4a", midtones: "#4a6a8a", highlights: "#f0e8d8", tint: 0.08 },
    cyberpunk: { shadows: "#0a0a20", midtones: "#4a2a6a", highlights: "#ff6090", tint: 0.12 },
    pastel: { shadows: "#e8d8d0", midtones: "#c8e8f0", highlights: "#fff8f0", tint: 0.05 },
    noir: { shadows: "#0a0a0a", midtones: "#303030", highlights: "#e8e8e8", tint: 0.15 },
    vibrant: { shadows: "#180830", midtones: "#8040a0", highlights: "#fff8e0", tint: 0.1 },
  };
  
  const p = presets[preset];
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="cgShadows" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="${p.shadows}" stop-opacity="${p.tint}"/>
          <stop offset="100%" stop-color="${p.shadows}" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="cgHighlights" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="${p.highlights}" stop-opacity="${p.tint * 0.7}"/>
          <stop offset="100%" stop-color="${p.highlights}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#cgShadows)"/>
      <rect width="${size}" height="${size}" fill="url(#cgHighlights)"/>
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
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
          <stop offset="55%" stop-color="#000000" stop-opacity="0.22"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.52"/>
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#ao)"/>
    </svg>
  `;
}

function buildHoloStreaksSvg(size: number): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="holo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#00ffff" stop-opacity="0"/>
          <stop offset="45%" stop-color="#00ffff" stop-opacity="0.06"/>
          <stop offset="50%" stop-color="#ff00ff" stop-opacity="0.08"/>
          <stop offset="55%" stop-color="#00ffff" stop-opacity="0.06"/>
          <stop offset="100%" stop-color="#00ffff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#holo)" transform="rotate(25 ${size/2} ${size/2})"/>
    </svg>
  `;
}

function buildMicroDetailSvg(size: number, seed: number): string {
  const rng = createSeededRandom(seed + 4000);
  const count = Math.floor(3 + rng() * 5);
  let rects = "";
  
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rng() * size);
    const y = Math.floor(rng() * size);
    const w = Math.floor(20 + rng() * 80);
    const h = Math.floor(20 + rng() * 80);
    const opacity = 0.02 + rng() * 0.04;
    rects += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ffffff" opacity="${opacity}"/>`;
  }
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${rects}
    </svg>
  `;
}

function buildMaterialToneSvg(size: number): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="material" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#e8f4ff" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#1a2030" stop-opacity="0.12"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#material)"/>
    </svg>
  `;
}

async function buildDirectionalShadeOverlay(inputPath: string, seed: number): Promise<Buffer> {
  const size = CANVAS_SIZE;
  const rng = createSeededRandom(seed + 6000);
  const lightAngle = rng() * Math.PI * 2;
  const lightX = Math.cos(lightAngle) * 0.5;
  const lightY = -0.5 + rng() * 0.3;
  const lightZ = 0.7;
  const width = size;
  const height = size;

  const inputBuffer = await sharp(inputPath).raw().toBuffer();
  const out = new Uint8Array(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const inOffset = (y * width + x) * 4;
      const alpha = inputBuffer[inOffset + 3];
      
      if (alpha < 10) {
        out[inOffset] = 0;
        out[inOffset + 1] = 0;
        out[inOffset + 2] = 0;
        out[inOffset + 3] = 0;
        continue;
      }

      const nx = (x / width - 0.5) * 2;
      const ny = (y / height - 0.5) * 2;
      const nz = 1 - Math.sqrt(nx * nx + ny * ny);
      
      if (nz <= 0) {
        out[inOffset] = 128;
        out[inOffset + 1] = 128;
        out[inOffset + 2] = 128;
        out[inOffset + 3] = 128;
        continue;
      }

      const lambert = clamp01(nx * lightX + ny * lightY + nz * lightZ);
      const shade = lambert * 0.5 + 0.5;
      const val = Math.floor(shade * 255);
      
      out[inOffset] = val;
      out[inOffset + 1] = val;
      out[inOffset + 2] = val;
      out[inOffset + 3] = 200;
    }
  }

  return sharp(out, {
    raw: { width, height, channels: 4 },
  })
    .png()
    .toBuffer();
}

function selectColorGrade(seed: number): ColorGradePreset {
  const rng = createSeededRandom(seed + 8000);
  const roll = rng();
  if (roll < 0.35) return "anime";
  if (roll < 0.55) return "cyberpunk";
  if (roll < 0.75) return "pastel";
  if (roll < 0.9) return "vibrant";
  return "noir";
}

export async function enhanceTraitPng(inputPath: string, outputPath: string, options: EnhanceOptions): Promise<void> {
  const size = options.size ?? CANVAS_SIZE;
  const colorGrade = selectColorGrade(options.seed);
  
  const grainRaw = buildGrainOverlay(size, options.seed, options.isBackground ? 16 : 20);
  const grainPng = await sharp(grainRaw, {
    raw: { width: size, height: size, channels: 4 },
  }).png().toBuffer();

  const filmGrainRaw = buildFilmGrainOverlay(size, options.seed);
  const filmGrainPng = await sharp(filmGrainRaw, {
    raw: { width: size, height: size, channels: 4 },
  }).png().toBuffer();

  const brightnessMod = options.isBackground ? 1.2 : 1.17;
  const saturationMod = options.isBackground ? 1.28 : 1.3;

  const blurred = await sharp(inputPath)
    .blur(options.isBackground ? 7 : 5)
    .modulate({ brightness: brightnessMod, saturation: saturationMod })
    .png()
    .toBuffer();

  if (options.isBackground) {
    const vignette = Buffer.from(buildBackgroundVignetteSvg(size, options.seed));
    const colorGradeOverlay = Buffer.from(buildColorGradeOverlay(size, colorGrade));
    
    const blurredWithOpacity = await sharp(blurred).modulate({ brightness: 0.28 }).toBuffer();
    const colorGradeWithOpacity = await sharp(colorGradeOverlay).modulate({ brightness: 0.35 }).toBuffer();
    
    await sharp(inputPath)
      .composite([
        { input: blurredWithOpacity, blend: "screen" as Blend },
        { input: grainPng, blend: "soft-light" as Blend },
        { input: vignette, blend: "multiply" as Blend },
        { input: colorGradeWithOpacity, blend: "overlay" as Blend },
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
    .composite([{ input: edgeInner, blend: "dest-out" as Blend }])
    .png()
    .toBuffer();

  const innerMask = await sharp(alpha).erode(7).blur(4.8).png().toBuffer();

  const edgeGlow = await sharp({
    create: { width: size, height: size, channels: 3, background: { r: 72, g: 214, b: 255 } },
  })
    .joinChannel(edgeMask)
    .png()
    .toBuffer();

  const magentaRim = await sharp({
    create: { width: size, height: size, channels: 3, background: { r: 255, g: 102, b: 188 } },
  })
    .joinChannel(edgeMask)
    .png()
    .toBuffer();

  const cyanRim = await sharp({
    create: { width: size, height: size, channels: 3, background: { r: 0, g: 200, b: 220 } },
  })
    .joinChannel(edgeMask)
    .png()
    .toBuffer();

  const innerLight = await sharp({
    create: { width: size, height: size, channels: 3, background: { r: 148, g: 224, b: 255 } },
  })
    .joinChannel(innerMask)
    .png()
    .toBuffer();

  const sssOverlay = Buffer.from(buildSubsurfaceScatteringSvg(size));
  const threePointLight = Buffer.from(buildThreePointLightingSvg(size, options.seed));
  const colorGradeOverlay = Buffer.from(buildColorGradeOverlay(size, colorGrade));
  const softFocus = Buffer.from(buildSoftFocusOverlay(size));

  const embossedHighlight = await sharp(inputPath)
    .removeAlpha()
    .greyscale()
    .convolve({ width: 3, height: 3, kernel: [-2, -1, 0, -1, 1, 1, 0, 1, 2] })
    .normalize()
    .tint("#8de7ff")
    .png()
    .toBuffer();

  const embossedShadow = await sharp(inputPath)
    .removeAlpha()
    .greyscale()
    .convolve({ width: 3, height: 3, kernel: [2, 1, 0, 1, -1, -1, 0, -1, -2] })
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

  const compositeOps = [
    { input: blurred, blend: "screen" as Blend, opacity: 0.14 },
    { input: embossedHighlight, blend: "screen" as Blend, opacity: 0.1 },
    { input: embossedShadow, blend: "multiply" as Blend, opacity: 0.44 },
    { input: materialTone, blend: "multiply" as Blend, opacity: 0.82 },
    { input: directionalShade, blend: "overlay" as Blend, opacity: 0.68 },
    { input: edgeGlow, blend: "screen" as Blend, opacity: 0.25 },
    { input: magentaRim, blend: "screen" as Blend, opacity: 0.08 },
    { input: cyanRim, blend: "screen" as Blend, opacity: 0.15 },
    { input: innerLight, blend: "soft-light" as Blend, opacity: 0.08 },
    { input: sssOverlay, blend: "soft-light" as Blend, opacity: 0.2 },
    { input: threePointLight, blend: "overlay" as Blend, opacity: 0.18 },
    { input: topSpecular, blend: "screen" as Blend, opacity: 0.07 },
    { input: ambientOcclusion, blend: "multiply" as Blend, opacity: 0.68 },
    { input: holoStreaks, blend: "screen" as Blend, opacity: 0.18 },
    { input: microDetail, blend: "soft-light" as Blend, opacity: 0.36 },
    { input: colorGradeOverlay, blend: "overlay" as Blend, opacity: 0.28 },
    { input: softFocus, blend: "screen" as Blend, opacity: 0.15 },
    { input: grainPng, blend: "soft-light" as Blend, opacity: 1 },
  ];

  const enhancedRgb = await sharp(inputPath)
    .removeAlpha()
    .composite(compositeOps)
    .modulate({ brightness: 0.88, saturation: 1.4 })
    .linear(1.18, -20)
    .gamma(1.02)
    .sharpen({ sigma: 1.2, m1: 1.3, m2: 2.4, x1: 2.2, y2: 14.0, y3: 24.0 })
    .png({ compressionLevel: 9, effort: 8 })
    .toBuffer();

  const filmGrainWithOpacity = await sharp(filmGrainPng).modulate({ brightness: 0.6 }).toBuffer();

  await sharp(enhancedRgb)
    .composite([{ input: filmGrainWithOpacity, blend: "overlay" as Blend }])
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
