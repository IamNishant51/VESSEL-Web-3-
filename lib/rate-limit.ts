import { RATE_LIMIT_CONFIG } from "@/lib/config";
import { redisSet, redisGet, redisIncr, redisExists, redisDel } from "@/lib/redis";

interface RateLimitUsage {
  count: number;
  resetTime: number;
}

function getRedisKeyForRateLimit(key: string): string {
  return `ratelimit:${key}`;
}

function getRedisKeyForResetTime(key: string): string {
  return `ratelimit:reset:${key}`;
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  return request.headers.get("x-real-ip") || "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  remaining?: number;
}

export async function checkRateLimit(
  key: string,
  options?: Partial<typeof RATE_LIMIT_CONFIG.DEFAULT_WINDOW_MS extends number ? { windowMs: number; max: number } : never>
): Promise<RateLimitResult> {
  const windowMs = options?.windowMs ?? RATE_LIMIT_CONFIG.DEFAULT_WINDOW_MS;
  const max = options?.max ?? RATE_LIMIT_CONFIG.DEFAULT_MAX_REQUESTS;
  
  const now = Date.now();
  const redisKey = getRedisKeyForRateLimit(key);
  const resetKey = getRedisKeyForResetTime(key);
  
  // Check if we have an existing rate limit entry
  const existingResetTime = await redisGet<number>(resetKey);
  
  if (!existingResetTime || now >= existingResetTime) {
    // Window expired or first request - start new window
    const newResetTime = now + windowMs;
    await redisSet(resetKey, newResetTime, Math.ceil(windowMs / 1000));
    await redisSet(redisKey, 1, Math.ceil(windowMs / 1000));
    return { allowed: true, remaining: max - 1 };
  }
  
  // Increment counter within window
  const count = await redisIncr(redisKey, Math.ceil(windowMs / 1000));
  
  if (count > max) {
    const retryAfterSeconds = Math.ceil((existingResetTime - now) / 1000);
    return { allowed: false, retryAfterSeconds, remaining: 0 };
  }
  
  return { allowed: true, remaining: max - count };
}

/**
 * Synchronous fallback for rate limiting (for critical paths that don't allow async)
 * WARNING: This only uses local in-memory state, not distributed Redis
 * Use checkRateLimit() instead when possible
 */
const localRateLimitStore = new Map<string, RateLimitUsage>();

export function checkRateLimitSync(
  key: string,
  options?: Partial<{ windowMs: number; max: number }>
): RateLimitResult {
  const windowMs = options?.windowMs ?? RATE_LIMIT_CONFIG.DEFAULT_WINDOW_MS;
  const max = options?.max ?? RATE_LIMIT_CONFIG.DEFAULT_MAX_REQUESTS;
  
  const now = Date.now();
  let usage = localRateLimitStore.get(key);

  if (!usage || now >= usage.resetTime) {
    const newUsage: RateLimitUsage = {
      count: 1,
      resetTime: now + windowMs,
    };
    localRateLimitStore.set(key, newUsage);
    
    // Cleanup old entries if map gets too large
    if (localRateLimitStore.size > 5000) {
      let removed = 0;
      for (const [k, v] of localRateLimitStore.entries()) {
        if (now > v.resetTime) {
          localRateLimitStore.delete(k);
          removed++;
        }
        if (removed > 1000) break;
      }
    }
    
    return { allowed: true, remaining: max - 1 };
  }

  if (usage.count >= max) {
    const retryAfterSeconds = Math.ceil((usage.resetTime - now) / 1000);
    return { allowed: false, retryAfterSeconds, remaining: 0 };
  }

  usage.count++;
  return { allowed: true, remaining: max - usage.count };
}

export async function resetRateLimit(key: string): Promise<void> {
  const redisKey = getRedisKeyForRateLimit(key);
  const resetKey = getRedisKeyForResetTime(key);
  await redisDel(redisKey);
  await redisDel(resetKey);
}

export async function getRateLimitStatus(key: string): Promise<{ count: number; resetTime: number } | null> {
  const redisKey = getRedisKeyForRateLimit(key);
  const resetKey = getRedisKeyForResetTime(key);
  
  const count = await redisGet<number>(redisKey);
  const resetTime = await redisGet<number>(resetKey);
  
  if (!count || !resetTime) return null;
  return { count, resetTime };
}

export async function checkAuthRateLimit(key: string): Promise<RateLimitResult> {
  return checkRateLimit(key, {
    windowMs: RATE_LIMIT_CONFIG.AUTH_WINDOW_MS,
    max: RATE_LIMIT_CONFIG.AUTH_MAX_REQUESTS,
  });
}

export async function checkAgentRunRateLimit(key: string): Promise<RateLimitResult> {
  return checkRateLimit(key, {
    windowMs: RATE_LIMIT_CONFIG.AGENT_RUN_WINDOW_MS,
    max: RATE_LIMIT_CONFIG.AGENT_RUN_MAX_REQUESTS,
  });
}

export async function checkApiDbRateLimit(key: string): Promise<RateLimitResult> {
  return checkRateLimit(key, {
    windowMs: RATE_LIMIT_CONFIG.API_DB_WINDOW_MS,
    max: RATE_LIMIT_CONFIG.API_DB_MAX_REQUESTS,
  });
}

export async function checkMarketplaceRateLimit(key: string): Promise<RateLimitResult> {
  return checkRateLimit(key, {
    windowMs: RATE_LIMIT_CONFIG.MARKETPLACE_WINDOW_MS,
    max: RATE_LIMIT_CONFIG.MARKETPLACE_MAX_REQUESTS,
  });
}
