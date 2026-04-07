import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import { redisGet, redisSet } from "@/lib/redis";

const NONCE_EXPIRY_MS = 5 * 60 * 1000;
const usedNonces = new Map<string, number>();
const NONCE_PREFIX = "auth:nonce:";

export type AuthResult = {
  valid: true;
  publicKey: PublicKey;
  message: string;
  signature: Uint8Array;
} | {
  valid: false;
  status: number;
  error: string;
};

function cleanupExpiredNonces(): void {
  const now = Date.now();
  for (const [nonce, timestamp] of usedNonces.entries()) {
    if (now - timestamp > NONCE_EXPIRY_MS) {
      usedNonces.delete(nonce);
    }
  }
  
  if (usedNonces.size > 10000) {
    const sortedByTime = Array.from(usedNonces.entries()).sort((a, b) => a[1] - b[1]);
    const toRemove = sortedByTime.slice(0, Math.ceil(sortedByTime.length / 2));
    for (const [nonce] of toRemove) {
      usedNonces.delete(nonce);
    }
  }
}

async function isNonceValid(nonce: string, timestamp: number): Promise<boolean> {
  const now = Date.now();
  const nonceKey = `${NONCE_PREFIX}${nonce}`;
  
  if (Math.abs(now - timestamp) > NONCE_EXPIRY_MS) {
    return false;
  }
  
  const redisNonce = await redisGet<number>(nonceKey);
  if (redisNonce || usedNonces.has(nonce)) {
    return false;
  }
  
  usedNonces.set(nonce, now);
  await redisSet(nonceKey, now, Math.ceil(NONCE_EXPIRY_MS / 1000));
  
  if (usedNonces.size > 5000) {
    cleanupExpiredNonces();
  }
  
  return true;
}

export async function verifyWalletAuth(request: NextRequest, requireSignature = true): Promise<AuthResult> {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return { valid: false, status: 400, error: "Invalid request body" };
    }

    const { publicKey: publicKeyStr, signature: signatureStr, message: messageStr, nonce, timestamp } = body;

    if (!publicKeyStr) {
      return { valid: false, status: 401, error: "Missing public key" };
    }

    let pubKey: PublicKey;
    try {
      pubKey = new PublicKey(publicKeyStr);
    } catch {
      return { valid: false, status: 401, error: "Invalid public key format" };
    }

    if (!requireSignature) {
      return { valid: true, publicKey: pubKey, message: "", signature: new Uint8Array() };
    }

    if (!signatureStr || !messageStr) {
      return { valid: false, status: 401, error: "Signature and message required for authentication" };
    }

    if (!nonce || !timestamp) {
      return { valid: false, status: 401, error: "Missing nonce or timestamp for authentication" };
    }

    if (!Number.isFinite(timestamp) || timestamp < 0) {
      return { valid: false, status: 401, error: "Invalid timestamp" };
    }

    if (!(await isNonceValid(nonce, timestamp))) {
      return { valid: false, status: 401, error: "Invalid or expired nonce" };
    }

    const signatureBytes = Uint8Array.from(Buffer.from(signatureStr, "base64"));
    const messageBytes = new TextEncoder().encode(messageStr);

    const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, pubKey.toBytes());

    if (!isValid) {
      return { valid: false, status: 403, error: "Invalid signature" };
    }

    return {
      valid: true,
      publicKey: pubKey,
      message: messageStr,
      signature: signatureBytes,
    };
  } catch {
    return { valid: false, status: 500, error: "Authentication failed" };
  }
}

export function authErrorResponse(status: number, error: string): NextResponse {
  return NextResponse.json({ error }, { status });
}
