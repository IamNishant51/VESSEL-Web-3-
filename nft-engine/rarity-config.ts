import type { CharacterFamily, RenderContext, TraitVariant } from "./types";
import { clamp, randomRange } from "./utils/hash";
import { getPalette } from "./utils/palette";

const UNIVERSAL = ["universal"] as const;

function createTheme(seed: number) {
  const palette = getPalette(seed);
  const spotlightX = 380 + (seed % 240);
  const spotlightY = 360 + (seed % 180);

  return {
    palette,
    spotlightX,
    spotlightY,
  };
}

function sharedDefs(context: RenderContext): string {
  const { palette, seed } = context;
  const theme = createTheme(seed);
  return `
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${palette.background[0]}"/>
        <stop offset="55%" stop-color="${palette.background[1]}"/>
        <stop offset="100%" stop-color="${palette.background[2]}"/>
      </linearGradient>
      <radialGradient id="spotlight" cx="50%" cy="34%" r="68%">
        <stop offset="0%" stop-color="${palette.glow[0]}" stop-opacity="0.38"/>
        <stop offset="40%" stop-color="${palette.glow[1]}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="${palette.glow[2]}" stop-opacity="0"/>
      </radialGradient>
      <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="14" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <filter id="sharpGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="5" result="blur"/>
        <feMerge>
          <feMergeNode in="blur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
      <linearGradient id="metalGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${palette.highlight}" stop-opacity="0.95"/>
        <stop offset="40%" stop-color="${palette.shimmer}" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="${palette.ink}" stop-opacity="0.96"/>
      </linearGradient>
      <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${palette.accent[0]}"/>
        <stop offset="50%" stop-color="${palette.accent[1]}"/>
        <stop offset="100%" stop-color="${palette.accent[2]}"/>
      </linearGradient>
      <radialGradient id="maskLight" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75"/>
        <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
      </radialGradient>
    </defs>
  `;
}

