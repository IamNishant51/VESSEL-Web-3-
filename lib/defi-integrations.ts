import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const JUPITER_API = "https://api.jup.ag";
const COINGECKO_API = "https://api.coingecko.com/api/v3";

interface TokenInfo {
  mint: string;
  symbol: string;
  decimals: number;
  usdPrice: number;
}

interface PortfolioAsset {
  mint: string;
  symbol: string;
  amount: number;
  decimals: number;
  usdValue: number;
}

interface Portfolio {
  wallet: string;
  totalUsdValue: number;
  assets: PortfolioAsset[];
  sol: number;
  solUsdValue: number;
  updatedAt: Date;
}

interface JupiterQuote {
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  outputAmount: string;
  priceImpactPct: string;
  routePlan: any[];
}

/**
 * Get SOL price in USD from Coingecko
 */
export async function getSolPrice(): Promise<number> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=solana&vs_currencies=usd`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) throw new Error("Coingecko API error");
    const data = await response.json();
    return data.solana?.usd || 150; // Fallback to 150
  } catch (error) {
    console.warn("[DeFi] Failed to get SOL price:", error);
    return 150; // Fallback price
  }
}

/**
 * Get token price from Coingecko
 */
export async function getTokenPrice(coingeckoId: string): Promise<number> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coingeckoId}&vs_currencies=usd`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) throw new Error("Coingecko API error");
    const data = await response.json();
    return data[coingeckoId]?.usd || 0;
  } catch (error) {
    console.warn(`[DeFi] Failed to get price for ${coingeckoId}:`, error);
    return 0;
  }
}

/**
 * Get Jupiter swap quote
 */
export async function getJupiterQuote(
  inputMint: string,
  outputMint: string,
  amount: string | number,
  slippageBps: number = 100
): Promise<JupiterQuote | null> {
  try {
    const amountStr = amount.toString();
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amountStr,
      slippageBps: slippageBps.toString(),
    });

    const response = await fetch(`${JUPITER_API}/swap/quote?${params}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error("Jupiter API error");
    return await response.json();
  } catch (error) {
    console.error("[DeFi] Jupiter quote failed:", error);
    return null;
  }
}

/**
 * Get user's portfolio (all SPL tokens and SOL)
 */
export async function getPortfolio(
  walletAddress: string,
  connection: Connection
): Promise<Portfolio | null> {
  try {
    const wallet = new PublicKey(walletAddress);

    // Get SOL balance
    const solBalanceLamports = await connection.getBalance(wallet);
    const solAmount = solBalanceLamports / LAMPORTS_PER_SOL;
    const solPrice = await getSolPrice();
    const solUsdValue = solAmount * solPrice;

    // Get token accounts (SPL tokens)
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss613VQ5DA"),
    });

    const assets: PortfolioAsset[] = [];
    let totalTokenUsdValue = 0;

    // Process each token account
    for (const account of tokenAccounts.value) {
      const parsedTokenAmount = account.account.data.parsed?.info?.tokenAmount;
      if (!parsedTokenAmount) continue;

      const mint = account.account.data.parsed?.info?.mint;
      const amount = parsedTokenAmount.uiAmount ?? 0;

      if (amount > 0) {
        // For now, set placeholder USD values
        // In production, would look up token metadata from on-chain sources
        const asset: PortfolioAsset = {
          mint,
          symbol: mint.slice(0, 6).toUpperCase(), // Placeholder
          amount,
          decimals: parsedTokenAmount.decimals ?? 6,
          usdValue: 0, // Would fetch real price
        };

        assets.push(asset);
        totalTokenUsdValue += asset.usdValue;
      }
    }

    return {
      wallet: walletAddress,
      totalUsdValue: solUsdValue + totalTokenUsdValue,
      assets,
      sol: solAmount,
      solUsdValue,
      updatedAt: new Date(),
    };

  } catch (error) {
    console.error("[DeFi] Portfolio fetch failed:", error);
    return null;
  }
}

/**
 * Parse Jupiter swap instruction (for encoding into transaction)
 */
export async function getSwapIx(quoteResponse: JupiterQuote, userPublicKey: string) {
  try {
    const response = await fetch(`${JUPITER_API}/swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse,
        userPublicKey,
        wrapAndUnwrapSol: true,
        feeAccount: undefined,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) throw new Error("Swap instruction fetch failed");
    return await response.json();
  } catch (error) {
    console.error("[DeFi] Swap instruction fetch failed:", error);
    return null;
  }
}

/**
 * Get price impact percentage
 */
export function calculatePriceImpact(
  inputAmount: string,
  outputAmount: string,
  inputPrice: number,
  outputPrice: number
): number {
  try {
    const inputValueUsd = Number(inputAmount) * inputPrice;
    const outputValueUsd = Number(outputAmount) * outputPrice;
    const impact = ((inputValueUsd - outputValueUsd) / inputValueUsd) * 100;
    return Math.max(0, impact);
  } catch {
    return 0;
  }
}

/**
 * Validate swap is acceptable (not too much slippage, reasonable output)
 */
export function isSwapAcceptable(
  priceImpactPct: number,
  maxSlippagePercent: number = 5
): boolean {
  return priceImpactPct <= maxSlippagePercent;
}
