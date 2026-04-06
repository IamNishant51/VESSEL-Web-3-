import { NextRequest, NextResponse } from "next/server";
import { checkRateLimitSync, getClientIp } from "@/lib/rate-limit";
import { RATE_LIMIT_CONFIG } from "@/lib/config";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

interface PriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  change24hPercent: number;
  marketCap: number;
  volume24h: number;
  high24h?: number;
  low24h?: number;
  updatedAt: string;
}

interface PriceResponse {
  success: boolean;
  timestamp: string;
  source: string;
  data: PriceData | PriceData[];
  error?: string;
}

const SUPPORTED_ASSETS: Record<string, { id: string; symbol: string; name: string }> = {
  sol: { id: "solana", symbol: "SOL", name: "Solana" },
  solana: { id: "solana", symbol: "SOL", name: "Solana" },
  btc: { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  bitcoin: { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  eth: { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  ethereum: { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  usdc: { id: "usd-coin", symbol: "USDC", name: "USD Coin" },
  usdt: { id: "tether", symbol: "USDT", name: "Tether" },
  jup: { id: "jupiter-exchange-solana", symbol: "JUP", name: "Jupiter" },
  ray: { id: "raydium", symbol: "RAY", name: "Raydium" },
  msol: { id: "msol", symbol: "mSOL", name: "Marinade staked SOL" },
  jitosol: { id: "jito-staked-sol", symbol: "JitoSOL", name: "Jito Staked SOL" },
  bonk: { id: "bonk", symbol: "BONK", name: "BONK" },
  wif: { id: "dogwifhat", symbol: "WIF", name: "dogwifhat" },
  popcat: { id: "popcat", symbol: "POPCAT", name: "Popcat" },
};

const priceCache = new Map<string, { data: PriceData[]; expiresAt: number }>();
const PRICE_CACHE_TTL = 60 * 1000;

function getCachedPrices(symbols: string[]): PriceData[] | null {
  const now = Date.now();
  const cached = priceCache.get(symbols.join(","));
  if (cached && cached.expiresAt > now) {
    return cached.data;
  }
  return null;
}

function setCachedPrices(symbols: string[], data: PriceData[]): void {
  priceCache.set(symbols.join(","), {
    data,
    expiresAt: Date.now() + PRICE_CACHE_TTL,
  });
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const limit = checkRateLimitSync(`price:${ip}`, { 
      windowMs: RATE_LIMIT_CONFIG.DEFAULT_WINDOW_MS, 
      max: 30 
    });
    
    if (!limit.allowed) {
      const fallbackPrices = getFallbackPrices(["sol", "btc", "eth"]);
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        source: "fallback",
        data: fallbackPrices,
      } as PriceResponse);
    }

    const body = await request.json();
    const { symbols = ["sol"], currency = "usd" } = body;

    if (!Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json(
        { error: "symbols array is required" },
        { status: 400 }
      );
    }

    const normalizedSymbols = symbols.map((s: string) => s.toLowerCase().trim());
    const cached = getCachedPrices(normalizedSymbols);
    if (cached) {
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        source: "cache",
        data: cached.length === 1 ? cached[0] : cached,
      } as PriceResponse);
    }

    const coingeckoIds = normalizedSymbols
      .map((s) => SUPPORTED_ASSETS[s]?.id)
      .filter(Boolean);

    if (coingeckoIds.length === 0) {
      return NextResponse.json(
        { error: "No supported symbols provided", supported: Object.keys(SUPPORTED_ASSETS) },
        { status: 400 }
      );
    }

    try {
      const ids = coingeckoIds.join(",");
      const url = `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=${currency}&include_24hr_change=true&include_24hr_high=true&include_24hr_low=true&include_market_cap=true&include_24hr_vol=true`;

      const response = await fetch(url, {
        headers: {
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        const fallbackPrices = getFallbackPrices(normalizedSymbols);
        setCachedPrices(normalizedSymbols, fallbackPrices);
        return NextResponse.json({
          success: true,
          timestamp: new Date().toISOString(),
          source: "fallback",
          data: fallbackPrices.length === 1 ? fallbackPrices[0] : fallbackPrices,
        } as PriceResponse);
      }

      const data = await response.json();
      const prices: PriceData[] = normalizedSymbols
        .map((symbol) => {
          const asset = SUPPORTED_ASSETS[symbol];
          if (!asset) return null;

          const priceData = data[asset.id];
          if (!priceData) return null;

          const price = priceData[currency] || 0;
          const change24h = priceData[`${currency}_24h_change`] || 0;

          return {
            symbol: asset.symbol,
            name: asset.name,
            price,
            change24h,
            change24hPercent: price > 0 ? (change24h / (price - change24h)) * 100 : 0,
            marketCap: priceData[`${currency}_market_cap`] || 0,
            volume24h: priceData[`${currency}_24h_vol`] || 0,
            high24h: priceData[`${currency}_24h_high`],
            low24h: priceData[`${currency}_24h_low`],
            updatedAt: new Date().toISOString(),
          };
        })
        .filter(Boolean) as PriceData[];

      if (prices.length > 0) {
        setCachedPrices(normalizedSymbols, prices);
      }

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        source: "coingecko",
        data: prices.length === 1 ? prices[0] : prices,
      } as PriceResponse);
    } catch {
      const fallbackPrices = getFallbackPrices(normalizedSymbols);
      setCachedPrices(normalizedSymbols, fallbackPrices);
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        source: "fallback",
        data: fallbackPrices.length === 1 ? fallbackPrices[0] : fallbackPrices,
      } as PriceResponse);
    }
  } catch (error) {
    console.error("Price API error:", error);
    const fallbackPrices = getFallbackPrices(["sol", "btc", "eth"]);
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      source: "fallback",
      data: fallbackPrices,
    } as PriceResponse);
  }
}