function backgroundLayer(name: string, seed: number, family: CharacterFamily): string {
  return `
    <rect width="1024" height="1024" fill="url(#bgGrad)"/>
    <circle cx="${512 + (seed % 70) - 35}" cy="${340 + (seed % 90) - 45}" r="360" fill="url(#spotlight)"/>
    <g opacity="0.25">
      ${Array.from({ length: 18 }, (_, index) => {
        const x = (seed * (index + 3) * 47) % 1024;
        const y = (seed * (index + 5) * 61) % 1024;
        const r = 1 + ((seed + index) % 3);
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="${0.14 + ((seed + index) % 7) / 20}"/>`;
      }).join("")}
    </g>
    <g opacity="0.22" filter="url(#sharpGlow)">
      <path d="M 0 ${700 - (seed % 120)} C 180 ${620 - (seed % 80)}, 320 ${760 + (seed % 80)}, 1024 ${640 - (seed % 90)}" fill="none" stroke="url(#accentGrad)" stroke-width="3"/>
      <path d="M 0 ${810 - (seed % 90)} C 260 ${740 + (seed % 60)}, 470 ${920 - (seed % 90)}, 1024 ${760 + (seed % 60)}" fill="none" stroke="${family === "mech" ? "#ffffff" : "url(#accentGrad)"}" stroke-width="1.5" opacity="0.28"/>
    </g>
    <rect width="1024" height="1024" fill="rgba(0,0,0,0.06)"/>
  `;
}

function bodySilhouette(family: CharacterFamily, seed: number): string {
  const skew = (seed % 18) - 9;
  if (family === "canine") {
    return `M 352 790 C 334 676, 362 582, 424 520 C 452 492, 468 464, 512 462 C 556 464, 572 492, 600 520 C 662 582, 690 676, 672 790 Z`;
  }
  if (family === "feline") {
    return `M 360 792 C 350 676, 382 560, 454 506 C 476 490, 494 456, 512 452 C 530 456, 548 490, 570 506 C 642 560, 674 676, 664 792 Z`;
  }
  if (family === "avian") {
    return `M 382 794 C 360 684, 388 572, 458 516 C 472 502, 492 474, 512 470 C 532 474, 552 502, 566 516 C 636 572, 664 684, 642 794 Z`;
  }
  if (family === "mech") {
    return `M 344 796 L 376 602 L 460 504 L 564 504 L 648 602 L 680 796 Z`;
  }
  if (family === "spirit") {
    return `M 348 796 C 332 676, 374 548, 458 496 C 478 484, 496 456, 512 448 C 528 456, 546 484, 566 496 C 650 548, 692 676, 676 796 C 616 812, 588 820, 512 820 C 436 820, 408 812, 348 796 Z`;
  }
  if (family === "dragon") {
    return `M 348 798 C 332 674, 364 552, 430 500 C 450 484, 466 456, 494 450 C 508 438, 516 424, 512 408 C 508 424, 516 438, 530 450 C 558 456, 574 484, 594 500 C 660 552, 692 674, 676 798 Z`;
  }
  if (family === "rabbit") {
    return `M 370 794 C 352 676, 386 556, 458 512 C 474 502, 486 468, 512 458 C 538 468, 550 502, 566 512 C 638 556, 672 676, 654 794 Z`;
  }
  return `M 352 794 C 334 676, 366 560, 438 510 C 466 490, 488 468, 512 458 C 536 468, 558 490, 586 510 C 658 560, 690 676, 672 794 Z`;
}

function bodyLayer(name: string, family: CharacterFamily, palette: ReturnType<typeof createTheme>["palette"], seed: number): string {
  const shoulderLift = clamp((seed % 24) - 12, -10, 10);
  const path = bodySilhouette(family, seed);
  const collarY = 620 + shoulderLift;

  return `
    <g filter="url(#sharpGlow)">
      <path d="${path}" fill="url(#metalGrad)" opacity="0.92"/>
      <path d="${path}" fill="none" stroke="${palette.glow[0]}" stroke-width="3" opacity="0.35"/>
      <path d="M 396 ${collarY} C 448 ${590 + shoulderLift}, 576 ${590 + shoulderLift}, 628 ${collarY}" fill="none" stroke="url(#accentGrad)" stroke-width="8" stroke-linecap="round" opacity="0.7"/>
      <path d="M 402 ${collarY + 26} C 462 ${678 + shoulderLift}, 562 ${678 + shoulderLift}, 622 ${collarY + 26}" fill="none" stroke="${palette.ink}" stroke-width="22" opacity="0.92"/>
      <path d="M 440 ${560 + shoulderLift} C 470 ${540 + shoulderLift}, 554 ${540 + shoulderLift}, 584 ${560 + shoulderLift}" fill="none" stroke="${palette.highlight}" stroke-width="2" opacity="0.28"/>
    </g>
  `;
}

function eyesLayer(family: CharacterFamily, palette: ReturnType<typeof createTheme>["palette"], seed: number): string {
  const eyeY = 506 + (seed % 16) - 8;
  const spread = 92 + (seed % 20) - 10;
  const blink = seed % 5;
  if (family === "mech") {
    return `
      <g filter="url(#sharpGlow)">
        <rect x="410" y="${eyeY - 16}" width="204" height="42" rx="20" fill="${palette.ink}" opacity="0.9"/>
        <circle cx="${512 - spread / 2}" cy="${eyeY}" r="18" fill="${palette.glow[0]}" opacity="0.85"/>
        <circle cx="${512 + spread / 2}" cy="${eyeY}" r="18" fill="${palette.glow[1]}" opacity="0.85"/>
        <circle cx="${512 - spread / 2}" cy="${eyeY}" r="7" fill="#ffffff" opacity="0.9"/>
        <circle cx="${512 + spread / 2}" cy="${eyeY}" r="7" fill="#ffffff" opacity="0.9"/>
      </g>
    `;
  }

  return `
    <g filter="url(#sharpGlow)">
      <ellipse cx="${512 - spread / 2}" cy="${eyeY}" rx="28" ry="${blink === 0 ? 11 : 15}" fill="${palette.glow[0]}" opacity="0.78"/>
      <ellipse cx="${512 + spread / 2}" cy="${eyeY}" rx="28" ry="${blink === 0 ? 11 : 15}" fill="${palette.glow[1]}" opacity="0.78"/>
      <ellipse cx="${512 - spread / 2}" cy="${eyeY}" rx="10" ry="${blink === 0 ? 4 : 6}" fill="#ffffff" opacity="0.94"/>
      <ellipse cx="${512 + spread / 2}" cy="${eyeY}" rx="10" ry="${blink === 0 ? 4 : 6}" fill="#ffffff" opacity="0.94"/>
    </g>
  `;
}

function headgearLayer(family: CharacterFamily, palette: ReturnType<typeof createTheme>["palette"], seed: number): string {
  const width = 260 + (seed % 50);
  const x = 512 - width / 2;
  const topY = 280 + (seed % 16) - 8;

  if (family === "dragon") {
    return `
      <g filter="url(#sharpGlow)">
        <path d="M ${x} ${topY + 52} C ${x + 30} ${topY - 8}, ${x + width - 30} ${topY - 8}, ${x + width} ${topY + 52} L ${x + width - 20} ${topY + 112} L ${x + 20} ${topY + 112} Z" fill="${palette.ink}" opacity="0.96"/>
        <path d="M ${x + 26} ${topY + 62} C ${x + 76} ${topY + 10}, ${x + width - 76} ${topY + 10}, ${x + width - 26} ${topY + 62}" fill="none" stroke="${palette.glow[0]}" stroke-width="4" opacity="0.72"/>
        <path d="M ${x + 54} ${topY - 2} L ${x + 18} ${topY - 48} L ${x + 58} ${topY - 24} Z" fill="${palette.glow[1]}" opacity="0.85"/>
        <path d="M ${x + width - 54} ${topY - 2} L ${x + width - 18} ${topY - 48} L ${x + width - 58} ${topY - 24} Z" fill="${palette.glow[2]}" opacity="0.85"/>
      </g>
    `;
  }

  if (family === "spirit") {
    return `
      <g filter="url(#sharpGlow)">
        <path d="M ${x + 16} ${topY + 58} C ${x + 42} ${topY + 8}, ${x + width - 42} ${topY + 8}, ${x + width - 16} ${topY + 58} L ${x + width - 30} ${topY + 126} L ${x + 30} ${topY + 126} Z" fill="${palette.ink}" opacity="0.88"/>
        <path d="M ${x + 38} ${topY + 66} C ${x + 64} ${topY + 22}, ${x + width - 64} ${topY + 22}, ${x + width - 38} ${topY + 66}" fill="none" stroke="${palette.glow[0]}" stroke-width="3" opacity="0.65"/>
        <circle cx="512" cy="${topY + 42}" r="20" fill="${palette.glow[1]}" opacity="0.45"/>
      </g>
    `;
  }

  return `
    <g filter="url(#sharpGlow)">
      <path d="M ${x + 20} ${topY + 54} C ${x + 46} ${topY + 6}, ${x + width - 46} ${topY + 6}, ${x + width - 20} ${topY + 54} L ${x + width - 30} ${topY + 118} L ${x + 30} ${topY + 118} Z" fill="${palette.ink}" opacity="0.96"/>
      <path d="M ${x + 48} ${topY + 63} C ${x + 78} ${topY + 24}, ${x + width - 78} ${topY + 24}, ${x + width - 48} ${topY + 63}" fill="none" stroke="${palette.glow[0]}" stroke-width="3" opacity="0.72"/>
      <path d="M ${x + width / 2 - 24} ${topY + 10} L ${x + width / 2} ${topY - 34} L ${x + width / 2 + 24} ${topY + 10} Z" fill="${palette.glow[1]}" opacity="0.85"/>
    </g>
  `;
}

function clothingLayer(family: CharacterFamily, palette: ReturnType<typeof createTheme>["palette"], seed: number): string {
  const flare = 460 + (seed % 34) - 17;
  const trim = family === "mech" ? palette.glow[1] : palette.glow[0];
  return `
    <g filter="url(#sharpGlow)">
      <path d="M 374 698 C 412 642, 460 614, 512 612 C 564 614, 612 642, 650 698 L 702 860 L 322 860 Z" fill="${palette.ink}" opacity="0.96"/>
      <path d="M 392 706 C 430 652, 472 628, 512 628 C 552 628, 594 652, 632 706" fill="none" stroke="${trim}" stroke-width="5" opacity="0.75"/>
      <path d="M 424 676 L 424 860" fill="none" stroke="${palette.highlight}" stroke-width="3" opacity="0.18"/>
      <path d="M 600 676 L 600 860" fill="none" stroke="${palette.highlight}" stroke-width="3" opacity="0.18"/>
      <rect x="470" y="${flare}" width="84" height="20" rx="10" fill="url(#accentGrad)" opacity="0.75"/>
      <path d="M 470 676 L 512 724 L 554 676" fill="none" stroke="${palette.glow[2]}" stroke-width="3" opacity="0.45"/>
    </g>
  `;
}

function accessoriesLayer(family: CharacterFamily, palette: ReturnType<typeof createTheme>["palette"], seed: number): string {
  const necklaceY = 804 + (seed % 12) - 6;
  return `
    <g filter="url(#sharpGlow)">
      <circle cx="512" cy="${necklaceY}" r="26" fill="none" stroke="${palette.glow[0]}" stroke-width="4" opacity="0.8"/>
      <circle cx="512" cy="${necklaceY}" r="7" fill="#ffffff" opacity="0.9"/>
      <path d="M 430 ${730 + (seed % 18)} C 470 ${710 + (seed % 8)}, 554 ${710 + (seed % 8)}, 594 ${730 + (seed % 18)}" fill="none" stroke="${palette.glow[1]}" stroke-width="4" stroke-linecap="round" opacity="0.7"/>
      <path d="M ${414 + (seed % 24)} ${642 + (seed % 16)} L ${444 + (seed % 24)} ${612 + (seed % 16)}" stroke="${palette.accent[0]}" stroke-width="4" stroke-linecap="round" opacity="0.72"/>
      <path d="M ${610 - (seed % 24)} ${642 + (seed % 16)} L ${580 - (seed % 24)} ${612 + (seed % 16)}" stroke="${palette.accent[2]}" stroke-width="4" stroke-linecap="round" opacity="0.72"/>
      <circle cx="${420 + (seed % 18)}" cy="${670 + (seed % 10)}" r="6" fill="${palette.glow[2]}" opacity="0.85"/>
      <circle cx="${604 - (seed % 18)}" cy="${670 + (seed % 10)}" r="6" fill="${palette.glow[0]}" opacity="0.85"/>
    </g>
  `;
}

function effectsLayer(palette: ReturnType<typeof createTheme>["palette"], seed: number): string {
  const rays = Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * Math.PI * 2;
    const length = 280 + (seed % 50);
    const x2 = 512 + Math.cos(angle) * length;
    const y2 = 512 + Math.sin(angle) * length;
    return `<line x1="512" y1="512" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${palette.glow[index % palette.glow.length]}" stroke-width="2" opacity="0.12"/>`;
  }).join("");

  const particles = Array.from({ length: 42 }, (_, index) => {
    const x = (seed * (index + 17) * 29) % 1024;
    const y = (seed * (index + 11) * 41) % 1024;
    const size = 1 + ((seed + index) % 4);
    const color = palette.accent[index % palette.accent.length];
    return `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="${0.1 + (index % 5) * 0.05}"/>`;
  }).join("");

  return `
    <g filter="url(#sharpGlow)">
      ${rays}
      ${particles}
      <ellipse cx="512" cy="516" rx="238" ry="318" fill="none" stroke="url(#accentGrad)" stroke-width="4" opacity="0.18"/>
      <ellipse cx="512" cy="516" rx="290" ry="372" fill="none" stroke="${palette.highlight}" stroke-width="1.5" opacity="0.08"/>
    </g>
  `;
}

