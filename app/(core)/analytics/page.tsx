"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Bot,
  Activity,
  Clock,
  Zap,
  Target,
  Wallet,
  DollarSign,
  Shield,
  BarChart3,
  ArrowUpRight,
  ListChecks,
} from 'lucide-react';

import { useAgent } from "@/hooks/useAgent";
import { useStoreHydrated } from '@/hooks/useStoreHydrated';
import { getCyberpunkAgentDataUrl } from '@/lib/agent-avatar';
import { useVesselStore } from '@/store/useVesselStore';
import type { Agent } from '@/types/agent';

type TimeRange = '24h' | '7d' | '30d' | 'all';

type AgentPerf = {
  id: string;
  name: string;
  actions: number;
  earnings: number;
  reputation: number;
  lastAction: string | null;
};

export default function AnalyticsPage() {
  const { agents } = useAgent();
  const marketplaceListings = useVesselStore((state) => state.marketplaceListings);
  const hasHydrated = useStoreHydrated();
  const router = useRouter();

  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  const agentPerformance: AgentPerf[] = useMemo(() => {
    return agents.map((agent: Agent) => ({
      id: agent.id,
      name: agent.name,
      actions: agent.totalActions ?? 0,
      earnings: agent.earnings ?? 0,
      reputation: agent.reputation ?? 80,
      lastAction: agent.lastActionAt ?? null,
    }));
  }, [agents]);

  const totalStats = useMemo(() => {
    return agentPerformance.reduce(
      (acc, agent) => ({
        totalActions: acc.totalActions + agent.actions,
        totalEarnings: acc.totalEarnings + agent.earnings,
        avgReputation: acc.avgReputation + agent.reputation,
      }),
      { totalActions: 0, totalEarnings: 0, avgReputation: 0 }
    );
  }, [agentPerformance]);

  const avgReputation = agents.length > 0 ? totalStats.avgReputation / agents.length : 0;

  const topPerformers = useMemo(() => {
    return [...agentPerformance].sort((a, b) => b.actions - a.actions).slice(0, 5);
  }, [agentPerformance]);

  const sortedByEarnings = useMemo(() => {
    return [...agentPerformance].sort((a, b) => b.earnings - a.earnings).slice(0, 5);
  }, [agentPerformance]);

  if (!hasHydrated) {
    return (
      <div className="-mx-4 -mt-8 min-h-screen overflow-x-clip bg-[var(--bg-base)] px-4 pb-10 pt-4 text-[var(--text-primary)] sm:-mx-6 sm:px-6">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="mb-8">
            <div className="h-10 w-48 animate-pulse rounded bg-black/10" />
            <div className="mt-2 h-5 w-72 animate-pulse rounded bg-black/5" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl border border-black/10 bg-white" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Actions',
      value: totalStats.totalActions.toLocaleString(),
      change: '+12%',
      trend: 'up' as const,
      icon: <Activity className="h-4 w-4" />,
      color: 'blue',
    },
    {
      label: 'Total Earnings',
      value: totalStats.totalEarnings.toFixed(3) + ' USDC',
      change: '+8.2%',
      trend: 'up' as const,
      icon: <DollarSign className="h-4 w-4" />,
      color: 'amber',
    },
    {
      label: 'Avg Reputation',
      value: avgReputation.toFixed(1) + '%',
      change: '+2.1%',
      trend: 'up' as const,
      icon: <Shield className="h-4 w-4" />,
      color: 'violet',
    },
    {
      label: 'Active Agents',
      value: agents.length,
      change: agents.length > 0 ? '100%' : '0%',
      trend: agents.length > 0 ? ('up' as const) : ('neutral' as const),
      icon: <Bot className="h-4 w-4" />,
      color: 'emerald',
    },
  ];

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-black sm:text-[28px]">Analytics</h1>
              <p className="mt-1 text-sm text-black/40">Track your agents performance and earnings</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-black/10 bg-white p-1">
                {(['24h', '7d', '30d', 'all'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={"rounded-md px-3 py-1.5 text-xs font-medium transition " + (timeRange === range ? 'bg-black text-white' : 'text-black/50 hover:text-black')}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statCards.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-black/6 bg-white p-4"
              >
                <div className={"mb-3 inline-flex rounded-lg p-2 " + (stat.color === 'blue' ? 'bg-blue-50 text-blue-600' : stat.color === 'amber' ? 'bg-amber-50 text-amber-600' : stat.color === 'violet' ? 'bg-violet-50 text-violet-600' : 'bg-emerald-50 text-emerald-600')}>
                  {stat.icon}
                </div>
                <div className="flex items-baseline gap-1.5">
                  <p className="text-lg font-bold text-black sm:text-xl">{stat.value}</p>
                  <span className={"flex items-center gap-0.5 text-[10px] font-medium " + (stat.trend === 'up' ? 'text-emerald-600' : 'text-black/40')}>
                    {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : null}
                    {stat.change}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-black/40">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-black/6 bg-white">
                <div className="border-b border-black/6 px-4 py-3 sm:px-6">
                  <h2 className="text-base font-semibold text-black">Top Performers</h2>
                  <p className="text-xs text-black/40">Agents with most actions</p>
                </div>
                <div className="divide-y divide-black/6">
                  {topPerformers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/[0.04]">
                        <BarChart3 className="h-5 w-5 text-black/30" />
                      </div>
                      <p className="text-sm text-black/50">No agent activity yet</p>
                    </div>
                  ) : (
                    topPerformers.map((agent, idx) => (
                      <motion.button
                        key={agent.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => router.push('/agents/' + agent.id)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.02] sm:px-6 sm:py-4"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/[0.04] text-sm font-bold text-black/40">
                          {idx + 1}
                        </div>
                        <img
                          src={getCyberpunkAgentDataUrl(agent.id)}
                          alt={agent.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-black">{agent.name}</p>
                          <p className="text-xs text-black/40">{agent.actions} actions</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-black">{agent.reputation.toFixed(0)}%</p>
                          <p className="text-[10px] text-black/40">success</p>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-black/6 bg-white">
                <div className="border-b border-black/6 px-4 py-3 sm:px-6">
                  <h2 className="text-base font-semibold text-black">Earnings Leaders</h2>
                  <p className="text-xs text-black/40">Agents ranked by earnings</p>
                </div>
                <div className="divide-y divide-black/6">
                  {sortedByEarnings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/[0.04]">
                        <DollarSign className="h-5 w-5 text-black/30" />
                      </div>
                      <p className="text-sm text-black/50">No earnings yet</p>
                    </div>
                  ) : (
                    sortedByEarnings.map((agent, idx) => (
                      <motion.button
                        key={agent.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => router.push('/agents/' + agent.id)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-black/[0.02] sm:px-6 sm:py-4"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-sm font-bold text-amber-600">
                          <span>$</span>{idx + 1}
                        </div>
                        <img
                          src={getCyberpunkAgentDataUrl(agent.id)}
                          alt={agent.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-black">{agent.name}</p>
                          <p className="text-xs text-black/40">{agent.actions} actions</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-amber-600">{agent.earnings.toFixed(3)} USDC</p>
                          <p className="text-[10px] text-black/40">earned</p>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-black/6 bg-white p-5">
                <h3 className="text-sm font-semibold text-black">Performance Overview</h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-black/50">Total Actions</span>
                      <span className="font-medium text-black">{totalStats.totalActions}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/[0.06]">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-black/50">Avg Reputation</span>
                      <span className="font-medium text-black">{avgReputation.toFixed(1)}%</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/[0.06]">
                      <div className="h-full rounded-full bg-violet-500" style={{ width: avgReputation + '%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-black/50">Marketplace Listings</span>
                      <span className="font-medium text-black">{marketplaceListings.length}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/[0.06]">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-black/6 bg-white p-5">
                <h3 className="text-sm font-semibold text-black">Recent Activity</h3>
                <div className="mt-4 space-y-3">
                  {agentPerformance.slice(0, 5).map((agent) => (
                    <div key={agent.id} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/[0.04]">
                        <Clock className="h-4 w-4 text-black/30" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-black">{agent.name}</p>
                        <p className="text-[10px] text-black/40">
                          {agent.lastAction ? new Date(agent.lastAction).toLocaleDateString() : 'No activity'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-black">{agent.actions}</p>
                        <p className="text-[10px] text-black/40">actions</p>
                      </div>
                    </div>
                  ))}
                  {agentPerformance.length === 0 && (
                    <p className="py-4 text-center text-xs text-black/40">No recent activity</p>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-black/6 bg-white p-5">
                <h3 className="text-sm font-semibold text-black">Quick Stats</h3>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-black/[0.02] p-3">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <p className="mt-2 text-lg font-bold text-black">{agents.length}</p>
                    <p className="text-[10px] text-black/40">Total Agents</p>
                  </div>
                  <div className="rounded-lg bg-black/[0.02] p-3">
                    <Target className="h-4 w-4 text-emerald-500" />
                    <p className="mt-2 text-lg font-bold text-black">{avgReputation.toFixed(0)}%</p>
                    <p className="text-[10px] text-black/40">Avg Score</p>
                  </div>
                  <div className="rounded-lg bg-black/[0.02] p-3">
                    <ListChecks className="h-4 w-4 text-blue-500" />
                    <p className="mt-2 text-lg font-bold text-black">{totalStats.totalActions}</p>
                    <p className="text-[10px] text-black/40">Actions</p>
                  </div>
                  <div className="rounded-lg bg-black/[0.02] p-3">
                    <Wallet className="h-4 w-4 text-violet-500" />
                    <p className="mt-2 text-lg font-bold text-black">{totalStats.totalEarnings.toFixed(2)}</p>
                    <p className="text-[10px] text-black/40">USDC Earned</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-black/6 pt-4 text-xs text-black/30 sm:flex-row">
            <span>© 2026 Vessel Engine. All rights reserved.</span>
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/terms')} className="transition-colors hover:text-black">Terms</button>
              <button onClick={() => router.push('/privacy')} className="transition-colors hover:text-black">Privacy</button>
            </div>
        </div>
      </div>
    </div>
  );
}
