import { NextResponse } from "next/server";

import { clampText, isValidPublicKey, sanitizeStringArray } from "@/lib/input-validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { runAgent } from "@/lib/agent-runner";
import type { Agent, RunAgentRequest } from "@/types/agent";
import { auditLog } from "@/lib/audit";

const MAX_BODY_BYTES = 32 * 1024;
const MAX_MESSAGE_CHARS = 700;

function sanitizeAgent(input: Partial<Agent>): Agent {
  return {
    id: clampText(input.id, 64),
    name: clampText(input.name, 64),
    personality: clampText(input.personality, 320),
    owner: clampText(input.owner, 64),
    mintAddress: clampText(input.mintAddress, 64) || undefined,
    createdAt: clampText(input.createdAt, 64) || undefined,
    tagline: clampText(input.tagline, 120) || undefined,
    tools: sanitizeStringArray(input.tools, 24, 64),
    maxSolPerTx: Number.isFinite(input.maxSolPerTx) ? Math.max(0, Math.min(100, Number(input.maxSolPerTx))) : undefined,
    dailyBudgetUsdc: Number.isFinite(input.dailyBudgetUsdc) ? Math.max(0, Math.min(1_000_000, Number(input.dailyBudgetUsdc))) : undefined,
    allowedActions: sanitizeStringArray(input.allowedActions, 24, 48),
    riskLevel: input.riskLevel,
    systemPrompt: clampText(input.systemPrompt, 1500) || undefined,
    treasuryBalance: Number.isFinite(input.treasuryBalance) ? Math.max(0, Number(input.treasuryBalance)) : undefined,
    reputation: Number.isFinite(input.reputation) ? Math.max(0, Math.min(100, Number(input.reputation))) : undefined,
    totalActions: Number.isFinite(input.totalActions) ? Math.max(0, Number(input.totalActions)) : undefined,
    earnings: Number.isFinite(input.earnings) ? Math.max(0, Number(input.earnings)) : undefined,
    lastActionAt: clampText(input.lastActionAt, 64) || undefined,
    listed: !!input.listed,
    price: Number.isFinite(input.price) ? Math.max(0, Number(input.price)) : undefined,
    priceCurrency: input.priceCurrency,
    seller: clampText(input.seller, 64) || undefined,
    rentalEnd: clampText(input.rentalEnd, 64) || undefined,
    isRental: !!input.isRental,
  };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimit(`run:${ip}`, { windowMs: 60_000, max: 25 });
    if (!limit.allowed) {
      auditLog({ level: "security", event: "rate_limit_exceeded", details: { ip, endpoint: "agent-run" }, ip });
      return NextResponse.json(
        { success: false, errorCode: "RATE_LIMITED", error: "Too many requests. Try again soon." },
        {
          status: 429,
          headers: {
            "retry-after": String(limit.retryAfterSeconds),
          },
        }
      );
    }

    const { id: agentIdFromPath } = await params;

    if (!agentIdFromPath || !/^[a-zA-Z0-9_-]+$/.test(agentIdFromPath)) {
      return NextResponse.json(
        { success: false, errorCode: "INVALID_AGENT_ID", error: "Valid agent ID is required" },
        { status: 400 }
      );
    }
    
    const rawBody = await request.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, errorCode: "PAYLOAD_TOO_LARGE", error: "Request payload too large" },
        { status: 413 }
      );
    }

    let body: RunAgentRequest & { agent?: Agent };
    try {
      body = JSON.parse(rawBody) as RunAgentRequest & { agent?: Agent };
    } catch {
      return NextResponse.json(
        { success: false, errorCode: "INVALID_JSON", error: "Malformed JSON payload" },
        { status: 400 }
      );
    }

    const userMessage = clampText(body.userMessage, MAX_MESSAGE_CHARS);
    const userPublicKey = clampText(body.userPublicKey, 64);
    const agent = body.agent ? sanitizeAgent(body.agent) : null;
    const context = {
      lastAssistantMessage: clampText(body.context?.lastAssistantMessage, 700) || undefined,
      lastUserMessage: clampText(body.context?.lastUserMessage, 700) || undefined,
    };

    if (userMessage.length < 2) {
      return NextResponse.json(
        { success: false, errorCode: "MISSING_MESSAGE", error: "userMessage is required" },
        { status: 400 }
      );
    }

    if (!userPublicKey || !isValidPublicKey(userPublicKey)) {
      return NextResponse.json(
        { success: false, errorCode: "INVALID_WALLET", error: "Valid userPublicKey is required" },
        { status: 400 }
      );
    }

    if (!agent) {
      return NextResponse.json(
        { success: false, errorCode: "MISSING_AGENT", error: "Agent configuration not provided" },
        { status: 400 }
      );
    }

    if (agent.id !== agentIdFromPath) {
      return NextResponse.json(
        { success: false, errorCode: "AGENT_ID_MISMATCH", error: "Agent ID mismatch" },
        { status: 400 }
      );
    }

    const result = await runAgent(agent, userMessage, userPublicKey, context);

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { success: false, errorCode: "RUN_ROUTE_ERROR", error: "Request failed" },
      { status: 500 }
    );
  }
}

