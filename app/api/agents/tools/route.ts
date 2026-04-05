import { NextResponse } from "next/server";

import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { getSolanaAgentKitTools } from "@/lib/agent-kit";

type ToolsCache = {
  value: Awaited<ReturnType<typeof getSolanaAgentKitTools>>;
  expiresAt: number;
};

let toolsCache: ToolsCache | null = null;
const TOOLS_CACHE_MS = 10 * 60 * 1000;

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`tools:${ip}`, { windowMs: 60_000, max: 30 });
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests.", tools: [], success: false },
        { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds) } }
      );
    }

    const now = Date.now();
    if (toolsCache && toolsCache.expiresAt > now) {
      return NextResponse.json({ tools: toolsCache.value, success: true });
    }

    const tools = await getSolanaAgentKitTools();
    toolsCache = {
      value: tools,
      expiresAt: now + TOOLS_CACHE_MS,
    };

    return NextResponse.json({ tools, success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to fetch tools", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch tools.", tools: [], success: false },
      { status: 500 }
    );
  }
}
