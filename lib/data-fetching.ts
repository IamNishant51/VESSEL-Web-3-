/**
 * Data Fetching Hooks with SWR
 * Provides automatic caching, deduplication, and stale-while-revalidate for API calls
 * 
 * SWR Benefits:
 * - Deduplicates identical requests within the same render cycle
 * - Caches responses in browser memory
 * - Refetches on window focus
 * - Implements stale-while-revalidate pattern
 * - Prevents cascading requests
 */

import useSWR, { SWRConfiguration } from 'swr';

// Global fetcher for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = new Error('API Error');
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};

// Default SWR config: cache + refetch on focus
const defaultConfig: SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 5000, // 5 seconds
  focusThrottleInterval: 150000, // 2.5 minutes
  refreshInterval: 30000, // 30 seconds (adjust based on needs)
  onError: (error) => {
    console.warn('[SWR] Fetch error:', error.message);
  },
};

/**
 * Fetch all agents for a wallet
 */
export function useFetchAgents(walletAddress?: string | null, enabled = true) {
  const url = enabled && walletAddress ? `/api/db/agents/fetch?wallet=${walletAddress}` : null;
  
  return useSWR(url, fetcher, {
    ...defaultConfig,
    dedupingInterval: 10000, // Less aggressive deduplication for large lists
  });
}

/**
 * Fetch agent metadata and details
 */
export function useFetchAgentDetails(agentId?: string | null) {
  const url = agentId ? `/api/agent?id=${agentId}` : null;
  
  return useSWR(url, fetcher, {
    ...defaultConfig,
    refreshInterval: 60000, // Less frequent refresh for detail pages
  });
}

/**
 * Fetch marketplace listings
 */
export function useFetchMarketplaceListings(page = 1, limit = 20) {
  const url = `/api/db/listings/fetch?page=${page}&limit=${limit}`;
  
  return useSWR(url, fetcher, {
    ...defaultConfig,
    dedupingInterval: 10000,
  });
}

/**
 * Fetch specific marketplace listing
 */
export function useFetchListing(listingId?: string | null) {
  const url = listingId ? `/api/db/listings/${listingId}` : null;
  
  return useSWR(url, fetcher, {
    ...defaultConfig,
  });
}

/**
 * Fetch Solana price (external API)
 */
export function useFetchSolanaPrice() {
  const url = '/api/defi/price?token=SOL';
  
  return useSWR(url, fetcher, {
    ...defaultConfig,
    refreshInterval: 30000, // Update price every 30 seconds
  });
}

/**
 * Fetch token prices
 */
export function useFetchTokenPrices(tokens: string[]) {
  const url = tokens.length > 0 ? `/api/defi/prices?tokens=${tokens.join(',')}` : null;
  
  return useSWR(url, fetcher, {
    ...defaultConfig,
    refreshInterval: 30000,
  });
}

/**
 * Fetch wallet portfolio (balances, tokens, NFTs)
 */
export function useFetchPortfolio(walletAddress?: string | null) {
  const url = walletAddress ? `/api/portfolio?wallet=${walletAddress}` : null;
  
  return useSWR(url, fetcher, {
    ...defaultConfig,
    refreshInterval: 20000, // Update every 20 seconds (balances can change)
  });
}

/**
 * Fetch leaderboard
 */
export function useFetchLeaderboard(sortBy = 'reputation', limit = 100) {
  const url = `/api/db/leaderboard?sort=${sortBy}&limit=${limit}`;
  
  return useSWR(url, fetcher, {
    ...defaultConfig,
    refreshInterval: 60000, // Update every minute
  });
}

/**
 * Fetch user preferences
 */
export function useFetchUserPreferences() {
  const url = '/api/auth/user';
  
  return useSWR(url, fetcher, {
    ...defaultConfig,
    refreshInterval: 0, // Don't auto-refresh preferences
  });
}

/**
 * Fetch user transactions
 */
export function useFetchTransactions(
  walletAddress?: string | null,
  page = 1,
  limit = 50
) {
  const url =
    walletAddress ? `/api/db/transactions?wallet=${walletAddress}&page=${page}&limit=${limit}` : null;
  
  return useSWR(url, fetcher, {
    ...defaultConfig,
    dedupingInterval: 10000,
  });
}

/**
 * Fetch live activity feed
 */
export function useFetchActivityFeed(limit = 50) {
  const url = `/api/db/activity?limit=${limit}`;
  
  return useSWR(url, fetcher, {
    ...defaultConfig,
    refreshInterval: 5000, // Activity feed updates frequently
  });
}

/**
 * Fetch agent conversations
 */
export function useFetchConversations(agentId?: string | null) {
  const url = agentId ? `/api/db/conversations?agentId=${agentId}` : null;
  
  return useSWR(url, fetcher, {
    ...defaultConfig,
    dedupingInterval: 15000,
  });
}

/**
 * Manual mutation function for POST/PUT/DELETE operations
 * Usage: const { trigger } = useCreateAgent(); await trigger(agentData);
 */
export async function apiMutation(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE',
  data?: unknown
): Promise<unknown> {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Clear SWR cache (useful for manual cache invalidation)
 */
export function clearSWRCache(url?: string) {
  if (typeof window !== 'undefined' && (window as any).__SWR) {
    if (url) {
      delete (window as any).__SWR[url];
    } else {
      (window as any).__SWR = {};
    }
  }
}
