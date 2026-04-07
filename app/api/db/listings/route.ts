import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { forwardDbAction } from "@/lib/db-route-forwarder";
import { MarketplaceListing } from "@/lib/models";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const listingId = url.searchParams.get("listingId");

  if (listingId) {
    const listing = await MarketplaceListing.findOne({ id: listingId }).lean();
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    return NextResponse.json({ listing });
  }

  const seller = url.searchParams.get("seller") || undefined;
  const includeAll = url.searchParams.get("includeAll") === "true";
  const page = url.searchParams.get("page");
  const limit = url.searchParams.get("limit");

  return forwardDbAction(request, {
    action: "fetch-listings",
    seller,
    includeAll,
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  return forwardDbAction(request, { action: "save-listing", listing: body.listing ?? body });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.agentId) {
    return NextResponse.json({ error: "Missing agentId" }, { status: 400 });
  }

  return forwardDbAction(request, {
    action: "delete-listing",
    agentId: body.agentId,
    ownerAddress: body.ownerAddress,
  });
}
