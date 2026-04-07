import { NextResponse } from "next/server";

import {
  generateAgentArt,
  generateAgentSVG,
  getRarityColor,
  getRarityLabel,
} from "@/lib/generative-art";
import { clampText } from "@/lib/input-validation";
import { getAgentVisualSeed } from "@/lib/agent-visuals";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const ALLOWED_RISK_LEVELS = new Set(["Conservative", "Balanced", "Aggressive"]);
type RiskLevel = "Conservative" | "Balanced" | "Aggressive";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const limit = await checkRateLimit(`metadata:${ip}`, { windowMs: 60_000, max: 60 });
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many metadata requests." },
      { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } }
    );
  }

  const { searchParams } = new URL(request.url);

  const id = clampText(searchParams.get("id") || "agent-soul", 80);
  const name = clampText(searchParams.get("name") || "Vessel Agent Soul", 64);
  const tagline = clampText(searchParams.get("tagline") || "Give Your Ideas a Soul", 120);
  const personality = clampText(searchParams.get("personality") || "", 320);
  const riskLevelInput = clampText(searchParams.get("riskLevel") || "Balanced", 24);
  const riskLevel: RiskLevel = ALLOWED_RISK_LEVELS.has(riskLevelInput)
    ? (riskLevelInput as RiskLevel)
    : "Balanced";
  const rawToolCount = Number.parseInt(searchParams.get("toolCount") || "0", 10);
  const toolCount = Number.isFinite(rawToolCount) ? Math.max(0, Math.min(24, rawToolCount)) : 0;

  const seed = getAgentVisualSeed({
    id,
    name,
    personality,
    riskLevel,
    mintAddress: "",
  });

  // Generate traits and art data
  const artResult = generateAgentArt({
    seed,
    name,
    personality,
    riskLevel,
    toolCount,
    size: 1024,
  });

  // Generate SVG for fast loading
  const svg = generateAgentSVG({ seed, name, personality, riskLevel, toolCount });
  const svgDataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

  // Build rich attributes array
  const attributes = [
    { trait_type: "Project", value: "Vessel" },
    { trait_type: "Type", value: "Agent Soul" },
    { trait_type: "Reference", value: id },
    { trait_type: "Rarity", value: artResult.traits.rarity },
    { trait_type: "Archetype", value: artResult.traits.archetype },
    { trait_type: "Energy", value: artResult.traits.energy },
    { trait_type: "Background", value: artResult.backgroundStyle },
    { trait_type: "Risk Level", value: riskLevel },
    { trait_type: "Tool Count", value: toolCount },
    ...artResult.traits.traits.map((trait) => ({
      trait_type: trait.name,
      value: trait.value,
    })),
  ];

  return NextResponse.json(
    {
      name,
      symbol: "VSLAGENT",
      description: `${tagline} — ${artResult.traits.archetype} (${artResult.traits.rarity})`,
      seller_fee_basis_points: 0,
      image: svgDataUri,
      external_url: "https://vessel.app",
      attributes,
      properties: {
        category: "image",
        files: [
          {
            uri: svgDataUri,
            type: "image/svg+xml",
          },
        ],
        rarity: {
          tier: artResult.traits.rarity,
          score: artResult.traits.rarityScore,
          color: getRarityColor(artResult.traits.rarity),
          label: getRarityLabel(artResult.traits.rarity),
        },
        palette: artResult.palette,
        seed,
      },
    },
    {
      headers: {
        "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    }
  );
}
