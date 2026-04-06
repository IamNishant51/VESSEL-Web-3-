import { NextRequest, NextResponse } from "next/server";

const EXA_API_KEY = process.env.EXA_API_KEY;
const EXA_SEARCH_URL = "https://api.exa.ai/search";

interface ExaSearchResult {
  title: string;
  url: string;
  snippet: string;
  publishedDate?: string;
}

interface ExaSearchResponse {
  results: ExaSearchResult[];
  totalResults: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, numResults = 10 } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    if (!EXA_API_KEY) {
      const fallbackResults = getFallbackSearchResults(query);
      return NextResponse.json({
        success: true,
        query,
        results: fallbackResults,
        totalResults: fallbackResults.length,
        source: "fallback",
      });
    }

    const response = await fetch(EXA_SEARCH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": EXA_API_KEY,
      },
      body: JSON.stringify({
        query,
        numResults,
        includeDomains: [
          "solana.com",
          "solana.org",
          "docs.solana.com",
          "jup.ag",
          "raydium.io",
          "marginfi.com",
          "jito.network",
          "birdeye.so",
          "coingecko.com",
          "dexscreener.com",
        ],
        excludeDomains: ["twitter.com", "x.com", "reddit.com"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Exa search error:", response.status, errorText);
      const fallbackResults = getFallbackSearchResults(query);
      return NextResponse.json({
        success: true,
        query,
        results: fallbackResults,
        totalResults: fallbackResults.length,
        source: "fallback",
      });
    }

    const data = (await response.json()) as ExaSearchResponse;

    const formattedResults = data.results.map((result) => ({
      title: result.title,
      url: result.url,
      snippet: result.snippet?.slice(0, 300) || "",
      publishedDate: result.publishedDate,
    }));

    return NextResponse.json({
      success: true,
      query,
      results: formattedResults,
      totalResults: data.totalResults || formattedResults.length,
      source: "exa",
    });
  } catch (error) {
    console.error("Search API error:", error);
    const query = "Solana DeFi";
    const fallbackResults = getFallbackSearchResults(query);
    return NextResponse.json({
      success: true,
      query,
      results: fallbackResults,
      totalResults: fallbackResults.length,
      source: "fallback",
    });
  }
}

function getFallbackSearchResults(query: string): Array<{ title: string; url: string; snippet: string }> {
  const normalizedQuery = query.toLowerCase();
  
  const solanaResults = [
    {
      title: "Solana Documentation",
      url: "https://docs.solana.com",
      snippet: "Official Solana blockchain documentation covering getting started, programming models, and validator operations.",
    },
    {
      title: "Jupiter Aggregator",
      url: "https://jup.ag",
      snippet: "Jupiter is the leading liquidity aggregator on Solana, providing the best swap rates acrossDEXes.",
    },
    {
      title: "Raydium",
      url: "https://raydium.io",
      snippet: "Raydium is an automated market maker (AMM) and liquidity hub for the Solana ecosystem.",
    },
    {
      title: "Marginfi",
      url: "https://marginfi.com",
      snippet: "Marginfi is a decentralized lending protocol on Solana offering competitive rates for borrowers and lenders.",
    },
    {
      title: "Jito Network",
      url: "https://jito.network",
      snippet: "Jito provides liquid staking solutions for SOL holders, offering staking rewards while maintaining liquidity.",
    },
  ];

  if (normalizedQuery.includes("price") || normalizedQuery.includes("sol") || normalizedQuery.includes("btc")) {
    solanaResults.push({
      title: "CoinGecko - Solana Price",
      url: "https://www.coingecko.com/en/coins/solana",
      snippet: "Current Solana (SOL) price, market cap, trading volume, and price history.",
    });
  }

  if (normalizedQuery.includes("nft") || normalizedQuery.includes("nft")) {
    solanaResults.push({
      title: "Metaplex - NFT Protocol",
      url: "https://www.metaplex.com",
      snippet: "Metaplex is the leading NFT protocol and toolkit for creating and trading NFTs on Solana.",
    });
  }

  return solanaResults.slice(0, 8);
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Agent search API - POST with { query: string, numResults?: number }",
    example: {
      query: "Solana DeFi yield farming",
      numResults: 10,
    },
  });
}
