import { Keypair } from "@solana/web3.js";
import {
  KeypairWallet,
  SolanaAgentKit,
  createVercelAITools,
} from "solana-agent-kit";

import { solanaRpcUrl } from "@/lib/solana";
import type { ForgeTool, ToolCategory } from "@/types/agent";

function inferCategory(name: string, description: string): ToolCategory {
  const value = `${name} ${description}`.toLowerCase();

  if (value.match(/swap|trade|order|market/)) return "Trading";
  if (value.match(/stake|validator/)) return "Staking";
  if (value.match(/lend|borrow|vault|yield|liquid/)) return "DeFi";
  if (value.match(/transfer|pay|send|tip/)) return "Payments";
  if (value.match(/nft|mint|collection|metadata/)) return "NFTs";
  if (value.match(/tweet|social|post|content/)) return "Social";
  if (value.match(/price|oracle|feed/)) return "Oracles";

  return "DeFi";
}

import { fallbackTools } from "@/lib/agent-kit-fallback";

export async function getSolanaAgentKitTools(): Promise<ForgeTool[]> {
  try {
    const wallet = new KeypairWallet(Keypair.generate(), solanaRpcUrl);
    const agent = new SolanaAgentKit(wallet, solanaRpcUrl, {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    });
    
    const tools = createVercelAITools(agent, agent.actions);

    const mapped = Object.entries(tools).map(([id, value]) => {
      const descriptionParts = value.description?.split("\n") ?? [id];
      const name = descriptionParts[0] ?? id;
      const description = value.description || "Solana Agent Kit capability";
      return {
        id,
        name,
        description,
        category: inferCategory(name, description),
      } satisfies ForgeTool;
    });

    if (mapped.length > 0) {
      return mapped;
    }
  } catch (error) {
    console.warn("Failed to load Solana Agent Kit tools, using fallback:", error);
  }

  return fallbackTools;
}

export async function runAgentAction() {
  throw new Error("runAgentAction will be implemented in Phase 6");
}
