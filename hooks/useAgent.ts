"use client";

import { useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

import { useMarketplace } from "@/hooks/useMarketplace";
import type { Agent } from "@/types/agent";

export function useAgent() {
  const { publicKey } = useWallet();
  const store = useMarketplace();
  const allAgents = store.agents;
  const addAgent = store.addAgent;
  const updateAgent = store.updateAgent;
  const deleteAgent = store.deleteAgent;
  const incrementAgentStats = store.incrementAgentStats;
  const getAgentById = store.getAgentById;

  const ownerAddress = publicKey?.toBase58();
  
  const agents = useMemo(() => {
    if (!ownerAddress) {
      return [];
    }

    return allAgents.filter((agent) => agent.owner === ownerAddress);
  }, [allAgents, ownerAddress]);

  const activeAgents = useMemo(() => {
    return agents.filter((agent) => (agent.totalActions ?? 0) > 0);
  }, [agents]);

  const listedAgents = useMemo(() => {
    return agents.filter((agent) => agent.listed === true);
  }, [agents]);

  const getAgent = (agentId: string): Agent | undefined => {
    return getAgentById(agentId);
  };

  return {
    agents,
    allAgents,
    activeAgents,
    listedAgents,
    addAgent,
    updateAgent,
    deleteAgent,
    incrementAgentStats,
    getAgent,
    getAgentById,
    isLoading: false,
  };
}
