import { NextResponse } from "next/server";
import { Connection, Transaction } from "@solana/web3.js";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  mintV1,
  TokenStandard,
  TokenProgramVersion,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  publicKey,
  some,
} from "@metaplex-foundation/umi";
import { mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { toWeb3JsLegacyTransaction } from "@metaplex-foundation/umi-web3js-adapters";

import { solanaRpcUrl, solanaNetwork } from "@/lib/solana";
import { checkWalletBalance, getWalletBalanceSol } from "@/lib/solana-payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MintRequestBody = {
  owner: string;
  name: string;
  uri: string;
  merkleTree: string;
  collectionMint: string;
  sellerFeeBasisPoints?: number;
  signedTransaction?: string;
  broadcast?: boolean;
};

type MintResponse = {
  transaction?: string;
  blockhash?: string;
  signature?: string;
  explorerUrl?: string;
  status?: string;
  error?: string;
};

function buildUmi() {
  const umi = createUmi(solanaRpcUrl);
  umi.use(mplTokenMetadata());
  return umi;
}

async function broadcastTransaction(signedTxHex: string): Promise<{
  signature: string;
  explorerUrl: string;
  confirmed: boolean;
}> {
  const connection = new Connection(solanaRpcUrl, "finalized");

  const transactionBuffer = Buffer.from(signedTxHex, "hex");
  const transaction = Transaction.from(transactionBuffer);

  // Send transaction
  const signature = await connection.sendRawTransaction(transaction.serialize(), {
    skipPreflight: false,
    preflightCommitment: "processed",
  });

  // Wait for confirmation with max 60s timeout
  const maxRetries = 60;
  let confirmed = false;
  let confirmation;

  for (let i = 0; i < maxRetries; i++) {
    try {
      confirmation = await connection.confirmTransaction(signature, "finalized");
      if (!confirmation.value.err) {
        confirmed = true;
        break;
      }
    } catch (e) {
      // Continue polling
    }
    await new Promise((res) => setTimeout(res, 1000));
  }

  if (!confirmed) {
    // Transaction may still be valid, just not confirmed in time
    // Continue tracking but warn user
  }

  const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=${solanaNetwork}`;

  return { signature, explorerUrl, confirmed };
}

async function buildMintTransaction(
  owner: string,
  name: string,
  uri: string,
  merkleTree: string,
  collectionMint: string,
  sellerFeeBasisPoints: number
): Promise<{ transaction: string; blockhash: string }> {
  const umi = buildUmi();

  const leafOwner = publicKey(owner);
  const merkleTreePub = publicKey(merkleTree);

  const metadataArgs = {
    name,
    symbol: "VESSEL",
    uri,
    sellerFeeBasisPoints,
    primarySaleHappened: false,
    isMutable: true,
    editionNonce: null,
    tokenStandard: some(TokenStandard.NonFungible),
    collection: some({ key: publicKey(collectionMint), verified: false }),
    uses: null,
    tokenProgramVersion: TokenProgramVersion.Original,
    creators: [],
  };

  const builder = mintV1(umi, {
    leafOwner,
    merkleTree: merkleTreePub,
    metadata: metadataArgs,
  });

  const { blockhash } = await umi.rpc.getLatestBlockhash();

  const transaction = await builder
    .setBlockhash(blockhash)
    .buildAndSign(umi);

  const web3JsTransaction = toWeb3JsLegacyTransaction(transaction);
  const serializedTransaction = web3JsTransaction.serialize();
  const hexTransaction = Buffer.from(serializedTransaction).toString("hex");

  return { transaction: hexTransaction, blockhash: blockhash.toString() };
}

export async function POST(request: Request): Promise<NextResponse<MintResponse>> {
  try {
    const body = (await request.json()) as MintRequestBody;

    const {
      owner,
      name,
      uri,
      merkleTree,
      collectionMint,
      sellerFeeBasisPoints = 0,
      signedTransaction,
      broadcast = false,
    } = body;

    // Handle transaction broadcast
    if (broadcast && signedTransaction) {
      try {
        const { signature, explorerUrl, confirmed } = await broadcastTransaction(signedTransaction);
        return NextResponse.json({
          signature,
          explorerUrl,
          status: confirmed ? "confirmed" : "sent",
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json(
          { error: `Failed to broadcast transaction: ${message}` },
          { status: 500 }
        );
      }
    }

    // Handle transaction building
    if (!owner || !name || !uri || !merkleTree || !collectionMint) {
      return NextResponse.json(
        { error: "Missing required fields: owner, name, uri, merkleTree, collectionMint" },
        { status: 400 }
      );
    }

    // Verify wallet balance before minting
    // Mint requires at least 0.01 SOL for transaction fees
    const MIN_MINT_BALANCE_LAMPORTS = 10_000_000; // 0.01 SOL
    
    try {
      const hasBalance = await checkWalletBalance(owner, MIN_MINT_BALANCE_LAMPORTS);
      if (!hasBalance) {
        const currentBalance = await getWalletBalanceSol(owner);
        return NextResponse.json(
          {
            error: `Insufficient balance. Current balance: ${currentBalance.toFixed(6)} SOL. Required: 0.01 SOL for transaction fees.`,
            status: "insufficient_balance",
          },
          { status: 402 }
        );
      }
    } catch (balanceCheckError) {
      console.error("[Mint] Balance check failed:", balanceCheckError);
      return NextResponse.json(
        { error: "Failed to verify wallet balance" },
        { status: 500 }
      );
    }

    const { transaction, blockhash } = await buildMintTransaction(
      owner,
      name,
      uri,
      merkleTree,
      collectionMint,
      sellerFeeBasisPoints
    );

    return NextResponse.json({
      transaction,
      blockhash,
      status: "unsigned",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to process mint transaction: ${message}` },
      { status: 500 }
    );
  }
}
