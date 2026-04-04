"use client";

import { motion } from "framer-motion";
import { Coins, PartyPopper, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ForgeDraft } from "@/types/agent";

type Props = {
  draft: ForgeDraft;
  selectedToolNames: string[];
  mintAddress: string | null;
  mintSignature: string | null;
  isMinting: boolean;
  onMint: () => Promise<void>;
  onViewDashboard: () => void;
};

const confettiSeeds = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${5 + index * 5}%`,
  delay: index * 0.05,
  color: index % 2 === 0 ? "#14F195" : "#9945FF",
}));

export function Step4Review({
  draft,
  selectedToolNames,
  mintAddress,
  mintSignature,
  isMinting,
  onMint,
  onViewDashboard,
}: Props) {
  if (mintAddress) {
    return (
      <Card className="overflow-hidden border-[#14F195]/40 bg-[#111111]/90 backdrop-blur-xl">
        <CardContent className="relative p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,241,149,0.18),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(153,69,255,0.2),transparent_45%)]" />
          {confettiSeeds.map((seed) => (
            <motion.span
              key={seed.id}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 180, opacity: [0, 1, 0], rotate: 220 }}
              transition={{ duration: 2.2, delay: seed.delay, repeat: Infinity }}
              style={{ left: seed.left, backgroundColor: seed.color }}
              className="absolute top-0 h-2 w-1 rounded-full"
            />
          ))}
          <div className="relative space-y-4 text-center">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#14F195]/50 bg-[#14F195]/20"
            >
              <PartyPopper className="h-8 w-8 text-[#14F195]" />
            </motion.div>
            <h3 className="text-2xl font-semibold text-white">Agent Soul Minted</h3>
            <p className="text-sm text-zinc-300">
              {draft.name} is now alive on Solana devnet as a compressed NFT.
            </p>
            <p className="rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-xs text-zinc-400">
              Mint address: {mintAddress}
            </p>
            {mintSignature && (
              <a
                href={`https://solscan.io/tx/${mintSignature}?cluster=devnet`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg border border-[#14F195]/25 px-4 py-2 text-xs text-[#14F195] hover:bg-[#14F195]/10"
              >
                View Mint Transaction
              </a>
            )}
            <Button
              onClick={onViewDashboard}
              className="bg-[#14F195] text-black hover:bg-[#35f5aa]"
            >
              View in Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-[#111111]/85 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">Review & Mint</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-white">{draft.name || "Untitled Agent"}</p>
          <p className="mt-1 text-xs text-zinc-400">{draft.tagline}</p>
          <p className="mt-3 text-sm text-zinc-300">{draft.personality}</p>
        </div>

        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.12em] text-zinc-500">Selected Tools</p>
          <div className="flex flex-wrap gap-2">
            {selectedToolNames.map((tool) => (
              <Badge key={tool} className="bg-[#9945FF]/20 text-[#c9a8ff]">
                {tool}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-zinc-300">
            Max SOL / tx: <span className="font-semibold text-white">{draft.maxSolPerTx}</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-zinc-300">
            Daily budget: <span className="font-semibold text-white">{draft.dailyBudgetUsdc} USDC</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-zinc-300">
            Weekly budget: <span className="font-semibold text-white">{draft.weeklyBudgetUsdc} USDC</span>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs text-zinc-300">
            Risk profile: <span className="font-semibold text-white">{draft.riskLevel}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center gap-2 text-sm text-zinc-300">
            <Coins className="h-4 w-4 text-[#14F195]" /> Estimated cost: ~0.001-0.003 SOL
          </div>
          <Button
            onClick={onMint}
            disabled={isMinting}
            className="h-10 bg-[#14F195] px-5 text-black hover:bg-[#35f5aa] disabled:opacity-60"
          >
            <Sparkles className="h-4 w-4" />
            {isMinting ? "Minting Agent Soul..." : "Mint Agent Soul as Compressed NFT"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
