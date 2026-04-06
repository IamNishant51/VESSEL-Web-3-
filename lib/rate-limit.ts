interface SimpleRateLimitUsage {
  count: number;
  resetTime: number;
}

// Store usage in memory (in production, use Redis)
const simpleRateLimitMap = new Map<string, SimpleRateLimitUsage>();

/**
 * Extract client IP from request
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * Simple rate limit check (without DB)
 */
export function checkRateLimit(
  key: string,
  options: { windowMs: number; max: number }
): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  let usage = simpleRateLimitMap.get(key);

  if (!usage || now >= usage.resetTime) {
    usage = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    simpleRateLimitMap.set(key, usage);
    return { allowed: true };
  }

  if (usage.count >= options.max) {
    const retryAfterSeconds = Math.ceil((usage.resetTime - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  usage.count++;
  return { allowed: true };
}