function makeLayer(
  layer: TraitVariant["layer"],
  id: string,
  name: string,
  rarity: TraitVariant["rarity"],
  weight: number,
  families: ReadonlyArray<CharacterFamily | "universal">,
  render: TraitVariant["render"]
): TraitVariant {
  return { layer, id, name, rarity, weight, families, render };
}

export const BACKGROUND_TRAITS: TraitVariant[] = [
  makeLayer("background", "neon-grid", "Neon Grid", "common", 20, UNIVERSAL, (context) => `${sharedDefs(context)}${backgroundLayer("Neon Grid", context.seed, context.family)}`),
  makeLayer("background", "nebula-haze", "Nebula Haze", "common", 18, UNIVERSAL, (context) => `${sharedDefs(context)}${backgroundLayer("Nebula Haze", context.seed + 3, context.family)}`),
  makeLayer("background", "aurora-scan", "Aurora Scan", "uncommon", 14, UNIVERSAL, (context) => `${sharedDefs(context)}${backgroundLayer("Aurora Scan", context.seed + 7, context.family)}`),
  makeLayer("background", "quantum-vault", "Quantum Vault", "uncommon", 12, UNIVERSAL, (context) => `${sharedDefs(context)}${backgroundLayer("Quantum Vault", context.seed + 13, context.family)}`),
  makeLayer("background", "void-corridor", "Void Corridor", "rare", 8, UNIVERSAL, (context) => `${sharedDefs(context)}${backgroundLayer("Void Corridor", context.seed + 19, context.family)}`),
  makeLayer("background", "prism-orbit", "Prism Orbit", "rare", 6, UNIVERSAL, (context) => `${sharedDefs(context)}${backgroundLayer("Prism Orbit", context.seed + 23, context.family)}`),
  makeLayer("background", "singularity-bloom", "Singularity Bloom", "epic", 3, UNIVERSAL, (context) => `${sharedDefs(context)}${backgroundLayer("Singularity Bloom", context.seed + 29, context.family)}`),
  makeLayer("background", "legend-grid", "Legend Grid", "legendary", 1, UNIVERSAL, (context) => `${sharedDefs(context)}${backgroundLayer("Legend Grid", context.seed + 31, context.family)}`),
];

