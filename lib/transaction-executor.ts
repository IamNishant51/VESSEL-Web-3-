import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { getJupiterQuote, getJupiterSwapTransaction, type JupiterQuote } from "@/lib/defi/jupiter";
import { TRANSACTION_CONFIG, CIRCUIT_BREAKER_CONFIG } from "@/lib/config";

export interface TransactionGenRequest {
  tool: "transfer" | "swap" | "stake" | "portfolio";
  params: Record<string, unknown>;
  userWallet: string;
  agentId: string;
  rpcUrl?: string;
}

export interface TransactionGenResponse {
  transaction: string;
  estimatedFee: number;
  estimatedOutput?: unknown;
  description: string;
}

export interface TransactionExecuteResponse {
  success: boolean;
  signature?: string;
  error?: string;
  explorerUrl?: string;
}

export async function generateUnsignedTransaction(
  req: TransactionGenRequest,
  connection: Connection
): Promise<TransactionGenResponse> {
  const { tool, params, userWallet, rpcUrl } = req;

  try {
    const userPubkey = new PublicKey(userWallet);
    const { blockhash } = await connection.getLatestBlockhash("finalized");

    const transaction = new Transaction();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = userPubkey;
    transaction.add(ComputeBudgetProgram.setComputeUnitPrice({ microLamports: TRANSACTION_CONFIG.PRIORITY_FEE_MICROLAMPORTS }));

    let estimatedFee = TRANSACTION_CONFIG.DEFAULT_FEE_LAMPORTS;
    let description = "";
    let estimatedOutput: unknown = null;

    if (tool === "transfer") {
      const { to, amount } = params as { to?: string; amount?: number };
      if (!to || !amount) throw new Error("Missing to or amount");

      const toAddress = new PublicKey(to);
      const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

      transaction.add(
        SystemProgram.transfer({
          fromPubkey: userPubkey,
          toPubkey: toAddress,
          lamports,
        })
      );

      description = `Transfer ${amount} SOL to ${to.slice(0, 8)}...`;

    } else if (tool === "swap") {
      const { inputMint, outputMint, inputAmount, slippageBps = 50 } = params as {
        inputMint?: string;
        outputMint?: string;
        inputAmount?: number;
        slippageBps?: number;
      };

      if (!inputMint || !outputMint || !inputAmount) {
        throw new Error("Missing swap parameters");
      }

      new PublicKey(inputMint);
      new PublicKey(outputMint);

      const amountInLamports = inputMint === "So11111111111111111111111111111111111111112"
        ? Math.floor(inputAmount * LAMPORTS_PER_SOL)
        : inputAmount;

      const quote: JupiterQuote = await getJupiterQuote({
        inputMint,
        outputMint,
        amount: amountInLamports,
        slippageBps,
      });

      description = `Swap ${inputAmount} tokens with ${slippageBps / 100}% slippage`;

      const swapResult = await getJupiterSwapTransaction({
        userPublicKey: userWallet,
        quoteResponse: quote,
        wrapUnwrapSOL: true,
      }, rpcUrl || "");

      if (!swapResult.success || !swapResult.transaction) {
        throw new Error(swapResult.error || "Failed to get swap transaction");
      }

      estimatedOutput = {
        inputMint,
        outputMint,
        inputAmount,
        estimatedOutput: quote.outAmount,
        slippageBps,
        priceImpactPct: quote.priceImpactPct,
      };

      const swapTxBuffer = Buffer.from(swapResult.transaction, "base64");
      const swapTx = Transaction.from(swapTxBuffer);
      transaction.add(...swapTx.instructions);

    } else if (tool === "stake") {
      throw new Error("Staking requires specialized integration. Use Jito or Marinade API.");

    } else if (tool === "portfolio") {
      throw new Error("Portfolio query does not require transaction signing");
    }

    try {
      const fee = await connection.getFeeForMessage(transaction.compileMessage(), "finalized");
      if (fee?.value) {
        estimatedFee = fee.value / LAMPORTS_PER_SOL;
      }
    } catch (feeErr) {
      console.warn("Failed to estimate fee, using default:", feeErr);
    }

    const serialized = transaction.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });

    return {
      transaction: Buffer.from(serialized).toString("base64"),
      estimatedFee,
      estimatedOutput,
      description,
    };

  } catch (error) {
    throw new Error(`Failed to generate transaction: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function submitSignedTransaction(
  signedTxBase64: string,
  connection: Connection,
  cluster: "devnet" | "testnet" | "mainnet" = "devnet"
): Promise<TransactionExecuteResponse> {
  const delays = TRANSACTION_CONFIG.RETRY_DELAYS;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= delays.length; attempt++) {
    try {
      const txBuffer = Buffer.from(signedTxBase64, "base64");
      const tx = Transaction.from(txBuffer);

      if (!tx.signatures || tx.signatures.length === 0) {
        return { success: false, error: "Transaction is not signed" };
      }

      const signature = await sendAndConfirmTransaction(
        connection,
        tx,
        [],
        {
          commitment: TRANSACTION_CONFIG.FINALIZED_COMMITMENT,
          maxRetries: TRANSACTION_CONFIG.MAX_RETRIES,
          preflightCommitment: TRANSACTION_CONFIG.PREFLIGHT_COMMITMENT,
        }
      );

      const explorerURL = cluster === "mainnet"
        ? `https://solscan.io/tx/${signature}`
        : `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;

      return { success: true, signature, explorerUrl: explorerURL };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Unknown error");

      if (attempt < delays.length) {
        console.log(`[Executor] Attempt ${attempt + 1} failed, retrying in ${delays[attempt]}ms...`);
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
      }
    }
  }

  console.error("[Executor] Transaction submission failed after all retries:", lastError?.message);
  return {
    success: false,
    error: `Transaction failed after ${delays.length + 1} attempts: ${lastError?.message}`,
  };
}

export async function getTransactionStatus(
  signature: string,
  connection: Connection
): Promise<{ status: "pending" | "confirmed" | "failed" | "error"; error?: string; blockTime?: number; slot?: number; logs?: string[] }> {
  try {
    const tx = await connection.getTransaction(signature, {
      commitment: "finalized",
      maxSupportedTransactionVersion: 0,
    });

    if (!tx) {
      return { status: "pending", error: "Transaction not found" };
    }

    if (tx.meta?.err) {
      return {
        status: "failed",
        error: JSON.stringify(tx.meta.err),
        logs: tx.meta.logMessages ?? undefined,
      };
    }

    return {
      status: "confirmed",
      blockTime: tx.blockTime ?? undefined,
      slot: tx.slot ?? undefined,
      logs: tx.meta?.logMessages ?? undefined,
    };

  } catch (error) {
    return {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
