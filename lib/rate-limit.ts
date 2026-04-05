type RateLimitOptions = {
  windowMs: number;
  max: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 50000;
const CLEANUP_THRESHOLD = 2;

function nowMs() {
  return Date.now();
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

function cleanupExpiredBuckets(now: number): void {
  if (buckets.size < MAX_BUCKETS) return;

  const cutoff = now - CLEANUP_THRESHOLD * 60000;
  let deleted = 0;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < cutoff) {
      buckets.delete(key);
      deleted++;
      if (deleted > 10000) break;
    }
  }
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = nowMs();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    cleanupExpiredBuckets(now);

    return {
      allowed: true,
      remaining: Math.max(0, options.max - 1),
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  if (existing.count >= options.max) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  buckets.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(0, options.max - existing.count),
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "unknown";
}
