import { NextRequest, NextResponse } from "next/server";
import { getCircuitBreakerStatus } from "@/lib/circuit-breaker";

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

    // Get circuit breaker status (current execution limits)
    const cbStatus = getCircuitBreakerStatus(agentId);

    // TODO: Fetch real analytics from database
    // For now, return circuit breaker status as placeholder
    const analytics = {
      agentId,
      successCount: 0,
      failureCount: cbStatus?.failureCount || 0,
      totalVolume: 0, // USD
      totalEarnings: 0, // SOL
      profitAndLoss: 0, // SOL
      successRate: "0%",
      circuitBreakerTripped: cbStatus?.isTripped || false,
      dailySpentSol: cbStatus?.dailySpentSol || 0,
      dailyLimitSol: 1.0,
      dailyRemainingSol: 1.0 - (cbStatus?.dailySpentSol || 0),
      recentTransactions: [],
      createdAt: new Date(),
    };

    return NextResponse.json(analytics, { status: 200 });

  } catch (error) {
    console.error("[Analytics] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
