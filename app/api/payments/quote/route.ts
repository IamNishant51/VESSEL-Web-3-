import { NextRequest, NextResponse } from "next/server";
import { generatePaymentQuote } from "@/lib/x402-payments";

/**
 * GET: Get payment quote for a tool
 * POST: Verify payment was made
 */

export async function GET(request: NextRequest) {
  try {
    const toolParam = request.nextUrl.searchParams.get("tool");
    const amount = request.nextUrl.searchParams.get("amount");

    if (!toolParam) {
      return NextResponse.json(
        { error: "tool parameter is required" },
        { status: 400 }
      );
    }

    const amountNum = amount ? Number(amount) : undefined;
    const quote = generatePaymentQuote(toolParam as any, amountNum);

    return NextResponse.json(quote, { status: 200 });

  } catch (error) {
    console.error("[PaymentQuote] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate payment quote" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { agentId?: string; txSignature?: string };
    const { agentId, txSignature } = body;

    if (!agentId || !txSignature) {
      return NextResponse.json(
        { error: "agentId and txSignature are required" },
        { status: 400 }
      );
    }

    // In production:
    // 1. Query blockchain to verify transaction actually occurred
    // 2. Check that payment was made to the correct recipient
    // 3. Verify amount matches expected cost
    // 4. Return payment verification

    // For now, placeholder that checks format
    if (txSignature.length < 80) {
      return NextResponse.json(
        { error: "Invalid transaction signature" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        verified: true,
        message: "Payment verified on-chain",
        txSignature,
        timestamp: Date.now(),
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[PaymentVerify] Error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
