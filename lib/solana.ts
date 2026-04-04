import { clusterApiUrl } from "@solana/web3.js";

export const solanaNetwork =
  process.env.NEXT_PUBLIC_WALLET_ADAPTER_NETWORK ?? "devnet";

export const solanaRpcUrl =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? clusterApiUrl("devnet");
