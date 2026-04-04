"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertCircle, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AgentRunnerChat } from "@/components/agents/AgentRunnerChat";
import { ListAgentModal } from "@/components/marketplace/ListAgentModal";
import { useAgent } from "@/hooks/useAgent";
import type { Agent } from "@/types/agent";

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { publicKey } = useWallet();
  const { agents } = useAgent();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  useEffect(() => {
    const agentId = Array.isArray(params.id) ? params.id[0] : params.id;
    const found = agents.find((a) => a.id === agentId);

    if (found) {
      setAgent(found);
    }
    setIsLoading(false);
  }, [params.id, agents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-zinc-400">Loading agent...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <Card className="border-red-500/20 bg-red-950/10">
          <CardContent className="flex items-center gap-3 p-6">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-semibold text-white">Agent not found</h3>
              <p className="text-sm text-zinc-400">
                This agent may have been deleted or the ID is incorrect.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => router.push("/agents")}
          className="bg-[#14F195] text-[#0A0A0A] hover:bg-[#14F195]/90"
        >
          Go to Agents
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 text-zinc-400 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {publicKey && (
            <Button
              onClick={() => setIsListModalOpen(true)}
              className="gap-2 bg-[#14F195] text-[#0A0A0A] hover:bg-[#14F195]/90"
            >
              <ShoppingCart className="h-4 w-4" />
              List on Marketplace
            </Button>
          )}
        </div>

        <div className="text-right">
          <h1 className="text-xl font-semibold text-white">{agent.name}</h1>
          {agent.createdAt && (
            <p className="text-xs text-zinc-500">
              Minted {new Date(agent.createdAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Chat interface */}
      <div className="flex-1 rounded-xl border border-white/10 bg-[#111111]/40 backdrop-blur-xl overflow-hidden">
        <AgentRunnerChat agent={agent} />
      </div>

      <ListAgentModal
        agents={[agent]}
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        ownerAddress={publicKey?.toBase58() || ""}
      />
    </motion.div>
  );
}
