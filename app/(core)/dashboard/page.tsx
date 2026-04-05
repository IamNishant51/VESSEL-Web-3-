"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot,
  Coins,
  GitBranch,
  Plus,
  Save,
  Settings,
  Sparkles,
  Trash2,
  Wallet,
  Zap,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

import { WalletConnectButton } from "@/components/wallet/connect-button";
import { useAgent } from "@/hooks/useAgent";
import { getAgentArtworkUrl } from "@/lib/agent-visuals";
import { shortAddress } from "@/lib/utils";
import { useVesselStore } from "@/store/useVesselStore";
import type { Agent } from "@/types/agent";

const sidebarItems = [
  { id: "orchestra", label: "Orchestra", icon: GitBranch },
  { id: "my-agents", label: "My Agents", icon: Bot },
  { id: "running", label: "Running", icon: Zap },
  { id: "earnings", label: "Earnings", icon: Coins },
  { id: "settings", label: "Settings", icon: Settings },
];

const flowCards = [
  {
    id: "scanner",
    title: "X-Scanner",
    fieldLabel: "INPUT SOURCE",
    value: "solana_news_feed",
    top: "8%",
    left: "8%",
    accent: true,
  },
  {
    id: "zenith",
    title: "Zenith AI",
    fieldLabel: "OPERATION",
    value: "sentiment_analysis(0.85)",
    top: "22%",
    left: "44%",
    accent: false,
  },
  {
    id: "trader",
    title: "V-Trader v2",
    fieldLabel: "TARGET PAIR",
    value: "SOL / USDC",
    top: "40%",
    left: "28%",
    accent: false,
    live: true,
  },
];

