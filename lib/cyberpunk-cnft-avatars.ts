import { CYBERPUNK_CNFT_AVATARS } from "@/lib/cyberpunk-avatars";

function hashText(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getCyberpunkCnftAvatarUrl(agentId: string | number, fallbackIndex = 0): string {
  const normalized = typeof agentId === "number" ? String(agentId) : agentId || "0";
  const index = hashText(normalized) % CYBERPUNK_CNFT_AVATARS.length;
  return CYBERPUNK_CNFT_AVATARS[index] ?? CYBERPUNK_CNFT_AVATARS[fallbackIndex % CYBERPUNK_CNFT_AVATARS.length];
}
