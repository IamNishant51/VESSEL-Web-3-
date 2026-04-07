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
  // NFT minting status
  mintTxSignature?: string;
  mintStatus?: "pending" | "sent" | "confirmed" | "failed";
  mintError?: string;
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
  type?: "text" | "tool" | "transaction" | "reasoning" | "plan" | "alert";
  toolName?: string;
  toolStatus?: "pending" | "running" | "success" | "failed";
  toolDetails?: Record<string, unknown>;
  reasoningSteps?: AgentReasoningStep[];
  planSteps?: AgentPlanStep[];
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
  agentState?: "idle" | "thinking" | "planning" | "executing" | "waiting_approval" | "ready_for_execution" | "error";
  executionRequest?: {
    tool: string;
    step: string;
    requiresWalletApproval: boolean;
    description?: string;
    estimatedFee?: number;
    agentId?: string;
    parameters?: Record<string, unknown>;
  };
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

export type RiskLevel = "Conservative" | "Balanced" | "Aggressive" | "low" | "medium" | "high";

export type ForgeDraft = {
  name: string;
  personality: string;
  tagline: string;
  tools: string[];
  knowledgeSources: string[];
  customContext: string;
  riskLevel: RiskLevel;
  maxSlippage: number;
  maxSolPerTx: number;
  dailyBudgetUsdc: number;
  weeklyBudgetUsdc: number;
  allowedActions: string[];
  guardrails: string[];
};

export const initialForgeDraft: ForgeDraft = {
  name: "",
  personality: "",
  tagline: "Give Your Ideas a Soul",
  tools: [],
  knowledgeSources: [],
  customContext: "",
  riskLevel: "Balanced",
  maxSlippage: 1.0,
  maxSolPerTx: 1.2,
  dailyBudgetUsdc: 120,
  weeklyBudgetUsdc: 700,
  allowedActions: ["Swap", "Stake"],
  guardrails: [],
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

export type UserProfile = {
  walletAddress: string;
  agentCount: number;
  listedAgentCount: number;
  totalEarnings: number;
  createdAt: string;
  updatedAt: string;
};

export type ConversationMeta = {
  id: string;
  agentId: string;
  walletAddress: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
};

export type Conversation = {
  id: string;
  agentId: string;
  walletAddress: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
};

export type ConversationListItem = {
  id: string;
  agentId: string;
  title: string;
  messageCount: number;
  preview: string;
  createdAt: number;
  updatedAt: number;
};

export type Follow = {
  id: string;
  followerWallet: string;
  agentId: string;
  createdAt: number;
};

export type Like = {
  id: string;
  walletAddress: string;
  agentId: string;
  createdAt: number;
};

export type SocialCounts = {
  followers: number;
  likes: number;
};

export type AgentWithSocial = Agent & SocialCounts & {
  isFollowing?: boolean;
  isLiked?: boolean;
};
