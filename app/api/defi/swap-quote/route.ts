import { NextRequest, NextResponse } from "next/server";
import { getJupiterQuote, isSwapAcceptable } from "@/lib/defi-integrations";

export async function GET(request: NextRequest) {
  try {
    const inputMint = request.nextUrl.searchParams.get("inputMint");
    const outputMint = request.nextUrl.searchParams.get("outputMint");
    const amountParam = request.nextUrl.searchParams.get("amount");
    const slippageParam = request.nextUrl.searchParams.get("slippageBps");

    if (!inputMint || !outputMint || !amountParam) {
      return NextResponse.json(
        {
          error: "Missing parameters",
          required: ["inputMint", "outputMint", "amount"],
          optional: ["slippageBps"],
        },
        { status: 400 }
      );
    }

    const amount = Number(amountParam);
    const slippageBps = slippageParam ? Number(slippageParam) : 100;

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    if (slippageBps < 0 || slippageBps > 10000) {
      return NextResponse.json(
        { error: "Slippage must be between 0 and 10000 basis points" },
        { status: 400 }
      );
    }

    // Get Jupiter quote
    const quote = await getJupiterQuote(inputMint, outputMint, amount, slippageBps);

    if (!quote) {
      return NextResponse.json(
        { error: "Failed to get swap quote from Jupiter" },
        { status: 500 }
      );
    }

    // Check if swap is acceptable (slippage within limits)
    const isAcceptable = isSwapAcceptable(Number(quote.priceImpactPct), 5);

    return NextResponse.json(
      {
        quote,
        acceptable: isAcceptable,
        priceImpactPct: Number(quote.priceImpactPct),
        slippageRequested: slippageBps / 100,
        warning: !isAcceptable
          ? `High price impact: ${quote.priceImpactPct}%. Consider reducing amount.`
          : undefined,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[SwapQuote] Error:", error);
    return NextResponse.json(
      { error: "Failed to get swap quote" },
      { status: 500 }
    );
  }
}
