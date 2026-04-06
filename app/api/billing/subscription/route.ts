import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Subscription } from "@/lib/models";
import { verifyToken } from "@/lib/jwt";

// Get subscription status
export async function GET(request: Request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectToDatabase();

    const subscription = await Subscription.findOne({
      walletAddress: payload.walletAddress,
    });

    if (!subscription) {
      // Return free tier default
      return NextResponse.json({
        tier: "free",
        status: "inactive",
        features: {
          maxAgents: 3,
          maxRentals: 0,
          maxDailyApiCalls: 100,
          prioritySupport: false,
          advancedAnalytics: false,
        },
      });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("[Billing] Get subscription error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription" },
      { status: 500 }
    );
  }
}
