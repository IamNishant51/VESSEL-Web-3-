import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { forwardDbAction } from "@/lib/db-route-forwarder";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const agentId = url.searchParams.get("agentId");
  const walletAddress = url.searchParams.get("walletAddress") || undefined;

  if (!agentId) {
    return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
  }

  return forwardDbAction(request, {
    action: "get-social-status",
    agentId,
    walletAddress,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.action) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 });
  }

  const { action, agentId } = body;
  if (!["follow-agent", "unfollow-agent", "like-agent", "unlike-agent"].includes(action)) {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  return forwardDbAction(request, { action, agentId });
}
