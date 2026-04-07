import { Connection, PublicKey } from "@solana/web3.js";
import { CIRCUIT_BREAKER_CONFIG } from "@/lib/config";

export interface CircuitBreakerState {
  agentId: string;
  failureCount: number;
  lastFailureTime: number;
  isTripped: boolean;
  nextRetryTime: number;
  dailySpentSol: number;
  dailyResetTime: number;
  lastAccessTime: number; // Track last access for cleanup
}

const circuitBreakerMap = new Map<string, CircuitBreakerState>();

// Cleanup stale entries every 5 minutes (300,000ms)
const CLEANUP_INTERVAL = 5 * 60 * 1000;
// Remove entries not accessed in 2 hours
const STALE_ENTRY_TTL = 2 * 60 * 60 * 1000;
let cleanupIntervalId: NodeJS.Timeout | null = null;

function startCleanupInterval(): void {
  if (cleanupIntervalId) return;
  
  cleanupIntervalId = setInterval(() => {
    const now = Date.now();
    let removed = 0;
    
    for (const [agentId, state] of circuitBreakerMap.entries()) {
      if (now - state.lastAccessTime > STALE_ENTRY_TTL) {
        circuitBreakerMap.delete(agentId);
        removed++;
      }
    }
    
    if (removed > 0) {
      console.log(`[CircuitBreaker] Cleaned up ${removed} stale entries. Map size: ${circuitBreakerMap.size}`);
    }
  }, CLEANUP_INTERVAL);

  // Prevent Node.js from keeping process alive just for this interval
  cleanupIntervalId.unref();
}

// Start cleanup on first use
let hasInitialized = false;

export interface CircuitBreakerCheck {
  allowed: boolean;
  reason?: string;
  dailyRemaining?: number;
}

function getOrCreateState(agentId: string): CircuitBreakerState {
  if (!hasInitialized) {
    startCleanupInterval();
    hasInitialized = true;
  }

  const now = Date.now();
  let state = circuitBreakerMap.get(agentId);
  if (!state) {
    state = {
      agentId,
      failureCount: 0,
      lastFailureTime: 0,
      isTripped: false,
      nextRetryTime: 0,
      dailySpentSol: 0,
      dailyResetTime: now,
      lastAccessTime: now,
    };
    circuitBreakerMap.set(agentId, state);
  } else {
    state.lastAccessTime = now; // Update access time for cleanup tracking
  }
  return state;
}

export function checkCircuitBreaker(agentId: string): CircuitBreakerCheck {
  const state = getOrCreateState(agentId);

  if (Date.now() - state.dailyResetTime > 86_400_000) {
    state.dailySpentSol = 0;
    state.dailyResetTime = Date.now();
  }

  if (state.isTripped) {
    if (Date.now() >= state.nextRetryTime) {
      console.log(`[CircuitBreaker] ${agentId} - Reset after cooldown`);
      state.isTripped = false;
      state.failureCount = 0;
    } else {
      const remainingMs = state.nextRetryTime - Date.now();
      return {
        allowed: false,
        reason: `Circuit breaker tripped. Retry in ${Math.ceil(remainingMs / 1000)}s`,
      };
    }
  }

  return {
    allowed: true,
    dailyRemaining: CIRCUIT_BREAKER_CONFIG.MAX_DAILY_SPEND_SOL - state.dailySpentSol,
  };
}

export function checkTransactionLimits(
  agentId: string,
  amountSol: number,
  slippageBps?: number
): CircuitBreakerCheck {
  const breaker = checkCircuitBreaker(agentId);

  if (!breaker.allowed) {
    return breaker;
  }

  const state = getOrCreateState(agentId);

  if (amountSol > CIRCUIT_BREAKER_CONFIG.MAX_SINGLE_TX_SOL) {
    return {
      allowed: false,
      reason: `Transaction too large. Max: ${CIRCUIT_BREAKER_CONFIG.MAX_SINGLE_TX_SOL} SOL, Requested: ${amountSol} SOL`,
    };
  }

  if (state.dailySpentSol + amountSol > CIRCUIT_BREAKER_CONFIG.MAX_DAILY_SPEND_SOL) {
    return {
      allowed: false,
      reason: `Daily limit exceeded. Daily max: ${CIRCUIT_BREAKER_CONFIG.MAX_DAILY_SPEND_SOL} SOL, Already spent: ${state.dailySpentSol} SOL`,
    };
  }

  if (slippageBps && slippageBps > CIRCUIT_BREAKER_CONFIG.MAX_SLIPPAGE_BPS) {
    return {
      allowed: false,
      reason: `Slippage too high. Max: ${CIRCUIT_BREAKER_CONFIG.MAX_SLIPPAGE_BPS / 100}%, Requested: ${slippageBps / 100}%`,
    };
  }

  return {
    allowed: true,
    dailyRemaining: CIRCUIT_BREAKER_CONFIG.MAX_DAILY_SPEND_SOL - state.dailySpentSol - amountSol,
  };
}

export function recordSuccess(agentId: string, amountSol: number): void {
  const state = getOrCreateState(agentId);
  state.dailySpentSol += amountSol;
  state.failureCount = Math.max(0, state.failureCount - 1);
  circuitBreakerMap.set(agentId, state);
  console.log(`[CircuitBreaker] ${agentId} - Success. Failures: ${state.failureCount}`);
}

export function recordFailure(agentId: string, reason?: string): void {
  const state = getOrCreateState(agentId);
  state.failureCount++;
  state.lastFailureTime = Date.now();

  if (state.failureCount >= CIRCUIT_BREAKER_CONFIG.FAILURE_THRESHOLD) {
    state.isTripped = true;
    state.nextRetryTime = Date.now() + CIRCUIT_BREAKER_CONFIG.COOLDOWN_MS;
    console.error(`[CircuitBreaker] ${agentId} - TRIPPED after ${state.failureCount} failures. Cooldown: ${CIRCUIT_BREAKER_CONFIG.COOLDOWN_MS / 60000}m`);
  }

  circuitBreakerMap.set(agentId, state);
  console.log(`[CircuitBreaker] ${agentId} - Failure #${state.failureCount}${reason ? ` (${reason})` : ""}`);
}

export function getCircuitBreakerStatus(agentId: string): CircuitBreakerState | null {
  return circuitBreakerMap.get(agentId) || null;
}

export function resetCircuitBreaker(agentId: string): void {
  circuitBreakerMap.delete(agentId);
  console.log(`[CircuitBreaker] ${agentId} - Reset by admin`);
}

export async function verifyTransactionSignature(
  signature: string,
  connection: Connection
): Promise<{ valid: boolean; error?: string }> {
  try {
    const tx = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return { valid: false, error: "Transaction not found on chain" };
    }

    if (tx.meta?.err) {
      return { valid: false, error: `Transaction failed: ${JSON.stringify(tx.meta.err)}` };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: `Verification error: ${error instanceof Error ? error.message : "Unknown"}`,
    };
  }
}

export async function checkBalance(
  wallet: PublicKey,
  requiredLamports: number,
  connection: Connection
): Promise<{ sufficient: boolean; balance: number; required: number }> {
  try {
    const balance = await connection.getBalance(wallet);
    return {
      sufficient: balance >= requiredLamports,
      balance,
      required: requiredLamports,
    };
  } catch (error) {
    console.error("Failed to check balance:", error);
    return {
      sufficient: false,
      balance: 0,
      required: requiredLamports,
    };
  }
}