export const BODY_TRAITS: TraitVariant[] = [
  makeLayer("body", "humanoid-prime", "Humanoid Prime", "common", 20, ["humanoid"], (context) => `${sharedDefs(context)}${bodyLayer("Humanoid Prime", "humanoid", context.palette, context.seed)}`),
  makeLayer("body", "canine-runner", "Canine Runner", "common", 16, ["canine"], (context) => `${sharedDefs(context)}${bodyLayer("Canine Runner", "canine", context.palette, context.seed)}`),
  makeLayer("body", "feline-arc", "Feline Arc", "common", 16, ["feline"], (context) => `${sharedDefs(context)}${bodyLayer("Feline Arc", "feline", context.palette, context.seed)}`),
  makeLayer("body", "avian-wisp", "Avian Wisp", "uncommon", 12, ["avian"], (context) => `${sharedDefs(context)}${bodyLayer("Avian Wisp", "avian", context.palette, context.seed)}`),
  makeLayer("body", "mech-frame", "Mech Frame", "uncommon", 12, ["mech"], (context) => `${sharedDefs(context)}${bodyLayer("Mech Frame", "mech", context.palette, context.seed)}`),
  makeLayer("body", "spirit-veil", "Spirit Veil", "rare", 8, ["spirit"], (context) => `${sharedDefs(context)}${bodyLayer("Spirit Veil", "spirit", context.palette, context.seed)}`),
  makeLayer("body", "dragon-core", "Dragon Core", "rare", 8, ["dragon"], (context) => `${sharedDefs(context)}${bodyLayer("Dragon Core", "dragon", context.palette, context.seed)}`),
  makeLayer("body", "rabbit-synth", "Rabbit Synth", "epic", 4, ["rabbit"], (context) => `${sharedDefs(context)}${bodyLayer("Rabbit Synth", "rabbit", context.palette, context.seed)}`),
];

