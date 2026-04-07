import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { forwardDbAction } from "@/lib/db-route-forwarder";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const walletAddress = url.searchParams.get("walletAddress");
  const mode = url.searchParams.get("mode") || "stats";

  if (!walletAddress) {
    return NextResponse.json({ error: "Missing walletAddress" }, { status: 400 });
  }

  if (mode === "profile") {
    return forwardDbAction(request, { action: "fetch-user-profile", walletAddress });
  }

  return forwardDbAction(request, { action: "fetch-user-stats", walletAddress });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  return forwardDbAction(request, {
    action: "user-stats",
    ownerAddress: body.ownerAddress ?? body.walletAddress,
    stats: body.stats ?? body,
  });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.walletAddress) {
    return NextResponse.json({ error: "Missing walletAddress" }, { status: 400 });
  }

  return forwardDbAction(request, {
    action: "update-user-profile",
    walletAddress: body.walletAddress,
    profileData: body.profileData ?? body,
  });
}
