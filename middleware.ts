import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge-compatible rate limiter using request context (no memory leak)
const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window

// Bot patterns to block
const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /go-http-client/i,
  /java\//i,
  /libwww-perl/i,
  /scrapy/i,
  /httpclient/i,
  /axios/i,
  /node-fetch/i,
  /undici/i,
];

// Paths that don't need rate limiting
const PUBLIC_PATHS = ["/", "/terms", "/privacy", "/favicon.ico", "/robots.txt"];
const API_PATHS = ["/api/health", "/api/agents/tools"];

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  "https://vessel-engine.vercel.app",
];

export function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;
  const userAgent = request.headers.get("user-agent") || "";
  // Use Next.js platform-provided IP instead of client-controllable headers
  const ip = (request as any).ip || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const response = NextResponse.next();

  // Block known bots/scrapers
  if (BOT_PATTERNS.some((pattern) => pattern.test(userAgent))) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  // Add security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https: ik.imagekit.io; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https: *.solana.com *.helius.xyz *.rpcpool.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );

  // CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    const requestOrigin = request.headers.get("origin") || "";
    if (ALLOWED_ORIGINS.includes(requestOrigin)) {
      response.headers.set("Access-Control-Allow-Origin", requestOrigin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
      );
      response.headers.set("Access-Control-Max-Age", "86400");
    }

    // Handle preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": requestOrigin,
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers":
            "Content-Type, Authorization, X-Requested-With",
          "Access-Control-Max-Age": "86400",
        },
      });
    }
  }

  // Skip rate limiting for public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return response;
  }

  // Rate limiting for API routes
  if (pathname.startsWith("/api/") && !API_PATHS.includes(pathname)) {
    const now = Date.now();
    const key = `api:${ip}:${pathname}`;
    const record = RATE_LIMIT_MAP.get(key);

    if (record && now < record.resetAt) {
      if (record.count >= RATE_LIMIT_MAX) {
        return new NextResponse(
          JSON.stringify({
            error: "Rate limit exceeded. Try again later.",
            retryAfter: Math.ceil((record.resetAt - now) / 1000),
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
              "Retry-After": String(Math.ceil((record.resetAt - now) / 1000)),
              "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
              "X-RateLimit-Remaining": "0",
              "X-RateLimit-Reset": String(record.resetAt),
            },
          }
        );
      }
      record.count++;
    } else {
      RATE_LIMIT_MAP.set(key, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      });
    }

    // Clean up old entries periodically (every 1000 requests)
    if (RATE_LIMIT_MAP.size > 10000) {
      const cutoff = now - RATE_LIMIT_WINDOW_MS * 2;
      for (const [k, v] of RATE_LIMIT_MAP.entries()) {
        if (v.resetAt < cutoff) RATE_LIMIT_MAP.delete(k);
      }
    }
  }

  // Rate limiting for non-API routes (higher limit)
  if (!pathname.startsWith("/api/")) {
    const now = Date.now();
    const key = `page:${ip}`;
    const record = RATE_LIMIT_MAP.get(key);

    if (record && now < record.resetAt) {
      if (record.count >= RATE_LIMIT_MAX * 3) {
        return new NextResponse("Too Many Requests", {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((record.resetAt - now) / 1000)),
          },
        });
      }
      record.count++;
    } else {
      RATE_LIMIT_MAP.set(key, {
        count: 1,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      });
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$|manifest.json|sw.js).*)",
  ],
};
