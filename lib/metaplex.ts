import {
  Connection,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { MPL_BUBBLEGUM_PROGRAM_ID } from "@metaplex-foundation/mpl-bubblegum";

import { solanaNetwork, solanaRpcUrl } from "@/lib/solana";
import type { ForgeDraft } from "@/types/agent";
import type { Adapter } from "@solana/wallet-adapter-base";

type MintInput = {
  owner: string;
  draft: ForgeDraft;
  walletAdapter?: Adapter;
  metadataUri?: string;
  merkleTreeAddress?: string;
  collectionMintAddress?: string;
};

export type MintResult = {
  mintAddress: string;
  bubblegumProgram: string;
  signature: string;
  estimatedCostSol: string;
  simulated: boolean;
  agentName?: string;
  explorerUrl?: string;
};

export async function mintAgentSoulCnft({
  owner,
  draft,
  walletAdapter,
  metadataUri,
  merkleTreeAddress,
  collectionMintAddress,
}: MintInput): Promise<MintResult> {
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  if (isDevMode) {
    return simulateMint(owner, draft);
  }

  if (!walletAdapter) {
    throw new Error("Wallet adapter is required for on-chain minting");
  }

  if (!merkleTreeAddress || !collectionMintAddress) {
    throw new Error("Merkle tree and collection mint addresses are required for on-chain minting");
  }

  if (!metadataUri) {
    throw new Error("Metadata URI is required for on-chain minting");
  }

  try {
    const mintApiUrl = `${window.location.origin}/api/agents/mint`;

    // Step 1: Build transaction
    const buildResponse = await fetch(mintApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        owner,
        name: draft.name,
        uri: metadataUri,
        merkleTree: merkleTreeAddress,
        collectionMint: collectionMintAddress,
        sellerFeeBasisPoints: 0,
        broadcast: false,
      }),
    });

    if (!buildResponse.ok) {
      const errorData = await buildResponse.json().catch(() => ({}));
      throw new Error(errorData.error || `Mint API error: ${buildResponse.status}`);
    }

    const buildData = await buildResponse.json() as {
      transaction?: string;
      blockhash?: string;
    };

    if (!buildData.transaction) {
      throw new Error("No transaction returned from mint API");
    }

    // Step 2: Sign transaction with wallet
    const transactionBuffer = Buffer.from(buildData.transaction, "hex");
    const transaction = Transaction.from(transactionBuffer);

    if (!transaction.recentBlockhash) {
      transaction.recentBlockhash = buildData.blockhash;
    }

    const signedTransaction = await (walletAdapter as unknown as { signTransaction: (tx: Transaction) => Promise<Transaction> }).signTransaction(transaction);
    const signedTxHex = Buffer.from(signedTransaction.serialize()).toString("hex");

    // Step 3: Broadcast signed transaction
    const broadcastResponse = await fetch(mintApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signedTransaction: signedTxHex,
        broadcast: true,
        owner,
        name: draft.name,
      }),
    });

    if (!broadcastResponse.ok) {
      const errorData = await broadcastResponse.json().catch(() => ({}));
      throw new Error(errorData.error || `Broadcast API error: ${broadcastResponse.status}`);
    }

    const broadcastData = await broadcastResponse.json() as {
      signature?: string;
      explorerUrl?: string;
      status?: string;
    };

    if (!broadcastData.signature) {
      throw new Error("No transaction signature returned from broadcast");
    }

    const bubblegumProgram = MPL_BUBBLEGUM_PROGRAM_ID.toString();

    return {
      mintAddress: broadcastData.signature.slice(0, 32),
      bubblegumProgram,
      signature: broadcastData.signature,
      estimatedCostSol: "0.0021",
      simulated: false,
      agentName: draft.name,
      explorerUrl: broadcastData.explorerUrl || `https://explorer.solana.com/tx/${broadcastData.signature}?cluster=${solanaNetwork}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to mint agent soul on-chain: ${errorMessage}`);
  }
}

function simulateMint(owner: string, draft: ForgeDraft): MintResult {
  const ownerKey = new PublicKey(owner);
  const signature = `sim_${Date.now()}_${ownerKey.toBase58().slice(0, 8)}`;
  const bubblegumProgram = MPL_BUBBLEGUM_PROGRAM_ID.toString();

  return {
    mintAddress: `sim_${Date.now()}_mint`,
    bubblegumProgram,
    signature,
    estimatedCostSol: "0.0000",
    simulated: true,
    agentName: draft.name,
  };
}

export async function getCnftAssetData(assetId: string) {
  const connection = new Connection(solanaRpcUrl, "confirmed");

  try {
    const assetPublicKey = new PublicKey(assetId);

    const response = await connection.getParsedTransaction(assetPublicKey.toBase58(), {
      maxSupportedTransactionVersion: 2,
    });

    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to fetch cNFT asset data: ${errorMessage}`);
  }
}
