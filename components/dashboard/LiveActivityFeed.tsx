"use client";

import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowRightLeft, Cpu, Coins, ShieldCheck, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

interface ActivityEvent {
  id: string;
  agentName: string;
  type: "trade" | "orchestration" | "security" | "minting";
  description: string;
  amount?: string;
  time: Date;
  signature?: string;
  explorerUrl?: string;
}

interface NetworkStats {
  solPrice: number;
  solChange24h: number;
  tps: number;
  slot: number;
}

const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

export const LiveActivityFeed = memo(function LiveActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);

  useEffect(() => {
    async function fetchRealNetworkData() {
      try {
        const connection = new Connection(SOLANA_RPC, "confirmed");
        
        // Fetch SOL price from CoinGecko
        let solPrice = 0;
        let solChange24h = 0;
        try {
          const priceResponse = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true",
            { cache: "no-store" }
          );
          if (priceResponse.ok) {
            const priceData = await priceResponse.json();
            solPrice = priceData.solana?.usd || 0;
            solChange24h = priceData.solana?.usd_24h_change || 0;
          }
        } catch (e) {
          console.warn("[LiveActivity] Failed to fetch SOL price:", e);
        }

        // Fetch current slot for TPS estimation
        let slot = 0;
        let tps = 0;
        try {
          slot = await connection.getSlot();
          const performance = await connection.getRecentPerformanceSamples(1);
          if (performance.length > 0) {
            tps = Math.round(performance[0].numTransactions / performance[0].samplePeriodSecs);
          }
        } catch (e) {
          console.warn("[LiveActivity] Failed to fetch slot/TPS:", e);
        }

        setNetworkStats({
          solPrice,
          solChange24h,
          tps,
          slot,
        });

        // Fetch recent transactions from our DB
        try {
          const txResponse = await fetch("/api/db", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "fetch-transactions",
              limit: 10,
            }),
          });

          if (txResponse.ok) {
            const txData = await txResponse.json();
            const transactions = txData.transactions || txData.docs || [];
            
            if (transactions.length > 0) {
              setIsRealData(true);
              const mappedEvents: ActivityEvent[] = transactions.map((tx: any, index: number) => {
                const type = mapTxTypeToEventType(tx.type);
                return {
                  id: `${tx.transactionSignature || tx._id}-${index}`,
                  agentName: tx.agentId ? formatAgentName(tx.agentId) : "Vessel Agent",
                  type,
                  description: getEventDescription(tx),
                  amount: tx.amount ? `${tx.amount.toFixed(4)} ${tx.currency || "SOL"}` : undefined,
                  time: tx.createdAt ? new Date(tx.createdAt) : new Date(),
                  signature: tx.transactionSignature,
                  explorerUrl: tx.explorerUrl || (tx.transactionSignature 
                    ? `https://explorer.solana.com/tx/${tx.transactionSignature}?cluster=devnet` 
                    : undefined),
                };
              });
              
              setEvents(mappedEvents.sort((a, b) => b.time.getTime() - a.time.getTime()));
            }
          }
        } catch (e) {
          console.warn("[LiveActivity] Failed to fetch transactions:", e);
        }

        // If no real transactions, generate sample activity based on real network data
        if (events.length === 0) {
          setEvents(generateNetworkActivity(solPrice, slot));
        }
      } catch (error) {
        console.error("[LiveActivity] Failed to fetch network data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    function generateNetworkActivity(solPrice: number, slot: number): ActivityEvent[] {
      const sampleActivities: ActivityEvent[] = [
        {
          id: "network-1",
          agentName: "Vessel Network",
          type: "security",
          description: `SOL price: $${solPrice.toFixed(2)} | Slot: ${slot.toLocaleString()}`,
          time: new Date(),
        },
        {
          id: "network-2",
          agentName: "Vessel Orchestra",
          type: "orchestration",
          description: "Ready to process agent requests",
          time: new Date(Date.now() - 5000),
        },
        {
          id: "network-3",
          agentName: "Policy Engine",
          type: "security",
          description: "All safety checks active",
          time: new Date(Date.now() - 15000),
        },
        {
          id: "network-4",
          agentName: "NFT Minting Service",
          type: "minting",
          description: "cNFT compression ready",
          time: new Date(Date.now() - 30000),
        },
      ];
      return sampleActivities;
    }

    fetchRealNetworkData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchRealNetworkData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Also add mock events periodically if we have real data
  useEffect(() => {
    if (!isRealData && events.length > 0) {
      const interval = setInterval(() => {
        setEvents(prev => {
          const newEvent = generateFallbackEvent();
          return [newEvent, ...prev].slice(0, 10);
        });
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [isRealData]);

  function generateFallbackEvent(): ActivityEvent {
    const types: ActivityEvent["type"][] = ["trade", "orchestration", "security", "minting"];
    const type = types[Math.floor(Math.random() * types.length)];
    const agentNames = ["Vessel Agent", "Orchestra", "Policy Engine", "Mint Service"];
    const agentName = agentNames[Math.floor(Math.random() * agentNames.length)];
    
    let description = "";
    let amount: string | undefined;

    switch (type) {
      case "trade":
        amount = `${(Math.random() * 0.5 + 0.01).toFixed(3)} SOL`;
        description = "Swap executed on Jupiter DEX";
        break;
      case "orchestration":
        description = "Agent delegation active";
        break;
      case "security":
        description = "Signature validated";
        break;
      case "minting":
        description = "cNFT minted via Bubblegum";
        amount = "0.0021 SOL";
        break;
    }

    return {
      id: `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      agentName,
      type,
      description,
      amount,
      time: new Date(),
    };
  }

  function mapTxTypeToEventType(txType: string): ActivityEvent["type"] {
    switch (txType) {
      case "mint":
      case "buy":
      case "rent":
        return "minting";
      case "swap":
      case "tool_call":
        return "trade";
      default:
        return "orchestration";
    }
  }

  function formatAgentName(agentId: string): string {
    if (agentId.length <= 10) return agentId;
    return `${agentId.slice(0, 4)}...${agentId.slice(-4)}`;
  }

  function getEventDescription(tx: any): string {
    switch (tx.type) {
      case "mint":
        return "Agent minted as cNFT";
      case "buy":
        return `Purchased agent for ${tx.amount || 0} ${tx.currency || "SOL"}`;
      case "rent":
        return "Agent rental initiated";
      case "tool_call":
        return `Executed ${tx.metadata?.toolName || "tool"} operation`;
      case "swap":
        return "Token swap via Jupiter";
      default:
        return tx.type ? `${tx.type} transaction` : "Vessel activity";
    }
  }

  const getIcon = (type: ActivityEvent["type"]) => {
    switch (type) {
      case "trade": return <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500" />;
      case "orchestration": return <Cpu className="w-3.5 h-3.5 text-purple-500" />;
      case "security": return <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />;
      case "minting": return <Coins className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  return (
    <div className="rounded-xl border border-black/10 bg-white overflow-hidden flex flex-col h-full max-h-[300px] sm:max-h-[400px]">
      <div className="p-4 border-b border-black/8 flex items-center justify-between bg-black/[0.02]">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-rose-500" />
          <h3 className="font-semibold text-sm text-black">Live Network Activity</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin text-black/30" />
          ) : (
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          )}
          <span className="text-[10px] uppercase tracking-widest text-black/40">
            {isRealData ? "Live" : "Demo"}
          </span>
        </div>
      </div>

      {/* Network Stats Bar */}
      {networkStats && (
        <div className="px-4 py-2 border-b border-black/5 bg-black/[0.02] flex items-center gap-4 text-[10px]">
          {networkStats.solPrice > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-black/50">SOL:</span>
              <span className="font-semibold text-black">${networkStats.solPrice.toFixed(2)}</span>
              <span className={networkStats.solChange24h >= 0 ? "text-emerald-600" : "text-red-600"}>
                {networkStats.solChange24h >= 0 ? <TrendingUp className="h-3 w-3 inline" /> : <TrendingDown className="h-3 w-3 inline" />}
                {Math.abs(networkStats.solChange24h).toFixed(1)}%
              </span>
            </div>
          )}
          {networkStats.tps > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-black/50">TPS:</span>
              <span className="font-semibold text-black">{networkStats.tps}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="text-black/50">Slot:</span>
            <span className="font-semibold text-black">{networkStats.slot.toLocaleString()}</span>
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-2">
        {events.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Activity className="h-8 w-8 text-black/20 mb-2" />
            <p className="text-[12px] text-black/40">No activity yet</p>
            <p className="text-[10px] text-black/30 mt-1">Start using agents to see live activity</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-3 mb-2 rounded-lg bg-black/[0.02] border border-black/5 hover:bg-black/[0.04] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="shrink-0 mt-0.5 w-7 h-7 rounded-full bg-black/5 border border-black/10 flex items-center justify-center">
                    {getIcon(event.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-medium text-black/70 truncate">
                        <span className="text-black font-semibold">{event.agentName}</span>
                      </p>
                      <span className="text-[10px] text-black/30 shrink-0">
                        {event.time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-black/50 mt-0.5 truncate">
                      {event.description}
                    </p>
                    {event.amount && (
                      <div className="mt-1.5 inline-flex items-center rounded-sm bg-emerald-50 px-1.5 py-1 text-[10px] font-medium text-emerald-600">
                        {event.amount}
                      </div>
                    )}
                    {event.explorerUrl && (
                      <a
                        href={event.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1.5 ml-1 inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
});

function ExternalLink({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}
