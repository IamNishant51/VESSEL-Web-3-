import { NextResponse } from "next/server";

import { getSolanaAgentKitTools } from "@/lib/agent-kit";

export async function GET() {
  try {
    const tools = await getSolanaAgentKitTools();
    return NextResponse.json({ tools, success: true });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to fetch tools:", errorMessage);
    return NextResponse.json(
      { error: errorMessage, tools: [], success: false },
      { status: 500 }
    );
  }
}
