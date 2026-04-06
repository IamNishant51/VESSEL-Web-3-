/**
 * Database Sync Layer
 * Bridges MongoDB with the existing Zustand store
 * Provides CRUD operations that persist to MongoDB while keeping localStorage as fallback
 */

import type { Agent, Conversation, ConversationListItem } from "@/types/agent";

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

export async function syncConversationToDB(conversation: Conversation): Promise<void> {
  if (!DB_ENABLED) return;
  try {
    await apiCall("/conversations", {
      body: JSON.stringify({ conversation }),
    });
  } catch (e) {
    console.warn("[DB] Failed to sync conversation:", e);
  }
}

export async function deleteConversationFromDB(conversationId: string): Promise<void> {
  if (!DB_ENABLED) return;
  try {
    await apiCall("/conversations/delete", {
      body: JSON.stringify({ conversationId }),
    });
  } catch (e) {
    console.warn("[DB] Failed to delete conversation:", e);
  }
}

export async function fetchConversationsFromDB(agentId: string, walletAddress: string): Promise<Conversation[]> {
  if (!DB_ENABLED) return [];
  try {
    const result = await apiCall("/conversations/fetch", {
      body: JSON.stringify({ agentId, walletAddress }),
    });
    return (result as { conversations: Conversation[] }).conversations || [];
  } catch (e) {
    console.warn("[DB] Failed to fetch conversations:", e);
    return [];
  }
}

export async function fetchConversationListFromDB(agentId: string, walletAddress: string): Promise<ConversationListItem[]> {
  if (!DB_ENABLED) return [];
  try {
    const result = await apiCall("/conversations/list", {
      body: JSON.stringify({ agentId, walletAddress }),
    });
    return (result as { conversations: ConversationListItem[] }).conversations || [];
  } catch (e) {
    console.warn("[DB] Failed to fetch conversation list:", e);
    return [];
  }
}

export async function followAgent(agentId: string): Promise<{ success: boolean; followerCount: number }> {
  if (!DB_ENABLED) return { success: false, followerCount: 0 };
  try {
    const result = await apiCall("/follow-agent", {
      body: JSON.stringify({ agentId }),
    });
    return result as { success: boolean; followerCount: number };
  } catch (e) {
    console.warn("[DB] Failed to follow agent:", e);
    return { success: false, followerCount: 0 };
  }
}

export async function unfollowAgent(agentId: string): Promise<{ success: boolean; followerCount: number }> {
  if (!DB_ENABLED) return { success: false, followerCount: 0 };
  try {
    const result = await apiCall("/unfollow-agent", {
      body: JSON.stringify({ agentId }),
    });
    return result as { success: boolean; followerCount: number };
  } catch (e) {
    console.warn("[DB] Failed to unfollow agent:", e);
    return { success: false, followerCount: 0 };
  }
}

export async function likeAgent(agentId: string): Promise<{ success: boolean; likeCount: number }> {
  if (!DB_ENABLED) return { success: false, likeCount: 0 };
  try {
    const result = await apiCall("/like-agent", {
      body: JSON.stringify({ agentId }),
    });
    return result as { success: boolean; likeCount: number };
  } catch (e) {
    console.warn("[DB] Failed to like agent:", e);
    return { success: false, likeCount: 0 };
  }
}

export async function unlikeAgent(agentId: string): Promise<{ success: boolean; likeCount: number }> {
  if (!DB_ENABLED) return { success: false, likeCount: 0 };
  try {
    const result = await apiCall("/unlike-agent", {
      body: JSON.stringify({ agentId }),
    });
    return result as { success: boolean; likeCount: number };
  } catch (e) {
    console.warn("[DB] Failed to unlike agent:", e);
    return { success: false, likeCount: 0 };
  }
}

export async function getSocialStatus(agentId: string, walletAddress?: string): Promise<{
  followers: number;
  likes: number;
  isFollowing: boolean;
  isLiked: boolean;
}> {
  if (!DB_ENABLED) return { followers: 0, likes: 0, isFollowing: false, isLiked: false };
  try {
    const result = await apiCall("/get-social-status", {
      body: JSON.stringify({ agentId, walletAddress }),
    });
    return result as { followers: number; likes: number; isFollowing: boolean; isLiked: boolean };
  } catch (e) {
    console.warn("[DB] Failed to get social status:", e);
    return { followers: 0, likes: 0, isFollowing: false, isLiked: false };
  }
}

// ===== User Preferences =====

export type UserPreferences = {
  theme?: "light" | "dark" | "system";
  language?: string;
  notifications?: boolean;
};

export async function syncUserPreferences(prefs: UserPreferences): Promise<void> {
  if (!DB_ENABLED) return;
  try {
    await fetch("/api/auth/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferences: prefs }),
    });
  } catch (e) {
    console.warn("[DB] Failed to sync user preferences:", e);
  }
}

export async function fetchUserPreferences(): Promise<UserPreferences | null> {
  if (!DB_ENABLED) return null;
  try {
    const response = await fetch("/api/auth/user");
    if (!response.ok) return null;
    const data = await response.json() as { user?: { preferences?: UserPreferences } };
    return data.user?.preferences || null;
  } catch (e) {
    console.warn("[DB] Failed to fetch user preferences:", e);
    return null;
  }
}

export async function logoutDevice(deviceId: string): Promise<boolean> {
  if (!DB_ENABLED) return false;
  try {
    const response = await fetch(`/api/auth/user?deviceId=${deviceId}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (e) {
    console.warn("[DB] Failed to logout device:", e);
    return false;
  }
}

export async function getDevices(): Promise<Array<{
  id: string;
  name?: string;
  ip?: string;
  lastActive: string;
}>> {
  if (!DB_ENABLED) return [];
  try {
    const response = await fetch("/api/auth/user");
    if (!response.ok) return [];
    const data = await response.json() as { devices?: Array<{ id: string; name?: string; ip?: string; lastActive: string }> };
    return data.devices || [];
  } catch (e) {
    console.warn("[DB] Failed to fetch devices:", e);
    return [];
  }
  }
}
