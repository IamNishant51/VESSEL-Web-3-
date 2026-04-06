import { NextResponse } from "next/server";
import { checkRateLimitSync, getClientIp } from "@/lib/rate-limit";
import { RATE_LIMIT_CONFIG } from "@/lib/config";
import { fallbackTools } from "@/lib/agent-kit-fallback";

type ToolsCache = {
  value: Awaited<ReturnType<typeof import("@/lib/agent-kit").getSolanaAgentKitTools>> | typeof fallbackTools;
  expiresAt: number;
};

let toolsCache: ToolsCache | null = null;
const TOOLS_CACHE_MS = 30 * 60 * 1000;

export const dynamic = "force-dynamic";
export const revalidate = 1800;

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimitSync(`tools:${ip}`, { 
      windowMs: RATE_LIMIT_CONFIG.DEFAULT_WINDOW_MS, 
      max: 30 
    });
    
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many requests.", tools: fallbackTools, success: false },
        { status: 429, headers: { "retry-after": String(limit.retryAfterSeconds ?? 60) } }
      );
    }

    const now = Date.now();
    if (toolsCache && toolsCache.expiresAt > now) {
      return NextResponse.json({ tools: toolsCache.value, success: true });
    }

    const { getSolanaAgentKitTools } = await import("@/lib/agent-kit");
    
    const toolsPromise = getSolanaAgentKitTools();
    const timeout = new Promise<typeof fallbackTools>((resolve) => {
      setTimeout(() => resolve(fallbackTools), 2000);
    });

    const tools = await Promise.race([toolsPromise, timeout]);
    
    toolsCache = {
      value: tools,
      expiresAt: now + TOOLS_CACHE_MS,
    };

    return NextResponse.json({ tools, success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch tools.", tools: fallbackTools, success: true },
      { status: 200 }
    );
  }
}
