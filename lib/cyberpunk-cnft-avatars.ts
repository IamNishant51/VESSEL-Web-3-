import { getCyberpunkAgentDataUrl } from "./agent-avatar";

function hashText(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getCyberpunkCnftAvatarUrl(agentId: string | number): string {
  const normalized = typeof agentId === "number" ? String(agentId) : agentId || "0";
  return getCyberpunkAgentDataUrl(normalized);
}
