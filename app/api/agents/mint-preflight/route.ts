import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

import { solanaRpcUrl } from "@/lib/solana";

export const runtime = "nodejs";

type PreflightStatus = {
  ready: boolean;
  checks: Array<{ name: string; ok: boolean; detail: string }>;
  config: {
    merkleTree: string | null;
    collectionMint: string | null;
  };
};

function readRequiredEnv(name: "NEXT_PUBLIC_BUBBLEGUM_MERKLE_TREE" | "NEXT_PUBLIC_BUBBLEGUM_COLLECTION_MINT") {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetries<T>(task: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        await sleep(250 * (i + 1));
      }
    }
  }
  throw lastError;
}

async function resolveWorkingConnection() {
  const candidates = Array.from(new Set([solanaRpcUrl.trim(), "https://api.devnet.solana.com"]));
  const failures: string[] = [];

  for (const rpcUrl of candidates) {
    const connection = new Connection(rpcUrl, "confirmed");
    try {
      await withRetries(() => connection.getLatestBlockhash(), 3);
      return { connection, rpcUrl, failures };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      failures.push(`${rpcUrl}: ${message}`);
    }
  }

  return { connection: null, rpcUrl: null, failures };
}

export async function GET() {
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true";

  if (isDevMode) {
    return NextResponse.json({
      ready: true,
      checks: [
        { name: "dev_mode", ok: true, detail: "Development mode active — on-chain requirements bypassed" },
        { name: "bubblegum_merkle_tree_env", ok: true, detail: "Not required in dev mode" },
        { name: "bubblegum_collection_mint_env", ok: true, detail: "Not required in dev mode" },
        { name: "rpc_connection", ok: true, detail: "Not required in dev mode" },
        { name: "sol_balance", ok: true, detail: "Not required in dev mode" },
      ],
      config: {
        merkleTree: null,
        collectionMint: null,
      },
    });
  }

  const checks: PreflightStatus["checks"] = [];

  const merkleTree = readRequiredEnv("NEXT_PUBLIC_BUBBLEGUM_MERKLE_TREE");
  const collectionMint = readRequiredEnv("NEXT_PUBLIC_BUBBLEGUM_COLLECTION_MINT");

  checks.push({
    name: "bubblegum_merkle_tree_env",
    ok: !!merkleTree,
    detail: merkleTree ? "Configured" : "Missing NEXT_PUBLIC_BUBBLEGUM_MERKLE_TREE",
  });

  checks.push({
    name: "bubblegum_collection_mint_env",
    ok: !!collectionMint,
    detail: collectionMint ? "Configured" : "Missing NEXT_PUBLIC_BUBBLEGUM_COLLECTION_MINT",
  });

  const rpc = await resolveWorkingConnection();

  if (rpc.connection && rpc.rpcUrl) {
    checks.push({
      name: "rpc_connection",
      ok: true,
      detail: `Connected (${rpc.rpcUrl})`,
    });
  } else {
    checks.push({
      name: "rpc_connection",
      ok: false,
      detail: rpc.failures.length > 0 ? rpc.failures.join(" | ") : "Unable to connect to configured RPC.",
    });
  }

  if (!rpc.connection) {
    if (merkleTree) {
      checks.push({
        name: "merkle_tree_account",
        ok: false,
        detail: "Skipped: RPC connection unavailable",
      });
    }

    if (collectionMint) {
      checks.push({
        name: "collection_mint_account",
        ok: false,
        detail: "Skipped: RPC connection unavailable",
      });
    }
  } else if (merkleTree) {
    try {
      const info = await withRetries(() => rpc.connection!.getAccountInfo(new PublicKey(merkleTree)), 3);
      checks.push({
        name: "merkle_tree_account",
        ok: !!info,
        detail: info ? "Account exists" : "Account not found",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid public key";
      checks.push({
        name: "merkle_tree_account",
        ok: false,
        detail: message,
      });
    }
  }

  if (rpc.connection && collectionMint) {
    try {
      const info = await withRetries(() => rpc.connection!.getAccountInfo(new PublicKey(collectionMint)), 3);
      checks.push({
        name: "collection_mint_account",
        ok: !!info,
        detail: info ? "Account exists" : "Account not found",
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid public key";
      checks.push({
        name: "collection_mint_account",
        ok: false,
        detail: message,
      });
    }
  }

  const ready = checks.every((check) => check.ok);

  return NextResponse.json({
    ready,
    checks,
    config: {
      merkleTree,
      collectionMint,
    },
  });
}
