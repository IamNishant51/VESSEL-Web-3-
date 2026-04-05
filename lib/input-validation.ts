import { PublicKey } from "@solana/web3.js";

export function clampText(input: unknown, maxLen: number): string {
  if (typeof input !== "string") {
    return "";
  }

  const cleaned = input.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
  return cleaned.slice(0, maxLen);
}

export function sanitizeStringArray(input: unknown, maxItems: number, maxItemLen: number): string[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((value): value is string => typeof value === "string")
    .map((value) => clampText(value, maxItemLen))
    .filter((value) => value.length > 0)
    .slice(0, maxItems);
}

export function isValidPublicKey(value: string): boolean {
  try {
    // Throws if not a valid base58 Solana pubkey.
    void new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}