export default function DashboardPage() {
  const { publicKey, disconnect } = useWallet();
  const { agents, activeAgents } = useAgent();
  const marketplaceListings = useVesselStore((state) => state.marketplaceListings);
  const router = useRouter();

  const [activeSidebar, setActiveSidebar] = useState("orchestra");
  const [activeToolbox, setActiveToolbox] = useState("flow");
  const [isRunning, setIsRunning] = useState(false);
  const [orchestraNodes, setOrchestraNodes] = useState(flowCards);
  const [workspaceSavedAt, setWorkspaceSavedAt] = useState<string | null>(null);
  const [earningsHighlighted, setEarningsHighlighted] = useState(false);
  const earningsPanelRef = useRef<HTMLDivElement | null>(null);

  const ownerAddress = publicKey?.toBase58();

  const activeInstances = useMemo(() => {
    return agents.slice(0, 4).map((agent: Agent, index: number) => ({
      id: agent.id,
      name: agent.name,
      status: index === 0 && isRunning ? "Running" : "Idle",
      subtitle: index === 0 && isRunning ? "Running Strategy" : "Awaiting Signal",
      progress: isRunning ? Math.floor(Math.random() * 60) + 40 : 0,
      agentId: agent.id,
      artworkUrl: getAgentArtworkUrl(agent, 256),
    }));
  }, [agents, isRunning]);

  const myListingsCount = useMemo(() => {
    if (!ownerAddress) {
      return 0;
    }
    return marketplaceListings.filter((listing) => listing.seller === ownerAddress).length;
  }, [marketplaceListings, ownerAddress]);

  const myRentalsCount = useMemo(() => {
    if (!ownerAddress) {
      return 0;
    }
    return agents.filter((agent: Agent) => agent.isRental).length;
  }, [agents, ownerAddress]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const raw = localStorage.getItem("vessel_workspace");
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as {
        nodes?: typeof flowCards;
        savedAt?: string;
      };

      if (Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
        setOrchestraNodes(parsed.nodes);
      }

      if (parsed.savedAt) {
        setWorkspaceSavedAt(parsed.savedAt);
      }
    } catch {
      // Ignore malformed local workspace cache.
    }
  }, []);

  const earnings = useMemo(() => {
    const total = agents.reduce((sum: number, item: Agent) => sum + (item.earnings ?? 0), 0);
    return `${total.toFixed(3)} USDC`;
  }, [agents]);

  const totalActions = useMemo(() => {
    return agents.reduce((sum: number, item: Agent) => sum + (item.totalActions ?? 0), 0);
  }, [agents]);

  const averageReputation = useMemo(() => {
    if (agents.length === 0) {
      return 0;
    }
    const total = agents.reduce((sum: number, item: Agent) => sum + (item.reputation ?? 80), 0);
    return total / agents.length;
  }, [agents]);

  const walletLabel = shortAddress(publicKey?.toBase58());

  function focusEarningsPanel() {
    earningsPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setEarningsHighlighted(true);
    window.setTimeout(() => setEarningsHighlighted(false), 1200);
  }

  const handleSidebarClick = (itemId: string, itemLabel: string) => {
    setActiveSidebar(itemId);
    switch (itemId) {
      case "my-agents":
        router.push("/agents");
        break;
      case "orchestra":
        break;
      case "running":
        if (agents.length === 0) {
          toast.info("Forge at least one agent to start running workflows.");
          router.push("/forge");
          break;
        }
        setIsRunning(true);
        toast.success("Run mode activated for current workspace.");
        break;
      case "earnings":
        focusEarningsPanel();
        toast.success("Showing earnings inside dashboard.");
        break;
      case "settings":
        toast.info("Workspace settings are saved locally on this dashboard.");
        break;
      default:
        toast.info(`${itemLabel} selected`);
    }
  };

  function onSave() {
    const savedData = {
      nodes: orchestraNodes,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("vessel_workspace", JSON.stringify(savedData));
    setWorkspaceSavedAt(savedData.savedAt);
    toast.success("Workspace snapshot saved.");
  }

  function onRunOrchestra() {
    if (agents.length === 0) {
      toast.info("Forge at least one agent to run orchestration.");
      router.push("/forge");
      return;
    }

    if (orchestraNodes.length === 0) {
      toast.info("Add a node before starting orchestration.");
      return;
    }

    setIsRunning((prev) => !prev);
    toast.success(isRunning ? "Orchestra paused." : "Orchestra run started.");
  }

  function onAddNode() {
    const newNode = {
      id: `node-${Date.now()}`,
      title: `Node ${orchestraNodes.length + 1}`,
      fieldLabel: "CONFIGURE",
      value: "Set values...",
      top: `${20 + Math.random() * 40}%`,
      left: `${20 + Math.random() * 40}%`,
      accent: false,
    };
    setOrchestraNodes([...orchestraNodes, newNode]);
    toast.success("New node added.");
  }

  function onDeleteNode(nodeId: string) {
    setOrchestraNodes(orchestraNodes.filter((n) => n.id !== nodeId));
    toast.success("Node removed.");
  }

  function onAutoArrangeNodes() {
    if (orchestraNodes.length === 0) {
      toast.info("Add at least one node before arranging.");
      return;
    }

    const arranged = orchestraNodes.map((node, index) => {
      const row = Math.floor(index / 2);
      const column = index % 2;
      return {
        ...node,
        top: `${10 + row * 20}%`,
        left: `${8 + column * 36}%`,
      };
    });

    setOrchestraNodes(arranged);
    toast.success("Nodes auto-arranged.");
  }

  function onResetWorkspace() {
    setOrchestraNodes(flowCards);
    setIsRunning(false);
    toast.success("Workspace reset to default flow.");
  }

  function onToolboxClick(tool: "flow" | "nodes" | "settings") {
    setActiveToolbox(tool);

    if (tool === "flow") {
      onRunOrchestra();
      return;
    }

    if (tool === "nodes") {
      onAddNode();
      return;
    }

    onSave();
  }

  function onForgeAgent() {
    router.push("/forge");
  }

  function onViewMarketplace() {
    router.push("/marketplace");
  }

  function onDisconnectWallet() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("vessel:wallet-explicit-disconnect"));
    }
    void disconnect();
  }

  function onInstanceClick(instance: typeof activeInstances[0]) {
    if (instance.agentId) {
      router.push(`/agents/${instance.agentId}`);
    } else {
      toast.info(`${instance.name}: ${instance.subtitle}`);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium text-black/60">
              <span className="h-2 w-2 rounded-full bg-black" />
              Solana
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-black lg:text-[32px]">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {publicKey ? (
              <>
                <button
                  onClick={onForgeAgent}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-black/80"
                >
                  <Plus className="h-4 w-4" />
                  Forge Agent
                </button>
                <button
                  onClick={onDisconnectWallet}
                  className="inline-flex h-10 items-center gap-2 rounded-xl bg-black/5 px-4 text-sm font-semibold text-black transition hover:bg-black/10"
                >
                  <Wallet className="h-4 w-4" />
                  {walletLabel}
                </button>
              </>
            ) : (
              <WalletConnectButton />
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[200px_1fr_260px]">
          <aside className="hidden rounded-2xl bg-[#fafafa] p-4 lg:block">
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Module</p>
              <h2 className="mt-1 text-xl font-bold text-black">Orchestra</h2>
              <p className="mt-0.5 text-xs text-black/40">v1.0.4</p>
            </div>

            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const active = activeSidebar === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSidebarClick(item.id, item.label)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all ${
                      active
                        ? "bg-black text-white"
                        : "text-black/60 hover:bg-black/5 hover:text-black"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6 rounded-xl bg-white p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-black/40">Performance</p>
              <div className="mt-3 flex items-end gap-1.5">
                {[16, 24, 38, 22, 30, 28, 35].map((h, i) => (
                  <div
                    key={i}
                    className={`w-full rounded-sm ${i === 4 ? "bg-black" : "bg-black/10"}`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-medium text-black">SOL/USDC</span>
                <span className="font-bold text-black">+4.2%</span>
              </div>
            </div>
          </aside>

          <main className="relative rounded-2xl bg-[#fafafa] p-4 lg:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-black lg:text-xl">Active Workspace</h2>
                <p className="text-sm text-black/50">
                  Untitled Flow
                  {workspaceSavedAt ? ` • Synced ${new Date(workspaceSavedAt).toLocaleTimeString()}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onSave}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white px-4 text-sm font-medium text-black transition hover:bg-black/5"
                >
                  <Save className="h-4 w-4" />
                  Save
                </button>
                <button
                  onClick={onRunOrchestra}
                  className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-medium text-white transition ${
                    isRunning ? "bg-red-500 hover:bg-red-600" : "bg-black hover:bg-black/80"
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  {isRunning ? "Pause" : "Run"}
                </button>
              </div>
            </div>

            <div className="pointer-events-none absolute right-6 top-20 select-none text-[100px] font-bold leading-[0.85] tracking-[-0.04em] text-black/[0.03] hidden xl:block">
              VESSEL
              <br />
              OS
            </div>

            {activeSidebar === "earnings" && (
              <div className="mt-6 rounded-xl border border-black/10 bg-white p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-black">Earnings Overview</h3>
                    <p className="text-sm text-black/45">Track payouts and reputation without leaving the dashboard.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onViewMarketplace}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-white px-3 text-xs font-medium text-black transition hover:bg-black/5"
                    >
                      View Marketplace
                    </button>
                    <button
                      onClick={onForgeAgent}
                      className="inline-flex h-9 items-center justify-center rounded-lg bg-black px-3 text-xs font-medium text-white transition hover:bg-black/80"
                    >
                      Forge Agent
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-lg bg-[#fafafa] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/40">Today</p>
                    <p className="mt-1 text-lg font-bold text-black">+{earnings}</p>
                  </div>
                  <div className="rounded-lg bg-[#fafafa] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/40">Listings</p>
                    <p className="mt-1 text-lg font-bold text-black">{myListingsCount}</p>
                  </div>
                  <div className="rounded-lg bg-[#fafafa] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-black/40">Rentals</p>
                    <p className="mt-1 text-lg font-bold text-black">{myRentalsCount}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3 lg:hidden">
              {orchestraNodes.map((card) => (
                <motion.div
                  key={`mobile-${card.id}`}
                  whileHover={{ y: -2 }}
                  className="group rounded-xl border border-black/5 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        card.accent ? "bg-black/10" : "bg-black/5"
                      }`}>
                        {card.id === "scanner" ? (
                          <Sparkles className="h-5 w-5 text-black" />
                        ) : (
                          <Bot className="h-5 w-5 text-black/40" />
                        )}
                      </span>
                      <div>
                        <p className="font-semibold text-black">{card.title}</p>
                        <p className="text-xs text-black/40">{card.fieldLabel}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {card.live && (
                        <span className="flex h-2 w-2 rounded-full bg-black" />
                      )}
                      <button onClick={() => onDeleteNode(card.id)} className="opacity-0 transition-opacity group-hover:opacity-100">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg bg-[#fafafa] px-3 py-2 text-sm text-black/60">{card.value}</div>
                </motion.div>
              ))}
              <button
                onClick={onAddNode}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/10 p-4 text-sm font-medium text-black/40 transition hover:border-black/20 hover:text-black/60"
              >
                <Plus className="h-4 w-4" />
                Add Node
              </button>
            </div>

            <div className="relative mt-6 hidden h-[420px] overflow-hidden lg:block">
              <div className="absolute left-[21%] top-[23%] h-14 w-[2px] bg-black/40" />
              <div className="absolute left-[42%] top-[44%] h-[2px] w-20 bg-black/10" />

              {orchestraNodes.map((card) => (
                <motion.div
                  key={card.id}
                  whileHover={{ y: -3 }}
                  className="group absolute w-[280px] rounded-xl border border-black/5 bg-white p-4 shadow-sm"
                  style={{ top: card.top, left: card.left }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        card.accent ? "bg-black/10" : "bg-black/5"
                      }`}>
                        {card.id === "scanner" ? (
                          <Sparkles className="h-5 w-5 text-black" />
                        ) : (
                          <Bot className="h-5 w-5 text-black/40" />
                        )}
                      </span>
                      <p className="text-xl font-semibold text-black">{card.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDeleteNode(card.id)}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                      <span className="h-2 w-2 rounded-full bg-black" />
                    </div>
                  </div>
                  <p className="mt-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-black/40">{card.fieldLabel}</p>
                  <div className="mt-1 rounded-lg bg-[#fafafa] px-3 py-2 text-sm text-black/60">{card.value}</div>
                  {card.live && (
                    <span className="mt-2 inline-flex rounded-full bg-black/10 px-3 py-1 text-xs font-medium text-black">
                      Active
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-3 lg:mt-8">
              <div className="flex items-center gap-1.5 rounded-xl bg-black/5 p-1.5">
                <button
                  onClick={() => onToolboxClick("flow")}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    activeToolbox === "flow" ? "bg-black text-white" : "text-black/50 hover:text-black"
                  }`}
                  title="Run or pause flow"
                >
                  <GitBranch className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onToolboxClick("nodes")}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    activeToolbox === "nodes" ? "bg-black text-white" : "text-black/50 hover:text-black"
                  }`}
                  title="Add a node"
                >
                  <Bot className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onToolboxClick("settings")}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    activeToolbox === "settings" ? "bg-black text-white" : "text-black/50 hover:text-black"
                  }`}
                  title="Save workspace"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={onAddNode}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-medium text-white transition hover:bg-black/80"
              >
                <Plus className="h-4 w-4" />
                Add Node
              </button>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {activeToolbox === "flow" && (
                <>
                  <button
                    onClick={onRunOrchestra}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-xs font-medium text-black transition hover:bg-black/5"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    {isRunning ? "Pause Flow" : "Run Flow"}
                  </button>
                  <button
                    onClick={onSave}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-xs font-medium text-black transition hover:bg-black/5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Snapshot
                  </button>
                </>
              )}

              {activeToolbox === "nodes" && (
                <>
                  <button
                    onClick={onAddNode}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-xs font-medium text-black transition hover:bg-black/5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Node
                  </button>
                  <button
                    onClick={onAutoArrangeNodes}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-xs font-medium text-black transition hover:bg-black/5"
                  >
                    <GitBranch className="h-3.5 w-3.5" />
                    Auto Arrange
                  </button>
                  <button
                    onClick={() => {
                      if (orchestraNodes.length === 0) {
                        toast.info("No nodes to remove.");
                        return;
                      }
                      onDeleteNode(orchestraNodes[orchestraNodes.length - 1].id);
                    }}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-medium text-red-600 transition hover:bg-red-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove Last
                  </button>
                </>
              )}

              {activeToolbox === "settings" && (
                <>
                  <button
                    onClick={onSave}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-xs font-medium text-black transition hover:bg-black/5"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Save Settings
                  </button>
                  <button
                    onClick={onResetWorkspace}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-xs font-medium text-black transition hover:bg-black/5"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Reset Layout
                  </button>
                </>
              )}
            </div>
          </main>

          <aside className="hidden space-y-4 lg:block">
            <div className="rounded-2xl bg-[#fafafa] p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-black/40">Quick Stats</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { label: "Total Agents", value: agents.length },
                  { label: "Active", value: activeAgents.length },
                  { label: "Actions", value: totalActions },
                  { label: "My Listings", value: myListingsCount, highlight: true },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl bg-white p-3 text-center">
                    <p className={`text-lg font-bold ${stat.highlight ? "text-black" : "text-black"}`}>{stat.value}</p>
                    <p className="text-[10px] text-black/40">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#fafafa] p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-black/40">Active Instances</h3>
              <div className="mt-3 space-y-2">
                {activeInstances.length === 0 ? (
                  <div className="rounded-xl border border-black/5 bg-white p-4 text-center">
                    <p className="text-sm font-semibold text-black">No agents yet</p>
                    <p className="mt-1 text-xs text-black/45">Forge your first agent to activate dashboard instances.</p>
                  </div>
                ) : (
                  activeInstances.map((item: (typeof activeInstances)[number]) => (
                    <button
                      key={item.id}
                      onClick={() => onInstanceClick(item)}
                      className="w-full cursor-pointer rounded-xl border border-black/5 bg-white p-3 text-left transition hover:border-black/10"
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={item.artworkUrl}
                          alt={`${item.name} artwork`}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-black">{item.name}</p>
                          <p className="text-xs text-black/40">{item.subtitle}</p>
                        </div>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-black/5">
                        <div className="h-1.5 rounded-full bg-black" style={{ width: `${item.progress}%` }} />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div
              ref={earningsPanelRef}
              className={`rounded-2xl bg-[#fafafa] p-4 transition-shadow ${
                earningsHighlighted ? "ring-2 ring-black/20 shadow-lg" : ""
              }`}
            >
              <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-black/40">Today&apos;s Earnings</h3>
              <p className="mt-2 text-2xl font-bold text-black">+{earnings}</p>
              <p className="mt-1 text-xs text-black/45">Avg reputation: {averageReputation.toFixed(1)} / 100 • Rentals: {myRentalsCount}</p>
              <div className="mt-4 space-y-2">
                <button
                  onClick={onViewMarketplace}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white py-2.5 text-sm font-medium text-black transition hover:bg-black/5"
                >
                  View Marketplace
                </button>
                <button
                  onClick={onForgeAgent}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-2.5 text-sm font-medium text-white transition hover:bg-black/80"
                >
                  <Plus className="h-4 w-4" />
                  Forge New Agent
                </button>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6 hidden flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-4 text-xs text-black/40 lg:flex">
          <span>© 2026 Vessel Engine. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="/terms" className="transition-colors hover:text-black">Terms</a>
            <a href="/privacy" className="transition-colors hover:text-black">Privacy</a>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-black" />
              Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
