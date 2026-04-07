import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { z } from "zod";

import { generateUnsignedTransaction, TransactionGenRequest } from "@/lib/transaction-executor";
import { checkTransactionLimits } from "@/lib/circuit-breaker";
import { getClientIp } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit";

const SignTxSchema = z.object({
  agentId: z.string().min(1).max(64),
  tool: z.enum(["transfer", "swap", "stake", "portfolio"]),
  params: z.record(z.any()),
  userWallet: z.string().length(44), // Solana address
  estimatedAmount: z.number().positive().optional(), // SOL amount for limits check
  slippageBps: z.number().int().min(0).max(10000).optional(),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    const body = await request.json();
    const validated = SignTxSchema.parse(body);

    // Validate user wallet address
    try {
      new PublicKey(validated.userWallet);
    } catch {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Check circuit breaker limits
    const estimatedAmount = validated.estimatedAmount || 0.01; // Default to 0.01 SOL if not specified
    const limitCheck = checkTransactionLimits(
      validated.agentId,
      estimatedAmount,
      validated.slippageBps
    );

    if (!limitCheck.allowed) {
      auditLog({
        level: "warn",
        event: "circuit_breaker_limit",
        details: {
          agentId: validated.agentId,
          reason: limitCheck.reason,
          ip,
        },
        ip,
      });

      return NextResponse.json(
        {
          error: limitCheck.reason || "Operation blocked by safety limits",
          dailyRemaining: limitCheck.dailyRemaining,
        },
        { status: 429 }
      );
    }

    // Generate unsigned transaction
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com";
    const connection = new Connection(rpcUrl, "finalized");

    const txGenReq: TransactionGenRequest = {
      tool: validated.tool,
      params: validated.params,
      userWallet: validated.userWallet,
      agentId: validated.agentId,
    };

    const txResponse = await generateUnsignedTransaction(txGenReq, connection);

    // Log successful signing request
    auditLog({
      level: "info",
      event: "tx_sign_request",
      details: {
        agentId: validated.agentId,
        tool: validated.tool,
        estimatedFee: txResponse.estimatedFee,
        description: txResponse.description,
      },
      ip,
    });

    return NextResponse.json(
      {
        success: true,
        transaction: txResponse.transaction, // Base64 encoded unsigned TX
        estimatedFee: txResponse.estimatedFee,
        estimatedOutput: txResponse.estimatedOutput,
        description: txResponse.description,
        dailyRemaining: limitCheck.dailyRemaining,
        network: "devnet",
      },
      { status: 200 }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: error.errors },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[SignTx] Error:", message);

    auditLog({
      level: "error",
      event: "tx_sign_error",
      details: { error: message },
      ip,
    });

    return NextResponse.json(
      { error: "Failed to generate transaction", details: message },
      { status: 500 }
    );
  }
}
