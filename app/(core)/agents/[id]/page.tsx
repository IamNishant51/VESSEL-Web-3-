"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, AlertCircle, Bot, Shield, ShoppingCart, Sparkles, Wallet, Zap, Clock, TrendingUp, Loader2, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

import { LandingNavigation } from "@/components/layout/landing-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AgentRunnerChat } from "@/components/agents/AgentRunnerChat";
import { ListAgentModal } from "@/components/marketplace/ListAgentModal";
import { useAgent } from "@/hooks/useAgent";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { isPremadeDerivedAgent } from "@/lib/premade-agents";
import { sendConfirmedSolTransfer } from "@/lib/solana-payments";
import type { Agent } from "@/types/agent";

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const wallet = useWallet();
  const { publicKey } = wallet;
  const { agents, orchestrateAgents } = useAgent();
  const hasHydrated = useStoreHydrated();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "orchestra">("chat");
  const [orchestraTargetId, setOrchestraTargetId] = useState("");
  const [orchestraPrompt, setOrchestraPrompt] = useState("");
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestraChain, setOrchestraChain] = useState<
    Array<{ id: string; role: "user" | "assistant" | "system"; content: string; explorerUrl?: string }>
  >([]);

  useEffect(() => {
    const agentId = Array.isArray(params.id) ? params.id[0] : params.id;
    const found = agents.find((a: Agent) => a.id === agentId);

    if (found) {
      setAgent(found);
    }
    setIsLoading(false);
  }, [params.id, agents]);

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black/20 border-t-black" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-black/10" />
          <div className="h-4 w-32 animate-pulse rounded bg-black/8" />
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center">
        <div className="max-w-md space-y-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ff2338]/10">
            <AlertCircle className="h-6 w-6 text-[#ff2338]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-black">Agent not found</h3>
            <p className="mt-1 text-sm text-black/50">
              This agent may have been deleted or the ID is incorrect.
            </p>
          </div>
          <Button
            onClick={() => router.push("/agents")}
            className="bg-[#171819] text-white hover:bg-[#111111]"
          >
            Go to Agents
          </Button>
        </div>
      </div>
    );
  }

  const ownedOtherAgents = agents.filter((item: Agent) => item.id !== agent.id);

  const runOrchestration = async () => {
    if (!orchestraPrompt.trim() || !orchestraTargetId || !publicKey) {
      if (!publicKey) toast.error("Connect wallet before running orchestration.");
      return;
    }

    const targetAgent = agents.find((item: Agent) => item.id === orchestraTargetId);
    if (!targetAgent?.owner) {
      toast.error("Target agent owner is not available.");
      return;
    }

    setIsOrchestrating(true);

    try {
      const paymentTx = await sendConfirmedSolTransfer({
        wallet,
        to: targetAgent.owner,
        amountSol: 0.001,
      });

      const result = orchestrateAgents(agent.id, orchestraTargetId, orchestraPrompt.trim(), paymentTx);

      if (!result.success) {
        setOrchestraChain((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: "system",
            content: result.error || "Orchestration failed.",
          },
        ]);
        return;
      }

      const step = result.steps[0];

      setOrchestraChain((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "user", content: orchestraPrompt.trim() },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `${agent.name} reasoned about the task and delegated execution to ${targetAgent.name}.`,
        },
        {
          id: crypto.randomUUID(),
          role: "system",
          content: `Agent paid 0.001 SOL to ${targetAgent.name}`,
          explorerUrl: step.payment.explorerUrl,
        },
        { id: crypto.randomUUID(), role: "assistant", content: step.response },
        { id: crypto.randomUUID(), role: "assistant", content: result.finalMessage },
      ]);

      setOrchestraPrompt("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Orchestration payment failed.";
      toast.error(message);
    } finally {
      setIsOrchestrating(false);
    }
  };

  return (
    <>
      <LandingNavigation forceLight />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex h-[calc(100dvh-4rem)] min-h-0 flex-col overflow-hidden"
    >
      {/* Top Bar */}
      <div className="shrink-0 border-b border-black/8 bg-white px-4 py-2.5">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-black/40 transition-colors hover:bg-black/5 hover:text-black/70"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171819] text-[12px] font-bold text-white">
                {agent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-[14px] font-semibold text-black">{agent.name}</h1>
                <p className="text-[11px] text-black/40">{agent.tagline || "Autonomous agent"}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex items-center gap-1.5 text-[11px] text-black/50">
                <Shield className="h-3.5 w-3.5" />
                {(agent.reputation ?? 80).toFixed(0)}%
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-black/50">
                <Zap className="h-3.5 w-3.5" />
                {(agent.totalActions ?? 0).toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-black/50">
                <Wallet className="h-3.5 w-3.5" />
                {(agent.treasuryBalance ?? 0).toFixed(2)} USDC
              </div>
            </div>
            {publicKey && (
              <Button
                onClick={() => setIsListModalOpen(true)}
                disabled={isPremadeDerivedAgent(agent) || agent.isRental || agent.listed}
                className="h-8 gap-1.5 rounded-lg bg-[#171819] px-3 text-[12px] text-white hover:bg-[#111111]"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">List</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="shrink-0 border-b border-black/8 bg-white px-4">
        <div className="mx-auto flex max-w-[1400px] gap-1">
          <button
            onClick={() => setActiveTab("chat")}
            className={`rounded-t-lg px-4 py-2.5 text-[13px] font-medium transition-colors ${
              activeTab === "chat"
                ? "bg-white text-black"
                : "text-black/40 hover:bg-black/[0.03] hover:text-black/60"
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab("orchestra")}
            className={`rounded-t-lg px-4 py-2.5 text-[13px] font-medium transition-colors ${
              activeTab === "orchestra"
                ? "bg-white text-black"
                : "text-black/40 hover:bg-black/[0.03] hover:text-black/60"
            }`}
          >
            Orchestra
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-hidden bg-white">
        <AnimatePresence mode="wait">
          {activeTab === "chat" ? (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              <AgentRunnerChat agent={agent} />
            </motion.div>
          ) : (
            <motion.div
              key="orchestra"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full overflow-y-auto bg-white"
            >
              <div className="mx-auto max-w-[800px] p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-black">Agent Orchestra</h2>
                  <p className="mt-1 text-[13px] text-black/50">
                    Chain agents together for complex multi-step workflows with on-chain payments.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="min-w-0 flex-1">
                      <label className="mb-1.5 block text-[12px] font-medium text-black/60">Task Description</label>
                      <textarea
                        value={orchestraPrompt}
                        onChange={(e) => setOrchestraPrompt(e.target.value)}
                        placeholder="Describe the orchestration task..."
                        rows={3}
                        className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black placeholder-black/30 outline-none transition-colors focus:border-black/20 focus:ring-1 focus:ring-black/5"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="min-w-0 flex-1">
                      <label className="mb-1.5 block text-[12px] font-medium text-black/60">Target Agent</label>
                      <select
                        value={orchestraTargetId}
                        onChange={(e) => setOrchestraTargetId(e.target.value)}
                        className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black outline-none transition-colors focus:border-black/20 focus:ring-1 focus:ring-black/5"
                      >
                        <option value="">Select an agent...</option>
                        {ownedOtherAgents.map((ownedAgent: Agent) => (
                          <option key={ownedAgent.id} value={ownedAgent.id}>
                            {ownedAgent.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        onClick={runOrchestration}
                        disabled={isOrchestrating || !orchestraPrompt.trim() || !orchestraTargetId}
                        className="h-12 rounded-xl bg-[#171819] px-6 text-[14px] text-white hover:bg-[#111111] disabled:opacity-40"
                      >
                        {isOrchestrating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Running...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Run
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {orchestraChain.length > 0 && (
                    <div className="mt-6">
                      <h3 className="mb-3 text-[14px] font-semibold text-black/70">Execution Log</h3>
                      <div className="space-y-3">
                        {orchestraChain.map((entry, i) => (
                          <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`rounded-xl border px-4 py-3 ${
                              entry.role === "user"
                                ? "border-black/8 bg-white"
                                : entry.role === "system"
                                  ? "border-amber-200/60 bg-amber-50/60"
                                  : "border-black/8 bg-white"
                            }`}
                          >
                            <div className="mb-1 flex items-center gap-2">
                              <div
                                className={`flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold text-white ${
                                  entry.role === "user"
                                    ? "bg-[#171819]"
                                    : entry.role === "system"
                                      ? "bg-amber-500"
                                      : "bg-emerald-500"
                                }`}
                              >
                                {entry.role === "user" ? "U" : entry.role === "system" ? "S" : "A"}
                              </div>
                              <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/40">
                                {entry.role}
                              </span>
                            </div>
                            <p className="text-[13px] leading-relaxed text-black/75">{entry.content}</p>
                            {entry.explorerUrl && (
                              <a
                                href={entry.explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1 text-[12px] font-medium text-black/60 hover:text-black"
                              >
                                View transaction
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ListAgentModal
        agents={[agent]}
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        ownerAddress={publicKey?.toBase58() || ""}
      />
    </motion.div>
    </>
  );
}
