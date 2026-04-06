import { RATE_LIMIT_CONFIG } from "@/lib/config";

interface RateLimitUsage {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitUsage>();

function getMemoryUsage(key: string): RateLimitUsage | undefined {
  return memoryStore.get(key);
}

function setMemoryUsage(key: string, usage: RateLimitUsage): void {
  if (memoryStore.size > 10000) {
    let removed = 0;
    for (const [k, v] of memoryStore.entries()) {
      if (Date.now() > v.resetTime) {
        memoryStore.delete(k);
        removed++;
      }
      if (removed > 2000) break;
    }
  }
  memoryStore.set(key, usage);
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
  
  return checkRateLimitSync(key, { windowMs, max });
}

export function checkRateLimitSync(
  key: string,
  options?: Partial<{ windowMs: number; max: number }>
): RateLimitResult {
  const windowMs = options?.windowMs ?? RATE_LIMIT_CONFIG.DEFAULT_WINDOW_MS;
  const max = options?.max ?? RATE_LIMIT_CONFIG.DEFAULT_MAX_REQUESTS;
  
  const now = Date.now();
  let usage = getMemoryUsage(key);

  if (!usage || now >= usage.resetTime) {
    const newUsage: RateLimitUsage = {
      count: 1,
      resetTime: now + windowMs,
    };
    setMemoryUsage(key, newUsage);
    return { allowed: true, remaining: max - 1 };
  }

  if (usage.count >= max) {
    const retryAfterSeconds = Math.ceil((usage.resetTime - now) / 1000);
    return { allowed: false, retryAfterSeconds, remaining: 0 };
  }

  usage.count++;
  setMemoryUsage(key, usage);
  return { allowed: true, remaining: max - usage.count };
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

export function resetRateLimit(key: string): void {
  memoryStore.delete(key);
}

export function getRateLimitStatus(key: string): { count: number; resetTime: number } | null {
  const usage = getMemoryUsage(key);
  if (!usage) return null;
  return { count: usage.count, resetTime: usage.resetTime };
}
