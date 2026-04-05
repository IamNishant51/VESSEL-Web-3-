export type Agent = {
  id: string;
  name: string;
  personality: string;
  owner: string;
  treasuryBalance?: number;
  reputation?: number;
  totalActions?: number;
  earnings?: number;
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
  sourceTemplateId?: string;
  isPremade?: boolean;
};

export type AgentStats = {
  reputation: number;
  totalActions: number;
  earnings: number;
};

export type AgentPayment = {
  amount: number;
  currency: "USDC";
  fromAgentId: string;
  to: string;
  transactionSignature: string;
  explorerUrl: string;
};

export type OrchestrationStep = {
  fromAgentId: string;
  toAgentId: string;
  message: string;
  response: string;
  payment: AgentPayment;
};

export type OrchestrationResult = {
  success: boolean;
  steps: OrchestrationStep[];
  finalMessage: string;
  error?: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  transactionSignature?: string;
  explorerUrl?: string;
  payment?: AgentPayment;
  isStreaming?: boolean;
};

export type RunAgentRequest = {
  agentId?: string;
  userMessage: string;
  userPublicKey?: string;
  agent?: Agent;
  context?: {
    lastAssistantMessage?: string;
    lastUserMessage?: string;
  };
};

export type AgentToolExecution = {
  name: string;
  status: "pending" | "running" | "success" | "failed";
  details?: Record<string, unknown>;
};

export type AgentReasoningStep = {
  type: "perception" | "reasoning" | "planning" | "tool_selection" | "validation" | "execution" | "reflection";
  content: string;
};

export type AgentPlanStep = {
  id: string;
  description: string;
  status: "pending" | "running" | "done" | "failed";
  tool?: string;
};

export type RunAgentResponse = {
  message: string;
  success?: boolean;
  transactionSignature?: string;
  explorerUrl?: string;
  toolUsed?: string;
  payment?: AgentPayment;
  errorCode?: string;
  error?: string;
  reasoningSteps?: AgentReasoningStep[];
  planSteps?: AgentPlanStep[];
  toolExecution?: AgentToolExecution;
  agentState?: "idle" | "thinking" | "planning" | "executing" | "waiting_approval" | "error";
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
