"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  CircleGauge,
  Coins,
  Cpu,
  GitBranch,
  Play,
  Save,
  Settings,
  Sparkles,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

import { useAgent } from "@/hooks/useAgent";

const sidebarItems = [
  { id: "orchestra", label: "ORCHESTRA", icon: GitBranch },
  { id: "my-agents", label: "MY AGENTS", icon: Bot },
  { id: "running", label: "RUNNING", icon: Zap },
  { id: "earnings", label: "EARNINGS", icon: Coins },
  { id: "settings", label: "SETTINGS", icon: Settings },
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

function shortAddress(address?: string) {
  if (!address) return "Connect Wallet";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const { agents } = useAgent();

  const [activeSidebar, setActiveSidebar] = useState("orchestra");
  const [activeToolbox, setActiveToolbox] = useState("flow");
  const [isRunning, setIsRunning] = useState(false);

  const activeInstances = useMemo(() => {
    const seeded = agents.slice(0, 2).map((agent, index) => ({
      id: agent.id,
      name: agent.name,
      status: index === 0 ? "Running" : "Idle",
      subtitle: index === 0 ? "Running Strategy" : "Awaiting Signal",
      progress: index === 0 ? 72 : 22,
    }));

    if (seeded.length > 0) return seeded;

    return [
      { id: "seed-1", name: "Sentinel-01", status: "Running", subtitle: "Running Scrape...", progress: 68 },
      { id: "seed-2", name: "Nova Arb", status: "Idle", subtitle: "Idle (Awaiting Signal)", progress: 0 },
    ];
  }, [agents]);

  const earnings = useMemo(() => {
    const baseline = 12.42;
    return `${baseline.toFixed(2)} SOL`;
  }, []);

  const walletLabel = shortAddress(publicKey?.toBase58());

  function onSave() {
    toast.success("Workspace snapshot saved.");
  }

  function onRunOrchestra() {
    setIsRunning((prev) => !prev);
    toast.success(isRunning ? "Orchestra paused." : "Orchestra run started.");
  }

  return (
    <div className="-mx-4 -mt-8 min-h-screen bg-[#f5f5f6] px-4 pb-8 pt-5 text-[#171819] sm:-mx-6 sm:px-6">
      <div className="mx-auto w-full max-w-[1320px] space-y-4">
        <div className="flex items-center justify-end gap-3">
          <span className="inline-flex items-center gap-2 rounded-sm border border-black/10 bg-white px-3 py-1.5 text-[12px] font-medium text-black/70">
            <span className="h-2 w-2 rounded-full bg-[#0b7d82]" />
            Solana Mainnet
          </span>
          <button className="inline-flex h-10 cursor-pointer items-center rounded-[6px] bg-[#171819] px-5 text-[12px] font-semibold tracking-[0.04em] text-white transition-colors hover:bg-black">
            {walletLabel}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[190px_minmax(0,1fr)_220px]">
          <aside className="rounded-sm bg-[#ebebec] p-4 lg:min-h-[680px]">
            <p className="text-[10px] font-semibold tracking-[0.16em] text-[#0b7d82]">ORCHESTRA</p>
            <p className="mt-1 text-[10px] text-black/50">v1.0.4-Alpha</p>

            <div className="mt-5 space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const active = activeSidebar === item.id;
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setActiveSidebar(item.id);
                      toast.info(`${item.label} selected`);
                    }}
                    className={`flex w-full cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-left text-[12px] font-semibold tracking-[0.08em] transition-colors ${
                      active
                        ? "border-black/10 bg-white text-[#0b7d82]"
                        : "border-transparent text-black/70 hover:border-black/10 hover:bg-white/80"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-40 rounded-md border border-black/10 bg-white/70 p-3">
              <p className="text-[9px] font-semibold tracking-[0.14em] text-black/55">LIVE PERFORMANCE</p>
              <div className="mt-3 flex items-center justify-between text-[12px] text-black/75">
                <span>SOL/USDC</span>
                <span className="font-semibold text-[#0b7d82]">+4.2%</span>
              </div>
              <div className="mt-3 flex items-end gap-1.5">
                {[16, 24, 38, 22, 30].map((h, i) => (
                  <span
                    key={i}
                    className={`w-7 rounded-sm ${i === 2 ? "bg-[#171819]" : i === 3 ? "bg-[#16cfd4]" : "bg-[#87d8dc]/55"}`}
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>
          </aside>

          <main className="relative min-h-[680px] rounded-sm bg-[#efeff0] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-[36px] font-semibold tracking-[-0.02em] text-black">Active Workspace / Untitled Flow</h1>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSave}
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[6px] border border-black/10 bg-white px-4 text-[12px] font-semibold text-black/75"
                >
                  <Save className="h-4 w-4" />
                  Save
                </motion.button>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRunOrchestra}
                  className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[6px] bg-[#0b7d82] px-4 text-[12px] font-semibold text-white hover:bg-[#096a6e]"
                >
                  <Play className="h-4 w-4" />
                  {isRunning ? "Pause Orchestra" : "Run Orchestra"}
                </motion.button>
              </div>
            </div>

            <div className="pointer-events-none absolute right-12 top-28 select-none text-[112px] font-semibold leading-[0.85] tracking-[-0.04em] text-black/[0.045]">
              VESSEL
              <br />
              ORCHESTRA
            </div>

            <div className="relative mt-14 h-[500px] overflow-hidden">
              <div className="absolute left-[21%] top-[23%] h-14 w-[2px] bg-[#0b7d82]/40" />
              <div className="absolute left-[42%] top-[44%] h-[2px] w-20 bg-[#0b7d82]/30" />

              {flowCards.map((card) => (
                <motion.div
                  key={card.id}
                  whileHover={{ y: -3 }}
                  className="absolute w-[290px] rounded-lg border border-black/8 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.08)]"
                  style={{ top: card.top, left: card.left }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-sm ${card.accent ? "bg-[#16d8dd]" : "bg-[#f1f1f1]"}`}>
                        {card.id === "scanner" ? <CircleGauge className="h-3.5 w-3.5 text-[#0b7d82]" /> : <Cpu className="h-3.5 w-3.5 text-black/60" />}
                      </span>
                      <p className="text-[24px] font-semibold tracking-[-0.02em] text-black">{card.title}</p>
                    </div>
                    <span className="h-2 w-2 rounded-full bg-[#16d8dd]" />
                  </div>

                  <p className="mt-3 text-[9px] font-semibold tracking-[0.14em] text-black/45">{card.fieldLabel}</p>
                  <div className="mt-1 rounded-sm bg-[#f2f2f3] px-3 py-2 text-[12px] text-black/75">{card.value}</div>

                  {card.live && (
                    <span className="mt-2 inline-flex rounded-sm bg-[#d9efef] px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-[#0b7d82]">
                      ACTIVE
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-xl bg-[#1f2326] p-2 shadow-[0_10px_24px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-[#2c3136] px-3 py-2 text-[10px] font-semibold tracking-[0.14em] text-white/65">TOOLBOX</span>
                {[
                  { id: "flow", icon: GitBranch },
                  { id: "ops", icon: Wrench },
                  { id: "nodes", icon: Sparkles },
                ].map((tool) => {
                  const Icon = tool.icon;
                  const active = activeToolbox === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        setActiveToolbox(tool.id);
                        toast.success(`Toolbox switched to ${tool.id.toUpperCase()}`);
                      }}
                      className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md transition-colors ${
                        active ? "bg-[#0b7d82] text-white" : "bg-[#2c3136] text-white/70 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  );
                })}
                <button
                  onClick={() => toast.success("Added new orchestration node.")}
                  className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md bg-[#0b7d82] text-white hover:bg-[#086b70]"
                >
                  +
                </button>
              </div>
            </div>
          </main>

          <aside className="space-y-4">
            <div className="rounded-sm border border-black/10 bg-white p-4">
              <p className="text-[11px] font-semibold tracking-[0.12em] text-black/55">ACTIVE INSTANCES</p>
              <div className="mt-3 space-y-2">
                {activeInstances.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ y: -1 }}
                    className="w-full cursor-pointer rounded-md border border-black/10 bg-[#f8f8f9] px-3 py-2 text-left"
                    onClick={() => toast.info(`${item.name}: ${item.subtitle}`)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-[#161819] text-white">🤖</span>
                      <div>
                        <p className="text-[12px] font-semibold text-black">{item.name}</p>
                        <p className="text-[10px] text-black/55">{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-black/8">
                      <div className="h-1.5 rounded-full bg-[#0b7d82]" style={{ width: `${item.progress}%` }} />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="rounded-sm border border-black/10 bg-white p-4">
              <p className="text-[10px] font-semibold tracking-[0.12em] text-black/55">TODAY'S EARNINGS</p>
              <p className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-black">+{earnings}</p>
              <button
                onClick={() => toast.success("Detailed report opened.")}
                className="mt-3 inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-[5px] border border-black/15 bg-[#f8f8f9] text-[11px] font-semibold tracking-[0.08em] text-black/75 hover:bg-black/5"
              >
                VIEW DETAILED REPORT
              </button>
            </div>
          </aside>
        </div>

        <footer className="flex flex-wrap items-center justify-between border-t border-black/10 px-1 pt-3 text-[11px] tracking-[0.12em] text-black/55">
          <span>© 2024 VESSEL ENGINE. ALL RIGHTS RESERVED.</span>
          <div className="flex flex-wrap items-center gap-4">
            <a href="/terms" className="transition-colors hover:text-black">TERMS</a>
            <a href="/privacy" className="transition-colors hover:text-black">PRIVACY</a>
            <a href="#" className="transition-colors hover:text-black">STATUS: OPERATIONAL</a>
            <a href="#" className="transition-colors hover:text-black">TWITTER</a>
            <a href="#" className="transition-colors hover:text-black">DISCORD</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