export const EYES_TRAITS: TraitVariant[] = [
  makeLayer("eyes", "narrow-neon", "Narrow Neon", "common", 18, UNIVERSAL, (context) => `${sharedDefs(context)}${eyesLayer(context.family, context.palette, context.seed)}`),
  makeLayer("eyes", "visor-glow", "Visor Glow", "common", 18, ["mech"], (context) => `${sharedDefs(context)}${eyesLayer("mech", context.palette, context.seed + 2)}`),
  makeLayer("eyes", "cat-lens", "Cat Lens", "uncommon", 14, ["feline"], (context) => `${sharedDefs(context)}${eyesLayer("feline", context.palette, context.seed + 4)}`),
  makeLayer("eyes", "hawk-scan", "Hawk Scan", "uncommon", 14, ["avian"], (context) => `${sharedDefs(context)}${eyesLayer("avian", context.palette, context.seed + 6)}`),
  makeLayer("eyes", "wolf-eyes", "Wolf Eyes", "rare", 10, ["canine"], (context) => `${sharedDefs(context)}${eyesLayer("canine", context.palette, context.seed + 8)}`),
  makeLayer("eyes", "soul-bloom", "Soul Bloom", "epic", 6, ["spirit", "dragon"], (context) => `${sharedDefs(context)}${eyesLayer(context.family, context.palette, context.seed + 10)}`),
];

