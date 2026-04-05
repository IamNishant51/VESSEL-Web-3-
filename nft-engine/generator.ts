import path from "node:path";
import { fileURLToPath } from "node:url";

import { COLLECTION_DESCRIPTION, COLLECTION_NAME, LAYER_ORDER, rarityScore, TRAIT_LIBRARY, traitsForLayer, type CharacterFamily, type LayerName, type RarityTier, type TraitDefinition, isTraitCompatible } from "./trait-library";
import { createSeededRandom, hashString, padNumber, slugify, weightedPick } from "./utils/hash";
import { copyFileSafe, ensureDir, pathExists, writeJson } from "./utils/file";
import { CANVAS_SIZE, compositePngLayers, enhanceTraitPng, renderSvgToPng } from "./utils/render";

type TraitSelection = Record<LayerName, TraitDefinition>;

type GeneratedNFTMetadata = {
  tokenId: number;
  uniqueId: string;
  name: string;
  description: string;
  image: string;
  attributes: Array<{ trait_type: string; value: string | number }>;
  properties: {
    category: "image";
    files: Array<{ uri: string; type: "image/png" }>;
    rarity: {
      tier: RarityTier;
      score: number;
    };
    seed: number;
    traitPaths: Record<LayerName, string>;
  };
};

type GenerationOptions = {
  count: number;
  seed: number;
  syncPublicCount: number;
  outputRoot: string;
  traitsRoot: string;
  publicAvatarRoot: string;
  collectionName: string;
  description: string;
};

