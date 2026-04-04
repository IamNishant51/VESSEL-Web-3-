"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, Zap, ShoppingCart } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ListAgentModal } from "@/components/marketplace/ListAgentModal";
import { useAgent } from "@/hooks/useAgent";

export default function AgentsPage() {
  const { agents } = useAgent();
  const { publicKey } = useWallet();
  const router = useRouter();
  const [isListModalOpen, setIsListModalOpen] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0 },
  };

  if (agents.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Your Agents
          </h1>
          <p className="text-sm text-zinc-400">
            No agents yet. Head to Forge to create your first autonomous AI agent.
          </p>
        </div>

        <Card className="border-white/10 bg-[#111111]/50 backdrop-blur-xl">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Zap className="mx-auto h-12 w-12 text-zinc-600 mb-4" />
              <p className="text-zinc-400 mb-6">Get started by forging your first agent</p>
              <Button
                onClick={() => router.push("/forge")}
                className="bg-[#14F195] text-[#0A0A0A] hover:bg-[#14F195]/90"
              >
                Go to Forge
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Your Agents
          </h1>
          <p className="text-sm text-zinc-400">
            {agents.length} agent{agents.length !== 1 ? "s" : ""} minted and ready to execute.
          </p>
        </div>
        {agents.length > 0 && publicKey && (
          <Button
            onClick={() => setIsListModalOpen(true)}
            className="gap-2 bg-[#14F195] text-[#0A0A0A] hover:bg-[#14F195]/90"
          >
            <ShoppingCart className="h-4 w-4" />
            List for Sale
          </Button>
        )}
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
      >
        {agents.map((agent) => (
          <motion.div key={agent.id} variants={item}>
            <Card
              onClick={() => router.push(`/agents/${agent.id}`)}
              className="group relative cursor-pointer border-white/10 bg-gradient-to-br from-[#111111] to-[#0A0A0A] backdrop-blur-xl transition-all hover:border-[#14F195]/40 hover:shadow-lg hover:shadow-[#14F195]/10"
            >
              <CardContent className="p-6">
                {/* Background gradient */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,241,149,0.1),transparent_35%)]" />

                <div className="relative space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#14F195] transition-colors">
                        {agent.name}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">{agent.tagline}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-[#14F195] transition-colors" />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-zinc-400 line-clamp-2">
                    {agent.personality}
                  </p>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-[#9945FF]/20 text-[#9945FF] border-0">
                      {agent.riskLevel || "Balanced"}
                    </Badge>
                    <Badge variant="secondary" className="bg-zinc-800/50 text-zinc-300 border-0">
                      {agent.tools?.length || 0} tools
                    </Badge>
                    {agent.mintAddress && (
                      <Badge variant="secondary" className="bg-[#14F195]/20 text-[#14F195] border-0">
                        ✓ Minted
                      </Badge>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 text-xs text-zinc-400 pt-2 border-t border-white/5">
                    <div>
                      <span className="text-zinc-500">Max/tx:</span>
                      <p className="text-white font-mono">{agent.maxSolPerTx} SOL</p>
                    </div>
                    <div>
                      <span className="text-zinc-500">Daily:</span>
                      <p className="text-white font-mono">${agent.dailyBudgetUsdc}</p>
                    </div>
                  </div>

                  {/* Action hint */}
                  <Button
                    variant="ghost"
                    className="w-full mt-2 border border-[#14F195]/20 text-[#14F195] hover:bg-[#14F195]/10 hover:border-[#14F195]/40"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/agents/${agent.id}`);
                    }}
                  >
                    Open Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <ListAgentModal
        agents={agents}
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        ownerAddress={publicKey?.toBase58() || ""}
      />
    </div>
  );
}