export const HEADGEAR_TRAITS: TraitVariant[] = [
  makeLayer("headgear", "nano-cap", "Nano Cap", "common", 18, UNIVERSAL, (context) => `${sharedDefs(context)}${headgearLayer(context.family, context.palette, context.seed)}`),
  makeLayer("headgear", "holo-visor", "Holo Visor", "common", 18, UNIVERSAL, (context) => `${sharedDefs(context)}${headgearLayer(context.family, context.palette, context.seed + 2)}`),
  makeLayer("headgear", "chrome-hood", "Chrome Hood", "uncommon", 14, ["humanoid", "spirit"], (context) => `${sharedDefs(context)}${headgearLayer(context.family, context.palette, context.seed + 4)}`),
  makeLayer("headgear", "neon-crest", "Neon Crest", "rare", 10, ["avian", "dragon"], (context) => `${sharedDefs(context)}${headgearLayer(context.family, context.palette, context.seed + 6)}`),
  makeLayer("headgear", "mech-crown", "Mech Crown", "rare", 8, ["mech"], (context) => `${sharedDefs(context)}${headgearLayer(context.family, context.palette, context.seed + 8)}`),
  makeLayer("headgear", "legend-mask", "Legend Mask", "legendary", 2, UNIVERSAL, (context) => `${sharedDefs(context)}${headgearLayer(context.family, context.palette, context.seed + 10)}`),
];

export const CLOTHING_TRAITS: TraitVariant[] = [
  makeLayer("clothing", "cyber-jacket", "Cyber Jacket", "common", 18, ["humanoid", "canine", "feline", "rabbit"], (context) => `${sharedDefs(context)}${clothingLayer(context.family, context.palette, context.seed)}`),
  makeLayer("clothing", "plated-armor", "Plated Armor", "common", 16, ["mech", "dragon"], (context) => `${sharedDefs(context)}${clothingLayer(context.family, context.palette, context.seed + 2)}`),
  makeLayer("clothing", "silk-glass", "Silk Glass", "uncommon", 14, ["humanoid", "spirit"], (context) => `${sharedDefs(context)}${clothingLayer(context.family, context.palette, context.seed + 4)}`),
  makeLayer("clothing", "halo-cloak", "Halo Cloak", "rare", 10, ["spirit", "avian"], (context) => `${sharedDefs(context)}${clothingLayer(context.family, context.palette, context.seed + 6)}`),
  makeLayer("clothing", "crystal-rig", "Crystal Rig", "epic", 6, UNIVERSAL, (context) => `${sharedDefs(context)}${clothingLayer(context.family, context.palette, context.seed + 8)}`),
  makeLayer("clothing", "mythic-suit", "Mythic Suit", "legendary", 2, UNIVERSAL, (context) => `${sharedDefs(context)}${clothingLayer(context.family, context.palette, context.seed + 10)}`),
];

