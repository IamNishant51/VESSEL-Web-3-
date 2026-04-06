import { clusterApiUrl, Connection } from "@solana/web3.js";
import { SOLANA_CONFIG } from "@/lib/config";

export type SolanaNetwork = "devnet" | "testnet" | "mainnet";

export const solanaNetwork: SolanaNetwork = 
  (process.env.NEXT_PUBLIC_WALLET_ADAPTER_NETWORK as SolanaNetwork) || SOLANA_CONFIG.DEFAULT_NETWORK;

export const solanaRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(solanaNetwork === "mainnet" ? "mainnet-beta" : solanaNetwork);

export function isMainnet(): boolean {
  return solanaNetwork === "mainnet";
}

export function isDevnet(): boolean {
  return solanaNetwork === "devnet";
}

export function getConnection(): Connection {
  const commitment = solanaNetwork === "mainnet" ? "finalized" : "confirmed";
  return new Connection(solanaRpcUrl, commitment);
}

const MAINNET_WHITELIST_ENABLED = process.env.NEXT_PUBLIC_MAINNET_WHITELIST_ENABLED === "true";
const MAINNET_WALLET_WHITELIST = new Set(
  (process.env.MAINNET_WHITELIST || "").split(",").filter(Boolean)
);

export function isWhitelistedForMainnet(walletAddress: string): boolean {
  if (!MAINNET_WHITELIST_ENABLED) {
    return true;
  }
  return MAINNET_WALLET_WHITELIST.has(walletAddress);
}

export function requireMainnetAccess(walletAddress: string): void {
  if (isMainnet() && !isWhitelistedForMainnet(walletAddress)) {
    throw new Error("This wallet is not whitelisted for mainnet access");
  }
}

export function getExplorerUrl(signature: string, network?: SolanaNetwork): string {
  const net = network || solanaNetwork;
  if (net === "mainnet") {
    return `https://solscan.io/tx/${signature}`;
  }
  return `https://explorer.solana.com/tx/${signature}?cluster=${net}`;
}
