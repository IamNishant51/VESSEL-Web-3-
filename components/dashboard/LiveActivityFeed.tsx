"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowRightLeft, Cpu, Coins, ShieldCheck } from "lucide-react";

interface ActivityEvent {
  id: string;
  agentName: string;
  type: "trade" | "orchestration" | "security" | "minting";
  description: string;
  amount?: string;
  time: Date;
}

const generateMockEvent = (): ActivityEvent => {
  const types: ActivityEvent["type"][] = ["trade", "orchestration", "security", "minting"];
  const type = types[Math.floor(Math.random() * types.length)];
  const names = ["Aegis-7", "Nexus Tracker", "Specter Prime", "Warden Core", "Cipher Zero", "Oracle Alpha"];
  const agentName = names[Math.floor(Math.random() * names.length)];
  
  let description = "";
  let amount = undefined;

  switch (type) {
    case "trade":
      const tokens = ["SOL", "USDC", "BONK", "JUP"];
      const token = tokens[Math.floor(Math.random() * tokens.length)];
      amount = `${(Math.random() * 50 + 0.1).toFixed(2)} ${token}`;
      description = `Executed cross-chain swap`;
      break;
    case "orchestration":
      description = `Delegated task to ${names[Math.floor(Math.random() * names.length)]}`;
      amount = "0.001 USDC (x402)";
      break;
    case "security":
      description = `Validated signature and passed policy check`;
      break;
    case "minting":
      description = `Minted as cNFT to new wallet`;
      amount = "+0.2 SOL";
      break;
  }

  return {
    id: Math.random().toString(36).substring(2, 9),
    agentName,
    type,
    description,
    amount,
    time: new Date(),
  };
};

export function LiveActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    // Initial populate
    setEvents(Array.from({ length: 5 }, () => generateMockEvent()).sort((a, b) => b.time.getTime() - a.time.getTime()));

    // Simulate live feed
    const interval = setInterval(() => {
      setEvents(prev => {
        const newEvent = generateMockEvent();
        return [newEvent, ...prev].slice(0, 10);
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "trade": return <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />;
      case "orchestration": return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
      case "security": return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case "minting": return <Coins className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-[#050505] overflow-hidden flex flex-col h-full max-h-[400px]">
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-rose-500" />
          <h3 className="font-semibold text-sm text-white">Live Network Activity</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[9px] uppercase tracking-widest text-zinc-500">Syncing</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence initial={false}>
          {events.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-3 mb-2 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                  {getIcon(event.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-medium text-zinc-300 truncate">
                      <span className="text-white font-semibold">{event.agentName}</span>
                    </p>
                    <span className="text-[9px] text-zinc-600 shrink-0">
                      {event.time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                    {event.description}
                  </p>
                  {event.amount && (
                    <div className="mt-1.5 inline-flex items-center rounded-sm bg-white/5 px-1.5 py-0.5 text-[9px] font-medium text-emerald-400">
                      {event.amount}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
