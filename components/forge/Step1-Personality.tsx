"use client";

import { motion } from "framer-motion";

import { AgentAvatar3D } from "@/components/agents/AgentAvatar3D";
import { Card, CardContent } from "@/components/ui/card";
import type { ForgeDraft } from "@/types/agent";

type Props = {
  draft: ForgeDraft;
  updateDraft: (patch: Partial<ForgeDraft>) => void;
};

const promptIdeas = [
  "A hyper-focused DeFi strategist that auto-balances risk and yield.",
  "A social-native content engine that posts on-chain performance updates.",
  "A treasury guardian that enforces strict spending policy and alerts.",
];

export function Step1Personality({ draft, updateDraft }: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-5">
      <Card className="border-white/10 bg-[#111111]/85 backdrop-blur-xl xl:col-span-3">
        <CardContent className="space-y-4 p-6">
          <div>
            <h2 className="text-3xl font-semibold text-white">Give Your Ideas a Soul</h2>
            <p className="mt-2 text-sm text-zinc-400">
              Define your agent identity, voice, and autonomous mission.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Agent Name</label>
            <input
              value={draft.name}
              onChange={(event) => updateDraft({ name: event.target.value })}
              placeholder="YieldFarmer Prime"
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#14F195]/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">
              Describe your agent personality and goal
            </label>
            <textarea
              value={draft.personality}
              onChange={(event) => updateDraft({ personality: event.target.value })}
              placeholder="An autonomous Solana strategist that executes low-risk yield and rotating liquidity tactics while preserving principal."
              className="min-h-40 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#9945FF]/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-200">Tagline</label>
            <input
              value={draft.tagline}
              onChange={(event) => updateDraft({ tagline: event.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition focus:border-[#14F195]/50"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-[#111111]/85 backdrop-blur-xl xl:col-span-2">
        <CardContent className="space-y-4 p-6">
          <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Character Preview</p>
          <AgentAvatar3D accentColor="#14F195" variant="halo" />

          <p className="text-sm font-medium text-zinc-200">Prompt ideas</p>
          <div className="space-y-2">
            {promptIdeas.map((idea, index) => (
              <motion.button
                key={idea}
                whileHover={{ x: 3 }}
                transition={{ duration: 0.2 }}
                onClick={() => updateDraft({ personality: idea })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-xs text-zinc-300"
              >
                <span className="mr-2 text-[#14F195]">0{index + 1}.</span>
                {idea}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
