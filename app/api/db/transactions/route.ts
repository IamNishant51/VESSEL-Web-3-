import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { forwardDbAction } from "@/lib/db-route-forwarder";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const agentId = url.searchParams.get("agentId") || undefined;
  const page = url.searchParams.get("page");
  const limit = url.searchParams.get("limit");

  return forwardDbAction(request, {
    action: "fetch-transactions",
    agentId,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  return forwardDbAction(request, { action: "save-transaction", tx: body.tx ?? body });
}
