/**
 * API Response Caching Layer
 * Caches expensive API calls (prices, agent metadata, marketplace listings) in Redis
 * Reduces redundant blockchain RPC calls and database queries across Vercel instances
 */

import { redisSet, redisGet, redisDel, redisKeys } from "@/lib/redis";

// Cache key patterns
const CACHE_PATTERNS = {
  SOLANA_PRICE: "cache:solana:price",
  AGENT_METADATA: (agentId: string) => `cache:agent:${agentId}:metadata`,
  MARKETPLACE_LISTING: (listingId: string) => `cache:marketplace:${listingId}`,
  MARKETPLACE_LISTINGS: "cache:marketplace:listings",
  PORTFOLIO_DATA: (address: string) => `cache:portfolio:${address}`,
  TOKEN_PRICES: (tokenAddress: string) => `cache:token:${tokenAddress}:price`,
  LEADERBOARD: "cache:leaderboard",
};

// Cache TTLs (in seconds)
const CACHE_TTL = {
  SOLANA_PRICE: 60, // 1 minute - prices update frequently
  AGENT_METADATA: 300, // 5 minutes
  MARKETPLACE_LISTING: 600, // 10 minutes
  MARKETPLACE_LISTINGS: 300, // 5 minutes
  PORTFOLIO_DATA: 120, // 2 minutes - balances can change
  TOKEN_PRICES: 60, // 1 minute
  LEADERBOARD: 600, // 10 minutes
};

/**
 * Get cached Solana price
 */
export async function getCachedSolanaPrice(): Promise<number | null> {
  return redisGet<number>(CACHE_PATTERNS.SOLANA_PRICE);
}

/**
 * Set Solana price in cache
 */
export async function setSolanaPrice(price: number): Promise<void> {
  await redisSet(CACHE_PATTERNS.SOLANA_PRICE, price, CACHE_TTL.SOLANA_PRICE);
}

/**
 * Get cached agent metadata
 */
export async function getCachedAgentMetadata(agentId: string): Promise<Record<string, unknown> | null> {
  return redisGet<Record<string, unknown>>(CACHE_PATTERNS.AGENT_METADATA(agentId));
}

/**
 * Set agent metadata in cache
 */
export async function setCachedAgentMetadata(
  agentId: string,
  metadata: Record<string, unknown>
): Promise<void> {
  await redisSet(
    CACHE_PATTERNS.AGENT_METADATA(agentId),
    metadata,
    CACHE_TTL.AGENT_METADATA
  );
}

/**
 * Invalidate agent metadata cache
 */
export async function invalidateAgentMetadata(agentId: string): Promise<void> {
  await redisDel(CACHE_PATTERNS.AGENT_METADATA(agentId));
}

/**
 * Get cached marketplace listing
 */
export async function getCachedMarketplaceListing(
  listingId: string
): Promise<Record<string, unknown> | null> {
  return redisGet<Record<string, unknown>>(
    CACHE_PATTERNS.MARKETPLACE_LISTING(listingId)
  );
}

/**
 * Set marketplace listing in cache
 */
export async function setCachedMarketplaceListing(
  listingId: string,
  listing: Record<string, unknown>
): Promise<void> {
  await redisSet(
    CACHE_PATTERNS.MARKETPLACE_LISTING(listingId),
    listing,
    CACHE_TTL.MARKETPLACE_LISTING
  );
}

/**
 * Invalidate marketplace listing cache
 */
export async function invalidateMarketplaceListing(listingId: string): Promise<void> {
  await redisDel(CACHE_PATTERNS.MARKETPLACE_LISTING(listingId));
}

/**
 * Get cached marketplace listings (all/paginated)
 */
export async function getCachedMarketplaceListings(): Promise<unknown[] | null> {
  return redisGet<unknown[]>(CACHE_PATTERNS.MARKETPLACE_LISTINGS);
}

/**
 * Set marketplace listings in cache
 */
export async function setCachedMarketplaceListings(
  listings: unknown[]
): Promise<void> {
  await redisSet(
    CACHE_PATTERNS.MARKETPLACE_LISTINGS,
    listings,
    CACHE_TTL.MARKETPLACE_LISTINGS
  );
}

/**
 * Invalidate marketplace listings cache
 * Called when a new listing is created or removed
 */
export async function invalidateMarketplaceListings(): Promise<void> {
  await redisDel(CACHE_PATTERNS.MARKETPLACE_LISTINGS);
}

/**
 * Get cached portfolio data
 */
export async function getCachedPortfolioData(
  address: string
): Promise<Record<string, unknown> | null> {
  return redisGet<Record<string, unknown>>(CACHE_PATTERNS.PORTFOLIO_DATA(address));
}

/**
 * Set portfolio data in cache
 */
export async function setCachedPortfolioData(
  address: string,
  data: Record<string, unknown>
): Promise<void> {
  await redisSet(
    CACHE_PATTERNS.PORTFOLIO_DATA(address),
    data,
    CACHE_TTL.PORTFOLIO_DATA
  );
}

/**
 * Invalidate portfolio cache (when tokens change)
 */
export async function invalidatePortfolioData(address: string): Promise<void> {
  await redisDel(CACHE_PATTERNS.PORTFOLIO_DATA(address));
}

/**
 * Get cached token price
 */
export async function getCachedTokenPrice(tokenAddress: string): Promise<number | null> {
  return redisGet<number>(CACHE_PATTERNS.TOKEN_PRICES(tokenAddress));
}

/**
 * Set token price in cache
 */
export async function setCachedTokenPrice(
  tokenAddress: string,
  price: number
): Promise<void> {
  await redisSet(
    CACHE_PATTERNS.TOKEN_PRICES(tokenAddress),
    price,
    CACHE_TTL.TOKEN_PRICES
  );
}

/**
 * Get cached leaderboard
 */
export async function getCachedLeaderboard(): Promise<unknown[] | null> {
  return redisGet<unknown[]>(CACHE_PATTERNS.LEADERBOARD);
}

/**
 * Set leaderboard in cache
 */
export async function setCachedLeaderboard(leaderboard: unknown[]): Promise<void> {
  await redisSet(CACHE_PATTERNS.LEADERBOARD, leaderboard, CACHE_TTL.LEADERBOARD);
}

/**
 * Invalidate leaderboard cache
 */
export async function invalidateLeaderboard(): Promise<void> {
  await redisDel(CACHE_PATTERNS.LEADERBOARD);
}

/**
 * Clear all cache (for admin operations)
 */
export async function clearAllCache(): Promise<number> {
  const patterns = Object.values(CACHE_PATTERNS).map((p) =>
    typeof p === "function" ? "cache:*" : p
  );
  const uniquePatterns = [...new Set(patterns)];
  
  let totalCleared = 0;
  for (const pattern of uniquePatterns) {
    const keys = await redisKeys(pattern);
    for (const key of keys) {
      await redisDel(key);
      totalCleared++;
    }
  }
  
  console.log(`[Cache] Cleared ${totalCleared} entries`);
  return totalCleared;
}

/**
 * Get cache stats for monitoring
 */
export async function getCacheStats(): Promise<{
  enabled: boolean;
  patternCount: number;
  estimatedMemory: string;
}> {
  const keys = await redisKeys("cache:*");
  
  return {
    enabled: keys.length > 0,
    patternCount: keys.length,
    estimatedMemory: `~${Math.ceil(keys.length * 1.5)}KB`, // Rough estimate
  };
}
