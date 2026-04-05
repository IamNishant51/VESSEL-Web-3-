import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddress(address?: string, chars: number = 4): string {
  if (!address) return "Connect";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function clampText(input: string, maxLength: number = 1000): string {
  return input
    .replace(/[<>"'/]/g, (char) => {
      const entities: Record<string, string> = {
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#x27;",
        "/": "&#x2F;",
      };
      return entities[char] || char;
    })
    .slice(0, maxLength)
    .trim();
}

export function validateSolanaAddress(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}
