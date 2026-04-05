"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Agent, AgentPayment, AgentStats, OrchestrationResult } from "@/types/agent";

type Listing = Agent & { seller: string; listed: true };

type TxMeta = {
  transactionSignature: string;
  explorerUrl: string;
};

type BuyRentResult = {
  success: boolean;
  txSig?: string;
  explorerUrl?: string;
  newAgent?: Agent;
  error?: string;
};

interface VesselStore {
  usersAgents: Agent[];
  marketplaceListings: Listing[];
  agentStats: Record<string, AgentStats>;

  addAgent: (agent: Agent) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  deleteAgent: (agentId: string) => void;
  getAgentById: (agentId: string) => Agent | undefined;

  addListing: (
    agent: Agent & { seller: string },
    price: number,
    currency: "SOL" | "USDC",
    isRental: boolean,
    rentalDays?: number,
  ) => void;
  removeListing: (agentId: string) => void;
  getListingById: (agentId: string) => Listing | undefined;
  getListings: () => Listing[];
  getMyListings: (ownerAddress: string) => Listing[];

  buyAgent: (agentId: string, buyerAddress: string) => BuyRentResult;
  rentAgent: (agentId: string, renterAddress: string, days: number) => BuyRentResult;
  buyAgentWithSettlementTx: (agentId: string, buyerAddress: string, settlementTx: TxMeta) => BuyRentResult;
  rentAgentWithSettlementTx: (agentId: string, renterAddress: string, days: number, settlementTx: TxMeta) => BuyRentResult;

  incrementAgentStats: (agentId: string, earningsDelta?: number) => void;
  debitTreasuryForToolCall: (agentId: string, target: string, amount?: number, txMeta?: TxMeta) => { success: boolean; payment?: AgentPayment; error?: string };
  orchestrateAgents: (agentId1: string, agentId2: string, userPrompt: string, paymentTxMeta?: TxMeta) => OrchestrationResult;
  cleanupExpiredRentals: () => void;
}

function upsertAgent(agents: Agent[], nextAgent: Agent): Agent[] {
  const exists = agents.some((agent) => agent.id === nextAgent.id);
  if (!exists) {
    return [nextAgent, ...agents];
  }

  return agents.map((agent) => (agent.id === nextAgent.id ? { ...agent, ...nextAgent } : agent));
}

function statsFromAgent(agent: Agent): AgentStats {
  return {
    reputation: Math.max(0, Math.min(100, agent.reputation ?? 80)),
    totalActions: Math.max(0, agent.totalActions ?? 0),
    earnings: Math.max(0, agent.earnings ?? 0),
  };
}

function applyStats(agent: Agent, stats?: AgentStats): Agent {
  if (!stats) {
    return agent;
  }

  return {
    ...agent,
    reputation: stats.reputation,
    totalActions: stats.totalActions,
    earnings: stats.earnings,
  };
}

