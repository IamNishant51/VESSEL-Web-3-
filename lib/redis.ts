/**
 * Redis Wrapper for Upstash
 * Provides unified interface for distributed caching & state across Vercel serverless instances
 * Falls back to in-memory storage in development if Redis unavailable
 */

import { Redis } from '@upstash/redis';

const REDIS_ENABLED = !!(
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN
);

// In-memory fallback for development
const inMemoryStore = new Map<string, unknown>();
const inMemoryExpiry = new Map<string, number>();

// Initialize Upstash Redis client (will be null if env vars not set)
let redis: Redis | null = null;

try {
  if (REDIS_ENABLED) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
    console.log('[Redis] Connected to Upstash');
  }
} catch (error) {
  console.warn('[Redis] Failed to initialize Upstash client, using in-memory fallback:', error);
  redis = null;
}

/**
 * Set a key-value pair with optional TTL (in seconds)
 */
export async function redisSet(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<boolean> {
  try {
    if (redis) {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, stringValue);
      } else {
        await redis.set(key, stringValue);
      }
      return true;
    } else {
      // In-memory fallback
      inMemoryStore.set(key, value);
      if (ttlSeconds) {
        inMemoryExpiry.set(key, Date.now() + ttlSeconds * 1000);
      } else {
        inMemoryExpiry.delete(key);
      }
      return true;
    }
  } catch (error) {
    console.error(`[Redis] Set failed for key ${key}:`, error);
    return false;
  }
}

/**
 * Get a value by key
 */
export async function redisGet<T = unknown>(key: string): Promise<T | null> {
  try {
    if (redis) {
      const value = await redis.get(key);
      if (!value) return null;
      try {
        return JSON.parse(value as string) as T;
      } catch {
        return value as T;
      }
    } else {
      // In-memory fallback
      const expiry = inMemoryExpiry.get(key);
      if (expiry && Date.now() > expiry) {
        inMemoryStore.delete(key);
        inMemoryExpiry.delete(key);
        return null;
      }
      const value = inMemoryStore.get(key);
      return value as T | null;
    }
  } catch (error) {
    console.error(`[Redis] Get failed for key ${key}:`, error);
    return null;
  }
}

/**
 * Delete a key
 */
export async function redisDel(key: string): Promise<boolean> {
  try {
    if (redis) {
      await redis.del(key);
      return true;
    } else {
      // In-memory fallback
      inMemoryStore.delete(key);
      inMemoryExpiry.delete(key);
      return true;
    }
  } catch (error) {
    console.error(`[Redis] Delete failed for key ${key}:`, error);
    return false;
  }
}

/**
 * Check if key exists
 */
export async function redisExists(key: string): Promise<boolean> {
  try {
    if (redis) {
      const exists = await redis.exists(key);
      return exists === 1;
    } else {
      // In-memory fallback
      const expiry = inMemoryExpiry.get(key);
      if (expiry && Date.now() > expiry) {
        inMemoryStore.delete(key);
        inMemoryExpiry.delete(key);
        return false;
      }
      return inMemoryStore.has(key);
    }
  } catch (error) {
    console.error(`[Redis] Exists check failed for key ${key}:`, error);
    return false;
  }
}

/**
 * Increment a numeric value (for rate limiting counters)
 * Returns the new value
 */
export async function redisIncr(key: string, ttlSeconds?: number): Promise<number> {
  try {
    if (redis) {
      let value = await redis.incr(key);
      // Set TTL on first increment if provided
      if (ttlSeconds && value === 1) {
        await redis.expire(key, ttlSeconds);
      }
      return value;
    } else {
      // In-memory fallback
      let value = (inMemoryStore.get(key) as number) || 0;
      value += 1;
      inMemoryStore.set(key, value);
      
      if (ttlSeconds && value === 1) {
        inMemoryExpiry.set(key, Date.now() + ttlSeconds * 1000);
      }
      
      return value;
    }
  } catch (error) {
    console.error(`[Redis] Incr failed for key ${key}:`, error);
    return 0;
  }
}

/**
 * Get all keys matching a pattern (use sparingly in Redis due to blocking)
 */
export async function redisKeys(pattern: string): Promise<string[]> {
  try {
    if (redis) {
      return await redis.keys(pattern);
    } else {
      // In-memory fallback - simple prefix match
      const prefix = pattern.replace('*', '');
      const keys: string[] = [];
      for (const key of inMemoryStore.keys()) {
        if (typeof key === 'string' && key.startsWith(prefix)) {
          const expiry = inMemoryExpiry.get(key);
          if (!expiry || Date.now() <= expiry) {
            keys.push(key);
          } else {
            inMemoryStore.delete(key);
            inMemoryExpiry.delete(key);
          }
        }
      }
      return keys;
    }
  } catch (error) {
    console.error(`[Redis] Keys scan failed for pattern ${pattern}:`, error);
    return [];
  }
}

/**
 * Clear all keys matching a pattern
 */
export async function redisClearPattern(pattern: string): Promise<number> {
  try {
    const keys = await redisKeys(pattern);
    let cleared = 0;
    for (const key of keys) {
      await redisDel(key);
      cleared++;
    }
    return cleared;
  } catch (error) {
    console.error(`[Redis] Clear pattern failed for ${pattern}:`, error);
    return 0;
  }
}

/**
 * Get current Redis status for health checks
 */
export function getRedisStatus(): { enabled: boolean; connected: boolean; type: 'upstash' | 'inmemory' } {
  return {
    enabled: REDIS_ENABLED || inMemoryStore.size > 0,
    connected: redis !== null,
    type: redis ? 'upstash' : 'inmemory',
  };
}

export { Redis };
