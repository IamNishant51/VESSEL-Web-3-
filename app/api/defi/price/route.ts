import { NextRequest, NextResponse } from "next/server";
import { getSolPrice, getTokenPrice } from "@/lib/defi-integrations";

const CACHE_DURATION_MS = 30_000; // Cache prices for 30 seconds
const priceCache = new Map<string, { price: number; timestamp: number }>();

function getCacheKey(type: string, id: string): string {
  return `${type}:${id}`;
}

export async function GET(request: NextRequest) {
  try {
    const typeParam = request.nextUrl.searchParams.get("type") || "sol";
    const idParam = request.nextUrl.searchParams.get("id");

    if (typeParam === "sol") {
      // Get SOL price
      const cacheKey = "sol_price";
      const cached = priceCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
        return NextResponse.json(
          {
            symbol: "SOL",
            price: cached.price,
            currency: "usd",
            cached: true,
          },
          { status: 200 }
        );
      }

      const price = await getSolPrice();
      priceCache.set(cacheKey, { price, timestamp: Date.now() });

      return NextResponse.json(
        {
          symbol: "SOL",
          price,
          currency: "usd",
          cached: false,
        },
        { status: 200 }
      );

    } else if (typeParam === "token") {
      if (!idParam) {
        return NextResponse.json(
          { error: 'id parameter required for token type (e.g., ?type=token&id=ethereum)' },
          { status: 400 }
        );
      }

      const cacheKey = getCacheKey("token", idParam);
      const cached = priceCache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
        return NextResponse.json(
          {
            token: idParam,
            price: cached.price,
            currency: "usd",
            cached: true,
          },
          { status: 200 }
        );
      }

      const price = await getTokenPrice(idParam);
      priceCache.set(cacheKey, { price, timestamp: Date.now() });

      return NextResponse.json(
        {
          token: idParam,
          price,
          currency: "usd",
          cached: false,
        },
        { status: 200 }
      );

    } else {
      return NextResponse.json(
        { error: "Invalid type. Use 'sol' or 'token'" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("[Price] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch price" },
      { status: 500 }
    );
  }
}
