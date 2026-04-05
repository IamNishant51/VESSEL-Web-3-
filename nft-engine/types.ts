export type RarityTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type LayerName =
  | "background"
  | "body"
  | "eyes"
  | "headgear"
  | "clothing"
  | "accessories"
  | "effects";

export type CharacterFamily =
  | "humanoid"
  | "canine"
  | "feline"
  | "avian"
  | "mech"
  | "spirit"
  | "dragon"
  | "rabbit";

export interface Palette {
  name: string;
  background: string[];
  glow: string[];
  accent: string[];
  ink: string;
  highlight: string;
  shimmer: string;
}

export interface TraitVariant {
  id: string;
  name: string;
  layer: LayerName;
  rarity: RarityTier;
  weight: number;
  families?: ReadonlyArray<CharacterFamily | "universal">;
  render: (context: RenderContext) => string;
}

export interface RenderContext {
  seed: number;
  rng: () => number;
  palette: Palette;
  family: CharacterFamily;
  bodyTrait: TraitVariant;
  backgroundTrait: TraitVariant;
  layerSize: number;
}

export interface TraitSelection {
  background: TraitVariant;
  body: TraitVariant;
  eyes: TraitVariant;
  headgear: TraitVariant;
  clothing: TraitVariant;
  accessories: TraitVariant;
  effects: TraitVariant;
}

export interface GeneratedNFTMetadata {
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
  };
}
