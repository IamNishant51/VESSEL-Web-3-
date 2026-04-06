import { NextRequest, NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";
import { getTransactionStatus } from "@/lib/transaction-executor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ signature: string }> }
) {
  try {
    const { signature } = await params;

    if (!signature) {
      return NextResponse.json(
        { error: "Transaction signature is required" },
        { status: 400 }
      );
    }

    // Validate signature format
    if (!/^[1-9A-HJ-NP-Z]{88}$/.test(signature)) {
      return NextResponse.json(
        { error: "Invalid transaction signature format" },
        { status: 400 }
      );
    }

    // Get transaction status
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com";
    const connection = new Connection(rpcUrl, "finalized");

    const status = await getTransactionStatus(signature, connection);

    return NextResponse.json(
      {
        signature,
        ...status,
        explorerUrl: `https://solscan.io/tx/${signature}?cluster=devnet`,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[TxStatus] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction status" },
      { status: 500 }
    );
  }
}
