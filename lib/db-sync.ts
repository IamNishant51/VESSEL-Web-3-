/**
 * Database Sync Layer
 * Bridges MongoDB with the existing Zustand store
 * Provides CRUD operations that persist to MongoDB while keeping localStorage as fallback
 */

import type { Agent } from "@/types/agent";

const DB_ENABLED = typeof process !== "undefined" && !!process.env.MONGODB_URI;

// ===== Client-side sync functions =====
// These run in the browser and sync localStorage with MongoDB via API routes

async function apiCall(path: string, options: RequestInit = {}): Promise<unknown> {
  const response = await fetch(`/api/db${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((error as { error?: string }).error || `API call failed: ${response.status}`);
  }

  return response.json();
}

export async function syncAgentToDB(agent: Agent): Promise<void> {
  if (!DB_ENABLED) return;
  try {
    await apiCall("/agents", {
      body: JSON.stringify({ agent }),
    });
  } catch (e) {
    console.warn("[DB] Failed to sync agent:", e);
  }
}

export async function syncAgentsToDB(agents: Agent[]): Promise<void> {
  if (!DB_ENABLED) return;
  try {
    await apiCall("/agents/bulk", {
      body: JSON.stringify({ agents }),
    });
  } catch (e) {
    console.warn("[DB] Failed to sync agents:", e);
  }
}

export async function deleteAgentFromDB(agentId: string): Promise<void> {
  if (!DB_ENABLED) return;
  try {
    await apiCall("/agents/delete", {
      body: JSON.stringify({ agentId }),
    });
  } catch (e) {
    console.warn("[DB] Failed to delete agent:", e);
  }
}

export async function fetchAgentsFromDB(walletAddress?: string): Promise<Agent[]> {
  if (!DB_ENABLED) return [];
  try {
    const result = await apiCall("/agents/fetch", {
      body: JSON.stringify({ walletAddress }),
    });
    return (result as { agents: Agent[] }).agents || [];
  } catch (e) {
    console.warn("[DB] Failed to fetch agents:", e);
    return [];
  }
}

export async function syncListingToDB(listing: {
  id: string;
  agentId: string;
  name: string;
  seller: string;
  price: number;
  priceCurrency: "SOL" | "USDC";
  isRental: boolean;
  rentalDays: number;
}): Promise<void> {
  if (!DB_ENABLED) return;
  try {
    await apiCall("/listings", {
      body: JSON.stringify({ listing }),
    });
  } catch (e) {
    console.warn("[DB] Failed to sync listing:", e);
  }
}

export async function deleteListingFromDB(listingId: string): Promise<void> {
  if (!DB_ENABLED) return;
  try {
    await apiCall("/listings/delete", {
      body: JSON.stringify({ listingId }),
    });
  } catch (e) {
    console.warn("[DB] Failed to delete listing:", e);
  }
}

export async function fetchListingsFromDB(): Promise<unknown[]> {
  if (!DB_ENABLED) return [];
  try {
    const result = await apiCall("/listings/fetch");
    return (result as { listings: unknown[] }).listings || [];
  } catch (e) {
    console.warn("[DB] Failed to fetch listings:", e);
    return [];
  }
}

export async function syncTransactionToDB(tx: {
  transactionSignature: string;
  type: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  currency: string;
  agentId: string;
  status: string;
  explorerUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  if (!DB_ENABLED) return;
  try {
    await apiCall("/transactions", {
      body: JSON.stringify({ tx }),
    });
  } catch (e) {
    console.warn("[DB] Failed to sync transaction:", e);
  }
}

export async function fetchUserStatsFromDB(walletAddress: string): Promise<{
  agentCount: number;
  totalEarnings: number;
} | null> {
  if (!DB_ENABLED) return null;
  try {
    const result = await apiCall("/users/stats", {
      body: JSON.stringify({ walletAddress }),
    });
    return (result as { stats: { agentCount: number; totalEarnings: number } }).stats || null;
  } catch (e) {
    console.warn("[DB] Failed to fetch user stats:", e);
    return null;
  }
}
