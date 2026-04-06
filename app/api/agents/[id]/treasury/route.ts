import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params;

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }

    // TODO: Fetch treasury address from database based on agentId
    // For now, return placeholder
    const treasuryAddress = ""; // Would come from Agent model

    if (!treasuryAddress) {
      return NextResponse.json(
        {
          status: "not_created",
          message: "Agent treasury has not been created yet",
        },
        { status: 200 }
      );
    }

    // Get balance from blockchain
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com";
    const connection = new Connection(rpcUrl, "finalized");
    const treasuryPubkey = new PublicKey(treasuryAddress);

    try {
      const balanceLamports = await connection.getBalance(treasuryPubkey);
      const balanceSol = balanceLamports / LAMPORTS_PER_SOL;

      return NextResponse.json(
        {
          status: "active",
          treasuryAddress,
          balanceSol,
          balanceLamports,
          explorerUrl: `https://solscan.io/address/${treasuryAddress}?cluster=devnet`,
        },
        { status: 200 }
      );
    } catch (err) {
      console.error("[Treasury] Balance fetch error:", err);
      return NextResponse.json(
        {
          status: "error",
          treasuryAddress,
          error: "Failed to fetch balance from blockchain",
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("[Treasury] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch treasury status" },
      { status: 500 }
    );
  }
}
