import {
  Connection,
  PublicKey,
  Transaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

export interface ToolExecutionContext {
  agentId: string;
  userId: string;
  walletAddress: string;
  connection: Connection;
  rpcEndpoint: string;
}

export interface ToolResult {
  success: boolean;
  transactionSignature?: string;
  result?: any;
  error?: string;
  estimatedCost?: number;
  explorerUrl?: string;
}

/**
 * Execute a Solana transfer
 */
export async function executeTransfer(
  context: ToolExecutionContext,
  toAddress: string,
  amount: number,
  isSPL: boolean = false,
  tokenMint?: string
): Promise<ToolResult> {
  try {
    if (!toAddress || amount <= 0) {
      return {
        success: false,
        error: "Invalid recipient or amount",
      };
    }

    const connection = new Connection(context.rpcEndpoint);
    const from = new PublicKey(context.walletAddress);
    const to = new PublicKey(toAddress);

    if (isSPL && tokenMint) {
      // SPL Token transfer - requires token account addresses
      return {
        success: false,
        error: "SPL transfers require additional setup (token accounts)",
      };
    }

    // Native SOL transfer
    const lamports = amount * LAMPORTS_PER_SOL;
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: from,
        toPubkey: to,
        lamports,
      })
    );

    // Get blockhash for recent transaction
    const { blockhash } = await connection.getLatestBlockhash("finalized");
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = from;

    // Estimate fee
    const fee = await connection.getFeeForMessage(
      transaction.compileMessage(),
      "finalized"
    );

    return {
      success: true,
      result: {
        simulation: true,
        to: toAddress,
        amount,
        currency: "SOL",
      },
      estimatedCost: (fee?.value || 5000) / LAMPORTS_PER_SOL,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Transfer failed",
    };
  }
}

/**
 * Simulate a token swap via Jupiter
 */
export async function executeTokenSwap(
  context: ToolExecutionContext,
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 100 // 1%
): Promise<ToolResult> {
  try {
    if (!inputMint || !outputMint || amount <= 0) {
      return {
        success: false,
        error: "Invalid swap parameters",
      };
    }

    // Validate mint addresses
    try {
      new PublicKey(inputMint);
      new PublicKey(outputMint);
    } catch {
      return {
        success: false,
        error: "Invalid token mint address",
      };
    }

    // In production: Call Jupiter API
    // Example: https://api.jup.ag/swap?inputMint=...&outputMint=...
    // For now, return simulated result

    return {
      success: true,
      result: {
        simulation: true,
        inputMint,
        outputMint,
        inputAmount: amount,
        estimatedOutput: Math.floor(amount * 0.98), // 2% slippage assumption
        slippageBps,
      },
      estimatedCost: 0.0025, // ~0.0025 SOL for Solana swap
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Swap simulation failed",
    };
  }
}

/**
 * Simulate staking
 */
export async function executeStaking(
  context: ToolExecutionContext,
  validatorVoteAddress: string,
  amount: number
): Promise<ToolResult> {
  try {
    if (!validatorVoteAddress || amount <= 0) {
      return {
        success: false,
        error: "Invalid staking parameters",
      };
    }

    // Validate vote address
    try {
      new PublicKey(validatorVoteAddress);
    } catch {
      return {
        success: false,
        error: "Invalid validator vote address",
      };
    }

    // Staking is complex (requires stake account creation, delegation, etc.)
    // Return a detailed simulation

    return {
      success: true,
      result: {
        simulation: true,
        validator: validatorVoteAddress,
        amount,
        expectedAPY: 6.5, // Average Solana staking APY
        estimatedDailyReward: (amount * 6.5) / 100 / 365,
        lockupPeriod: "none",
      },
      estimatedCost: 0.02717, // Cost of creating stake account
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Staking simulation failed",
    };
  }
}

/**
 * Query portfolio balance with real on-chain data
 */
