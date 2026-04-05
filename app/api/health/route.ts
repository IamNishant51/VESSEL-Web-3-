import { NextResponse } from "next/server";

const HEALTH_RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();
const HEALTH_RATE_LIMIT_WINDOW_MS = 60_000;
const HEALTH_RATE_LIMIT_MAX = 30;

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const existing = HEALTH_RATE_LIMIT.get(ip);

  if (existing && now < existing.resetAt) {
    if (existing.count >= HEALTH_RATE_LIMIT_MAX) {
      return NextResponse.json({ error: "Rate limited" }, { status: 429 });
    }
    existing.count++;
  } else {
    HEALTH_RATE_LIMIT.set(ip, { count: 1, resetAt: now + HEALTH_RATE_LIMIT_WINDOW_MS });
  }

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        "Cache-Control": "public, max-age=30",
      },
    },
  );
}
