"use client";

import type { AgentPayment, OrchestrationResult } from "@/types/agent";
import { useVesselStore } from "@/store/useVesselStore";

export type MarketplaceCompatState = {
  agents: import("@/types/agent").Agent[];
  listings: (import("@/types/agent").Agent & { seller: string; listed: true })[];
  addAgent: (agent: import("@/types/agent").Agent) => void;
  updateAgent: (agentId: string, updates: Partial<import("@/types/agent").Agent>) => void;
  deleteAgent: (agentId: string) => void;
  incrementAgentStats: (agentId: string, earningsDelta?: number) => void;
  debitTreasuryForToolCall: (agentId: string, target: string, amount?: number, txMeta?: { transactionSignature: string; explorerUrl: string }) => { success: boolean; payment?: AgentPayment; error?: string };
  orchestrateAgents: (agentId1: string, agentId2: string, userPrompt: string, paymentTxMeta?: { transactionSignature: string; explorerUrl: string }) => OrchestrationResult;
  addListing: (agent: import("@/types/agent").Agent & { seller: string }, price: number, currency: "SOL" | "USDC", isRental: boolean, rentalDays?: number) => void;
  removeListing: (agentId: string) => void;
  buyAgent: (agentId: string, buyerAddress: string) => { success: boolean; txSig?: string; explorerUrl?: string; newAgent?: import("@/types/agent").Agent; error?: string };
  rentAgent: (agentId: string, renterAddress: string, days: number) => { success: boolean; txSig?: string; explorerUrl?: string; newAgent?: import("@/types/agent").Agent; error?: string };
  buyAgentWithSettlementTx: (agentId: string, buyerAddress: string, settlementTx: { transactionSignature: string; explorerUrl: string }) => { success: boolean; txSig?: string; explorerUrl?: string; newAgent?: import("@/types/agent").Agent; error?: string };
  rentAgentWithSettlementTx: (agentId: string, renterAddress: string, days: number, settlementTx: { transactionSignature: string; explorerUrl: string }) => { success: boolean; txSig?: string; explorerUrl?: string; newAgent?: import("@/types/agent").Agent; error?: string };
  getListings: () => (import("@/types/agent").Agent & { seller: string; listed: true })[];
  getListingById: (agentId: string) => (import("@/types/agent").Agent & { seller: string; listed: true }) | undefined;
  getAgentById: (agentId: string) => import("@/types/agent").Agent | undefined;
  getMyListings: (ownerAddress: string) => (import("@/types/agent").Agent & { seller: string; listed: true })[];
  cleanupExpiredRentals: () => void;
};

type Selector<T> = (state: MarketplaceCompatState) => T;

const compatMethods = {
  addAgent: (s: ReturnType<typeof useVesselStore.getState>) => s.addAgent,
  updateAgent: (s: ReturnType<typeof useVesselStore.getState>) => s.updateAgent,
  deleteAgent: (s: ReturnType<typeof useVesselStore.getState>) => s.deleteAgent,
  incrementAgentStats: (s: ReturnType<typeof useVesselStore.getState>) => s.incrementAgentStats,
  debitTreasuryForToolCall: (s: ReturnType<typeof useVesselStore.getState>) => s.debitTreasuryForToolCall,
  orchestrateAgents: (s: ReturnType<typeof useVesselStore.getState>) => s.orchestrateAgents,
  addListing: (s: ReturnType<typeof useVesselStore.getState>) => s.addListing,
  removeListing: (s: ReturnType<typeof useVesselStore.getState>) => s.removeListing,
  buyAgent: (s: ReturnType<typeof useVesselStore.getState>) => s.buyAgent,
  rentAgent: (s: ReturnType<typeof useVesselStore.getState>) => s.rentAgent,
  buyAgentWithSettlementTx: (s: ReturnType<typeof useVesselStore.getState>) => s.buyAgentWithSettlementTx,
  rentAgentWithSettlementTx: (s: ReturnType<typeof useVesselStore.getState>) => s.rentAgentWithSettlementTx,
  getListings: (s: ReturnType<typeof useVesselStore.getState>) => s.getListings,
  getListingById: (s: ReturnType<typeof useVesselStore.getState>) => s.getListingById,
  getAgentById: (s: ReturnType<typeof useVesselStore.getState>) => s.getAgentById,
  getMyListings: (s: ReturnType<typeof useVesselStore.getState>) => s.getMyListings,
  cleanupExpiredRentals: (s: ReturnType<typeof useVesselStore.getState>) => s.cleanupExpiredRentals,
};

function buildCompat(state: ReturnType<typeof useVesselStore.getState>): MarketplaceCompatState {
  return {
    agents: state.usersAgents,
    listings: state.marketplaceListings,
    ...Object.fromEntries(
      Object.entries(compatMethods).map(([key, fn]) => [key, fn(state)])
    ) as Omit<MarketplaceCompatState, "agents" | "listings">,
  };
}

export function useMarketplace(): MarketplaceCompatState;
export function useMarketplace<T>(selector: Selector<T>): T;
export function useMarketplace<T>(selector?: Selector<T>) {
  const agents = useVesselStore((s) => s.usersAgents);
  const listings = useVesselStore((s) => s.marketplaceListings);

  if (!selector) {
    const state = useVesselStore.getState();
    return buildCompat(state) as MarketplaceCompatState;
  }

  const compat = buildCompat(useVesselStore.getState());
  return selector({ ...compat, agents, listings });
}