export const ACCESSORIES_TRAITS: TraitVariant[] = [
  makeLayer("accessories", "neck-ring", "Neck Ring", "common", 18, UNIVERSAL, (context) => `${sharedDefs(context)}${accessoriesLayer(context.family, context.palette, context.seed)}`),
  makeLayer("accessories", "data-beads", "Data Beads", "common", 18, UNIVERSAL, (context) => `${sharedDefs(context)}${accessoriesLayer(context.family, context.palette, context.seed + 2)}`),
  makeLayer("accessories", "glow-chain", "Glow Chain", "uncommon", 14, UNIVERSAL, (context) => `${sharedDefs(context)}${accessoriesLayer(context.family, context.palette, context.seed + 4)}`),
  makeLayer("accessories", "orbital-tag", "Orbital Tag", "rare", 10, UNIVERSAL, (context) => `${sharedDefs(context)}${accessoriesLayer(context.family, context.palette, context.seed + 6)}`),
  makeLayer("accessories", "spirit-drip", "Spirit Drip", "epic", 6, ["spirit", "dragon"], (context) => `${sharedDefs(context)}${accessoriesLayer(context.family, context.palette, context.seed + 8)}`),
  makeLayer("accessories", "legend-sigil", "Legend Sigil", "legendary", 2, UNIVERSAL, (context) => `${sharedDefs(context)}${accessoriesLayer(context.family, context.palette, context.seed + 10)}`),
];

export const EFFECTS_TRAITS: TraitVariant[] = [
  makeLayer("effects", "glow-rings", "Glow Rings", "common", 18, UNIVERSAL, (context) => `${sharedDefs(context)}${effectsLayer(context.palette, context.seed)}`),
  makeLayer("effects", "particle-dust", "Particle Dust", "common", 18, UNIVERSAL, (context) => `${sharedDefs(context)}${effectsLayer(context.palette, context.seed + 3)}`),
  makeLayer("effects", "streak-bloom", "Streak Bloom", "uncommon", 14, UNIVERSAL, (context) => `${sharedDefs(context)}${effectsLayer(context.palette, context.seed + 5)}`),
  makeLayer("effects", "aura-field", "Aura Field", "rare", 10, UNIVERSAL, (context) => `${sharedDefs(context)}${effectsLayer(context.palette, context.seed + 7)}`),
  makeLayer("effects", "quantum-flare", "Quantum Flare", "epic", 6, UNIVERSAL, (context) => `${sharedDefs(context)}${effectsLayer(context.palette, context.seed + 11)}`),
  makeLayer("effects", "legend-burst", "Legend Burst", "legendary", 2, UNIVERSAL, (context) => `${sharedDefs(context)}${effectsLayer(context.palette, context.seed + 13)}`),
];

export const COLLECTION_NAME = "Vessel Cyber Sentients";
export const COLLECTION_DESCRIPTION =
  "Deterministic layer-composed compressed NFT collection for Vessel, built from premium cyberpunk character assets.";

export function getThemeForSeed(seed: number) {
  return createTheme(seed);
}

export function getRarityTierScore(tier: TraitVariant["rarity"]): number {
  switch (tier) {
    case "common":
      return 1;
    case "uncommon":
      return 2;
    case "rare":
      return 3;
    case "epic":
      return 4;
    case "legendary":
      return 5;
  }
}

export function getBodyFamilyHint(bodyTrait: TraitVariant): CharacterFamily {
  return (bodyTrait.families?.[0] as CharacterFamily) ?? "humanoid";
}

export function isCompatible(trait: TraitVariant, family: CharacterFamily): boolean {
  if (!trait.families || trait.families[0] === "universal") {
    return true;
  }
  return trait.families.includes(family);
}
