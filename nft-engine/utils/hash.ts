export function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let result = Math.imul(state ^ (state >>> 15), 1 | state);
    result ^= result + Math.imul(result ^ (result >>> 7), 61 | result);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function padNumber(value: number, length = 4): string {
  return String(value).padStart(length, "0");
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .replace(/-{2,}/g, "-");
}

export function weightedPick<T extends { weight: number }>(rng: () => number, items: readonly T[]): T {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  const threshold = rng() * total;
  let cursor = 0;

  for (const item of items) {
    cursor += item.weight;
    if (threshold <= cursor) {
      return item;
    }
  }

  return items[items.length - 1] as T;
}

export function randomRange(rng: () => number, min: number, max: number): number {
  return min + (max - min) * rng();
}
