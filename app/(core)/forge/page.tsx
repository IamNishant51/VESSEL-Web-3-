"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Banknote,
  Bot,
  CircleDollarSign,
  Hammer,
  Loader2,
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
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { solanaRpcUrl } from "@/lib/solana";
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
  const [isDeploying, setIsDeploying] = useState(false);
  const [mintAddress, setMintAddress] = useState<string | null>(null);
  const [mintSignature, setMintSignature] = useState<string | null>(null);
  const [mintPreflight, setMintPreflight] = useState<{
    ready: boolean;
    loading: boolean;
    checks: Array<{ name: string; ok: boolean; detail: string }>;
    config: { merkleTree: string | null; collectionMint: string | null };
  }>({ ready: false, loading: true, checks: [], config: { merkleTree: null, collectionMint: null } });
  const [customAction, setCustomAction] = useState("");
  const [activeStep, setActiveStep] = useState(0);
  const buttonFeedbackClass = "transform-gpu transition-all duration-150 active:scale-[0.97] active:brightness-[0.97]";

  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  const { publicKey, wallet } = useWallet();
  const isBraveWallet = (wallet?.adapter?.name || "").toLowerCase().includes("brave");
  const isSolflareWallet = (wallet?.adapter?.name || "").toLowerCase().includes("solflare");
  const { addAgent } = useAgent();
  const hasHydrated = useStoreHydrated();
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

  useEffect(() => {
    const loadMintPreflight = async () => {
      setMintPreflight((prev) => ({ ...prev, loading: true }));
      try {
        const response = await fetch("/api/agents/mint-preflight", { cache: "no-store" });
        const data = (await response.json()) as {
          ready?: boolean;
          checks?: Array<{ name: string; ok: boolean; detail: string }>;
          config?: { merkleTree?: string | null; collectionMint?: string | null };
        };

        setMintPreflight({
          ready: !!data.ready,
          loading: false,
          checks: Array.isArray(data.checks) ? data.checks : [],
          config: {
            merkleTree: data.config?.merkleTree ?? null,
            collectionMint: data.config?.collectionMint ?? null,
          },
        });
      } catch {
        setMintPreflight({
          ready: false,
          loading: false,
          checks: [{ name: "mint_preflight", ok: false, detail: "Failed to load mint preflight status." }],
          config: { merkleTree: null, collectionMint: null },
        });
      }
    };

    void loadMintPreflight();
  }, []);

  useEffect(() => {
    const sectionIds = ["section-identity", "section-tools", "section-economy", "section-deployment"];
    const observers: IntersectionObserver[] = [];

    const observerOptions = {
      root: null,
      rootMargin: "-50% 0px -50% 0px",
      threshold: 0,
    };

    sectionIds.forEach((id, index) => {
      const element = document.getElementById(id);
      if (element) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveStep(index);
            }
          });
        }, observerOptions);
        observer.observe(element);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
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

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-black/20 border-t-black" />
      </div>
    );
  }

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

    if (!wallet?.adapter) {
      toast.error("No wallet adapter found. Reconnect your wallet and retry.");
      return;
    }

    if (!isDevMode && isBraveWallet) {
      toast.error("Brave Wallet cannot mint this Bubblegum cNFT reliably. Switch to Phantom or Solflare for minting.");
      return;
    }

    if (!isDevMode && !mintPreflight.ready) {
      toast.error("Mint preflight checks are not passing. Fix configuration errors before minting.");
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

    if (!isDevMode) {
      try {
        const { Connection, PublicKey } = await import("@solana/web3.js");
        const connection = new Connection(solanaRpcUrl, "confirmed");
        const balance = await connection.getBalance(new PublicKey(publicKey.toBase58()));
        const solBalance = balance / 1_000_000_000;

        if (solBalance < 0.01) {
          toast.error(
            `Insufficient SOL balance. You have ${solBalance.toFixed(4)} SOL. ` +
            `Minting requires ~0.002 SOL for gas. Fund your wallet at ${solanaRpcUrl.includes("devnet") ? "https://solfaucet.com" : "an exchange"} and retry.`
          );
          return;
        }
      } catch {
        toast.error("Could not check wallet balance. Please retry.");
        return;
      }
    }

    try {
      setIsMinting(true);

      const metadataRef = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
      const metadataName = encodeURIComponent(draft.name.trim().slice(0, 40) || "Vessel Agent Soul");
      const metadataTagline = encodeURIComponent((draft.tagline || "Give Your Ideas a Soul").slice(0, 72));
      const metadataUri = `${window.location.origin}/api/agents/metadata?id=${encodeURIComponent(metadataRef)}&name=${metadataName}&tagline=${metadataTagline}`;
      const { mintAgentSoulCnft } = await import("@/lib/metaplex");

      const result = await mintAgentSoulCnft({
        owner: publicKey.toBase58(),
        draft,
        walletAdapter: wallet.adapter,
        metadataUri,
        merkleTreeAddress: mintPreflight.config.merkleTree ?? process.env.NEXT_PUBLIC_BUBBLEGUM_MERKLE_TREE ?? undefined,
        collectionMintAddress: mintPreflight.config.collectionMint ?? process.env.NEXT_PUBLIC_BUBBLEGUM_COLLECTION_MINT ?? undefined,
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
        treasuryBalance: 10,
        earnings: 0,
        tagline: draft.tagline,
        tools: draft.tools,
        maxSolPerTx: draft.maxSolPerTx,
        dailyBudgetUsdc: draft.dailyBudgetUsdc,
        allowedActions: draft.allowedActions,
        riskLevel: draft.riskLevel,
        systemPrompt,
      });

      toast.success(`Agent Soul minted successfully${isDevMode ? " (dev mode — no on-chain transaction)" : ` on-chain. ${result.explorerUrl ?? "Simulation complete"}`}`);
    } catch (error) {
      const message = (() => {
        if (error instanceof Error) {
          return error.message;
        }
        if (error && typeof error === "object") {
          try {
            const raw = JSON.stringify(error);
            if (raw && raw !== "{}") {
              return raw;
            }
          } catch {
            // ignore JSON serialization failure
          }
        }
        return "Unknown mint error";
      })();
      const walletName = wallet?.adapter?.name || "current wallet";
      const isBlockhash = message.toLowerCase().includes("blockhash");
      const isBalance = message.toLowerCase().includes("insufficient") || message.toLowerCase().includes("balance");
      const isNetworkMismatch =
        message.toLowerCase().includes("network") &&
        message.toLowerCase().includes("mainnet") &&
        message.toLowerCase().includes("devnet");
      const isBrave = walletName.toLowerCase().includes("brave");
      const isSolflare = walletName.toLowerCase().includes("solflare");

      let hint = "";
      if (isBlockhash) {
        hint = " Blockhash expired. Ensure your wallet is on Solana Devnet and retry immediately.";
      }
      if (isNetworkMismatch) {
        hint = " Your wallet is on mainnet while VESSEL mint uses devnet. Switch wallet network to Devnet and retry.";
      }
      if (isBalance) {
        hint = ` Your wallet has insufficient SOL for gas. Fund at ${solanaRpcUrl.includes("devnet") ? "https://solfaucet.com" : "an exchange"} and retry.`;
      }
      if (isBrave && isBlockhash) {
        hint += " Brave Wallet has known issues with cNFT minting. Try Phantom or Solflare instead.";
      }
      if (isSolflare && isNetworkMismatch) {
        hint += " In Solflare, open Settings -> Network and select Devnet.";
      }
      if (isSolflare && (isBlockhash || message.toLowerCase().includes("simulation failed"))) {
        hint += " In Solflare popup, check \"I trust this site\" before approving when balance changes show as Unknown.";
      }

      toast.error(`Mint failed: ${message}.${hint}`);
      const logError = error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
            cause: (error as Error & { cause?: unknown }).cause,
          }
        : error;
      // Use warn so Next dev overlay does not treat handled mint failures as app crashes.
      console.warn("Forge mint failed", { wallet: walletName, error: logError });
    } finally {
      setIsMinting(false);
    }
  }

  async function handleDeploy() {
    if (!mintAddress) {
      toast.info("Mint first, then deploy from dashboard orchestration.");
      return;
    }

    setIsDeploying(true);
    await new Promise((resolve) => setTimeout(resolve, 260));
    router.push("/dashboard");
  }

  return (
    <div className="-mx-4 -mt-8 min-h-screen bg-[#f5f5f6] px-4 pb-10 pt-6 text-[#161718] sm:-mx-6 sm:px-6 lg:pt-8">
      <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-16 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden self-start lg:block lg:sticky lg:top-24 lg:h-fit">
          <div className="mb-8 flex items-center gap-2">
            <span className="inline-block rounded-full bg-[#171819]/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#171819]/60">Forge Module</span>
            {isDevMode && (
              <span className="inline-block rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.15em] text-amber-600 ring-1 ring-amber-500/20">Dev Mode</span>
            )}
          </div>
          <h1 className="mb-6 text-5xl font-bold leading-[0.9] tracking-tight text-[#171819]">
            Agent
            <br />
            Creator
          </h1>

          <nav className="mb-8 space-y-1">
            {moduleItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === activeStep;
              const sectionId = `section-${item.id}`;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveStep(index);
                    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`${buttonFeedbackClass} flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all duration-200 ${
                    isActive
                      ? "bg-[#171819] text-white shadow-lg"
                      : "text-[#171819]/50 hover:bg-[#171819]/5 hover:text-[#171819]"
                  }`}
                >
                  <span className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                    isActive ? "bg-white/20" : "bg-[#171819]/10"
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                  <Icon className={`ml-auto h-4 w-4 ${isActive ? "text-white/70" : "text-[#171819]/30"}`} />
                </button>
              );
            })}
          </nav>

          <div className="rounded-xl border border-black/10 bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#171819]" />
              <span className="text-xs font-semibold text-[#171819]/40 uppercase tracking-[0.1em]">Info</span>
            </div>
            <p className="text-sm leading-relaxed text-[#171819]/60">
              You are initializing a Solana-native autonomous agent. These entities possess unique private keys and the ability to execute on-chain logic.
            </p>
          </div>
        </aside>

        <main className="space-y-20 lg:pl-2">
          <section id="section-identity" className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171819] text-xs font-bold text-white">1</span>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#171819]/50">Step One</span>
              </div>
              <h2 className="text-5xl font-bold tracking-tight text-[#171819]">Name &amp; Personality</h2>
              <p className="max-w-xl text-lg text-[#171819]/60 leading-relaxed">
                Define the core essence of your agent. This data will be etched into its neural metadata.
              </p>
            </div>

            <div className="grid gap-6">
              <div className="group space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#171819]/50">Agent Designation</label>
                <input
                  value={draft.name}
                  onChange={(event) => updateDraft({ name: event.target.value })}
                  placeholder="e.g. SOL-ARBITER-01"
                  className="w-full rounded-lg border-2 border-[#e5e5e5] bg-white px-5 py-4 text-lg font-medium text-[#171819] placeholder:text-[#171819]/30 transition focus:border-[#171819] focus:outline-none focus:ring-4 focus:ring-[#171819]/10"
                />
              </div>

              <div className="group space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#171819]/50">The Soul Tagline</label>
                <input
                  value={draft.tagline}
                  onChange={(event) => updateDraft({ tagline: event.target.value })}
                  placeholder="Give Your Ideas a Soul"
                  className="w-full rounded-lg border-2 border-[#e5e5e5] bg-white px-5 py-4 text-lg font-medium text-[#171819] placeholder:text-[#171819]/30 transition focus:border-[#171819] focus:outline-none focus:ring-4 focus:ring-[#171819]/10"
                />
              </div>

              <div className="group space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#171819]/50">Behavioral Directives</label>
                <textarea
                  value={draft.personality}
                  onChange={(event) => updateDraft({ personality: event.target.value })}
                  placeholder="Describe how your agent should think, speak, and prioritize tasks. Use natural language to guide its logic..."
                  className="min-h-[140px] w-full rounded-lg border-2 border-[#e5e5e5] bg-white px-5 py-4 text-base text-[#171819] placeholder:text-[#171819]/30 transition focus:border-[#171819] focus:outline-none focus:ring-4 focus:ring-[#171819]/10 resize-none"
                />
              </div>
            </div>
          </section>

          <section id="section-tools" className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171819] text-xs font-bold text-white">2</span>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#171819]/50">Step Two</span>
              </div>
              <h2 className="text-5xl font-bold tracking-tight text-[#171819]">Tools &amp; Capabilities</h2>
              <p className="max-w-xl text-lg text-[#171819]/60 leading-relaxed">
                Select the permissioned modules your agent can interact with.
              </p>
            </div>

            {loadingTools ? (
              <div className="rounded-xl border-2 border-[#e5e5e5] bg-white px-6 py-8 text-base text-[#171819]/50">Loading tool capabilities...</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {featuredTools.map((tool, index) => {
                  const selected = draft.tools.includes(tool.id);
                  return (
                    <button
                      key={tool.id}
                      onClick={() => toggleTool(tool.id)}
                      className={`${buttonFeedbackClass} group relative flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200 ${
                        selected
                          ? "border-[#171819] bg-white shadow-lg scale-[1.02]"
                          : "border-[#e5e5e5] bg-white hover:border-[#171819]/30 hover:shadow-md"
                      }`}
                    >
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors ${
                        selected ? "bg-[#171819]" : "bg-[#f5f5f5] group-hover:bg-[#e5e5e5]"
                      }`}>
                        {index % 2 === 0 ? <Hammer className={`h-5 w-5 ${selected ? "text-white" : "text-[#171819]/60"}`} /> : <Banknote className={`h-5 w-5 ${selected ? "text-white" : "text-[#171819]/60"}`} />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold text-[#171819]">{tool.name}</p>
                        <p className="mt-1 text-sm text-[#171819]/50">{tool.description}</p>
                      </div>
                      {selected && (
                        <span className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-[#171819] text-white">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section id="section-economy" className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171819] text-xs font-bold text-white">3</span>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#171819]/50">Step Three</span>
              </div>
              <h2 className="text-5xl font-bold tracking-tight text-[#171819]">Spending &amp; Limits</h2>
              <p className="max-w-xl text-lg text-[#171819]/60 leading-relaxed">
                Establish the safety rails for the agent&apos;s financial autonomy.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#171819]/50">Max Transaction [SOL]</label>
                <input
                  type="number"
                  value={draft.maxSolPerTx}
                  onChange={(event) => updateDraft({ maxSolPerTx: Number(event.target.value) })}
                  className="w-full rounded-lg border-2 border-[#e5e5e5] bg-white px-5 py-4 text-lg font-semibold text-[#171819] transition focus:border-[#171819] focus:outline-none focus:ring-4 focus:ring-[#171819]/10"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-[0.15em] text-[#171819]/50">Weekly Budget [SOL]</label>
                <input
                  type="number"
                  value={draft.weeklyBudgetUsdc}
                  onChange={(event) => updateDraft({ weeklyBudgetUsdc: Number(event.target.value) })}
                  className="w-full rounded-lg border-2 border-[#e5e5e5] bg-white px-5 py-4 text-lg font-semibold text-[#171819] transition focus:border-[#171819] focus:outline-none focus:ring-4 focus:ring-[#171819]/10"
                />
              </div>
            </div>

            <div className="rounded-xl border-2 border-[#e5e5e5] bg-white p-6">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#171819]/50">Allowed Actions White-list</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {draft.allowedActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => toggleAction(action)}
                    className={`${buttonFeedbackClass} inline-flex items-center gap-1.5 rounded-full border-2 border-[#e5e5e5] bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#171819]/70 transition-all hover:border-[#171819] hover:text-[#171819]`}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-[#14F195]" />
                    {action.replace(/\s+/g, "_").toUpperCase()}
                  </button>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    value={customAction}
                    onChange={(event) => setCustomAction(event.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addCustomAction(); }}
                    placeholder="custom action"
                    className="h-10 w-40 rounded-full border-2 border-[#e5e5e5] bg-white px-4 text-xs font-medium text-[#171819] placeholder:text-[#171819]/30 transition focus:border-[#171819] focus:outline-none focus:ring-4 focus:ring-[#171819]/10"
                  />
                  <button
                    onClick={addCustomAction}
                    className={`${buttonFeedbackClass} inline-flex h-10 items-center gap-1.5 rounded-full bg-[#171819] px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#111111]`}
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section id="section-deployment" className="space-y-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171819] text-xs font-bold text-white">4</span>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#171819]/50">Final Step</span>
              </div>
              <h2 className="text-5xl font-bold tracking-tight text-[#171819]">Final Verification</h2>
              <p className="max-w-xl text-lg text-[#171819]/60 leading-relaxed">
                Review the configuration before deploying to the Solana mainnet.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_10px_28px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#171819] to-[#333333]">
                  <Bot className="h-12 w-12 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-2xl font-bold tracking-tight text-[#171819]">{draft.name || "SOL-ARBITER-01"}</h3>
                  <p className="mt-1 text-base text-[#171819]/50">
                    {draft.tagline || "Give Your Ideas a Soul"}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] px-3 py-1.5 text-xs font-semibold text-[#171819]">
                      <ShieldCheck className="h-3.5 w-3.5" /> LOGIC: ENABLED
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] px-3 py-1.5 text-xs font-semibold text-[#171819]">
                      <Wallet className="h-3.5 w-3.5" /> SAFETY: HIGH
                    </span>
                    {mintSignature && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${isDevMode ? "bg-amber-500/10 text-amber-600" : "bg-[#14F195]/10 text-[#14F195]"}`}>
                        {isDevMode ? "MINTED: DEV MODE" : "MINTED: ON-CHAIN"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 border-t border-black/8 bg-[#fcfcfc] p-6 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#171819]/40">Tools</p>
                  <p className="text-sm font-medium text-[#171819]">{selectedToolNames.join(", ") || "None"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#171819]/40">Risk Level</p>
                  <p className="text-sm font-medium text-[#171819]">{draft.riskLevel}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#171819]/40">Max Transaction</p>
                  <p className="text-sm font-medium text-[#171819]">{draft.maxSolPerTx} SOL</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#171819]/40">Daily Budget</p>
                  <p className="text-sm font-medium text-[#171819]">{draft.dailyBudgetUsdc}</p>
                </div>
                {mintAddress && (
                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-[0.1em] text-[#171819]/40">Mint Address</p>
                    <p className="break-all text-xs font-mono text-[#171819]/70">{mintAddress}</p>
                  </div>
                )}
              </div>
            </div>

            <div className={`rounded-xl border p-4 ${mintPreflight.ready ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/70"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#171819]/60">Mint Preflight</p>
                <button
                  onClick={async () => {
                    setMintPreflight((prev) => ({ ...prev, loading: true }));
                    try {
                      const response = await fetch("/api/agents/mint-preflight", { cache: "no-store" });
                      const data = (await response.json()) as {
                        ready?: boolean;
                        checks?: Array<{ name: string; ok: boolean; detail: string }>;
                        config?: { merkleTree?: string | null; collectionMint?: string | null };
                      };

                      setMintPreflight({
                        ready: !!data.ready,
                        loading: false,
                        checks: Array.isArray(data.checks) ? data.checks : [],
                        config: {
                          merkleTree: data.config?.merkleTree ?? null,
                          collectionMint: data.config?.collectionMint ?? null,
                        },
                      });
                    } catch {
                      setMintPreflight({
                        ready: false,
                        loading: false,
                        checks: [{ name: "mint_preflight", ok: false, detail: "Failed to refresh mint preflight status." }],
                        config: { merkleTree: null, collectionMint: null },
                      });
                    }
                  }}
                  className="rounded-md border border-black/10 bg-white px-2.5 py-1 text-[11px] font-medium text-[#171819] hover:bg-black/5"
                >
                  {mintPreflight.loading ? "Checking..." : "Recheck"}
                </button>
              </div>

              <div className="mt-3 space-y-1.5">
                {mintPreflight.checks.map((check) => (
                  <div key={check.name} className="flex items-start gap-2 text-xs text-[#171819]/75">
                    <span className={`mt-0.5 h-2 w-2 rounded-full ${check.ok ? "bg-emerald-600" : "bg-amber-600"}`} />
                    <span>
                      {check.name}: {check.detail}
                    </span>
                  </div>
                ))}
                {mintPreflight.checks.length === 0 && (
                  <p className="text-xs text-[#171819]/60">No preflight checks returned yet.</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {!isDevMode && isBraveWallet && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 sm:col-span-2">
                  Brave Wallet is detected. For compressed NFT minting, connect Phantom or Solflare to continue.
                </div>
              )}

              {!isDevMode && isSolflareWallet && (
                <div className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-medium text-sky-900 sm:col-span-2">
                  Solflare detected. Ensure wallet network is set to Devnet before minting.
                </div>
              )}

              <Button
                onClick={() => void handleMint()}
                disabled={isMinting || (!isDevMode && (mintPreflight.loading || !mintPreflight.ready || isBraveWallet))}
                className={`${buttonFeedbackClass} h-11 gap-2 rounded-lg border border-[#171819] bg-[#171819] px-4 text-sm font-semibold text-white transition hover:bg-[#111111] hover:shadow-md disabled:opacity-60`}
              >
                <Sparkles className={`h-5 w-5 ${isMinting ? "animate-pulse" : ""}`} />
                {isMinting
                  ? "Minting..."
                  : isDevMode
                    ? "Mint (Dev Mode — No SOL Required)"
                    : isBraveWallet
                      ? "Switch Wallet to Mint"
                    : mintPreflight.loading
                      ? "Checking preflight..."
                      : mintPreflight.ready
                        ? "Mint as Compressed NFT"
                        : "Fix preflight to mint"}
              </Button>

              <Button
                onClick={() => void handleDeploy()}
                disabled={isDeploying}
                className={`${buttonFeedbackClass} h-11 gap-2 rounded-lg border border-black/15 bg-white px-4 text-sm font-semibold text-[#171819] transition hover:border-[#171819] hover:shadow-md disabled:opacity-70`}
              >
                {isDeploying ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Opening Dashboard...
                  </>
                ) : (
                  <>
                    Deploy to Solana
                    <Rocket className="h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </section>
        </main>
      </div>
      <footer className="mt-14 border-t border-black/10 pt-6 text-center">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] tracking-[0.12em] text-black/55">
            <a href="/terms" className="transition-colors hover:text-black">TERMS</a>
            <a href="/privacy" className="transition-colors hover:text-black">PRIVACY</a>
            <a href="#" className="transition-colors hover:text-black">STATUS</a>
            <a href="#" className="transition-colors hover:text-black">TWITTER</a>
            <a href="#" className="transition-colors hover:text-black">DISCORD</a>
          </div>
          <p className="mt-4 pb-6 text-[10px] tracking-[0.12em] text-black/50">© 2026 VESSEL ENGINE. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
}
