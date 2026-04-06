import { NextRequest, NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";
import { z } from "zod";

import { submitSignedTransaction } from "@/lib/transaction-executor";
import { recordSuccess, recordFailure } from "@/lib/circuit-breaker";
import { getClientIp } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit";

const ExecuteSignedTxSchema = z.object({
  agentId: z.string().min(1).max(64),
  signedTransaction: z.string(), // Base64 encoded signed TX
  tool: z.enum(["transfer", "swap", "stake"]),
  estimatedAmount: z.number().positive().optional(),
});

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const body = await req.json();
    const validated = ExecuteSignedTxSchema.parse(body);

    // Set up connection to devnet
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com";
    const connection = new Connection(rpcUrl, "finalized");

    // Submit the signed transaction to blockchain
    const submitResult = await submitSignedTransaction(validated.signedTransaction, connection, "devnet");

    if (!submitResult.success) {
      // Record failure for circuit breaker
      recordFailure(validated.agentId, submitResult.error);

      auditLog({
        level: "error",
        event: "tx_execution_failed",
        details: {
          agentId: validated.agentId,
          tool: validated.tool,
          error: submitResult.error,
        },
        ip,
      });

      return NextResponse.json(
        {
          success: false,
          error: submitResult.error,
        },
        { status: 400 }
      );
    }

    // Record success for circuit breaker
    recordSuccess(validated.agentId, validated.estimatedAmount || 0.01);

    // Log successful execution
    console.log(`[Executor] ${validated.tool} executed successfully for agent ${validated.agentId}`, {
      signature: submitResult.signature,
    });

    auditLog({
      level: "info",
      event: "tx_executed",
      details: {
        agentId: validated.agentId,
        tool: validated.tool,
        signature: submitResult.signature,
        explorerUrl: submitResult.explorerUrl,
      },
      ip,
    });

    return NextResponse.json(
      {
        success: true,
        signature: submitResult.signature,
        explorerUrl: submitResult.explorerUrl,
        tool: validated.tool,
        agentId: validated.agentId,
        message: `✅ Transaction executed! View on Solscan: ${submitResult.explorerUrl}`,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[Executor] Error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";

    auditLog({
      level: "error",
      event: "executor_error",
      details: { error: message },
      ip,
    });

    return NextResponse.json(
      { error: "Transaction execution failed", details: message },
      { status: 500 }
    );
  }
}
