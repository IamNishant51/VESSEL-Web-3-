import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";

const JUPITER_API = "https://api.jup.ag/swap/v6";

export interface JupiterQuoteParams {
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
  onlyDirectRoutes?: boolean;
}

export interface JupiterQuote {
  inAmount: number;
  outAmount: number;
  priceImpactPct: number;
  marketInfos: Array<{
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: number;
    outAmount: number;
    minInAmount: number;
    minOutAmount: number;
  }>;
  routePlan: Array<{
    swapInfo: {
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: number;
      outAmount: number;
    };
    percent: number;
  }>;
}

export interface JupiterSwapParams {
  userPublicKey: string;
  quoteResponse: JupiterQuote;
  wrapUnwrapSOL?: boolean;
}

export interface SwapResult {
  success: boolean;
  transaction?: string;
  signature?: string;
  error?: string;
  inputMint?: string;
  outputMint?: string;
  inputAmount?: number;
  outputAmount?: number;
  priceImpactPct?: number;
  explorerUrl?: string;
}

const TOKEN_MINT_MAP: Record<string, string> = {
  sol: "So11111111111111111111111111111111111111112",
  usdc: "EPjFWdd5AufqSSCwM1X5rUoU5Hq2U3qfK9oKkYqB5qB",
  usdt: "Es9vMFrzaNmM48x7ejVUoqoA6yiMt6YC2cY5k7FDe5b",
  btc: "btcBRJakJmF1q5S3Nir4YxSC5S2Qh4GxiCdh3K7apm",
  eth: "7fpynCPWU9D4uC3EGq7P7g7EuhGLw3XJqNRfLGT9pS",
  jup: "jupSoLaHXQiZZTSfEWMTRRgpnyi8dzfHcjMVWkFuG9",
  ray: "4k3Dyjzvzp8eMZWUXbBCjEvvSkqdtpj3NPwWtVBF8iw",
  bonk: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pP3iup",
  wif: "85VBFQZC9TZkfaptBWqv14ALD9fJNUKtZ41K5caw5kwm",
  msol: "mSoLzYCxHdYgGaU2zqE7J7rMmqTM2rY3v7Y3k1p7F8",
  jitosol: "J1toso1uCkdtDbrH17YXo5hG5Z4E1h6vEp7ELiHsJiYk",
  stsol: "LidoSTUSdcDtLRaDxyEQdS5USYyhgMV6ULd5Y7g9NYq",
  orca: "orcaEKTdK7LKq57V2GkhZ3Dre5E9w9R4SoXJQWXqK3M4",
  ftx: "8M9YdoDyYwdN9P6rRgH4F4g5y6J7d8K9L0M1N2O3P4Q",
};

export function getTokenMint(symbol: string): string | null {
  return TOKEN_MINT_MAP[symbol.toLowerCase()] || null;
}

export function getSymbolFromMint(mint: string): string | null {
  const entry = Object.entries(TOKEN_MINT_MAP).find(([, m]) => m === mint);
  return entry ? entry[0] : null;
}

export async function getJupiterQuote(params: JupiterQuoteParams): Promise<JupiterQuote> {
  const { inputMint, outputMint, amount, slippageBps = 50, onlyDirectRoutes = false } = params;

  const url = new URL(`${JUPITER_API}/quote`);
  url.searchParams.set("inputMint", inputMint);
  url.searchParams.set("outputMint", outputMint);
  url.searchParams.set("amount", amount.toString());
  url.searchParams.set("slippageBps", slippageBps.toString());
  url.searchParams.set("onlyDirectRoutes", onlyDirectRoutes.toString());
  url.searchParams.set("maxAccounts", "20");

  const response = await fetch(url.toString(), {
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Jupiter quote failed: ${response.status} - ${error}`);
  }

  return response.json() as Promise<JupiterQuote>;
}

export async function getJupiterSwapTransaction(
  params: JupiterSwapParams,
  rpcUrl: string
): Promise<SwapResult> {
  const { userPublicKey, quoteResponse, wrapUnwrapSOL = true } = params;

  try {
    const response = await fetch(`${JUPITER_API}/swap`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userPublicKey,
        quoteResponse,
        wrapUnwrapSOL,
        dynamicComputeUnitLimit: true,
        prioritizationFeeBps: 0,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        success: false,
        error: `Swap transaction failed: ${response.status} - ${error}`,
      };
    }

    const data = await response.json();
    
    const connection = new Connection(rpcUrl, "confirmed");
    
    let transaction: Transaction | VersionedTransaction;
    if (data.swapTransaction) {
      const txBuffer = Buffer.from(data.swapTransaction, "base64");
      try {
        transaction = VersionedTransaction.deserialize(txBuffer);
      } catch {
        transaction = Transaction.from(txBuffer);
      }
    } else {
      return {
        success: false,
        error: "No swap transaction returned",
      };
    }

    const latestBlockhash = await connection.getLatestBlockhash();
    if ("setVersion" in transaction) {
      (transaction as VersionedTransaction).message.recentBlockhash = latestBlockhash.blockhash;
    } else {
      (transaction as Transaction).recentBlockhash = latestBlockhash.blockhash;
    }

    return {
      success: true,
      transaction: data.swapTransaction,
      inputMint: quoteResponse.marketInfos[0]?.inputMint,
      outputMint: quoteResponse.marketInfos[0]?.outputMint,
      inputAmount: quoteResponse.inAmount,
      outputAmount: quoteResponse.outAmount,
      priceImpactPct: quoteResponse.priceImpactPct,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Swap execution failed",
    };
  }
}

export async function executeJupiterSwap(
  params: JupiterSwapParams,
  walletAdapter: { signTransaction: (tx: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction> },
  rpcUrl: string
): Promise<SwapResult> {
  const { quoteResponse, userPublicKey } = params;

  try {
    const swapResult = await getJupiterSwapTransaction(params, rpcUrl);
    
    if (!swapResult.success || !swapResult.transaction) {
      return swapResult;
    }

    const connection = new Connection(rpcUrl, "confirmed");
    const txBuffer = Buffer.from(swapResult.transaction, "base64");
    let transaction: Transaction | VersionedTransaction;
    
    try {
      transaction = VersionedTransaction.deserialize(txBuffer);
    } catch {
      transaction = Transaction.from(txBuffer);
    }

    const signedTransaction = await walletAdapter.signTransaction(transaction);

    const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    });

    await connection.confirmTransaction(signature, "confirmed");

    const cluster = rpcUrl.includes("devnet") ? "devnet" : rpcUrl.includes("testnet") ? "testnet" : "mainnet";
    const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;

    return {
      success: true,
      signature,
      explorerUrl,
      inputMint: quoteResponse.inAmount.toString(),
      outputMint: quoteResponse.outAmount.toString(),
      priceImpactPct: quoteResponse.priceImpactPct,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Swap execution failed",
    };
  }
}

export async function getTokenBalance(
  rpcUrl: string,
  ownerAddress: string,
  tokenMint: string
): Promise<number> {
  const connection = new Connection(rpcUrl, "confirmed");
  const owner = new PublicKey(ownerAddress);

  if (tokenMint === "So11111111111111111111111111111111111111112") {
    const balance = await connection.getBalance(owner);
    return balance / 1e9;
  }

  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
      programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss613VQ5DA"),
    });

    const tokenAccount = tokenAccounts.value.find(
      (acc) => acc.account.data.parsed.info.mint === tokenMint
    );

    if (tokenAccount) {
      return tokenAccount.account.data.parsed.info.tokenAmount.uiAmount;
    }

    return 0;
  } catch {
    return 0;
  }
}
