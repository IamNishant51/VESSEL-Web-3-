"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, TrendingDown, Grip, DollarSign, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { type Agent } from "@/types/agent";
import { ArtworkImage } from "@/components/landing/artwork-image";
import { getAgentArtworkUrl } from "@/lib/agent-visuals";

interface LeaderboardProps {
  agents: Agent[];
}

export function AgentLeaderboard({ agents }: LeaderboardProps) {
  const router = useRouter();
  
  const sortedAgents = useMemo(() => {
    // Sort by a combination of reputation and total actions
    return [...agents].sort((a, b) => {
      const scoreA = (a.reputation ?? 80) * 10 + (a.totalActions ?? 0);
      const scoreB = (b.reputation ?? 80) * 10 + (b.totalActions ?? 0);
      return scoreB - scoreA;
    }).slice(0, 5); // Show top 5
  }, [agents]);

  if (!agents || agents.length === 0) {
    return (
      <div className="rounded-xl border border-white/5 bg-black/40 p-6 flex items-center justify-center min-h-[300px]">
        <p className="text-zinc-500 text-sm">No agents available for leaderboard.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#050505] overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-emerald-400" />
          <h3 className="font-semibold text-sm text-white">Global Top Performers</h3>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">Live Rankings</span>
      </div>
      
      <div className="flex-1 flex flex-col">
        {sortedAgents.map((agent, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;
          
          return (
            <motion.div 
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => router.push(`/agents/${agent.id}`)}
              className="group border-b border-white/5 last:border-0 p-3 hover:bg-white/[0.03] transition-colors cursor-pointer flex items-center gap-3 relative overflow-hidden"
            >
              {rank === 1 && (
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
              )}
              
              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 font-bold text-[11px] ${
                rank === 1 ? "bg-yellow-500/20 text-yellow-500" :
                rank === 2 ? "bg-zinc-300/20 text-zinc-300" :
                rank === 3 ? "bg-amber-700/20 text-amber-500" :
                "bg-white/5 text-zinc-500"
              }`}>
                #{rank}
              </div>
              
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 relative">
                <ArtworkImage 
                  artworkUrl={getAgentArtworkUrl(agent, 200)} 
                  alt={agent.name} 
                />
              </div>
              
              <div className="flex-1 min-w-0 flex justify-between items-center">
                <div className="pr-2">
                  <p className="text-[13px] font-semibold text-zinc-200 truncate group-hover:text-emerald-400 transition-colors">
                    {agent.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                      <Grip className="w-2.5 h-2.5" /> {agent.allowedActions?.[0] || 'General'}
                    </span>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <div className="text-[12px] font-medium text-white flex items-center justify-end gap-1">
                    {agent.reputation?.toFixed(1) || "80.0"} <span className="text-emerald-500 text-[10px]">REP</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    {agent.totalActions?.toLocaleString() || 0} actions
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