export const useVesselStore = create<VesselStore>()(
  persist(
    (set, get) => ({
      usersAgents: [],
      marketplaceListings: [],
      agentStats: {},

      addAgent: (agent) => {
        const prepared: Agent = {
          ...agent,
          treasuryBalance: agent.treasuryBalance ?? 10,
          reputation: agent.reputation ?? 80,
          totalActions: agent.totalActions ?? 0,
          earnings: agent.earnings ?? 0,
        };

        set((state) => ({
          usersAgents: upsertAgent(state.usersAgents, prepared),
          agentStats: {
            ...state.agentStats,
            [prepared.id]: statsFromAgent(prepared),
          },
        }));
      },

      updateAgent: (agentId, updates) => {
        set((state) => {
          const updatedAgents = state.usersAgents.map((agent) =>
            agent.id === agentId ? { ...agent, ...updates } : agent,
          );

          const nextStats = { ...state.agentStats };
          const updated = updatedAgents.find((item) => item.id === agentId);
          if (updated) {
            nextStats[agentId] = statsFromAgent(updated);
          }

          return {
            usersAgents: updatedAgents,
            marketplaceListings: state.marketplaceListings.map((listing) =>
              listing.id === agentId
                ? {
                    ...listing,
                    ...updates,
                    listed: true,
                    seller: (updates.seller ?? listing.seller) as string,
                  }
                : listing,
            ),
            agentStats: nextStats,
          };
        });
      },

      deleteAgent: (agentId) => {
        set((state) => {
          const nextStats = { ...state.agentStats };
          delete nextStats[agentId];

          return {
            usersAgents: state.usersAgents.filter((agent) => agent.id !== agentId),
            marketplaceListings: state.marketplaceListings.filter((listing) => listing.id !== agentId),
            agentStats: nextStats,
          };
        });
      },

      getAgentById: (agentId) => {
        const state = get();
        const found = state.usersAgents.find((agent) => agent.id === agentId);
        if (!found) {
          return undefined;
        }
        return applyStats(found, state.agentStats[agentId]);
      },

      addListing: (agent, price, currency, isRental, rentalDays = 7) => {
        if (!Number.isFinite(price) || price <= 0) {
          return;
        }

        const sellerAddress = agent.seller || agent.owner;
        const listedAgent: Listing = {
          ...agent,
          listed: true,
          seller: sellerAddress,
          price,
          priceCurrency: currency,
          isRental,
          rentalEnd: isRental
            ? new Date(Date.now() + rentalDays * 24 * 60 * 60 * 1000).toISOString()
            : undefined,
        };

        set((state) => ({
          usersAgents: state.usersAgents.map((item) =>
            item.id === agent.id
              ? {
                  ...item,
                  listed: true,
                  seller: sellerAddress,
                  price,
                  priceCurrency: currency,
                  isRental,
                  rentalEnd: listedAgent.rentalEnd,
                }
              : item,
          ),
          marketplaceListings: state.marketplaceListings.some((listing) => listing.id === agent.id)
            ? state.marketplaceListings.map((listing) => (listing.id === agent.id ? listedAgent : listing))
            : [...state.marketplaceListings, listedAgent],
        }));
      },

      removeListing: (agentId) => {
        set((state) => ({
          marketplaceListings: state.marketplaceListings.filter((listing) => listing.id !== agentId),
          usersAgents: state.usersAgents.map((agent) =>
            agent.id === agentId
              ? {
                  ...agent,
                  listed: false,
                  price: undefined,
                  priceCurrency: undefined,
                  seller: undefined,
                  isRental: false,
                  rentalEnd: undefined,
                }
              : agent,
          ),
        }));
      },

      getListingById: (agentId) => {
        return get().marketplaceListings.find((listing) => listing.id === agentId);
      },

      getListings: () => {
        return get().marketplaceListings;
      },

      getMyListings: (ownerAddress) => {
        return get().marketplaceListings.filter((listing) => listing.seller === ownerAddress);
      },

      buyAgent: () => {
        return { success: false, error: "Use buyAgentWithSettlementTx after confirming an on-chain settlement transaction." };
      },

      rentAgent: () => {
        return { success: false, error: "Use rentAgentWithSettlementTx after confirming an on-chain settlement transaction." };
      },

      buyAgentWithSettlementTx: (agentId, buyerAddress, settlementTx) => {
        const state = get();
        const listing = state.marketplaceListings.find((item) => item.id === agentId);

        if (!listing) {
          return { success: false, error: "Listing not found." };
        }

        if (listing.seller === buyerAddress) {
          return { success: false, error: "You cannot buy your own listing." };
        }

        if (!settlementTx.transactionSignature || !settlementTx.explorerUrl) {
          return { success: false, error: "Settlement transaction metadata is required." };
        }

        const boughtAgent: Agent = {
          ...listing,
          owner: buyerAddress,
          listed: false,
          seller: undefined,
          isRental: false,
          rentalEnd: undefined,
        };

        set((latestState) => {
          const sellerId = latestState.usersAgents.find((agent) => agent.owner === listing.seller && agent.id === listing.id)?.id;
          const nextStats = { ...latestState.agentStats };
          if (sellerId) {
            const prev = nextStats[sellerId] ?? { reputation: 80, totalActions: 0, earnings: 0 };
            nextStats[sellerId] = { ...prev, earnings: prev.earnings + (listing.price ?? 0) };
          }

          return {
            marketplaceListings: latestState.marketplaceListings.filter((item) => item.id !== agentId),
            usersAgents: upsertAgent(
              latestState.usersAgents.map((agent) =>
                agent.id === agentId
                  ? { ...agent, listed: false, seller: undefined, isRental: false, rentalEnd: undefined }
                  : agent,
              ),
              boughtAgent,
            ).map((agent) => applyStats(agent, nextStats[agent.id])),
            agentStats: nextStats,
          };
        });

        return {
          success: true,
          txSig: settlementTx.transactionSignature,
          explorerUrl: settlementTx.explorerUrl,
          newAgent: boughtAgent,
        };
      },

      rentAgentWithSettlementTx: (agentId, renterAddress, days, settlementTx) => {
        const state = get();
        const listing = state.marketplaceListings.find((item) => item.id === agentId);

        if (!listing) {
          return { success: false, error: "Listing not found." };
        }

        if (listing.seller === renterAddress) {
          return { success: false, error: "You cannot rent your own listing." };
        }

        if (!settlementTx.transactionSignature || !settlementTx.explorerUrl) {
          return { success: false, error: "Settlement transaction metadata is required." };
        }

        const rentalEnd = new Date();
        rentalEnd.setDate(rentalEnd.getDate() + Math.max(1, days));

        const rentedAgent: Agent = {
          ...listing,
          id: `${agentId}_rented_${Date.now()}`,
          owner: renterAddress,
          isRental: true,
          rentalEnd: rentalEnd.toISOString(),
          listed: false,
          seller: undefined,
        };

        set((latestState) => {
          const sellerId = latestState.usersAgents.find((agent) => agent.owner === listing.seller && agent.id === listing.id)?.id;
          const nextStats = { ...latestState.agentStats };
          if (sellerId) {
            const prev = nextStats[sellerId] ?? { reputation: 80, totalActions: 0, earnings: 0 };
            nextStats[sellerId] = { ...prev, earnings: prev.earnings + (listing.price ?? 0) };
          }

          return {
            marketplaceListings: latestState.marketplaceListings.filter((item) => item.id !== agentId),
            usersAgents: upsertAgent(
              latestState.usersAgents.map((agent) =>
                agent.id === agentId
                  ? { ...agent, listed: false, seller: undefined, isRental: false, rentalEnd: undefined }
                  : agent,
              ),
              rentedAgent,
            ).map((agent) => applyStats(agent, nextStats[agent.id])),
            agentStats: nextStats,
          };
        });

        return {
          success: true,
          txSig: settlementTx.transactionSignature,
          explorerUrl: settlementTx.explorerUrl,
          newAgent: rentedAgent,
        };
      },

      incrementAgentStats: (agentId, earningsDelta = 0) => {
        set((state) => {
          const previous = state.agentStats[agentId] ?? {
            reputation: 80,
            totalActions: 0,
            earnings: 0,
          };

          const nextStats: AgentStats = {
            reputation: Math.min(100, previous.reputation + 1),
            totalActions: previous.totalActions + 1,
            earnings: Math.max(0, previous.earnings + Math.max(0, earningsDelta)),
          };

          return {
            agentStats: {
              ...state.agentStats,
              [agentId]: nextStats,
            },
            usersAgents: state.usersAgents.map((agent) =>
              agent.id === agentId
                ? {
                    ...applyStats(agent, nextStats),
                    lastActionAt: new Date().toISOString(),
                  }
                : agent,
            ),
          };
        });
      },

      debitTreasuryForToolCall: (agentId, target, amount = 0.001, txMeta) => {
        const state = get();
        const source = state.usersAgents.find((agent) => agent.id === agentId);

        if (!source) {
          return { success: false, error: "Source agent not found." };
        }

        if (!txMeta?.transactionSignature || !txMeta?.explorerUrl) {
          return { success: false, error: "Confirmed on-chain payment transaction is required." };
        }

        const currentBalance = source.treasuryBalance ?? 0;
        if (currentBalance < amount) {
          return {
            success: false,
            error: `Insufficient treasury balance. Required ${amount.toFixed(3)} USDC, available ${currentBalance.toFixed(3)} USDC.`,
          };
        }

        const payment: AgentPayment = {
          amount,
          currency: "USDC",
          fromAgentId: source.id,
          to: target,
          transactionSignature: txMeta.transactionSignature,
          explorerUrl: txMeta.explorerUrl,
        };

        set((latestState) => ({
          usersAgents: latestState.usersAgents.map((agent) =>
            agent.id === source.id
              ? { ...agent, treasuryBalance: Number(((agent.treasuryBalance ?? 0) - amount).toFixed(6)) }
              : agent,
          ),
        }));

        return { success: true, payment };
      },

      orchestrateAgents: (agentId1, agentId2, userPrompt, paymentTxMeta) => {
        const state = get();
        const agentA = state.usersAgents.find((agent) => agent.id === agentId1);
        const agentB = state.usersAgents.find((agent) => agent.id === agentId2);

        if (!agentA || !agentB) {
          return {
            success: false,
            steps: [],
            finalMessage: "",
            error: "Both agents must exist to orchestrate.",
          };
        }

        const paymentResult = get().debitTreasuryForToolCall(agentA.id, agentB.name, 0.001, paymentTxMeta);
        if (!paymentResult.success || !paymentResult.payment) {
          return {
            success: false,
            steps: [],
            finalMessage: "",
            error: paymentResult.error ?? "Orchestration payment failed.",
          };
        }

        const payment = paymentResult.payment;

        set((latestState) => ({
          usersAgents: latestState.usersAgents.map((agent) =>
            agent.id === agentB.id
              ? { ...agent, treasuryBalance: Number(((agent.treasuryBalance ?? 0) + payment.amount).toFixed(6)) }
              : agent,
          ),
        }));

        const delegatedMessage = `${agentA.name} delegated to ${agentB.name}: ${userPrompt}`;
        const response = `${agentB.name} executed the delegated task and returned structured output for ${agentA.name}.`;

        get().incrementAgentStats(agentA.id);
        get().incrementAgentStats(agentB.id, 0.001);

        const step = {
          fromAgentId: agentA.id,
          toAgentId: agentB.id,
          message: delegatedMessage,
          response,
          payment,
        };

        return {
          success: true,
          steps: [step],
          finalMessage: `${agentA.name} received the response from ${agentB.name} and completed the workflow.`,
        };
      },

      cleanupExpiredRentals: () => {
        const now = Date.now();
        set((state) => ({
          usersAgents: state.usersAgents.map((agent) => {
            if (!agent.isRental || !agent.rentalEnd) {
              return agent;
            }

            if (new Date(agent.rentalEnd).getTime() >= now) {
              return agent;
            }

            return {
              ...agent,
              isRental: false,
              rentalEnd: undefined,
            };
          }),
        }));
      },
    }),
    {
      name: "vessel-store-v3",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        usersAgents: state.usersAgents.slice(0, 100),
        marketplaceListings: state.marketplaceListings.slice(0, 200),
        agentStats: state.agentStats,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.cleanupExpiredRentals();
        }
      },
    },
  ),
);
