type AvatarSpec = {
  subject: string;
  accent: string;
  seed: number;
};

function hashText(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function buildAvatarUrl(spec: AvatarSpec): string {
  const prompt = [
    spec.subject,
    "premium cyberpunk cNFT avatar",
    "dark background",
    spec.accent,
    "neon cyan purple teal pink glows",
    "high contrast",
    "square 1:1",
    "editorial quality",
    "no text",
    "no watermark",
  ].join(", ");

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${spec.seed}&nologo=true`;
}

const AVATAR_SPECS: readonly AvatarSpec[] = [
  { subject: "masked neon hacker portrait with chrome faceplate and glowing eyes", accent: "cyan and magenta circuitry", seed: 101 },
  { subject: "chrome samurai with luminous visor and plated shoulders", accent: "teal and violet armor reflections", seed: 102 },
  { subject: "cyber wolf head with neon eyes and metallic muzzle", accent: "electric blue fur highlights", seed: 103 },
  { subject: "futuristic fox bust with radiant visor and sleek plating", accent: "pink and cyan edge lighting", seed: 104 },
  { subject: "robot monk portrait with glowing halo and steel mask", accent: "soft teal spiritual circuitry", seed: 105 },
  { subject: "neon oni mask with carbon fiber texture and sharp shadows", accent: "purple and crimson highlights", seed: 106 },
  { subject: "cyber raven with luminous beak and metallic feathers", accent: "cyan emissive feather edges", seed: 107 },
  { subject: "armored sentry drone portrait with central glowing eye", accent: "blue and violet hard-surface metal", seed: 108 },
  { subject: "android queen with luminous cheek panels and chrome crown", accent: "teal and pink beauty lighting", seed: 109 },
  { subject: "shadow operative mask with angular neon glyphs", accent: "magenta rim light and dark graphite", seed: 110 },
  { subject: "spectral cyber cat with glowing pupils and chrome whiskers", accent: "cyan pulse light and violet fog", seed: 111 },
  { subject: "chrome lion bust with laser mane and reflective armor", accent: "gold-cyan neon mane glow", seed: 112 },
  { subject: "mecha pilot helmet portrait with holographic visor", accent: "teal cockpit reflections and purple glow", seed: 113 },
  { subject: "cybernetic shogun mask with layered titanium plates", accent: "pink emissive seams and dark steel", seed: 114 },
  { subject: "future bounty hunter with neon hood and respirator mask", accent: "cyan scanlines and magenta rim glow", seed: 115 },
  { subject: "phoenix-inspired cyber avatar with luminous crest and metallic feathers", accent: "fiery pink, cyan, and purple plasma", seed: 116 },
];

export const CYBERPUNK_CNFT_AVATARS: string[] = AVATAR_SPECS.map(buildAvatarUrl);

export function getCyberpunkCnftAvatarUrl(agentId: string | number, fallbackIndex = 0): string {
  const normalized = typeof agentId === "number" ? String(agentId) : agentId || "0";
  const index = hashText(normalized) % CYBERPUNK_CNFT_AVATARS.length;
  return CYBERPUNK_CNFT_AVATARS[index] ?? CYBERPUNK_CNFT_AVATARS[fallbackIndex % CYBERPUNK_CNFT_AVATARS.length];
}
