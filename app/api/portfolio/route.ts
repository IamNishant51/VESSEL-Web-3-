import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { getPortfolio } from "@/lib/defi-integrations";

const CACHE_DURATION_MS = 60_000; // Cache for 60 seconds
const portfolioCache = new Map<string, { data: any; timestamp: number }>();

export async function GET(request: NextRequest) {
  try {
    const walletParam = request.nextUrl.searchParams.get("wallet");

    if (!walletParam) {
      return NextResponse.json(
        { error: "Wallet address is required (use ?wallet=ADDRESS)" },
        { status: 400 }
      );
    }

    // Validate wallet address
    try {
      new PublicKey(walletParam);
    } catch {
      return NextResponse.json(
        { error: "Invalid Solana wallet address" },
        { status: 400 }
      );
    }

    // Check cache
    const cached = portfolioCache.get(walletParam);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return NextResponse.json({ ...cached.data, cached: true }, { status: 200 });
    }

    // Fetch fresh portfolio data
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "https://api.devnet.solana.com";
    const connection = new Connection(rpcUrl, "finalized");

    const portfolio = await getPortfolio(walletParam, connection);

    if (!portfolio) {
      return NextResponse.json(
        { error: "Failed to fetch portfolio" },
        { status: 500 }
      );
    }

    // Cache the result
    portfolioCache.set(walletParam, {
      data: portfolio,
      timestamp: Date.now(),
    });

    return NextResponse.json(
      {
        ...portfolio,
        cached: false,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[Portfolio] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}
