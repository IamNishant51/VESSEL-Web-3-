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
    let cost = config.baseCost;
    if (amount && amount > 0.1 && "maxCost" in config) {
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
  lastAccessTime: number; // Track last access for TTL cleanup
}

const paymentRecords = new Map<string, PaymentRecord>();

// Cleanup stale entries every 5 minutes (300,000ms)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
// Remove entries not accessed in 24 hours (86,400,000ms)
const STALE_ENTRY_TTL = 24 * 60 * 60 * 1000;
// Max entries before forced cleanup
const MAX_ENTRIES = 10000;
let cleanupIntervalId: NodeJS.Timeout | null = null;
let hasInitialized = false;

function startCleanupInterval(): void {
  if (cleanupIntervalId) return;

  cleanupIntervalId = setInterval(() => {
    const now = Date.now();
    let removed = 0;
    
    // Remove stale entries not accessed in TTL window
    for (const [id, record] of paymentRecords.entries()) {
      if (now - record.lastAccessTime > STALE_ENTRY_TTL) {
        paymentRecords.delete(id);
        removed++;
      }
    }
    
    // If still over max, remove oldest accessed
    if (paymentRecords.size > MAX_ENTRIES) {
      const sorted = Array.from(paymentRecords.entries())
        .sort(([, a], [, b]) => a.lastAccessTime - b.lastAccessTime);
      const toRemove = sorted.length - MAX_ENTRIES;
      for (let i = 0; i < toRemove; i++) {
        paymentRecords.delete(sorted[i][0]);
        removed++;
      }
    }
    
    if (removed > 0) {
      console.log(`[x402-Payments] Cleaned up ${removed} stale entries. Map size: ${paymentRecords.size}`);
    }
  }, CLEANUP_INTERVAL);

  // Prevent Node.js from keeping process alive just for this interval
  cleanupIntervalId.unref();
}

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
  // Initialize cleanup on first use
  if (!hasInitialized) {
    startCleanupInterval();
    hasInitialized = true;
  }

  const now = Date.now();
  const record: PaymentRecord = {
    id: `${agentId}-${Date.now()}`,
    agentId,
    userId,
    tool,
    costSol,
    transactionSignature: txSignature,
    timestamp: now,
    status: "paid",
    lastAccessTime: now,
  };

  paymentRecords.set(record.id, record);
  console.log(`[Payment] Recorded: ${tool} for agent ${agentId} (${costSol} SOL)`);

  return record;
}

/**
 * Get payment history for an agent
 */
export function getPaymentHistory(agentId: string): PaymentRecord[] {
  const history = Array.from(paymentRecords.values())
    .filter(r => r.agentId === agentId)
    .sort((a, b) => b.timestamp - a.timestamp);
  
  // Update access time for all returned records
  const now = Date.now();
  history.forEach(record => {
    record.lastAccessTime = now;
  });
  
  return history;
}

/**
 * Calculate total paid by agent
 */
export function getTotalPaid(agentId: string): number {
  const now = Date.now();
  const records = getPaymentHistory(agentId).filter(r => r.status === "paid");
  
  // Update access time
  records.forEach(record => {
    record.lastAccessTime = now;
  });
  
  return records.reduce((sum, r) => sum + r.costSol, 0);
}

/**
 * Price-to-earnings ratio (cost efficiency)
 */
export function getPaymentEfficiency(agentId: string): {
  totalSpent: number;
  totalTransactions: number;
  averageCostPerTransaction: number;
} {
  const now = Date.now();
  const records = getPaymentHistory(agentId).filter(r => r.status === "paid");
  
  // Update access time
  records.forEach(record => {
    record.lastAccessTime = now;
  });

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
