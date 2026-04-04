"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Bot,
  CircleDollarSign,
  Hammer,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wallet,
  Wrench,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAgent } from "@/hooks/useAgent";
import { mintAgentSoulCnft } from "@/lib/metaplex";
import type { ForgeTool } from "@/types/agent";
import { initialForgeDraft } from "@/types/agent";

const moduleItems = [
  { id: "identity", label: "IDENTITY", icon: Bot },
  { id: "tools", label: "TOOLS", icon: Wrench },
  { id: "economy", label: "ECONOMY", icon: CircleDollarSign },
  { id: "deployment", label: "DEPLOYMENT", icon: Rocket },
];

export default function ForgePage() {
  const [draft, setDraft] = useState(initialForgeDraft);
  const [tools, setTools] = useState<ForgeTool[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [mintSignature, setMintSignature] = useState<string | null>(null);
  const [customAction, setCustomAction] = useState("");

  const { publicKey } = useWallet();
  const { addAgent } = useAgent();
  const router = useRouter();

  useEffect(() => {
    async function loadTools() {
      setLoadingTools(true);
      try {
        const response = await fetch("/api/agents/tools");
        const body = (await response.json()) as { tools?: ForgeTool[] };
        setTools(body.tools ?? []);
      } catch {
        toast.error("Failed to load tools catalog.");
      } finally {
        setLoadingTools(false);
      }
    }

    void loadTools();
  }, []);

  const selectedToolNames = useMemo(() => {
    return draft.tools
      .map((toolId) => tools.find((tool) => tool.id === toolId)?.name ?? toolId)
      .filter(Boolean);
  }, [draft.tools, tools]);

  const featuredTools = useMemo(() => {
    if (tools.length === 0) {
      return [
        { id: "dex-trading", name: "DEX Trading", description: "Jupiter & Orca integration", category: "Trading" },
        { id: "liquid-staking", name: "Liquid Staking", description: "Jito & Marinade tools", category: "Staking" },
        { id: "social", name: "Social (X/Discord)", description: "Autonomous posting & monitoring", category: "Social" },
        { id: "analytics", name: "On-chain Analytics", description: "Helius & Birdeye data", category: "Oracles" },
      ] as ForgeTool[];
    }

    return tools.slice(0, 4);
  }, [tools]);

  function updateDraft(patch: Partial<typeof draft>) {
    setDraft((previous) => ({ ...previous, ...patch }));
  }

  function toggleTool(id: string) {
    if (draft.tools.includes(id)) {
      updateDraft({ tools: draft.tools.filter((toolId) => toolId !== id) });
      return;
    }

    updateDraft({ tools: [...draft.tools, id] });
  }

  function toggleAction(action: string) {
    if (draft.allowedActions.includes(action)) {
      updateDraft({ allowedActions: draft.allowedActions.filter((item) => item !== action) });
      return;
    }

    updateDraft({ allowedActions: [...draft.allowedActions, action] });
  }

  function addCustomAction() {
    const value = customAction.trim();
    if (!value) return;
    if (draft.allowedActions.includes(value)) {
      toast.info("Action already exists.");
      return;
    }
    updateDraft({ allowedActions: [...draft.allowedActions, value] });
    setCustomAction("");
  }

  async function handleMint() {
    if (!publicKey) {
      toast.error("Connect a wallet before minting.");
      return;
    }

    if (!draft.name.trim() || !draft.personality.trim()) {
      toast.error("Add agent name and behavioral directives first.");
      return;
    }

    if (draft.tools.length === 0) {
      toast.error("Select at least one tool capability.");
      return;
    }

    try {
      setIsMinting(true);
      const result = await mintAgentSoulCnft({
        owner: publicKey.toBase58(),
        draft,
      });

      setMintAddress(result.mintAddress);
      setMintSignature(result.signature);

      const systemPrompt = `You are ${draft.name}, an autonomous Solana agent. Personality: ${draft.personality}. Respect risk level ${draft.riskLevel}, max ${draft.maxSolPerTx} SOL per tx, daily budget ${draft.dailyBudgetUsdc}.`;

      addAgent({
        id: crypto.randomUUID(),
        name: draft.name,
        personality: draft.personality,
        owner: publicKey.toBase58(),
        mintAddress: result.mintAddress,
        createdAt: new Date().toISOString(),
        tagline: draft.tagline,
        tools: draft.tools,
        maxSolPerTx: draft.maxSolPerTx,
        dailyBudgetUsdc: draft.dailyBudgetUsdc,
        allowedActions: draft.allowedActions,
        riskLevel: draft.riskLevel,
        systemPrompt,
      });

      toast.success("Agent Soul minted successfully on devnet.");
    } catch {
      toast.error("Mint failed. Please retry.");
    } finally {
      setIsMinting(false);
    }
  }

  function handleDeploy() {
    if (!mintAddress) {
      toast.info("Mint first, then deploy from dashboard orchestration.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="-mx-4 -mt-8 min-h-screen bg-[#f5f5f6] px-4 pb-16 pt-6 text-[#161718] sm:-mx-6 sm:px-6">
      <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-12 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <p className="text-[10px] font-semibold tracking-[0.2em] text-[#0c6f73]">FORGE MODULE</p>
          <h1 className="mt-2 max-w-[240px] text-[46px] font-semibold leading-[0.92] tracking-[-0.03em] text-[#1b1d1e]">
            AGENT
            <br />
            CREATOR
          </h1>

          <div className="mt-8 space-y-2">
            {moduleItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === 0;
              return (
                <button
                  key={item.id}
                  className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-[11px] font-semibold tracking-[0.08em] transition-colors ${
                    isActive
                      ? "border-[#0b7d82]/30 bg-white text-[#0b7d82]"
                      : "border-transparent text-black/55 hover:border-black/10 hover:bg-white/70"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 rounded-md border border-black/8 bg-white/60 p-3 text-[11px] leading-relaxed text-black/55">
            You are initializing a Solana-native autonomous agent. These entities possess unique private keys and the ability to execute on-chain logic.
          </div>
        </aside>

        <main className="space-y-14 lg:pl-2">
          <section className="space-y-4">
            <h2 className="text-[38px] font-semibold tracking-[-0.025em] text-black">1. Name &amp; Personality</h2>
            <p className="text-[15px] text-black/65">
              Define the core essence of your agent. This data will be etched into its neural metadata.
            </p>

            <div className="grid gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold tracking-[0.16em] text-black/55">AGENT DESIGNATION</label>
                <input
                  value={draft.name}
                  onChange={(event) => updateDraft({ name: event.target.value })}
                  placeholder="e.g. SOL-ARBITER-01"
                  className="h-12 w-full rounded-[2px] border border-[#c2d9da] bg-white px-4 text-[15px] text-black outline-none transition focus:border-[#0b7d82]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold tracking-[0.16em] text-black/55">THE SOUL TAGLINE</label>
                <input
                  value={draft.tagline}
                  onChange={(event) => updateDraft({ tagline: event.target.value })}
                  placeholder="One sentence that defines its purpose..."
                  className="h-12 w-full rounded-[2px] border border-[#cfd6d7] bg-white px-4 text-[15px] text-black outline-none transition focus:border-[#0b7d82]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold tracking-[0.16em] text-black/55">BEHAVIORAL DIRECTIVES</label>
                <textarea
                  value={draft.personality}
                  onChange={(event) => updateDraft({ personality: event.target.value })}
                  placeholder="Describe how your agent should think, speak, and prioritize tasks. Use natural language to guide its logic..."
                  className="min-h-36 w-full rounded-[2px] border border-[#cfd6d7] bg-white px-4 py-3 text-[14px] text-black outline-none transition focus:border-[#0b7d82]"
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[38px] font-semibold tracking-[-0.025em] text-black">2. Tools &amp; Capabilities</h2>
            <p className="text-[15px] text-black/65">Select the permissioned modules your agent can interact with.</p>

            {loadingTools ? (
              <div className="rounded-md border border-black/10 bg-white px-4 py-5 text-[14px] text-black/55">Loading tool capabilities...</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {featuredTools.map((tool, index) => {
                  const selected = draft.tools.includes(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => toggleTool(tool.id)}
                      className={`relative flex cursor-pointer items-start gap-3 rounded-md border px-4 py-4 text-left transition-colors ${
                        selected
                          ? "border-[#96c7c9] bg-white"
                          : "border-transparent bg-[#eef0f1] hover:border-black/10"
                      }`}
                    >
                      <span className={`mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-sm ${selected ? "bg-[#d9eef0]" : "bg-white/70"}`}>
                        {index % 2 === 0 ? <Hammer className="h-4 w-4 text-[#0b7d82]" /> : <Banknote className="h-4 w-4 text-black/60" />}
                      </span>
                      <div>
                        <p className="text-[14px] font-semibold text-black">{tool.name}</p>
                        <p className="mt-1 text-[12px] text-black/60">{tool.description}</p>
                      </div>
                      {selected && (
                        <span className="absolute right-2 top-2 inline-flex h-4 w-4 items-center justify-center rounded-sm bg-[#0b7d82] text-[10px] text-white">
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-[38px] font-semibold tracking-[-0.025em] text-black">3. Spending &amp; Limits</h2>
            <p className="text-[15px] text-black/65">Establish the safety rails for the agent&apos;s financial autonomy.</p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 rounded-md border border-black/10 bg-[#f2f3f4] p-3">
                <label className="text-[10px] font-semibold tracking-[0.16em] text-black/55">MAX TRANSACTION [SOL]</label>
                <input
                  type="number"
                  value={draft.maxSolPerTx}
                  onChange={(event) => updateDraft({ maxSolPerTx: Number(event.target.value) })}
                  className="h-10 w-full rounded-[2px] border border-transparent bg-white px-3 text-[14px] text-black outline-none focus:border-[#0b7d82]"
                />
              </div>

              <div className="space-y-1.5 rounded-md border border-black/10 bg-[#f2f3f4] p-3">
                <label className="text-[10px] font-semibold tracking-[0.16em] text-black/55">WEEKLY BUDGET [SOL]</label>
                <input
                  type="number"
                  value={draft.weeklyBudgetUsdc}
                  onChange={(event) => updateDraft({ weeklyBudgetUsdc: Number(event.target.value) })}
                  className="h-10 w-full rounded-[2px] border border-transparent bg-white px-3 text-[14px] text-black outline-none focus:border-[#0b7d82]"
                />
              </div>
            </div>

            <div className="rounded-md border border-black/10 bg-[#f2f3f4] p-4">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-black/55">ALLOWED ACTIONS WHITE-LIST</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {draft.allowedActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => toggleAction(action)}
                    className="rounded-full border border-black/15 bg-white px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-black/70 transition-colors hover:bg-black/5"
                  >
                    {action.replace(/\s+/g, "_").toUpperCase()}
                  </button>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    value={customAction}
                    onChange={(event) => setCustomAction(event.target.value)}
                    placeholder="custom action"
                    className="h-7 rounded-full border border-black/15 bg-white px-3 text-[11px] text-black outline-none focus:border-[#0b7d82]"
                  />
                  <button
                    onClick={addCustomAction}
                    className="rounded-full bg-[#0b7d82] px-3 py-1.5 text-[10px] font-semibold tracking-[0.08em] text-white hover:bg-[#08676b]"
                  >
                    + ADD ACTION
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-5 pb-10">
            <h2 className="text-center text-[40px] font-semibold tracking-[-0.025em] text-black">4. Final Verification</h2>
            <p className="text-center text-[15px] text-black/65">Review the configuration before deploying to the Solana mainnet.</p>

            <div className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_6px_18px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-4">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md bg-[#101215]">
                  <Bot className="h-10 w-10 text-[#5fe6ec]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[26px] font-semibold tracking-[-0.02em] text-black">{draft.name || "SOL-ARBITER-01"}</p>
                  <p className="mt-1 text-[14px] text-black/65">
                    {draft.tagline || "Protecting assets through autonomous liquidity-staking optimization."}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-semibold tracking-[0.08em] text-[#0b7d82]">
                    <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> LOGIC: ENABLED</span>
                    <span className="inline-flex items-center gap-1"><Wallet className="h-3 w-3" /> SAFETY: HIGH</span>
                    {mintSignature && <span>MINTED: YES</span>}
                  </div>
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-[12px] text-black/60 sm:grid-cols-2">
                <p>Tools: {selectedToolNames.join(", ") || "None"}</p>
                <p>Risk: {draft.riskLevel}</p>
                <p>Max Tx: {draft.maxSolPerTx} SOL</p>
                <p>Daily Budget: {draft.dailyBudgetUsdc}</p>
                {mintAddress && <p className="sm:col-span-2">Mint Address: {mintAddress}</p>}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                onClick={() => void handleMint()}
                disabled={isMinting}
                className="h-12 rounded-[2px] border border-black bg-[#1b1d1e] text-[14px] font-semibold text-white hover:bg-black disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {isMinting ? "Minting..." : "Mint as Compressed NFT (0.001 SOL)"}
              </Button>

              <Button
                onClick={handleDeploy}
                className="h-12 rounded-[2px] border border-[#0b7d82] bg-[#0b7d82] text-[14px] font-semibold text-white hover:bg-[#08676b]"
              >
                Deploy to Solana
              </Button>
            </div>
          </section>

          <footer className="pb-8 pt-4 text-center">
            <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] tracking-[0.12em] text-black/55">
              <a href="/terms" className="transition-colors hover:text-black">TERMS</a>
              <a href="/privacy" className="transition-colors hover:text-black">PRIVACY</a>
              <a href="#" className="transition-colors hover:text-black">STATUS</a>
              <a href="#" className="transition-colors hover:text-black">TWITTER</a>
              <a href="#" className="transition-colors hover:text-black">DISCORD</a>
            </div>
            <p className="mt-4 text-[12px] tracking-[0.08em] text-[#0b7d82]">© 2026 VESSEL ENGINE. ALL RIGHTS RESERVED.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
