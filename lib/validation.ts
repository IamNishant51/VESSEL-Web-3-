import { z } from "zod";

export const agentIdSchema = z.string().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/, "Invalid agent ID format");

export const publicKeySchema = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana public key");

export const signatureSchema = z.string().min(1);

export const agentNameSchema = z.string().min(1).max(40).regex(/^[a-zA-Z0-9 _-]+$/, "Agent name can only contain letters, numbers, spaces, hyphens, and underscores");

export const agentPersonalitySchema = z.string().min(1).max(500);

export const agentTaglineSchema = z.string().max(120).optional();

export const riskLevelSchema = z.enum(["Conservative", "Balanced", "Aggressive"]);

export const forgeToolSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
});

export const saveAgentSchema = z.object({
  action: z.literal("save-agent"),
  agent: z.object({
    id: agentIdSchema,
    name: agentNameSchema,
    personality: agentPersonalitySchema,
    owner: publicKeySchema,
    mintAddress: z.string().optional(),
    createdAt: z.string().datetime().optional(),
    treasuryBalance: z.number().min(0).max(1000000).optional(),
    earnings: z.number().min(0).optional(),
    tagline: agentTaglineSchema,
    tools: z.array(z.string()).max(20).optional(),
    maxSolPerTx: z.number().min(0).max(100).optional(),
    dailyBudgetUsdc: z.number().min(0).max(1000000).optional(),
    allowedActions: z.array(z.string()).max(20).optional(),
    riskLevel: riskLevelSchema.optional(),
    systemPrompt: z.string().max(2000).optional(),
  }),
});

export const deleteAgentSchema = z.object({
  action: z.literal("delete-agent"),
  agentId: agentIdSchema,
  ownerAddress: publicKeySchema,
});

export const saveListingSchema = z.object({
  action: z.literal("save-listing"),
  listing: z.object({
    id: agentIdSchema,
    seller: publicKeySchema,
    price: z.number().min(0).max(1000000),
    currency: z.enum(["SOL", "USDC"]),
    isRental: z.boolean().optional(),
    rentalDays: z.number().min(1).max(365).optional(),
  }),
});

export const deleteListingSchema = z.object({
  action: z.literal("delete-listing"),
  agentId: agentIdSchema,
  ownerAddress: publicKeySchema,
});

export const saveTransactionSchema = z.object({
  action: z.literal("save-transaction"),
  tx: z.object({
    transactionSignature: z.string().min(1).max(200),
    type: z.enum(["mint", "tool_call", "buy", "rent", "list", "unlist"]),
    agentId: agentIdSchema,
    timestamp: z.number().min(0).max(Date.now() + 86400000),
    amount: z.number().min(0).max(1000000).optional(),
    target: z.string().max(200).optional(),
    metadata: z.record(z.unknown()).refine((val) => Object.keys(val).length <= 10, "Metadata can have at most 10 fields").optional(),
  }),
});

export const bulkSaveAgentsSchema = z.object({
  action: z.literal("bulk-save-agents"),
  agents: z.array(saveAgentSchema.shape.agent).max(50),
});

export const userStatsSchema = z.object({
  action: z.literal("user-stats"),
  ownerAddress: publicKeySchema,
  stats: z.object({
    totalAgents: z.number().min(0).max(1000).optional(),
    totalTransactions: z.number().min(0).optional(),
    totalEarnings: z.number().min(0).optional(),
  }),
});

export const dbActionSchema = z.discriminatedUnion("action", [
  saveAgentSchema,
  deleteAgentSchema,
  saveListingSchema,
  deleteListingSchema,
  saveTransactionSchema,
  bulkSaveAgentsSchema,
  userStatsSchema,
  z.object({ action: z.literal("fetch-agents"), walletAddress: publicKeySchema.optional() }),
  z.object({ action: z.literal("fetch-agent-by-id"), agentId: agentIdSchema }),
  z.object({ action: z.literal("fetch-listings"), seller: publicKeySchema.optional(), includeAll: z.boolean().optional() }),
  z.object({ action: z.literal("fetch-transactions"), agentId: agentIdSchema.optional(), limit: z.number().min(1).max(200).optional() }),
  z.object({ action: z.literal("fetch-user-stats"), walletAddress: publicKeySchema }),
]);

export type SaveAgentInput = z.infer<typeof saveAgentSchema>;
export type DeleteAgentInput = z.infer<typeof deleteAgentSchema>;
export type SaveListingInput = z.infer<typeof saveListingSchema>;
export type DeleteListingInput = z.infer<typeof deleteListingSchema>;
export type SaveTransactionInput = z.infer<typeof saveTransactionSchema>;
export type BulkSaveAgentsInput = z.infer<typeof bulkSaveAgentsSchema>;
export type UserStatsInput = z.infer<typeof userStatsSchema>;
