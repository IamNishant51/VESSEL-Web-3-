"use client";

import { useState } from "react";
import { useAgentTools } from "@/hooks/useAgentTools";
import { Send, Loader } from "lucide-react";

interface AgentToolsComponentProps {
  agentId: string;
}

export function AgentToolsDemo({ agentId }: AgentToolsComponentProps) {
  const { executeTool, loading, error } = useAgentTools();
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"portfolio" | "transfer" | "swap" | "stake">(
    "portfolio"
  );

  const handlePortfolioQuery = async () => {
    const res = await executeTool({
      agentId,
      tool: "portfolio",
      params: {},
    });
    setResult(res);
  };

  const handleTransfer = async () => {
    const res = await executeTool({
      agentId,
      tool: "transfer",
      params: {
        to: "11111111111111111111111111111112", // Example address
        amount: 0.1,
        isSPL: false,
      },
    });
    setResult(res);
  };

  const handleSwap = async () => {
    const res = await executeTool({
      agentId,
      tool: "swap",
      params: {
        inputMint: "So11111111111111111111111111111111111111112", // Wrapped SOL
        outputMint: "EPjFWaLb3odcccccccccccccccccccccccccccccccc", // USDC
        amount: 1,
        slippage: 100,
      },
    });
    setResult(res);
  };

  const handleStake = async () => {
    const res = await executeTool({
      agentId,
      tool: "stake",
      params: {
        validator: "7xLk17EQQ7UunrPZLMJRRBvkie6TsWYqSFA7gAEKJJvJ", // Example validator
        amount: 10,
      },
    });
    setResult(res);
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-card rounded-lg border border-border">
      <h2 className="text-2xl font-bold mb-6 text-foreground">Agent Tools</h2>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded text-destructive">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {(["portfolio", "transfer", "swap", "stake"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tool Panels */}
      <div className="space-y-4 mb-6">
        {activeTab === "portfolio" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Query your wallet balance and token holdings
            </p>
            <button
              onClick={handlePortfolioQuery}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Query Portfolio
            </button>
          </div>
        )}

        {activeTab === "transfer" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Transfer SOL to another wallet (Pro tier+)
            </p>
            <button
              onClick={handleTransfer}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Execute Transfer
            </button>
          </div>
        )}

        {activeTab === "swap" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Swap tokens via Jupiter aggregator (Enterprise tier)
            </p>
            <button
              onClick={handleSwap}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Simulate Swap
            </button>
          </div>
        )}

        {activeTab === "stake" && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              Stake SOL with validators (Enterprise tier)
            </p>
            <button
              onClick={handleStake}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Simulate Staking
            </button>
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && (
        <div className="p-4 bg-muted rounded-lg border border-border">
          <h3 className="font-semibold text-foreground mb-2">Result</h3>
          <pre className="text-sm text-muted-foreground overflow-auto max-h-48">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/30 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground mb-2">Tier Availability:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            <strong>Free:</strong> Portfolio queries only
          </li>
          <li>
            <strong>Pro:</strong> + Token transfers
          </li>
          <li>
            <strong>Enterprise:</strong> + Swaps, Staking
          </li>
        </ul>
      </div>
    </div>
  );
}
