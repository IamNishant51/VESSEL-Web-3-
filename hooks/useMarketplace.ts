"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Agent } from "@/types/agent";

interface MarketplaceStore {
  agents: Agent[];
  listings: (Agent & { seller: string; listed: true })[];
  addAgent: (agent: Agent) => void;
  updateAgent: (agentId: string, updates: Partial<Agent>) => void;
  deleteAgent: (agentId: string) => void;
  incrementAgentStats: (agentId: string) => void;
  addListing: (agent: Agent & { seller: string }, price: number, currency: "SOL" | "USDC", isRental: boolean, rentalDays?: number) => void;
  removeListing: (agentId: string) => void;
  buyAgent: (agentId: string, buyerAddress: string) => { success: boolean; txSig?: string; newAgent?: Agent };
  rentAgent: (agentId: string, renterAddress: string, days: number) => { success: boolean; txSig?: string; newAgent?: Agent };
  getListings: () => (Agent & { seller: string; listed: true })[];
  getListingById: (agentId: string) => (Agent & { seller: string; listed: true }) | undefined;
  getAgentById: (agentId: string) => Agent | undefined;
  getMyListings: (ownerAddress: string) => (Agent & { seller: string; listed: true })[];
  cleanupExpiredRentals: () => void;
}

function upsertAgent(agents: Agent[], nextAgent: Agent) {
  const exists = agents.some((agent) => agent.id === nextAgent.id);
  if (!exists) {
    return [nextAgent, ...agents];
  }

  return agents.map((agent) => (agent.id === nextAgent.id ? { ...agent, ...nextAgent } : agent));
}

export const useMarketplace = create<MarketplaceStore>()(
  persist(
    (set, get) => ({
      agents: [],
      listings: [],

      addAgent: (agent) => {
        const prepared: Agent = {
          ...agent,
          reputation: agent.reputation ?? 80,
          totalActions: agent.totalActions ?? 0,
        };

        set((state) => ({
          agents: upsertAgent(state.agents, prepared),
        }));
      },

      updateAgent: (agentId, updates) => {
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === agentId ? { ...agent, ...updates } : agent
          ),
        }));
      },

      deleteAgent: (agentId) => {
        set((state) => ({
          agents: state.agents.filter((agent) => agent.id !== agentId),
          listings: state.listings.filter((listing) => listing.id !== agentId),
        }));
      },

      incrementAgentStats: (agentId) => {
        set((state) => ({
          agents: state.agents.map((agent) => {
            if (agent.id !== agentId) {
              return agent;
            }

            const nextActions = (agent.totalActions ?? 0) + 1;
            const nextReputation = Math.min(100, (agent.reputation ?? 80) + 1);
            return {
              ...agent,
              totalActions: nextActions,
              reputation: nextReputation,
              lastActionAt: new Date().toISOString(),
            };
          }),
        }));
      },

      addListing: (agent, price, currency, isRental, rentalDays = 7) => {
        const state = get();
        
        const existingListing = state.listings.find((listing) => listing.id === agent.id);
        if (existingListing) {
          return;
        }

        const listedAgent: Agent & { seller: string; listed: true } = {
          ...agent,
          listed: true,
          price,
          priceCurrency: currency,
          isRental,
          seller: agent.seller || agent.owner,
          rentalEnd: isRental ? new Date(Date.now() + rentalDays * 24 * 60 * 60 * 1000).toISOString() : undefined,
        };

        set((state) => ({
          agents: state.agents.map((item) => 
            item.id === agent.id ? { ...item, listed: true, price, priceCurrency: currency, isRental } : item
          ),
          listings: [...state.listings, listedAgent],
        }));
      },

      removeListing: (agentId) => {
        set((state) => ({
          listings: state.listings.filter((listing) => listing.id !== agentId),
          agents: state.agents.map((agent) =>
            agent.id === agentId
              ? { ...agent, listed: false, price: undefined, priceCurrency: undefined, isRental: false }
              : agent
          ),
        }));
      },

      buyAgent: (agentId, buyerAddress) => {
        const state = get();
        const listing = state.listings.find((listingItem) => listingItem.id === agentId);

        if (!listing) {
          return { success: false };
        }

        const txSig = `buy_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        const boughtAgent: Agent = {
          ...listing,
          owner: buyerAddress,
          listed: false,
          seller: undefined,
          isRental: false,
          rentalEnd: undefined,
        };

        set((latestState) => ({
          listings: latestState.listings.filter((listingItem) => listingItem.id !== agentId),
          agents: upsertAgent(latestState.agents, boughtAgent),
        }));

        return {
          success: true,
          txSig,
          newAgent: boughtAgent,
        };
      },

      rentAgent: (agentId, renterAddress, days) => {
        const state = get();
        const listing = state.listings.find((listingItem) => listingItem.id === agentId);

        if (!listing) {
          return { success: false };
        }

        const txSig = `rent_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

        const rentalEnd = new Date();
        rentalEnd.setDate(rentalEnd.getDate() + days);

        const rentedAgent: Agent = {
          ...listing,
          id: `${agentId}_rented_${Date.now()}`,
          owner: renterAddress,
          isRental: true,
          rentalEnd: rentalEnd.toISOString(),
          listed: false,
          seller: undefined,
        };

        set((latestState) => ({
          listings: latestState.listings.filter((listingItem) => listingItem.id !== agentId),
          agents: upsertAgent(latestState.agents, rentedAgent),
        }));

        return {
          success: true,
          txSig,
          newAgent: rentedAgent,
        };
      },

      getListings: () => {
        return get().listings;
      },

      getListingById: (agentId) => {
        return get().listings.find((listing) => listing.id === agentId);
      },

      getAgentById: (agentId) => {
        return get().agents.find((agent) => agent.id === agentId);
      },

      getMyListings: (ownerAddress) => {
        return get().listings.filter((listing) => listing.seller === ownerAddress);
      },

      cleanupExpiredRentals: () => {
        const now = new Date();
        set((state) => ({
          agents: state.agents.map((agent) => {
            if (agent.isRental && agent.rentalEnd) {
              const rentalEndDate = new Date(agent.rentalEnd);
              if (rentalEndDate < now) {
                return {
                  ...agent,
                  isRental: false,
                  rentalEnd: undefined,
                };
              }
            }
            return agent;
          }),
        }));
      },
    }),
    {
      name: "vessel-core-store",
      version: 1,
      partialize: (state) => ({
        agents: state.agents,
        listings: state.listings,
      }),
    },
  ),
);
