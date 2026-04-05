"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Coins,
  GitBranch,
  Plus,
  TrendingUp,
  Wallet,
  Zap,
  ArrowUpRight,
  ArrowRight,
  Clock,
  Activity,
  Shield,
  DollarSign,
  BarChart3,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

import { WalletConnectButton } from "@/components/wallet/connect-button";
import { useAgent } from "@/hooks/useAgent";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { getAgentArtworkUrl } from "@/lib/agent-visuals";
import { shortAddress } from "@/lib/utils";
import { useVesselStore } from "@/store/useVesselStore";
import type { Agent } from "@/types/agent";

export default function DashboardPage() {
  const { publicKey } = useWallet();
  const { agents, activeAgents } = useAgent();
  const marketplaceListings = useVesselStore((state) => state.marketplaceListings);
  const hasHydrated = useStoreHydrated();
  const router = useRouter();

  if (!hasHydrated) {
    return (
      <div className="-mx-4 -mt-8 min-h-screen bg-[#f5f5f6] px-4 pb-10 pt-4 text-[#171819] sm:-mx-6 sm:px-6">
        <div className="mx-auto w-full max-w-[1320px]">
          <div className="mb-8">
            <div className="h-14 w-64 animate-pulse rounded bg-black/10" />
            <div className="mt-2 h-5 w-96 animate-pulse rounded bg-black/5" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-[6px] border border-black/10 bg-white" />
            ))}
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-[6px] border border-black/10 bg-white" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const ownerAddress = publicKey?.toBase58();

  const myListings = useMemo(() => {
    if (!ownerAddress) return [];
    return marketplaceListings.filter((l) => l.seller === ownerAddress);
  }, [marketplaceListings, ownerAddress]);

  const myListingsCount = myListings.length;

  const myRentalsCount = useMemo(() => {
    if (!ownerAddress) return 0;
    return agents.filter((a: Agent) => a.isRental && a.owner === ownerAddress).length;
  }, [agents, ownerAddress]);

  const totalEarnings = useMemo(() => {
    return agents.reduce((sum: number, a: Agent) => sum + (a.earnings ?? 0), 0);
  }, [agents]);

  const totalActions = useMemo(() => {
    return agents.reduce((sum: number, a: Agent) => sum + (a.totalActions ?? 0), 0);
  }, [agents]);

  const avgReputation = useMemo(() => {
    if (agents.length === 0) return 0;
    return agents.reduce((sum: number, a: Agent) => sum + (a.reputation ?? 80), 0) / agents.length;
  }, [agents]);

  const totalTreasury = useMemo(() => {
    return agents.reduce((sum: number, a: Agent) => sum + (a.treasuryBalance ?? 0), 0);
  }, [agents]);

  const recentAgents = useMemo(() => {
    return agents.slice(0, 6).map((agent: Agent) => ({
      ...agent,
      artworkUrl: getAgentArtworkUrl(agent, 256),
    }));
  }, [agents]);

  const walletLabel = shortAddress(publicKey?.toBase58());

  const statCards = [
    {
      label: "Total Agents",
      value: agents.length,
      icon: <Bot className="h-4 w-4" />,
      color: "text-black",
      bg: "bg-black/[0.04]",
    },
    {
      label: "Active",
      value: activeAgents.length,
      icon: <Zap className="h-4 w-4" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Actions",
      value: totalActions.toLocaleString(),
      icon: <Activity className="h-4 w-4" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Avg Reputation",
      value: `${avgReputation.toFixed(1)}%`,
      icon: <Shield className="h-4 w-4" />,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "Total Earnings",
      value: `${totalEarnings.toFixed(3)} USDC`,
      icon: <DollarSign className="h-4 w-4" />,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Treasury",
      value: `${totalTreasury.toFixed(2)} USDC`,
      icon: <Coins className="h-4 w-4" />,
      color: "text-black",
      bg: "bg-black/[0.04]",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black sm:text-[28px]">Dashboard</h1>
            <p className="mt-1 text-sm text-black/40">
              {publicKey ? `Connected as ${walletLabel}` : "Connect your wallet to get started"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {publicKey ? (
              <button
                onClick={() => router.push("/forge")}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-black px-4 text-sm font-semibold text-white transition hover:bg-black/80"
              >
                <Plus className="h-4 w-4" />
                Forge Agent
              </button>
            ) : (
              <WalletConnectButton />
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-black/6 bg-white p-4"
            >
              <div className={`mb-2 inline-flex rounded-lg ${stat.bg} p-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-lg font-bold text-black sm:text-xl">{stat.value}</p>
              <p className="text-[11px] text-black/40">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Agents List */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-black/6 bg-white">
              <div className="flex items-center justify-between border-b border-black/6 px-4 py-3 sm:px-6">
                <div>
                  <h2 className="text-base font-semibold text-black">Your Agents</h2>
                  <p className="text-xs text-black/40">{agents.length} agent{agents.length !== 1 ? "s" : ""} created</p>
                </div>
                <button
                  onClick={() => router.push("/agents")}
                  className="inline-flex items-center gap-1 text-xs font-medium text-black/50 transition hover:text-black"
                >
                  View all
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {recentAgents.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-black/[0.04]">
                    <Bot className="h-6 w-6 text-black/30" />
                  </div>
                  <h3 className="text-sm font-semibold text-black/70">No agents yet</h3>
                  <p className="mt-1 max-w-[280px] text-xs text-black/40">
                    Forge your first autonomous Solana agent to start managing your portfolio.
                  </p>
                  <button
                    onClick={() => router.push("/forge")}
                    className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-black px-4 text-xs font-medium text-white transition hover:bg-black/80"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Forge Agent
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-black/6">
                  {recentAgents.map((agent: Agent & { artworkUrl: string }, i) => (
                    <motion.button
                      key={agent.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => router.push(`/agents/${agent.id}`)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.02] sm:px-6 sm:py-4"
                    >
                      <Image
                        src={agent.artworkUrl}
                        alt={`${agent.name} artwork`}
                        width={48}
                        height={48}
                        className="h-12 w-12 shrink-0 rounded-xl object-cover"
                        loading="lazy"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-black">{agent.name}</p>
                          {agent.listed && (
                            <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                              Listed
                            </span>
                          )}
                          {agent.isRental && (
                            <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                              Rental
                            </span>
                          )}
                        </div>
                        <p className="truncate text-xs text-black/40">{agent.tagline || agent.personality?.slice(0, 60) || "Autonomous agent"}</p>
                      </div>
                      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
                        <span className="text-xs font-medium text-black/60">{(agent.reputation ?? 80).toFixed(0)}%</span>
                        <span className="text-[10px] text-black/30">{(agent.totalActions ?? 0).toLocaleString()} actions</span>
                      </div>
                      <ArrowRight className="hidden h-4 w-4 shrink-0 text-black/20 sm:block" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-xl border border-black/6 bg-white p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-black">Quick Actions</h3>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  onClick={() => router.push("/forge")}
                  className="flex flex-col items-center gap-2 rounded-lg border border-black/8 bg-white p-3 text-center transition hover:border-black/15 hover:bg-black/[0.02]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/[0.04]">
                    <Sparkles className="h-4 w-4 text-black/60" />
                  </div>
                  <span className="text-[11px] font-medium text-black/60">Forge Agent</span>
                </button>
                <button
                  onClick={() => router.push("/marketplace")}
                  className="flex flex-col items-center gap-2 rounded-lg border border-black/8 bg-white p-3 text-center transition hover:border-black/15 hover:bg-black/[0.02]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/[0.04]">
                    <Layers className="h-4 w-4 text-black/60" />
                  </div>
                  <span className="text-[11px] font-medium text-black/60">Marketplace</span>
                </button>
                <button
                  onClick={() => router.push("/agents")}
                  className="flex flex-col items-center gap-2 rounded-lg border border-black/8 bg-white p-3 text-center transition hover:border-black/15 hover:bg-black/[0.02]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/[0.04]">
                    <Bot className="h-4 w-4 text-black/60" />
                  </div>
                  <span className="text-[11px] font-medium text-black/60">My Agents</span>
                </button>
                <button
                  onClick={() => router.push("/")}
                  className="flex flex-col items-center gap-2 rounded-lg border border-black/8 bg-white p-3 text-center transition hover:border-black/15 hover:bg-black/[0.02]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/[0.04]">
                    <BarChart3 className="h-4 w-4 text-black/60" />
                  </div>
                  <span className="text-[11px] font-medium text-black/60">Home</span>
                </button>
              </div>
            </div>

            {/* Marketplace Summary */}
            <div className="rounded-xl border border-black/6 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-black">Marketplace</h3>
                <button
                  onClick={() => router.push("/marketplace")}
                  className="inline-flex items-center gap-1 text-xs text-black/40 transition hover:text-black"
                >
                  View
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/40">My Listings</span>
                  <span className="font-semibold text-black">{myListingsCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/40">My Rentals</span>
                  <span className="font-semibold text-black">{myRentalsCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-black/40">Total Listings</span>
                  <span className="font-semibold text-black">{marketplaceListings.length}</span>
                </div>
              </div>
              {myListings.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {myListings.slice(0, 3).map((listing) => (
                    <button
                      key={listing.id}
                      onClick={() => router.push(`/marketplace/${listing.id}`)}
                      className="flex w-full items-center justify-between rounded-lg bg-black/[0.02] px-3 py-2 text-left transition hover:bg-black/[0.04]"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-black/70">{listing.name}</p>
                        <p className="text-[10px] text-black/35">{listing.price} {listing.priceCurrency}</p>
                      </div>
                      <ArrowUpRight className="h-3 w-3 shrink-0 text-black/20" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Earnings Summary */}
            <div className="rounded-xl border border-black/6 bg-white p-4 sm:p-5">
              <h3 className="text-sm font-semibold text-black">Earnings</h3>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-black">{totalEarnings.toFixed(3)}</span>
                <span className="text-sm text-black/40">USDC</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>{totalActions} total actions across all agents</span>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-black/40">
                <Clock className="h-3.5 w-3.5" />
                <span>Avg reputation: {avgReputation.toFixed(1)} / 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-black/6 pt-4 text-xs text-black/30 sm:flex-row">
          <span>© 2026 Vessel Engine. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/terms")} className="transition-colors hover:text-black">Terms</button>
            <button onClick={() => router.push("/privacy")} className="transition-colors hover:text-black">Privacy</button>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Operational
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
