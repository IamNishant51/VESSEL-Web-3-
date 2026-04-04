"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { ForgeDraft } from "@/types/agent";

type Props = {
  draft: ForgeDraft;
  updateDraft: (patch: Partial<ForgeDraft>) => void;
};

const allowedActions = ["Swap", "Stake", "Transfer", "Mint", "Bridge", "Lend"];

const riskLevels = ["Conservative", "Balanced", "Aggressive"] as const;

export function Step3Limits({ draft, updateDraft }: Props) {
  function toggleAction(action: string) {
    if (draft.allowedActions.includes(action)) {
      updateDraft({
        allowedActions: draft.allowedActions.filter((item) => item !== action),
      });
      return;
    }

    updateDraft({ allowedActions: [...draft.allowedActions, action] });
  }

  return (
    <Card className="border-white/10 bg-[#111111]/85 backdrop-blur-xl">
      <CardContent className="space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-semibold text-white">Spending & Safety Limits</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Configure hard limits and risk profile for autonomous execution.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <label className="text-xs uppercase tracking-[0.12em] text-zinc-500">
              Max SOL per transaction
            </label>
            <input
              type="range"
              min={0.1}
              max={10}
              step={0.1}
              value={draft.maxSolPerTx}
              onChange={(event) => updateDraft({ maxSolPerTx: Number(event.target.value) })}
              className="w-full"
            />
            <p className="text-sm font-semibold text-white">{draft.maxSolPerTx} SOL</p>
          </div>

          <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <label className="text-xs uppercase tracking-[0.12em] text-zinc-500">
              Daily budget (USDC)
            </label>
            <input
              type="number"
              value={draft.dailyBudgetUsdc}
              onChange={(event) => updateDraft({ dailyBudgetUsdc: Number(event.target.value) })}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#14F195]/50"
            />
          </div>

          <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <label className="text-xs uppercase tracking-[0.12em] text-zinc-500">
              Weekly budget (USDC)
            </label>
            <input
              type="number"
              value={draft.weeklyBudgetUsdc}
              onChange={(event) => updateDraft({ weeklyBudgetUsdc: Number(event.target.value) })}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-[#9945FF]/50"
            />
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-sm font-medium text-zinc-200">Allowed actions</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {allowedActions.map((action) => (
              <label
                key={action}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-300"
              >
                <input
                  type="checkbox"
                  checked={draft.allowedActions.includes(action)}
                  onChange={() => toggleAction(action)}
                  className="accent-[#14F195]"
                />
                {action}
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <p className="text-sm font-medium text-zinc-200">Risk Level</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {riskLevels.map((level) => (
              <button
                key={level}
                onClick={() => updateDraft({ riskLevel: level })}
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  draft.riskLevel === level
                    ? "border-[#14F195]/50 bg-[#14F195]/10 text-[#14F195]"
                    : "border-white/10 bg-black/30 text-zinc-300"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
