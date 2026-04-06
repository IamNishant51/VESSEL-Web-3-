/**
 * x402 Payment System
 *
 * Agents pay for tool execution via Solana transactions.
 * Cost is deducted from agent treasury or user's wallet.
 */

interface ToolCostConfig {
  transfer: { baseCost: number; perByte: number };
  swap: { baseCost: number; maxCost: number };
  stake: { baseCost: number };
  portfolio: { baseCost: number };
  websearch: { baseCost: number };
  prices: { baseCost: number };
  market: { baseCost: number };
}

const TOOL_COSTS_SOL: ToolCostConfig = {
  transfer: {
    baseCost: 0.0001,
    perByte: 0.00000001,
  },
  swap: {
    baseCost: 0.0005,
    maxCost: 0.005,
  },
  stake: {
    baseCost: 0.0001,
  },
  portfolio: {
    baseCost: 0.00001,
  },
  websearch: {
    baseCost: 0.00005,
  },
  prices: {
    baseCost: 0.00001,
  },
  market: {
    baseCost: 0.00002,
  },
};

export interface PaymentRequest {
  agentId: string;
  tool: keyof ToolCostConfig;
  amount?: number; // Optional: tool-specific amount (e.g., swap amount)
  userId?: string;
}

export interface PaymentQuote {
  tool: string;
  costSol: number;
  costLamports: number;
  description: string;
  paymentRequired: boolean;
}

export interface PaymentVerification {
  paid: boolean;
  signature?: string;
  timestamp?: number;
  refundable?: boolean;
}

/**
 * Calculate cost for tool execution
 */
export function calculateToolCost(
  tool: keyof ToolCostConfig,
  amount?: number
): number {
  const config = TOOL_COSTS_SOL[tool];

  if (!config) {
    return 0;
  }

  if (tool === "transfer") {
    // Transfer cost: base + minimal transaction overhead
    return config.baseCost;
  }

  if (tool === "swap") {
    // Swap cost: escalates with amount, capped
    let cost = config.baseCost;
    if (amount && amount > 0.1) {
      cost = Math.min(config.maxCost, config.baseCost + amount * 0.0001);
    }
    return cost;
  }

  if (tool === "stake") {
    return config.baseCost;
  }

  if (tool === "portfolio") {
    return config.baseCost; // Nearly free
  }

  return 0;
}

/**
 * Generate payment quote for frontend/agent
 */
export function generatePaymentQuote(
  tool: keyof ToolCostConfig,
  amount?: number
): PaymentQuote {
  const costSol = calculateToolCost(tool, amount);
  const costLamports = Math.ceil(costSol * 1_000_000_000); // Convert to lamports

  const descriptions: Record<string, string> = {
    transfer: `${costSol} SOL for transfer execution`,
    swap: `${costSol} SOL for swap execution (${amount ? `${amount} SOL swap` : "quote inquiry"})`,
    stake: `${costSol} SOL for staking execution`,
    portfolio: `${costSol} SOL for portfolio query`,
  };

  return {
    tool,
    costSol,
    costLamports,
    description: descriptions[tool] || `${costSol} SOL for ${tool}`,
    paymentRequired: costSol > 0,
  };
}

/**
 * Encoded payment instruction into transaction
 * (would be added to transaction before signing)
 */
export function buildPaymentInstruction(
  agentId: string,
  costLamports: number,
  payerPublicKey: string
): object {
  // This is a placeholder. In production, would create actual instruction.
  // Could use Solana Pay or custom program.
  return {
    type: "payment_marker",
    agentId,
    costLamports,
    payer: payerPublicKey,
    timestamp: Date.now(),
  };
}

/**
 * Storage for payment records
 * In production, would be in MongoDB
 */
interface PaymentRecord {
  id: string;
  agentId: string;
  userId?: string;
  tool: string;
  costSol: number;
  transactionSignature: string;
  timestamp: number;
  status: "paid" | "pending" | "failed";
}

const paymentRecords = new Map<string, PaymentRecord>();

/**
 * Record a payment after transaction confirms
 */
export function recordPayment(
  agentId: string,
  tool: string,
  costSol: number,
  txSignature: string,
  userId?: string
): PaymentRecord {
  const record: PaymentRecord = {
    id: `${agentId}-${Date.now()}`,
    agentId,
    userId,
    tool,
    costSol,
    transactionSignature: txSignature,
    timestamp: Date.now(),
    status: "paid",
  };

  paymentRecords.set(record.id, record);
  console.log(`[Payment] Recorded: ${tool} for agent ${agentId} (${costSol} SOL)`);

  return record;
}

/**
 * Get payment history for an agent
 */
export function getPaymentHistory(agentId: string): PaymentRecord[] {
  return Array.from(paymentRecords.values())
    .filter(r => r.agentId === agentId)
    .sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Calculate total paid by agent
 */
export function getTotalPaid(agentId: string): number {
  return getPaymentHistory(agentId)
    .filter(r => r.status === "paid")
    .reduce((sum, r) => sum + r.costSol, 0);
}

/**
 * Price-to-earnings ratio (cost efficiency)
 */
export function getPaymentEfficiency(agentId: string): {
  totalSpent: number;
  totalTransactions: number;
  averageCostPerTransaction: number;
} {
  const records = getPaymentHistory(agentId).filter(r => r.status === "paid");

  if (records.length === 0) {
    return {
      totalSpent: 0,
      totalTransactions: 0,
      averageCostPerTransaction: 0,
    };
  }

  const totalSpent = records.reduce((sum, r) => sum + r.costSol, 0);

  return {
    totalSpent,
    totalTransactions: records.length,
    averageCostPerTransaction: totalSpent / records.length,
  };
}
