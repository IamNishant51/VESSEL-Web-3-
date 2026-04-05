import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";

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

export async function verifyWalletAuth(request: NextRequest, requireSignature = true): Promise<AuthResult> {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return { valid: false, status: 400, error: "Invalid request body" };
    }

    const { publicKey: publicKeyStr, signature: signatureStr, message: messageStr, nonce } = body;

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
