import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { forwardDbAction } from "@/lib/db-route-forwarder";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const agentId = url.searchParams.get("agentId");

  if (agentId) {
    return forwardDbAction(request, { action: "fetch-agent-by-id", agentId });
  }

  const walletAddress = url.searchParams.get("walletAddress") || undefined;
  const page = url.searchParams.get("page");
  const limit = url.searchParams.get("limit");

  return forwardDbAction(request, {
    action: "fetch-agents",
    walletAddress,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (Array.isArray(body.agents)) {
    return forwardDbAction(request, { action: "bulk-save-agents", agents: body.agents });
  }

  return forwardDbAction(request, { action: "save-agent", agent: body.agent ?? body });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.agentId) {
    return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
  }

  return forwardDbAction(request, {
    action: "delete-agent",
    agentId: body.agentId,
    ownerAddress: body.ownerAddress,
  });
}
