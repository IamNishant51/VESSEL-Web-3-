import { NextResponse } from "next/server";

import { generateAgentArt, generateAgentSVG, getRarityLabel, getRarityColor } from "@/lib/generative-art";
import { getAgentVisualSeed } from "@/lib/agent-visuals";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { clampText } from "@/lib/utils";

type RiskLevel = "Conservative" | "Balanced" | "Aggressive";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await checkRateLimit(`gen-img:${ip}`, { windowMs: 60_000, max: 10 });

    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
      );
    }

    const body = await request.json();
    const id = clampText(String(body?.id ?? ""), 64);
    const name = clampText(String(body?.name ?? ""), 100);
    const personality = clampText(String(body?.personality ?? ""), 500);
    const riskLevel: RiskLevel = ["Conservative", "Balanced", "Aggressive"].includes(body?.riskLevel)
      ? (body.riskLevel as RiskLevel)
      : "Balanced";
    const toolCount = Number.isFinite(Number(body?.toolCount))
      ? Math.max(0, Math.min(50, Number(body.toolCount)))
      : 0;

    if (!id || !name) {
      return NextResponse.json(
        { error: "Missing required fields: id, name" },
        { status: 400 }
      );
    }

    const seed = getAgentVisualSeed({
      id,
      name,
      personality,
      riskLevel,
      mintAddress: "",
    });

    const artResult = generateAgentArt({
      seed,
      name,
      personality,
      riskLevel,
      toolCount,
      size: 2048,
    });

    const svg = artResult.imageDataUrl
      ? undefined
      : generateAgentSVG({ seed, name, personality, riskLevel, toolCount });

    return NextResponse.json({
      success: true,
      imageDataUrl: artResult.imageDataUrl,
      svg,
      metadata: {
        seed,
        rarity: {
          tier: artResult.traits.rarity,
          label: getRarityLabel(artResult.traits.rarity),
          color: getRarityColor(artResult.traits.rarity),
          score: artResult.traits.rarityScore,
        },
        archetype: artResult.traits.archetype,
        energy: artResult.traits.energy,
        backgroundStyle: artResult.backgroundStyle,
        palette: artResult.palette,
        traits: artResult.traits.traits,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
