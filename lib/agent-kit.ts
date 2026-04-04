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

const fallbackTools: ForgeTool[] = [
  {
    id: "swap-sol-usdc",
    name: "Swap Executor",
    description: "Execute token swaps across Solana liquidity venues.",
    category: "Trading",
  },
  {
    id: "stake-sol",
    name: "Staking Manager",
    description: "Stake and rebalance SOL positions with validator strategies.",
    category: "Staking",
  },
  {
    id: "transfer-funds",
    name: "Treasury Transfer",
    description: "Transfer SOL and SPL assets with policy controls.",
    category: "Payments",
  },
  {
    id: "mint-cnft",
    name: "NFT Mint Operator",
    description: "Mint and manage collection assets and compressed NFTs.",
    category: "NFTs",
  },
  {
    id: "lend-borrow",
    name: "Lend/Borrow Optimizer",
    description: "Manage lending loops and collateral health thresholds.",
    category: "DeFi",
  },
  {
    id: "oracle-watch",
    name: "Oracle Watcher",
    description: "Monitor oracle updates and trigger risk actions.",
    category: "Oracles",
  },
  {
    id: "social-announce",
    name: "Social Broadcaster",
    description: "Publish strategy updates and execution recaps.",
    category: "Social",
  },
  {
    id: "bridge-sol",
    name: "Cross-Chain Bridge",
    description: "Bridge SOL and tokens across chains with Wormhole or LayerZero.",
    category: "DeFi",
  },
];

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
