import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";

const NONCE_EXPIRY_MS = 5 * 60 * 1000;
const usedNonces = new Set<string>();

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

function isNonceValid(nonce: string, timestamp: number): boolean {
  const now = Date.now();
  
  if (Math.abs(now - timestamp) > NONCE_EXPIRY_MS) {
    return false;
  }
  
  if (usedNonces.has(nonce)) {
    return false;
  }
  
  usedNonces.add(nonce);
  
  if (usedNonces.size > 10000) {
    const oldEntries = usedNonces.values();
    let removed = 0;
    for (const entry of oldEntries) {
      if (removed > 5000) break;
      usedNonces.delete(entry);
      removed++;
    }
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

    if (!isNonceValid(nonce, timestamp)) {
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
