export type Agent = {
  id: string;
  name: string;
  personality: string;
  owner: string;
  reputation?: number;
  totalActions?: number;
  lastActionAt?: string;
  mintAddress?: string;
  createdAt?: string;
  tagline?: string;
  tools?: string[];
  maxSolPerTx?: number;
  dailyBudgetUsdc?: number;
  allowedActions?: string[];
  riskLevel?: RiskLevel;
  systemPrompt?: string;
  // Marketplace fields
  listed?: boolean;
  price?: number;
  priceCurrency?: "SOL" | "USDC";
  seller?: string;
  rentalEnd?: string;
  isRental?: boolean;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  transactionSignature?: string;
  isStreaming?: boolean;
};

export type RunAgentRequest = {
  agentId?: string;
  userMessage: string;
  userPublicKey?: string;
  agent?: Agent;
};

export type RunAgentResponse = {
  message: string;
  transactionSignature?: string;
  toolUsed?: string;
  error?: string;
};

export type ToolCategory =
  | "All"
  | "Trading"
  | "DeFi"
  | "Staking"
  | "Payments"
  | "NFTs"
  | "Social"
  | "Oracles";

export type ForgeTool = {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
};

export type RiskLevel = "Conservative" | "Balanced" | "Aggressive";

export type ForgeDraft = {
  name: string;
  personality: string;
  tagline: string;
  tools: string[];
  maxSolPerTx: number;
  dailyBudgetUsdc: number;
  weeklyBudgetUsdc: number;
  allowedActions: string[];
  riskLevel: RiskLevel;
};

export const initialForgeDraft: ForgeDraft = {
  name: "",
  personality: "",
  tagline: "Give Your Ideas a Soul",
  tools: [],
  maxSolPerTx: 1.2,
  dailyBudgetUsdc: 120,
  weeklyBudgetUsdc: 700,
  allowedActions: ["Swap", "Stake"],
  riskLevel: "Balanced",
};

export type MarketplaceListing = {
  agentId: string;
  price: number;
  priceCurrency: "SOL" | "USDC";
  isRental: boolean;
  rentalDays?: number;
  seller: string;
  createdAt: string;
};
