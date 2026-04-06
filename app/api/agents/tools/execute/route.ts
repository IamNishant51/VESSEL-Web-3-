import { NextRequest, NextResponse } from "next/server";
import { Connection } from "@solana/web3.js";
import { z } from "zod";
import {
  executeTool,
  validateToolAccess,
  type ToolExecutionContext,
} from "@/lib/agent-tools";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import { SubscriptionModel } from "@/lib/models/subscription";
import { getUserSubscriptionTier } from "@/lib/rate-limit";

const ExecuteToolSchema = z.object({
  agentId: z.string().min(1),
  tool: z.enum(["transfer", "swap", "stake", "portfolio"]),
  params: z.record(z.any()),
  walletAddress: z.string().length(44),
  signature: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = ExecuteToolSchema.parse(body);

    // Verify JWT token
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectToDatabase();

    // Get subscription tier
    const tier = await getUserSubscriptionTier(validated.walletAddress);

    // Check tool access
    const { allowed, reason } = validateToolAccess(tier, validated.tool);
    if (!allowed) {
      return NextResponse.json(
        { error: `Tool access denied: ${reason}` },
        { status: 403 }
      );
    }

    // Create execution context
    const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT || "";
    if (!rpcEndpoint) {
      return NextResponse.json(
        { error: "RPC endpoint not configured" },
        { status: 500 }
      );
    }

    const context: ToolExecutionContext = {
      agentId: validated.agentId,
      userId: payload.userId,
      walletAddress: validated.walletAddress,
      connection: new Connection(rpcEndpoint),
      rpcEndpoint,
    };

    // Execute tool
    const result = await executeTool(context, validated.tool, validated.params);

    // Log tool execution
    console.log(`[Tools] ${validated.tool} executed for agent ${validated.agentId}`, {
      success: result.success,
      tier,
    });

    return NextResponse.json({
      ...result,
      tool: validated.tool,
      agentId: validated.agentId,
    });
  } catch (error) {
    console.error("[Tools] Execution error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Tool execution failed" },
      { status: 500 }
    );
  }
}
