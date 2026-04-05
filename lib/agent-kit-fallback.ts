import type { ForgeTool } from "@/types/agent";

export const fallbackTools: ForgeTool[] = [
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
