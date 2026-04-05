/**
 * Trait & Rarity System
 * Determines uniqueness and rarity of each agent's visual identity
 */

import { SeededRandom } from "./noise";

export type RarityTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

export interface AgentTraits {
  rarity: RarityTier;
  rarityScore: number; // 0-1
  archetype: string;
  energy: string;
  complexity: number; // 0-1
  traits: Trait[];
}

export interface Trait {
  name: string;
  value: string;
  rarity: number; // 0-1, higher = rarer
}

const ARCHETYPES = [
  "Sentinel", "Oracle", "Weaver", "Architect", "Vanguard",
  "Chronos", "Nexus", "Phantom", "Catalyst", "Aegis",
  "Harbinger", "Warden", "Sage", "Trickster", "Guardian",
  "Pathfinder", "Alchemist", "Stormcaller", "Dreamweaver", "Voidwalker",
];

const ENERGIES = [
  "Calm", "Steady", "Dynamic", "Intense", "Chaotic",
  "Serene", "Focused", "Volatile", "Resonant", "Ethereal",
];

const TRAIT_CATEGORIES = [
  {
    name: "Background",
    values: [
      { value: "Cosmic Void", rarity: 0.3 },
      { value: "Nebula Drift", rarity: 0.4 },
      { value: "Crystal Matrix", rarity: 0.5 },
      { value: "Digital Grid", rarity: 0.3 },
      { value: "Aurora Field", rarity: 0.6 },
      { value: "Quantum Foam", rarity: 0.7 },
      { value: "Dark Matter", rarity: 0.8 },
      { value: "Singularity", rarity: 0.95 },
    ],
  },
  {
    name: "Core",
    values: [
      { value: "Sacred Geometry", rarity: 0.3 },
      { value: "Neural Web", rarity: 0.4 },
      { value: "Crystal Shard", rarity: 0.5 },
      { value: "Orbital System", rarity: 0.4 },
      { value: "Mandala", rarity: 0.5 },
      { value: "Fractal Bloom", rarity: 0.6 },
      { value: "Wave Form", rarity: 0.4 },
      { value: "Energy Core", rarity: 0.5 },
      { value: "Void Heart", rarity: 0.85 },
      { value: "Infinity Loop", rarity: 0.9 },
    ],
  },
  {
    name: "Aura",
    values: [
      { value: "Subtle Glow", rarity: 0.2 },
      { value: "Radiant Pulse", rarity: 0.4 },
      { value: "Energy Field", rarity: 0.5 },
      { value: "Particle Storm", rarity: 0.6 },
      { value: "Light Rays", rarity: 0.5 },
      { value: "Holographic", rarity: 0.75 },
      { value: "Prismatic", rarity: 0.85 },
      { value: "Transcendent", rarity: 0.95 },
    ],
  },
  {
    name: "Frame",
    values: [
      { value: "None", rarity: 0.2 },
      { value: "Simple Border", rarity: 0.3 },
      { value: "Corner Accents", rarity: 0.4 },
      { value: "Ornate Frame", rarity: 0.6 },
      { value: "Animated Border", rarity: 0.7 },
      { value: "Living Frame", rarity: 0.9 },
    ],
  },
  {
    name: "Signature",
    values: [
      { value: "VESSEL Mark", rarity: 0.1 },
      { value: "Creator Sigil", rarity: 0.5 },
      { value: "Soul Imprint", rarity: 0.7 },
      { value: "Eternal Mark", rarity: 0.9 },
    ],
  },
];

/**
 * Calculate rarity tier from score
 */
function getRarityTier(score: number): RarityTier {
  if (score >= 0.92) return "legendary";
  if (score >= 0.78) return "epic";
  if (score >= 0.55) return "rare";
  if (score >= 0.3) return "uncommon";
  return "common";
}

/**
 * Weighted random selection based on rarity
 */
function weightedPick<T extends { value: string; rarity: number }>(
  items: T[],
  rng: SeededRandom,
  luckFactor: number = 0
): T {
  // Adjust weights based on luck factor (higher = more likely to get rare items)
  const weights = items.map((item) => {
    const baseWeight = 1 - item.rarity;
    const adjusted = Math.pow(baseWeight, 1 + luckFactor * 2);
    return Math.max(adjusted, 0.01);
  });

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = rng.next() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }

  return items[items.length - 1];
}

/**
 * Generate complete trait profile for an agent
 */
export function generateTraits(params: {
  seed: number;
  personality: string;
  riskLevel: string;
  toolCount: number;
}): AgentTraits {
  const rng = new SeededRandom(params.seed);

  // Base luck from tool count and risk
  const luckFactor = Math.min(params.toolCount * 0.05, 0.5) +
    (params.riskLevel === "Aggressive" ? 0.1 : params.riskLevel === "Conservative" ? -0.05 : 0);

  // Determine archetype
  const archetype = rng.pick(ARCHETYPES);

  // Determine energy
  const energy = rng.pick(ENERGIES);

  // Calculate complexity from tool count
  const complexity = Math.min(0.3 + params.toolCount * 0.07, 1);

  // Generate traits for each category
  const traits: Trait[] = [];
  let totalRarity = 0;

  for (const category of TRAIT_CATEGORIES) {
    const selected = weightedPick(category.values, rng, luckFactor);
    traits.push({
      name: category.name,
      value: selected.value,
      rarity: selected.rarity,
    });
    totalRarity += selected.rarity;
  }

  // Calculate overall rarity score (weighted average)
  const rarityScore = totalRarity / TRAIT_CATEGORIES.length;

  // Boost rarity if personality matches certain keywords
  const lowerPersonality = params.personality.toLowerCase();
  const rarityBoosters = ["legendary", "mythic", "ancient", "eternal", "supreme", "ultimate"];
  const hasRarityBooster = rarityBoosters.some((word) => lowerPersonality.includes(word));
  const finalRarityScore = Math.min(rarityScore + (hasRarityBooster ? 0.15 : 0), 1);

  const rarity = getRarityTier(finalRarityScore);

  return {
    rarity,
    rarityScore: finalRarityScore,
    archetype,
    energy,
    complexity,
    traits,
  };
}

/**
 * Get rarity color for display
 */
export function getRarityColor(rarity: RarityTier): string {
  switch (rarity) {
    case "legendary": return "#FFD700";
    case "epic": return "#A855F7";
    case "rare": return "#3B82F6";
    case "uncommon": return "#22C55E";
    case "common": return "#9CA3AF";
  }
}

/**
 * Get rarity label for display
 */
export function getRarityLabel(rarity: RarityTier): string {
  return rarity.charAt(0).toUpperCase() + rarity.slice(1);
}