export async function queryPortfolio(
  context: ToolExecutionContext
): Promise<ToolResult> {
  try {
    const connection = new Connection(context.rpcEndpoint);
    const wallet = new PublicKey(context.walletAddress);

    const solBalance = await connection.getBalance(wallet);

    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss613VQ5DA"),
    });

    const tokens = tokenAccounts.value.map((acc) => ({
      mint: acc.account.data.parsed.info.mint,
      balance: acc.account.data.parsed.info.tokenAmount.uiAmount,
      decimals: acc.account.data.parsed.info.tokenAmount.decimals,
    }));

    return {
      success: true,
      result: {
        wallet: context.walletAddress,
        solBalance: solBalance / LAMPORTS_PER_SOL,
        tokens,
        lastUpdated: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Portfolio query failed",
    };
  }
}

/**
 * Search the web for information
 */
export async function webSearch(
  query: string,
  numResults: number = 10
): Promise<ToolResult> {
  try {
    const response = await fetch("/api/agent/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, numResults }),
    });

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      result: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Web search failed",
    };
  }
}

/**
 * Get real-time price data
 */
export async function getPrices(
  symbols: string[] = ["sol"]
): Promise<ToolResult> {
  try {
    const response = await fetch("/api/agent/price", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbols }),
    });

    if (!response.ok) {
      throw new Error(`Price API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      result: data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Price fetch failed",
    };
  }
}

/**
 * Get market snapshot with real data
 */
export async function getMarketSnapshot(): Promise<ToolResult> {
  try {
    const pricesResult = await getPrices(["sol", "btc", "eth", "usdc", "jup"]);
    
    const globalResponse = await fetch("https://api.coingecko.com/api/v3/global");
    const globalData = await globalResponse.json();

    const fearGreed = calculateFearGreed(globalData.data?.market_cap_change_percentage_24h_usd || 0);

    return {
      success: true,
      result: {
        ...pricesResult.result,
        global: {
          totalMarketCap: globalData.data?.total_market_cap?.usd || 0,
          btcDominance: globalData.data?.market_cap_percentage?.btc || 0,
          fearGreed,
        },
        timestamp: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Market snapshot failed",
    };
  }
}

function calculateFearGreed(marketChange: number): string {
  if (marketChange > 5) return "Extreme Greed";
  if (marketChange > 2) return "Greed";
  if (marketChange < -5) return "Extreme Fear";
  if (marketChange < -2) return "Fear";
  return "Neutral";
}

/**
 * Execute any tool based on intent
 */
export async function executeTool(
  context: ToolExecutionContext,
  toolName: string,
  params: Record<string, any>
): Promise<ToolResult> {
  console.log(`[Tools] Executing tool: ${toolName}`, params);

  switch (toolName) {
    case "transfer":
      return executeTransfer(
        context,
        params.to,
        params.amount,
        params.isSPL,
        params.tokenMint
      );

    case "swap":
      return executeTokenSwap(
        context,
        params.inputMint,
        params.outputMint,
        params.amount,
        params.slippage
      );

    case "stake":
      return executeStaking(context, params.validator, params.amount);

    case "portfolio":
      return queryPortfolio(context);

    case "websearch":
      return webSearch(params.query, params.numResults);

    case "prices":
      return getPrices(params.symbols);

    case "market":
      return getMarketSnapshot();

    default:
      return {
        success: false,
        error: `Unknown tool: ${toolName}`,
      };
  }
}

/**
 * Get available tools for an agent
 */
export function getAgentTools(tier: string) {
  const baseTools = ["portfolio", "websearch", "prices", "market"];

  if (tier === "free") {
    return baseTools;
  }

  if (tier === "pro") {
    return [...baseTools, "transfer"];
  }

  return [...baseTools, "transfer", "swap", "stake"];
}

/**
 * Validate tool execution against subscription limits
 */
export function validateToolAccess(
  tier: string,
  tool: string
): { allowed: boolean; reason?: string } {
  const allowedTools = getAgentTools(tier);

  if (!allowedTools.includes(tool)) {
    return {
      allowed: false,
      reason: `${tool} requires ${tier === "free" ? "Pro" : "Enterprise"} tier`,
    };
  }

  return { allowed: true };
}
