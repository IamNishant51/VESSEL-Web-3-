import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { forwardDbAction } from "@/lib/db-route-forwarder";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const agentId = url.searchParams.get("agentId");
  const walletAddress = url.searchParams.get("walletAddress");
  const list = url.searchParams.get("list") === "true";

  if (!agentId || !walletAddress) {
    return NextResponse.json({ error: "Missing agentId or walletAddress" }, { status: 400 });
  }

  return forwardDbAction(request, {
    action: list ? "fetch-conversation-list" : "fetch-conversations",
    agentId,
    walletAddress,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  return forwardDbAction(request, { action: "save-conversation", conversation: body.conversation ?? body });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  return forwardDbAction(request, {
    action: "delete-conversation",
    conversationId: body.conversationId,
    ownerAddress: body.ownerAddress,
  });
}
