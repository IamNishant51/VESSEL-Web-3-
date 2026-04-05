import type { Agent } from "@/types/agent";

export type PremadeFreeAgentTemplate = Agent & {
  templateId: string;
  isPremade: true;
  listed: true;
  seller: string;
  price: 0;
  priceCurrency: "SOL";
  isRental: false;
  sourceTemplateId: string;
};

const PREMADE_PREFIX = "premade-free";

export function isPremadeDerivedAgent(agent: Pick<Agent, "isPremade" | "sourceTemplateId" | "mintAddress">): boolean {
  if (agent.isPremade) {
    return true;
  }

  const source = (agent.sourceTemplateId || "").toLowerCase();
  if (source.startsWith(PREMADE_PREFIX)) {
    return true;
  }

  const mint = (agent.mintAddress || "").toLowerCase();
  return mint.includes(PREMADE_PREFIX);
}

export const PREMADE_FREE_AGENTS: PremadeFreeAgentTemplate[] = [
  {
    id: `${PREMADE_PREFIX}-atlas-scout`,
    templateId: `${PREMADE_PREFIX}-atlas-scout`,
    sourceTemplateId: `${PREMADE_PREFIX}-atlas-scout`,
    isPremade: true,
    listed: true,
    seller: "Vessel Protocol",
    price: 0,
    priceCurrency: "SOL",
    isRental: false,
    name: "Atlas Scout",
    personality: "Scans SOL ecosystem activity, watches liquidity and volume changes, identifies emerging tokens and protocols, and returns a ranked top-3 opportunity brief with clear next steps.",
    owner: "Vessel Protocol",
    tagline: "Scans SOL markets and ranks the best opportunities",
    tools: ["scan", "chat", "alerts"],
    maxSolPerTx: 0.15,
    dailyBudgetUsdc: 60,
    allowedActions: ["Swap", "Stake"],
    riskLevel: "Balanced",
    systemPrompt: "You are Atlas Scout, a fast market intelligence agent. Focus on scanning the SOL ecosystem for trends, liquidity changes, and actionable opportunities. Give clear top-3 rankings, explain why each matters, and stay concise.",
    treasuryBalance: 0,
    reputation: 96,
    totalActions: 0,
    earnings: 0,
    createdAt: "2026-04-05T00:00:00.000Z",
    mintAddress: `${PREMADE_PREFIX}-atlas-scout-mint`,
  },
  {
    id: `${PREMADE_PREFIX}-nova-guard`,
    templateId: `${PREMADE_PREFIX}-nova-guard`,
    sourceTemplateId: `${PREMADE_PREFIX}-nova-guard`,
    isPremade: true,
    listed: true,
    seller: "Vessel Protocol",
    price: 0,
    priceCurrency: "SOL",
    isRental: false,
    name: "Nova Guard",
    personality: "Monitors portfolio risk, spots oversized positions, suggests safer allocations, and rebalances into lower-risk exposures when volatility or drawdown rises.",
    owner: "Vessel Protocol",
    tagline: "Protects capital with risk checks and rebalancing",
    tools: ["chat", "portfolio-guard", "rebalancer"],
    maxSolPerTx: 0.1,
    dailyBudgetUsdc: 40,
    allowedActions: ["Swap", "Transfer", "Stake"],
    riskLevel: "Conservative",
    systemPrompt: "You are Nova Guard, a capital preservation agent. Prioritize downside protection, position sizing, and portfolio rebalancing. Offer clear low-risk steps and default to caution.",
    treasuryBalance: 0,
    reputation: 98,
    totalActions: 0,
    earnings: 0,
    createdAt: "2026-04-05T00:00:00.000Z",
    mintAddress: `${PREMADE_PREFIX}-nova-guard-mint`,
  },
  {
    id: `${PREMADE_PREFIX}-echo-yield`,
    templateId: `${PREMADE_PREFIX}-echo-yield`,
    sourceTemplateId: `${PREMADE_PREFIX}-echo-yield`,
    isPremade: true,
    listed: true,
    seller: "Vessel Protocol",
    price: 0,
    priceCurrency: "SOL",
    isRental: false,
    name: "Echo Yield",
    personality: "Finds staking and lending routes, compares yield options, and recommends capital-efficient DeFi moves that improve passive returns without unnecessary risk.",
    owner: "Vessel Protocol",
    tagline: "Optimizes staking and lending yield paths",
    tools: ["chat", "yield-routing", "deFi"],
    maxSolPerTx: 0.2,
    dailyBudgetUsdc: 75,
    allowedActions: ["Stake", "Lend"],
    riskLevel: "Balanced",
    systemPrompt: "You are Echo Yield, a DeFi optimization agent. Focus on staking, lending, and yield allocation. Present efficient but responsible paths and avoid unnecessary risk.",
    treasuryBalance: 0,
    reputation: 95,
    totalActions: 0,
    earnings: 0,
    createdAt: "2026-04-05T00:00:00.000Z",
    mintAddress: `${PREMADE_PREFIX}-echo-yield-mint`,
  },
  {
    id: `${PREMADE_PREFIX}-pulse-ops`,
    templateId: `${PREMADE_PREFIX}-pulse-ops`,
    sourceTemplateId: `${PREMADE_PREFIX}-pulse-ops`,
    isPremade: true,
    listed: true,
    seller: "Vessel Protocol",
    price: 0,
    priceCurrency: "SOL",
    isRental: false,
    name: "Pulse Ops",
    personality: "Tracks social momentum, new mints, and launch activity, then highlights early narratives, trending projects, and community signals worth watching.",
    owner: "Vessel Protocol",
    tagline: "Tracks launches, social momentum, and early narratives",
    tools: ["chat", "social-monitor", "launch-radar"],
    maxSolPerTx: 0.12,
    dailyBudgetUsdc: 50,
    allowedActions: ["Transfer", "Mint"],
    riskLevel: "Aggressive",
    systemPrompt: "You are Pulse Ops, a launch and narrative intelligence agent. Watch community signals, surface early opportunities, and turn social momentum into clear action briefs.",
    treasuryBalance: 0,
    reputation: 94,
    totalActions: 0,
    earnings: 0,
    createdAt: "2026-04-05T00:00:00.000Z",
    mintAddress: `${PREMADE_PREFIX}-pulse-ops-mint`,
  },
];

export function getPremadeFreeAgentById(agentId: string): PremadeFreeAgentTemplate | undefined {
  return PREMADE_FREE_AGENTS.find((agent) => agent.id === agentId);
}

export function clonePremadeFreeAgent(template: PremadeFreeAgentTemplate, owner: string): Agent {
  const timestamp = Date.now();
  const sourceTemplateId = template.templateId || template.sourceTemplateId || template.id;

  return {
    ...template,
    id: crypto.randomUUID(),
    owner,
    listed: false,
    price: undefined,
    priceCurrency: undefined,
    seller: undefined,
    isRental: false,
    rentalEnd: undefined,
    sourceTemplateId,
    isPremade: true,
    createdAt: new Date(timestamp).toISOString(),
    mintAddress: `${sourceTemplateId}-${owner.slice(0, 8)}-${timestamp}`,
  };
}