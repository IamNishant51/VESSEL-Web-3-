import type { Agent } from "@/types/agent";
import {
  generateAgentArt,
  generateAgentPreview,
  generateAgentSVG,
  getAgentVisualSummary,
  getRarityColor,
  getRarityLabel,
  type ArtResult,
  type AgentTraits,
  type ColorPalette,
} from "@/lib/generative-art";
import { getCyberpunkCnftAvatarUrl } from "@/lib/cyberpunk-cnft-avatars";

type VisualInput = Pick<Agent, "id" | "name" | "mintAddress" | "personality" | "riskLevel"> & {
  toolCount?: number;
};

function hashText(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function normalize(input: VisualInput): string {
  return `${input.id || ""}|${input.name || ""}|${input.mintAddress || ""}`;
}

export function getAgentVisualSeed(input: VisualInput): number {
  return hashText(normalize(input));
}

/**
 * Generate full 2048x2048 artwork for an agent
 * Returns data URL + metadata
 */
export function generateAgentArtwork(
  input: VisualInput,
  personality: string = "",
  riskLevel: string = "Balanced",
  toolCount: number = 0
): ArtResult {
  const seed = getAgentVisualSeed(input);
  return generateAgentArt({
    seed,
    name: input.name || "Agent",
    personality: personality || input.personality || "",
    riskLevel: riskLevel || input.riskLevel || "Balanced",
    toolCount: toolCount || input.toolCount || 0,
    size: 2048,
  });
}

/**
 * Generate 512x512 preview for cards/lists
 */
export function generateAgentPreviewImage(
  input: VisualInput,
  personality: string = "",
  riskLevel: string = "Balanced",
  toolCount: number = 0
): string {
  const seed = getAgentVisualSeed(input);
  return generateAgentPreview({
    seed,
    name: input.name || "Agent",
    personality: personality || input.personality || "",
    riskLevel: riskLevel || input.riskLevel || "Balanced",
    toolCount: toolCount || input.toolCount || 0,
    size: 512,
  });
}

/**
 * Generate SVG for fast loading placeholders
 */
export function generateAgentPreviewSVG(
  input: VisualInput,
  personality: string = "",
  riskLevel: string = "Balanced",
  toolCount: number = 0
): string {
  const seed = getAgentVisualSeed(input);
  return generateAgentSVG({
    seed,
    name: input.name || "Agent",
    personality: personality || input.personality || "",
    riskLevel: riskLevel || input.riskLevel || "Balanced",
    toolCount: toolCount || input.toolCount || 0,
  });
}

/**
 * Get visual summary without generating image
 */
export function getAgentVisualSummaryData(
  input: VisualInput,
  personality: string = "",
  riskLevel: string = "Balanced",
  toolCount: number = 0
) {
  const seed = getAgentVisualSeed(input);
  return getAgentVisualSummary({
    seed,
    name: input.name || "Agent",
    personality: personality || input.personality || "",
    riskLevel: riskLevel || input.riskLevel || "Balanced",
    toolCount: toolCount || input.toolCount || 0,
  });
}

/**
 * Get rarity info for display
 */
export function getAgentRarityInfo(
  input: VisualInput,
  personality: string = "",
  riskLevel: string = "Balanced",
  toolCount: number = 0
): { color: string; label: string; traits: AgentTraits } {
  const seed = getAgentVisualSeed(input);
  const traits = generateAgentArt({
    seed,
    name: input.name || "Agent",
    personality: personality || input.personality || "",
    riskLevel: riskLevel || input.riskLevel || "Balanced",
    toolCount: toolCount || input.toolCount || 0,
  }).traits;

  return {
    color: getRarityColor(traits.rarity),
    label: getRarityLabel(traits.rarity),
    traits,
  };
}

/**
 * Get CSS gradient for agent card background
 */
export function getAgentCardGradient(
  input: VisualInput,
  personality: string = "",
  riskLevel: string = "Balanced",
  toolCount: number = 0
): string {
  const seed = getAgentVisualSeed(input);
  const summary = getAgentVisualSummary({
    seed,
    name: input.name || "Agent",
    personality,
    riskLevel,
    toolCount,
  });
  return summary.gradientCSS;
}

/**
 * Get color palette for agent
 */
export function getAgentPalette(
  input: VisualInput,
  personality: string = "",
  riskLevel: string = "Balanced",
  toolCount: number = 0
): ColorPalette {
  const seed = getAgentVisualSeed(input);
  const summary = getAgentVisualSummary({
    seed,
    name: input.name || "Agent",
    personality,
    riskLevel,
    toolCount,
  });
  return summary.palette;
}

/**
 * Get visual label (2-letter initials)
 */
export function getAgentVisualLabel(input: VisualInput): string {
  const clean = (input.name || "AGENT").replace(/[^a-zA-Z0-9\s]/g, " ").trim();
  const words = clean.split(/\s+/).filter(Boolean);

  let label = "AG";
  if (words.length >= 2) {
    label = `${words[0][0]}${words[1][0]}`;
  } else if (words.length === 1) {
    label = words[0].slice(0, 2);
  }

  return label.toUpperCase();
}

/**
 * Get artwork URL for an agent - returns premium cyberpunk cNFT SVG
 * Same agent always gets the same avatar (deterministic based on agent ID)
 * Includes version parameter for cache busting when generation code changes
 */
export function getAgentArtworkUrl(input: VisualInput, size = 1024): string {
  void size;
  const baseUrl = getCyberpunkCnftAvatarUrl(input.id || input.mintAddress || input.name || "0");
  // Add version parameter for cache busting - update this when changing avatar generation
  const version = "v2";
  return `${baseUrl}?v=${version}`;
}

/**
 * Backwards compatible aliases
 */
export function getAgentCoverGradientClass(input: VisualInput): string {
  void input;
  return `bg-gradient-to-br`;
}

export function getAgentIconBackgroundClass(input: VisualInput): string {
  const seed = getAgentVisualSeed(input);
  const backgrounds = ["bg-zinc-900", "bg-zinc-800", "bg-gray-900", "bg-neutral-900"];
  return backgrounds[seed % backgrounds.length];
}