function parseArg(name: string, fallback: number): number {
  const exact = process.argv.find((value) => value.startsWith(`--${name}=`));
  if (!exact) return fallback;
  const raw = exact.split("=").slice(1).join("=");
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseStringArg(name: string, fallback: string): string {
  const exact = process.argv.find((value) => value.startsWith(`--${name}=`));
  if (!exact) return fallback;
  const raw = exact.split("=").slice(1).join("=");
  return raw || fallback;
}

function pickCompatibleTrait(rng: () => number, pool: TraitDefinition[], family: CharacterFamily): TraitDefinition {
  const compatible = pool.filter((trait) => isTraitCompatible(trait, family));
  return weightedPick(rng, compatible.length > 0 ? compatible : pool);
}

function composeSignature(selection: TraitSelection): string {
  return LAYER_ORDER.map((layer) => selection[layer].id).join("|");
}

function deriveFinalRarity(selection: TraitSelection): { tier: RarityTier; score: number } {
  const score =
    rarityScore(selection.background.rarity) +
    rarityScore(selection.body.rarity) +
    rarityScore(selection.clothing.rarity) +
    rarityScore(selection.eyes.rarity) +
    rarityScore(selection.hair.rarity) +
    rarityScore(selection.headgear.rarity) +
    rarityScore(selection.accessories.rarity) +
    rarityScore(selection.effects.rarity);

  const average = score / LAYER_ORDER.length;
  if (average >= 4.2) return { tier: "legendary", score };
  if (average >= 3.3) return { tier: "epic", score };
  if (average >= 2.5) return { tier: "rare", score };
  if (average >= 1.7) return { tier: "uncommon", score };
  return { tier: "common", score };
}

function traitSummary(selection: TraitSelection): Array<{ trait_type: string; value: string | number }> {
  return [
    { trait_type: "Background", value: selection.background.name },
    { trait_type: "Body", value: selection.body.name },
    { trait_type: "Clothing", value: selection.clothing.name },
    { trait_type: "Eyes", value: selection.eyes.name },
    { trait_type: "Hair", value: selection.hair.name },
    { trait_type: "Headgear", value: selection.headgear.name },
    { trait_type: "Accessories", value: selection.accessories.name },
    { trait_type: "Effects", value: selection.effects.name },
    { trait_type: "Background Rarity", value: selection.background.rarity },
    { trait_type: "Body Rarity", value: selection.body.rarity },
    { trait_type: "Collection Tier", value: deriveFinalRarity(selection).tier },
  ];
}

function buildImageFileName(tokenId: number): string {
  return `${padNumber(tokenId, 4)}.png`;
}

function getResolvedOptions(options: Partial<GenerationOptions> = {}): GenerationOptions {
  return {
    count: options.count ?? 1024,
    seed: options.seed ?? 177538,
    syncPublicCount: options.syncPublicCount ?? 44,
    outputRoot: options.outputRoot ?? path.resolve(process.cwd(), "nft-engine", "output"),
    traitsRoot: options.traitsRoot ?? path.resolve(process.cwd(), "nft-engine", "traits"),
    publicAvatarRoot: options.publicAvatarRoot ?? path.resolve(process.cwd(), "public", "avatars"),
    collectionName: options.collectionName ?? COLLECTION_NAME,
    description: options.description ?? COLLECTION_DESCRIPTION,
  };
}

function layerFolderName(layer: LayerName): string {
  switch (layer) {
    case "background":
      return "backgrounds";
    case "body":
      return "bodies";
    case "clothing":
      return "clothing";
    case "eyes":
      return "eyes";
    case "hair":
      return "hair";
    case "headgear":
      return "headgear";
    case "accessories":
      return "accessories";
    case "effects":
      return "effects";
  }
}

function traitPngPath(traitsRoot: string, trait: TraitDefinition): string {
  return path.join(traitsRoot, layerFolderName(trait.layer), `${trait.id}.png`);
}

async function generateTraitAssetsInternal(options: GenerationOptions): Promise<void> {
  const tempRoot = path.join(options.traitsRoot, ".tmp");
  await ensureDir(tempRoot);

  for (const layer of LAYER_ORDER) {
    await ensureDir(path.join(options.traitsRoot, layerFolderName(layer)));
  }

  for (const layer of LAYER_ORDER) {
    for (const trait of traitsForLayer(layer)) {
      const target = traitPngPath(options.traitsRoot, trait);
      const temp = path.join(tempRoot, `${trait.layer}-${trait.id}.png`);
      await renderSvgToPng(trait.svg, temp, CANVAS_SIZE);
      await enhanceTraitPng(temp, target, {
        seed: hashString(`${trait.layer}:${trait.id}`),
        isBackground: trait.layer === "background",
        size: CANVAS_SIZE,
      });
    }
  }

  const totalTraits = LAYER_ORDER.reduce((sum, layer) => sum + traitsForLayer(layer).length, 0);

  await writeJson(path.join(options.traitsRoot, "traits-manifest.json"), {
    generatedAt: new Date().toISOString(),
    canvasSize: CANVAS_SIZE,
    totalTraits,
    layers: LAYER_ORDER.map((layer) => ({
      layer,
      folder: layerFolderName(layer),
      count: traitsForLayer(layer).length,
      traits: traitsForLayer(layer).map((trait) => ({
        id: trait.id,
        name: trait.name,
        rarity: trait.rarity,
        weight: trait.weight,
        family: trait.family,
        families: trait.families,
        path: traitPngPath(options.traitsRoot, trait),
      })),
    })),
  });
}

export async function generateTraitAssets(options: Partial<GenerationOptions> = {}) {
  const resolved = getResolvedOptions(options);
  await generateTraitAssetsInternal(resolved);
  return { options: resolved };
}

async function generateOne(
  tokenId: number,
  options: GenerationOptions,
  usedSignatures: Set<string>,
): Promise<GeneratedNFTMetadata> {
  let attempt = 0;
  let seed = hashString(`${options.collectionName}:${options.seed}:${tokenId}`);
  const bodyPool = traitsForLayer("body");

  while (attempt < 350) {
    const rng = createSeededRandom(seed);
    const body = weightedPick(rng, bodyPool);
    const family = body.family ?? "humanoid";
    const selection: TraitSelection = {
      background: weightedPick(rng, traitsForLayer("background")),
      body,
      clothing: pickCompatibleTrait(rng, traitsForLayer("clothing"), family),
      eyes: pickCompatibleTrait(rng, traitsForLayer("eyes"), family),
      hair: pickCompatibleTrait(rng, traitsForLayer("hair"), family),
      headgear: pickCompatibleTrait(rng, traitsForLayer("headgear"), family),
      accessories: pickCompatibleTrait(rng, traitsForLayer("accessories"), family),
      effects: pickCompatibleTrait(rng, traitsForLayer("effects"), family),
    };

    const signature = composeSignature(selection);
    if (!usedSignatures.has(signature)) {
      usedSignatures.add(signature);
      const layerPaths: Record<LayerName, string> = {
        background: traitPngPath(options.traitsRoot, selection.background),
        body: traitPngPath(options.traitsRoot, selection.body),
        clothing: traitPngPath(options.traitsRoot, selection.clothing),
        eyes: traitPngPath(options.traitsRoot, selection.eyes),
        hair: traitPngPath(options.traitsRoot, selection.hair),
        headgear: traitPngPath(options.traitsRoot, selection.headgear),
        accessories: traitPngPath(options.traitsRoot, selection.accessories),
        effects: traitPngPath(options.traitsRoot, selection.effects),
      };

      for (const layer of LAYER_ORDER) {
        if (!(await pathExists(layerPaths[layer]))) {
          throw new Error(`Missing phase-1 trait asset: ${layerPaths[layer]}`);
        }
      }

      const imageFileName = buildImageFileName(tokenId);
      const imagePath = path.join(options.outputRoot, "images", imageFileName);
      const imageUri = `/nft-engine/output/images/${imageFileName}`;

      await compositePngLayers(
        [
          layerPaths.background,
          layerPaths.body,
          layerPaths.clothing,
          layerPaths.eyes,
          layerPaths.headgear,
          layerPaths.accessories,
          layerPaths.effects,
        ],
        imagePath,
        CANVAS_SIZE,
      );

      const finalRarity = deriveFinalRarity(selection);
      const metadata: GeneratedNFTMetadata = {
        tokenId,
        uniqueId: `${slugify(options.collectionName)}-${padNumber(tokenId, 4)}`,
        name: `${options.collectionName} #${padNumber(tokenId, 4)}`,
        description: options.description,
        image: imageUri,
        attributes: [
          ...traitSummary(selection),
          { trait_type: "Seed", value: seed },
          { trait_type: "Final Rarity Tier", value: finalRarity.tier },
          { trait_type: "Final Rarity Score", value: finalRarity.score },
          { trait_type: "Body Family", value: selection.body.family ?? "humanoid" },
        ],
        properties: {
          category: "image",
          files: [{ uri: imageUri, type: "image/png" }],
          rarity: finalRarity,
          seed,
          traitPaths: layerPaths,
        },
      };

      return metadata;
    }

    attempt += 1;
    seed = hashString(`${seed}:${attempt}:${options.collectionName}`);
  }

  throw new Error(`Unable to create a unique NFT composition for token ${tokenId}`);
}

async function syncPublicAvatars(
  count: number,
  outputRoot: string,
  publicAvatarRoot: string,
): Promise<void> {
  const limit = Math.min(count, 44);
  await ensureDir(publicAvatarRoot);

  for (let index = 1; index <= limit; index += 1) {
    const fileName = buildImageFileName(index);
    const source = path.join(outputRoot, "images", fileName);
    const target = path.join(publicAvatarRoot, `cyber-${index}.png`);
    if (await pathExists(source)) {
      await copyFileSafe(source, target);
    }
  }
}

export async function generateCollection(options: Partial<GenerationOptions> = {}) {
  const resolved = getResolvedOptions(options);

  await generateTraitAssetsInternal(resolved);

  await ensureDir(path.join(resolved.outputRoot, "images"));
  await ensureDir(path.join(resolved.outputRoot, "metadata"));

  const usedSignatures = new Set<string>();
  const manifest: Array<{ tokenId: number; image: string; metadata: string; uniqueId: string }> = [];

  for (let tokenId = 1; tokenId <= resolved.count; tokenId += 1) {
    const metadata = await generateOne(tokenId, resolved, usedSignatures);
    const imageFileName = buildImageFileName(tokenId);
    const metadataFileName = `${padNumber(tokenId, 4)}.json`;

    await writeJson(path.join(resolved.outputRoot, "metadata", metadataFileName), metadata);
    manifest.push({
      tokenId,
      image: metadata.image,
      metadata: `/nft-engine/output/metadata/${metadataFileName}`,
      uniqueId: metadata.uniqueId,
    });
  }

  await writeJson(path.join(resolved.outputRoot, "manifest.json"), {
    collectionName: resolved.collectionName,
    description: resolved.description,
    count: resolved.count,
    generatedAt: new Date().toISOString(),
    items: manifest,
  });

  await syncPublicAvatars(resolved.syncPublicCount, resolved.outputRoot, resolved.publicAvatarRoot);

  return { options: resolved, manifest };
}

async function main() {
  const count = parseArg("count", 1024);
  const seed = parseArg("seed", 177538);
  const syncPublicCount = parseArg("sync-public-count", 44);
  const outputRoot = parseStringArg("output-root", path.resolve(process.cwd(), "nft-engine", "output"));
  const traitsRoot = parseStringArg("traits-root", path.resolve(process.cwd(), "nft-engine", "traits"));
  const publicAvatarRoot = parseStringArg("public-avatars-root", path.resolve(process.cwd(), "public", "avatars"));
  const collectionName = parseStringArg("collection-name", COLLECTION_NAME);
  const description = parseStringArg("description", COLLECTION_DESCRIPTION);
  const phase = parseStringArg("phase", "all").toLowerCase();

  const options = {
    count,
    seed,
    syncPublicCount,
    outputRoot,
    traitsRoot,
    publicAvatarRoot,
    collectionName,
    description,
  };

  if (phase === "traits") {
    await generateTraitAssets(options);
    return;
  }

  await generateCollection(options);
}

const isMainModule = process.argv[1]
  ? fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
  : false;

if (isMainModule) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