function getFallbackPrices(symbols: string[]): PriceData[] {
  const fallbackPrices: Record<string, PriceData> = {
    sol: {
      symbol: "SOL",
      name: "Solana",
      price: 74.5,
      change24h: 2.1,
      change24hPercent: 2.9,
      marketCap: 32000000000,
      volume24h: 1800000000,
      high24h: 76.2,
      low24h: 72.3,
      updatedAt: new Date().toISOString(),
    },
    btc: {
      symbol: "BTC",
      name: "Bitcoin",
      price: 43250,
      change24h: 850,
      change24hPercent: 2.0,
      marketCap: 845000000000,
      volume24h: 28000000000,
      high24h: 43800,
      low24h: 42100,
      updatedAt: new Date().toISOString(),
    },
    eth: {
      symbol: "ETH",
      name: "Ethereum",
      price: 2350,
      change24h: 45,
      change24hPercent: 1.95,
      marketCap: 282000000000,
      volume24h: 12500000000,
      high24h: 2380,
      low24h: 2290,
      updatedAt: new Date().toISOString(),
    },
    usdc: {
      symbol: "USDC",
      name: "USD Coin",
      price: 1.0,
      change24h: 0,
      change24hPercent: 0,
      marketCap: 42000000000,
      volume24h: 3500000000,
      updatedAt: new Date().toISOString(),
    },
    usdt: {
      symbol: "USDT",
      name: "Tether",
      price: 1.0,
      change24h: 0,
      change24hPercent: 0,
      marketCap: 95000000000,
      volume24h: 45000000000,
      updatedAt: new Date().toISOString(),
    },
    jup: {
      symbol: "JUP",
      name: "Jupiter",
      price: 0.85,
      change24h: 0.05,
      change24hPercent: 6.25,
      marketCap: 850000000,
      volume24h: 125000000,
      updatedAt: new Date().toISOString(),
    },
  };

  return symbols
    .map((symbol) => fallbackPrices[symbol] || null)
    .filter(Boolean) as PriceData[];
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Agent price API - POST with { symbols: string[] }",
    supportedAssets: Object.keys(SUPPORTED_ASSETS),
    example: {
      symbols: ["sol", "btc", "eth", "jup"],
    },
  });
}
