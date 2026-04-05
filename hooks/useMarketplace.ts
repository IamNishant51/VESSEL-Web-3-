"use client";

import type { AgentPayment, OrchestrationResult } from "@/types/agent";
import { useVesselStore } from "@/store/useVesselStore";
import { useMemo, useRef } from "react";

export type MarketplaceCompatState = {
  agents: import("@/types/agent").Agent[];
  listings: (import("@/types/agent").Agent & { seller: string; listed: true })[];
  addAgent: (agent: import("@/types/agent").Agent) => void;
  updateAgent: (agentId: string, updates: Partial<import("@/types/agent").Agent>) => void;
  deleteAgent: (agentId: string) => void;
  incrementAgentStats: (agentId: string, earningsDelta?: number) => void;
  debitTreasuryForToolCall: (agentId: string, target: string, amount?: number, txMeta?: { transactionSignature: string; explorerUrl: string }) => { success: boolean; payment?: AgentPayment; error?: string };
  orchestrateAgents: (agentId1: string, agentId2: string, userPrompt: string, paymentTxMeta?: { transactionSignature: string; explorerUrl: string }) => OrchestrationResult;
  addListing: (agent: import("@/types/agent").Agent & { seller: string }, price: number, currency: "SOL" | "USDC", isRental: boolean, rentalDays?: number) => { success: boolean; error?: string };
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

// Stable reference for methods (they never change)
const stableMethods = (() => {
  const s = useVesselStore.getState();
  return {
    addAgent: s.addAgent,
    updateAgent: s.updateAgent,
    deleteAgent: s.deleteAgent,
    incrementAgentStats: s.incrementAgentStats,
    debitTreasuryForToolCall: s.debitTreasuryForToolCall,
    orchestrateAgents: s.orchestrateAgents,
    addListing: s.addListing,
    removeListing: s.removeListing,
    buyAgent: s.buyAgent,
    rentAgent: s.rentAgent,
    buyAgentWithSettlementTx: s.buyAgentWithSettlementTx,
    rentAgentWithSettlementTx: s.rentAgentWithSettlementTx,
    getListings: s.getListings,
    getListingById: s.getListingById,
    getAgentById: s.getAgentById,
    getMyListings: s.getMyListings,
    cleanupExpiredRentals: s.cleanupExpiredRentals,
  };
})();

export function useMarketplace(): MarketplaceCompatState;
export function useMarketplace<T>(selector: (state: MarketplaceCompatState) => T): T;
export function useMarketplace<T>(selector?: (state: MarketplaceCompatState) => T) {
  const agents = useVesselStore((s) => s.usersAgents);
  const listings = useVesselStore((s) => s.marketplaceListings);

  // Memoize the compat object so it only changes when data changes
  const compat = useMemo<MarketplaceCompatState>(
    () => ({
      agents,
      listings,
      ...stableMethods,
    }),
    [agents, listings],
  );

  if (!selector) {
    return compat as unknown as MarketplaceCompatState;
  }

  return selector(compat);
}
