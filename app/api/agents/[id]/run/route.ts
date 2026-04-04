import { NextResponse } from "next/server";

import { runAgent } from "@/lib/agent-runner";
import type { Agent, RunAgentRequest } from "@/types/agent";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: agentIdFromPath } = await params;
    
    if (!agentIdFromPath) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }
    
    const body = await request.json() as RunAgentRequest & { agent?: Agent };

    const { userMessage, userPublicKey, agent } = body;

    if (!userMessage) {
      return NextResponse.json(
        { error: "userMessage is required" },
        { status: 400 }
      );
    }

    if (!userPublicKey) {
      return NextResponse.json(
        { error: "userPublicKey is required" },
        { status: 400 }
      );
    }

    if (!agent) {
      return NextResponse.json(
        { error: "Agent configuration not provided" },
        { status: 400 }
      );
    }

    if (agent.id !== agentIdFromPath) {
      return NextResponse.json(
        { error: "Agent ID mismatch" },
        { status: 400 }
      );
    }

    const result = await runAgent(agent, userMessage);

    return NextResponse.json(result);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Agent run error:", errorMessage);
    return NextResponse.json(
      { error: errorMessage, message: `Error executing agent: ${errorMessage}` },
      { status: 500 }
    );
  }
}

