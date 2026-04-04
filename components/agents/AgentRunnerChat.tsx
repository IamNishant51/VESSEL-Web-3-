"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, ExternalLink } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAgent } from "@/hooks/useAgent";
import type { Agent, ChatMessage, RunAgentResponse } from "@/types/agent";

type Props = {
  agent: Agent;
};

export function AgentRunnerChat({ agent }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hey! I'm ${agent.name}. ${agent.personality}. How can I help you with your Solana portfolio today?`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { publicKey } = useWallet();
  const { incrementAgentStats } = useAgent();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!input.trim()) return;
    if (!publicKey) {
      toast.error("Connect wallet to chat with agent");
      return;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    scrollToBottom();

    try {
      // Call agent runner API
      const apiResponse = await fetch(`/api/agents/${agent.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: input,
          userPublicKey: publicKey.toBase58(),
          agent, // Pass full agent config to API
        }),
      });

      if (!apiResponse.ok) {
        throw new Error("Agent execution failed");
      }

      const result = (await apiResponse.json()) as RunAgentResponse;

      // Add assistant response
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.message,
        timestamp: Date.now(),
        transactionSignature: result.transactionSignature,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (result.transactionSignature) {
        incrementAgentStats(agent.id);
        toast.success(
          `Action executed on devnet: https://solscan.io/tx/${result.transactionSignature}?cluster=devnet`
        );
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Chat failed: ${errorMsg}`);
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Error: ${errorMsg}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [input, agent, publicKey, scrollToBottom, incrementAgentStats]);

  return (
    <div className="flex h-full flex-col bg-[#0A0A0A]">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#111111]/50 px-6 py-4 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-white">{agent.name}</h2>
        <p className="text-xs text-zinc-400">{agent.tagline}</p>
        <div className="mt-2 flex gap-2 text-xs text-zinc-500">
          <span>📊 Max/tx: {agent.maxSolPerTx} SOL</span>
          <span>📈 Daily: {agent.dailyBudgetUsdc} USDC</span>
          <span>🛡️ Risk: {agent.riskLevel}</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto px-6 py-4"
      >
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs rounded-xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-[#14F195]/20 text-[#14F195]"
                    : "bg-[#9945FF]/15 text-zinc-100"
                }`}
              >
                {/* Main message */}
                <p className="text-sm">{msg.content}</p>

                {/* Transaction link if applicable */}
                {msg.transactionSignature && (
                  <a
                    href={`https://solscan.io/tx/${msg.transactionSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-[#14F195] hover:underline"
                  >
                    View Transaction
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {/* Timestamp */}
                <div className="mt-1 text-xs opacity-60">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="rounded-xl bg-[#9945FF]/15 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-zinc-100">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Agent thinking...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-[#111111]/50 px-6 py-4 backdrop-blur-xl">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSendMessage();
              }
            }}
            placeholder="Ask your agent to do something..."
            className="flex-1 rounded-lg border border-white/10 bg-[#0A0A0A] px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-[#14F195]/40 focus:outline-none focus:ring-1 focus:ring-[#14F195]/20"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !input.trim()}
            size="sm"
            className="gap-2 bg-[#14F195] text-[#0A0A0A] hover:bg-[#14F195]/90"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
