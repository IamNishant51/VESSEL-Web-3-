import { NextRequest, NextResponse } from "next/server";
import { getTotalPaid, getPaymentEfficiency } from "@/lib/x402-payments";

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

    // Get agent payment data
    const totalPaid = getTotalPaid(agentId);
    const efficiency = getPaymentEfficiency(agentId);

    return NextResponse.json(
      {
        agentId,
        totalPaidSol: totalPaid,
        transactionCount: efficiency.totalTransactions,
        averageCostPerTransaction: efficiency.averageCostPerTransaction,
        costEfficiency: efficiency.totalTransactions > 0 ? "optimized" : "new",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("[AgentBalance] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent balance" },
      { status: 500 }
    );
  }
}
