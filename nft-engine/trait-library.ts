import path from "node:path";

export type RarityTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type LayerName =
  | "background"
  | "body"
  | "clothing"
  | "eyes"
  | "hair"
  | "headgear"
  | "accessories"
  | "effects";

export type CharacterFamily =
  | "humanoid"
  | "canine"
  | "feline"
  | "avian"
  | "mech"
  | "spirit"
  | "dragon"
  | "rabbit";

export interface TraitDefinition {
  id: string;
  name: string;
  layer: LayerName;
  rarity: RarityTier;
  weight: number;
  family?: CharacterFamily;
  families?: ReadonlyArray<CharacterFamily | "universal">;
  svg: string;
}

const CANVAS = 1024;

function wrapSvg(content: string, background = false): string {
  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CANVAS} ${CANVAS}" width="${CANVAS}" height="${CANVAS}">
      <defs>
        <linearGradient id="metalBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#c8f4ff"/>
          <stop offset="45%" stop-color="#76c8ff"/>
          <stop offset="100%" stop-color="#0b2f5a"/>
        </linearGradient>
        <linearGradient id="metalRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffd6cb"/>
          <stop offset="45%" stop-color="#ff8f7f"/>
          <stop offset="100%" stop-color="#5a1b21"/>
        </linearGradient>
        <linearGradient id="metalPurple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f8d9ff"/>
          <stop offset="45%" stop-color="#bf7dff"/>
          <stop offset="100%" stop-color="#2f1c5f"/>
        </linearGradient>
        <linearGradient id="clothDark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2f3f63"/>
          <stop offset="100%" stop-color="#0f1524"/>
        </linearGradient>
        <linearGradient id="clothGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#fff4bf"/>
          <stop offset="50%" stop-color="#f8c95f"/>
          <stop offset="100%" stop-color="#9a5e11"/>
        </linearGradient>
        <linearGradient id="glowCyan" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#85ffff"/>
          <stop offset="100%" stop-color="#00c9ff"/>
        </linearGradient>
        <linearGradient id="glowRose" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#ff8ea0"/>
          <stop offset="100%" stop-color="#ff4d6d"/>
        </linearGradient>
        <linearGradient id="glowLime" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#cfff8b"/>
          <stop offset="100%" stop-color="#64ff64"/>
        </linearGradient>
        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="heavyGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="16" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <filter id="blurSmall">
          <feGaussianBlur stdDeviation="3"/>
        </filter>
        <radialGradient id="eyeGradCyan" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="20%" stop-color="#85ffff"/>
          <stop offset="60%" stop-color="#00c9ff"/>
          <stop offset="100%" stop-color="#0066aa"/>
        </radialGradient>
        <radialGradient id="eyeGradRose" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="20%" stop-color="#ff8ea0"/>
          <stop offset="60%" stop-color="#ff4d6d"/>
          <stop offset="100%" stop-color="#aa1133"/>
        </radialGradient>
        <radialGradient id="eyeGradPurple" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="20%" stop-color="#d4a5ff"/>
          <stop offset="60%" stop-color="#9b59b6"/>
          <stop offset="100%" stop-color="#5b2c6f"/>
        </radialGradient>
        <radialGradient id="eyeGradGold" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="20%" stop-color="#ffd700"/>
          <stop offset="60%" stop-color="#f39c12"/>
          <stop offset="100%" stop-color="#a67c00"/>
        </radialGradient>
        <radialGradient id="eyeGradEmerald" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="20%" stop-color="#6effb5"/>
          <stop offset="60%" stop-color="#00c853"/>
          <stop offset="100%" stop-color="#006622"/>
        </radialGradient>
        <radialGradient id="skinGrad" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffe8d6"/>
          <stop offset="50%" stop-color="#f5c5a3"/>
          <stop offset="100%" stop-color="#d4a07a"/>
        </radialGradient>
        <radialGradient id="skinCool" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#e8d8f0"/>
          <stop offset="50%" stop-color="#c8a8d8"/>
          <stop offset="100%" stop-color="#a080b8"/>
        </radialGradient>
        <radialGradient id="skinWarm" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#ffe0c0"/>
          <stop offset="50%" stop-color="#f0b890"/>
          <stop offset="100%" stop-color="#d09060"/>
        </radialGradient>
        <radialGradient id="bgGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="hairGradBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4fc3f7"/>
          <stop offset="50%" stop-color="#0288d1"/>
          <stop offset="100%" stop-color="#01579b"/>
        </linearGradient>
        <linearGradient id="hairGradPink" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f8bbd0"/>
          <stop offset="50%" stop-color="#e91e63"/>
          <stop offset="100%" stop-color="#880e4f"/>
        </linearGradient>
        <linearGradient id="hairGradPurple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ce93d8"/>
          <stop offset="50%" stop-color="#9c27b0"/>
          <stop offset="100%" stop-color="#4a148c"/>
        </linearGradient>
        <linearGradient id="hairGradSilver" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ffffff"/>
          <stop offset="50%" stop-color="#b0bec5"/>
          <stop offset="100%" stop-color="#546e7a"/>
        </linearGradient>
        <linearGradient id="hairGradRed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff8a80"/>
          <stop offset="50%" stop-color="#d32f2f"/>
          <stop offset="100%" stop-color="#b71c1c"/>
        </linearGradient>
        <linearGradient id="hairGradGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fff9c4"/>
          <stop offset="50%" stop-color="#fdd835"/>
          <stop offset="100%" stop-color="#f57f17"/>
        </linearGradient>
        <linearGradient id="hairGradGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#b9f6ca"/>
          <stop offset="50%" stop-color="#00c853"/>
          <stop offset="100%" stop-color="#1b5e20"/>
        </linearGradient>
      </defs>
      ${background ? "" : '<rect width="1024" height="1024" fill="transparent"/>'}
      ${content}
    </svg>
  `;
}

const BACKGROUNDS: TraitDefinition[] = [
  {
    id: "neon-alley",
    name: "Neon Alley",
    layer: "background",
    rarity: "common",
    weight: 24,
    svg: wrapSvg(`
      <rect width="1024" height="1024" fill="#0a0e1a"/>
      <rect x="0" y="0" width="280" height="1024" fill="#0f1628"/>
      <rect x="744" y="0" width="280" height="1024" fill="#0f1628"/>
      <rect x="280" y="200" width="464" height="824" fill="#0d1220"/>
      <rect x="300" y="220" width="180" height="240" rx="4" fill="#0ec2ff" opacity="0.15"/>
      <rect x="544" y="220" width="180" height="240" rx="4" fill="#ff4d6d" opacity="0.15"/>
      <rect x="300" y="480" width="180" height="200" rx="4" fill="#ff4d6d" opacity="0.1"/>
      <rect x="544" y="480" width="180" height="200" rx="4" fill="#0ec2ff" opacity="0.1"/>
      <line x1="0" y1="780" x2="1024" y2="780" stroke="#0ec2ff" stroke-width="2" opacity="0.3"/>
      <line x1="0" y1="820" x2="1024" y2="820" stroke="#ff4d6d" stroke-width="1" opacity="0.2"/>
      <circle cx="512" cy="400" r="280" fill="url(#bgGlow)"/>
      <rect x="60" y="100" width="8" height="180" fill="#1a2240"/>
      <circle cx="64" cy="90" r="14" fill="#0ec2ff" opacity="0.6" filter="url(#softGlow)"/>
      <rect x="956" y="150" width="8" height="160" fill="#1a2240"/>
      <circle cx="960" cy="140" r="12" fill="#ff4d6d" opacity="0.5" filter="url(#softGlow)"/>
    `, true),
  },
  {
    id: "orbital-hangar",
    name: "Orbital Hangar",
    layer: "background",
    rarity: "common",
    weight: 22,
    svg: wrapSvg(`
      <rect width="1024" height="1024" fill="#0e1118"/>
      <ellipse cx="512" cy="480" rx="440" ry="350" fill="#141c2c"/>
      <ellipse cx="512" cy="480" rx="360" ry="270" fill="#0c1320"/>
      <rect x="200" y="660" width="624" height="200" rx="20" fill="#162030"/>
      <rect x="220" y="690" width="584" height="30" fill="#2a3f5e"/>
      <rect x="220" y="740" width="584" height="14" fill="#0ec2ff" opacity="0.3"/>
      <line x1="160" y1="480" x2="864" y2="480" stroke="#8bcfff" stroke-width="1" opacity="0.15"/>
      <line x1="200" y1="540" x2="824" y2="540" stroke="#8bcfff" stroke-width="1" opacity="0.15"/>
      <circle cx="512" cy="300" r="6" fill="#ffffff" opacity="0.6"/>
      <circle cx="380" cy="250" r="4" fill="#ffffff" opacity="0.4"/>
      <circle cx="640" cy="220" r="5" fill="#ffffff" opacity="0.5"/>
      <circle cx="300" cy="320" r="3" fill="#ffffff" opacity="0.3"/>
      <circle cx="720" cy="280" r="4" fill="#ffffff" opacity="0.4"/>
      <circle cx="512" cy="400" r="260" fill="url(#bgGlow)"/>
    `, true),
  },
  {
    id: "crystal-cavern",
    name: "Crystal Cavern",
    layer: "background",
    rarity: "uncommon",
    weight: 16,
    svg: wrapSvg(`
      <rect width="1024" height="1024" fill="#0e0820"/>
      <polygon points="0,1024 0,500 200,600 360,1024" fill="#1a1030"/>
      <polygon points="1024,1024 1024,500 824,600 664,1024" fill="#1a1030"/>
      <polygon points="230,180 340,420 160,500" fill="#8f6bff" opacity="0.35"/>
      <polygon points="794,160 910,410 730,500" fill="#8f6bff" opacity="0.35"/>
      <polygon points="470,100 630,380 430,430" fill="#c4a2ff" opacity="0.45"/>
      <polygon points="350,200 420,350 300,400" fill="#a78bfa" opacity="0.3"/>
      <polygon points="674,180 740,340 620,390" fill="#a78bfa" opacity="0.3"/>
      <circle cx="512" cy="520" r="280" fill="#8f6bff" opacity="0.08"/>
      <line x1="250" y1="780" x2="774" y2="780" stroke="#dcbfff" stroke-width="2" opacity="0.25"/>
      <circle cx="400" cy="300" r="4" fill="#d4b5ff" opacity="0.6" filter="url(#softGlow)"/>
      <circle cx="620" cy="260" r="3" fill="#d4b5ff" opacity="0.5" filter="url(#softGlow)"/>
      <circle cx="512" cy="200" r="5" fill="#e8d0ff" opacity="0.7" filter="url(#softGlow)"/>
    `, true),
  },
  {
    id: "ruined-temple",
    name: "Ruined Temple",
    layer: "background",
    rarity: "uncommon",
    weight: 14,
    svg: wrapSvg(`
      <rect width="1024" height="1024" fill="#16120e"/>
      <rect x="160" y="220" width="704" height="520" fill="#242018"/>
      <rect x="240" y="160" width="544" height="80" fill="#332d22"/>
      <rect x="220" y="300" width="90" height="340" fill="#3a3228"/>
      <rect x="714" y="300" width="90" height="340" fill="#3a3228"/>
      <polygon points="390,740 634,740 690,1024 334,1024" fill="#2a241c"/>
      <circle cx="512" cy="470" r="160" fill="#c29c68" opacity="0.08"/>
      <line x1="230" y1="420" x2="794" y2="420" stroke="#c29c68" stroke-width="1" opacity="0.2"/>
      <circle cx="512" cy="300" r="4" fill="#ffd08a" opacity="0.5" filter="url(#softGlow)"/>
      <circle cx="400" cy="350" r="3" fill="#ffd08a" opacity="0.4" filter="url(#softGlow)"/>
      <circle cx="624" cy="350" r="3" fill="#ffd08a" opacity="0.4" filter="url(#softGlow)"/>
    `, true),
  },
  {
    id: "data-vault",
    name: "Data Vault",
    layer: "background",
    rarity: "rare",
    weight: 10,
    svg: wrapSvg(`
      <rect width="1024" height="1024" fill="#050e1a"/>
      <rect x="108" y="108" width="808" height="808" rx="48" fill="#0c1e34"/>
      <rect x="168" y="168" width="688" height="688" rx="32" fill="#081526"/>
      <circle cx="512" cy="512" r="230" fill="none" stroke="#2ed4ff" stroke-width="4" opacity="0.4"/>
      <circle cx="512" cy="512" r="140" fill="none" stroke="#2ed4ff" stroke-width="2" opacity="0.3"/>
      <circle cx="512" cy="512" r="60" fill="#2ed4ff" opacity="0.08"/>
      <line x1="512" y1="168" x2="512" y2="856" stroke="#2ed4ff" stroke-width="1" opacity="0.25"/>
      <line x1="168" y1="512" x2="856" y2="512" stroke="#2ed4ff" stroke-width="1" opacity="0.25"/>
      <rect x="462" y="462" width="100" height="100" rx="8" fill="#2ed4ff" opacity="0.12"/>
      <circle cx="300" cy="300" r="3" fill="#2ed4ff" opacity="0.5" filter="url(#softGlow)"/>
      <circle cx="724" cy="300" r="3" fill="#2ed4ff" opacity="0.5" filter="url(#softGlow)"/>
      <circle cx="300" cy="724" r="3" fill="#2ed4ff" opacity="0.5" filter="url(#softGlow)"/>
      <circle cx="724" cy="724" r="3" fill="#2ed4ff" opacity="0.5" filter="url(#softGlow)"/>
    `, true),
  },
  {
    id: "storm-plaza",
    name: "Storm Plaza",
    layer: "background",
    rarity: "rare",
    weight: 8,
    svg: wrapSvg(`
      <rect width="1024" height="1024" fill="#181e2a"/>
      <rect x="0" y="760" width="1024" height="264" fill="#0e141e"/>
      <polygon points="100,760 200,400 300,760" fill="#283548"/>
      <polygon points="724,760 824,360 924,760" fill="#283548"/>
      <polyline points="200,230 290,400 230,400 340,620" fill="none" stroke="#b9dcff" stroke-width="4" opacity="0.6"/>
      <polyline points="780,180 710,370 780,370 670,620" fill="none" stroke="#b9dcff" stroke-width="4" opacity="0.6"/>
      <circle cx="512" cy="350" r="220" fill="#9bc9ff" opacity="0.06"/>
      <line x1="0" y1="200" x2="1024" y2="200" stroke="#ffffff" stroke-width="1" opacity="0.08"/>
      <line x1="0" y1="280" x2="1024" y2="280" stroke="#ffffff" stroke-width="1" opacity="0.05"/>
    `, true),
  },
  {
    id: "desert-monolith",
    name: "Desert Monolith",
    layer: "background",
    rarity: "epic",
    weight: 4,
    svg: wrapSvg(`
      <rect width="1024" height="1024" fill="#2a1c13"/>
      <rect x="0" y="660" width="1024" height="364" fill="#4a3222"/>
      <polygon points="400,160 624,160 670,780 354,780" fill="#1c1611"/>
      <polygon points="200,660 320,460 370,660" fill="#5f4330"/>
      <polygon points="720,660 824,450 880,660" fill="#5f4330"/>
      <circle cx="512" cy="280" r="160" fill="#ffbe73" opacity="0.2"/>
      <circle cx="512" cy="280" r="80" fill="#ffd699" opacity="0.15"/>
      <line x1="100" y1="760" x2="924" y2="760" stroke="#dca36f" stroke-width="2" opacity="0.3"/>
      <circle cx="350" cy="500" r="3" fill="#ffd699" opacity="0.4" filter="url(#softGlow)"/>
      <circle cx="674" cy="480" r="3" fill="#ffd699" opacity="0.4" filter="url(#softGlow)"/>
    `, true),
  },
  {
    id: "arctic-station",
    name: "Arctic Station",
    layer: "background",
    rarity: "legendary",
    weight: 2,
    svg: wrapSvg(`
      <rect width="1024" height="1024" fill="#061728"/>
      <rect x="0" y="680" width="1024" height="344" fill="#dcefff"/>
      <rect x="150" y="320" width="724" height="280" rx="32" fill="#2a4460"/>
      <rect x="200" y="370" width="624" height="50" fill="#89c9ff" opacity="0.5"/>
      <rect x="200" y="440" width="624" height="20" fill="#b8e2ff" opacity="0.6"/>
      <circle cx="512" cy="200" r="130" fill="#9ad8ff" opacity="0.15"/>
      <line x1="120" y1="740" x2="904" y2="740" stroke="#8ac8ff" stroke-width="3" opacity="0.4"/>
      <circle cx="300" cy="150" r="4" fill="#ffffff" opacity="0.6"/>
      <circle cx="512" cy="100" r="5" fill="#ffffff" opacity="0.7"/>
      <circle cx="724" cy="130" r="3" fill="#ffffff" opacity="0.5"/>
      <circle cx="400" cy="180" r="3" fill="#ffffff" opacity="0.4"/>
      <circle cx="624" cy="160" r="4" fill="#ffffff" opacity="0.5"/>
    `, true),
  },
];

const BODIES: TraitDefinition[] = [
  {
    id: "humanoid-prime",
    name: "Humanoid Prime",
    layer: "body",
    rarity: "common",
    weight: 20,
    family: "humanoid",
    families: ["humanoid"],
    svg: wrapSvg(`
      <path d="M512 380 C460 380 420 420 410 480 C400 540 410 580 430 620 C440 640 460 660 512 660 C564 660 584 640 594 620 C614 580 624 540 614 480 C604 420 564 380 512 380 Z" fill="url(#skinGrad)" opacity="0.95"/>
      <path d="M430 520 C455 460 485 425 512 420 C539 425 569 460 594 520" fill="none" stroke="#f5d0b0" stroke-width="6" opacity="0.4"/>
      <path d="M370 620 C380 680 400 780 420 850 L604 850 C624 780 644 680 654 620 C620 640 580 660 512 660 C444 660 404 640 370 620 Z" fill="url(#metalBlue)" opacity="0.9"/>
      <rect x="440" y="680" width="144" height="100" rx="20" fill="#0f2f52" opacity="0.8"/>
      <circle cx="512" cy="730" r="24" fill="#71dcff" opacity="0.7" filter="url(#softGlow)"/>
      <path d="M370 620 C350 640 340 700 350 760 C360 800 380 830 400 850" fill="none" stroke="#5aa0d0" stroke-width="8" opacity="0.6" stroke-linecap="round"/>
      <path d="M654 620 C674 640 684 700 674 760 C664 800 644 830 624 850" fill="none" stroke="#5aa0d0" stroke-width="8" opacity="0.6" stroke-linecap="round"/>
    `),
  },
  {
    id: "canine-runner",
    name: "Canine Runner",
    layer: "body",
    rarity: "common",
    weight: 18,
    family: "canine",
    families: ["canine"],
    svg: wrapSvg(`
      <path d="M340 850 C370 665 440 530 505 500 C580 520 654 655 706 850 Z" fill="url(#metalBlue)" opacity="0.94"/>
      <path d="M380 560 C430 520 460 470 506 460 C560 470 605 520 650 560" fill="none" stroke="#b7efff" stroke-width="7" opacity="0.55"/>
      <ellipse cx="500" cy="702" rx="48" ry="62" fill="#16395d" opacity="0.82"/>
      <ellipse cx="575" cy="706" rx="42" ry="52" fill="#16395d" opacity="0.82"/>
    `),
  },
  {
    id: "feline-arc",
    name: "Feline Arc",
    layer: "body",
    rarity: "common",
    weight: 18,
    family: "feline",
    families: ["feline"],
    svg: wrapSvg(`
      <path d="M356 852 C360 650 430 520 512 482 C594 520 664 650 668 852 Z" fill="url(#metalPurple)" opacity="0.92"/>
      <path d="M408 560 C460 500 480 455 512 446 C544 455 564 500 616 560" fill="none" stroke="#ecd9ff" stroke-width="7" opacity="0.5"/>
      <path d="M430 760 C462 700 562 700 594 760" fill="none" stroke="#d39dff" stroke-width="9" opacity="0.55"/>
      <ellipse cx="512" cy="700" rx="54" ry="56" fill="#351f5b" opacity="0.8"/>
    `),
  },
  {
    id: "avian-wisp",
    name: "Avian Wisp",
    layer: "body",
    rarity: "uncommon",
    weight: 14,
    family: "avian",
    families: ["avian"],
    svg: wrapSvg(`
      <path d="M370 850 C382 670 432 540 512 500 C592 540 642 670 654 850 Z" fill="url(#metalBlue)" opacity="0.9"/>
      <path d="M512 470 L560 520 L512 565 L464 520 Z" fill="#9feaff" opacity="0.75"/>
      <path d="M390 640 C442 620 470 574 512 560 C554 574 582 620 634 640" fill="none" stroke="#d7f8ff" stroke-width="7" opacity="0.5"/>
      <polygon points="512,620 548,760 512,820 476,760" fill="#193755" opacity="0.82"/>
    `),
  },
  {
    id: "mech-frame",
    name: "Mech Frame",
    layer: "body",
    rarity: "uncommon",
    weight: 12,
    family: "mech",
    families: ["mech"],
    svg: wrapSvg(`
      <rect x="350" y="520" width="324" height="330" rx="18" fill="url(#metalBlue)" opacity="0.95"/>
      <rect x="400" y="460" width="224" height="90" rx="12" fill="#a9edff" opacity="0.68"/>
      <rect x="382" y="620" width="260" height="42" fill="#143358" opacity="0.86"/>
      <rect x="382" y="686" width="260" height="42" fill="#143358" opacity="0.86"/>
      <rect x="470" y="760" width="84" height="62" rx="8" fill="#122e4f" opacity="0.9"/>
      <circle cx="430" cy="798" r="22" fill="#93e3ff" opacity="0.76"/>
      <circle cx="594" cy="798" r="22" fill="#93e3ff" opacity="0.76"/>
    `),
  },
  {
    id: "spirit-veil",
    name: "Spirit Veil",
    layer: "body",
    rarity: "rare",
    weight: 8,
    family: "spirit",
    families: ["spirit"],
    svg: wrapSvg(`
      <path d="M336 850 C354 648 430 520 512 476 C594 520 670 648 688 850 C612 875 412 875 336 850 Z" fill="url(#metalPurple)" opacity="0.82"/>
      <path d="M390 760 C452 742 572 742 634 760" stroke="#ffdfff" stroke-width="6" opacity="0.65" fill="none"/>
      <ellipse cx="512" cy="690" rx="120" ry="158" fill="#f3c8ff" opacity="0.18" filter="url(#softGlow)"/>
      <circle cx="512" cy="612" r="40" fill="#f4daff" opacity="0.55"/>
    `),
  },
  {
    id: "dragon-core",
    name: "Dragon Core",
    layer: "body",
    rarity: "rare",
    weight: 6,
    family: "dragon",
    families: ["dragon"],
    svg: wrapSvg(`
      <path d="M332 850 C356 638 430 522 512 482 C594 522 668 638 692 850 Z" fill="url(#metalRed)" opacity="0.93"/>
      <polygon points="512,468 560,530 512,592 464,530" fill="#ffd8c4" opacity="0.68"/>
      <path d="M388 748 L448 678 L476 738 L420 804 Z" fill="#7a2b2f" opacity="0.78"/>
      <path d="M636 748 L576 678 L548 738 L604 804 Z" fill="#7a2b2f" opacity="0.78"/>
      <path d="M430 620 C470 596 554 596 594 620" fill="none" stroke="#ffb08a" stroke-width="8" opacity="0.55"/>
    `),
  },
  {
    id: "rabbit-synth",
    name: "Rabbit Synth",
    layer: "body",
    rarity: "epic",
    weight: 4,
    family: "rabbit",
    families: ["rabbit"],
    svg: wrapSvg(`
      <path d="M366 850 C370 664 432 542 512 500 C592 542 654 664 658 850 Z" fill="url(#metalBlue)" opacity="0.9"/>
      <rect x="474" y="392" width="24" height="140" rx="12" fill="#aaf1ff" opacity="0.74"/>
      <rect x="526" y="392" width="24" height="140" rx="12" fill="#aaf1ff" opacity="0.74"/>
      <rect x="442" y="620" width="140" height="150" rx="26" fill="#13335a" opacity="0.84"/>
      <circle cx="512" cy="698" r="30" fill="#8ce6ff" opacity="0.78"/>
    `),
  },
];

const EYES: TraitDefinition[] = [
  {
    id: "anime-cyan",
    name: "Cyan Gaze",
    layer: "eyes",
    rarity: "common",
    weight: 22,
    families: ["humanoid", "feline", "spirit", "rabbit"],
    svg: wrapSvg(`
      <ellipse cx="456" cy="516" rx="32" ry="22" fill="url(#eyeGradCyan)" opacity="0.95"/>
      <ellipse cx="568" cy="516" rx="32" ry="22" fill="url(#eyeGradCyan)" opacity="0.95"/>
      <ellipse cx="456" cy="516" rx="18" ry="12" fill="#000000" opacity="0.3"/>
      <ellipse cx="568" cy="516" rx="18" ry="12" fill="#000000" opacity="0.3"/>
      <circle cx="446" cy="508" r="6" fill="#ffffff" opacity="0.9"/>
      <circle cx="558" cy="508" r="6" fill="#ffffff" opacity="0.9"/>
      <circle cx="464" cy="522" r="3" fill="#ffffff" opacity="0.5"/>
      <circle cx="576" cy="522" r="3" fill="#ffffff" opacity="0.5"/>
      <path d="M424 516 C440 490 472 490 488 516" stroke="#1a1a2e" stroke-width="4" fill="none" opacity="0.7" stroke-linecap="round"/>
      <path d="M536 516 C552 490 584 490 600 516" stroke="#1a1a2e" stroke-width="4" fill="none" opacity="0.7" stroke-linecap="round"/>
    `),
  },
  {
    id: "anime-rose",
    name: "Rose Gaze",
    layer: "eyes",
    rarity: "common",
    weight: 18,
    families: ["humanoid", "feline", "spirit", "rabbit"],
    svg: wrapSvg(`
      <ellipse cx="456" cy="516" rx="32" ry="22" fill="url(#eyeGradRose)" opacity="0.95"/>
      <ellipse cx="568" cy="516" rx="32" ry="22" fill="url(#eyeGradRose)" opacity="0.95"/>
      <ellipse cx="456" cy="516" rx="18" ry="12" fill="#000000" opacity="0.3"/>
      <ellipse cx="568" cy="516" rx="18" ry="12" fill="#000000" opacity="0.3"/>
      <circle cx="446" cy="508" r="6" fill="#ffffff" opacity="0.9"/>
      <circle cx="558" cy="508" r="6" fill="#ffffff" opacity="0.9"/>
      <circle cx="464" cy="522" r="3" fill="#ffffff" opacity="0.5"/>
      <circle cx="576" cy="522" r="3" fill="#ffffff" opacity="0.5"/>
      <path d="M424 516 C440 490 472 490 488 516" stroke="#1a1a2e" stroke-width="4" fill="none" opacity="0.7" stroke-linecap="round"/>
      <path d="M536 516 C552 490 584 490 600 516" stroke="#1a1a2e" stroke-width="4" fill="none" opacity="0.7" stroke-linecap="round"/>
    `),
  },
  {
    id: "anime-purple",
    name: "Purple Gaze",
    layer: "eyes",
    rarity: "uncommon",
    weight: 14,
    families: ["humanoid", "feline", "spirit", "rabbit"],
    svg: wrapSvg(`
      <ellipse cx="456" cy="516" rx="32" ry="22" fill="url(#eyeGradPurple)" opacity="0.95"/>
      <ellipse cx="568" cy="516" rx="32" ry="22" fill="url(#eyeGradPurple)" opacity="0.95"/>
      <ellipse cx="456" cy="516" rx="18" ry="12" fill="#000000" opacity="0.3"/>
      <ellipse cx="568" cy="516" rx="18" ry="12" fill="#000000" opacity="0.3"/>
      <circle cx="446" cy="508" r="6" fill="#ffffff" opacity="0.9"/>
      <circle cx="558" cy="508" r="6" fill="#ffffff" opacity="0.9"/>
      <circle cx="464" cy="522" r="3" fill="#ffffff" opacity="0.5"/>
      <circle cx="576" cy="522" r="3" fill="#ffffff" opacity="0.5"/>
      <path d="M424 516 C440 490 472 490 488 516" stroke="#1a1a2e" stroke-width="4" fill="none" opacity="0.7" stroke-linecap="round"/>
      <path d="M536 516 C552 490 584 490 600 516" stroke="#1a1a2e" stroke-width="4" fill="none" opacity="0.7" stroke-linecap="round"/>
    `),
  },
  {
    id: "anime-gold",
    name: "Gold Gaze",
    layer: "eyes",
    rarity: "rare",
    weight: 10,
    families: ["humanoid", "feline", "dragon", "spirit"],
    svg: wrapSvg(`
      <ellipse cx="456" cy="516" rx="32" ry="22" fill="url(#eyeGradGold)" opacity="0.95"/>
      <ellipse cx="568" cy="516" rx="32" ry="22" fill="url(#eyeGradGold)" opacity="0.95"/>
      <ellipse cx="456" cy="516" rx="18" ry="12" fill="#000000" opacity="0.3"/>
      <ellipse cx="568" cy="516" rx="18" ry="12" fill="#000000" opacity="0.3"/>
      <circle cx="446" cy="508" r="6" fill="#ffffff" opacity="0.9"/>
      <circle cx="558" cy="508" r="6" fill="#ffffff" opacity="0.9"/>
      <circle cx="464" cy="522" r="3" fill="#ffffff" opacity="0.5"/>
      <circle cx="576" cy="522" r="3" fill="#ffffff" opacity="0.5"/>
      <path d="M424 516 C440 490 472 490 488 516" stroke="#1a1a2e" stroke-width="4" fill="none" opacity="0.7" stroke-linecap="round"/>
      <path d="M536 516 C552 490 584 490 600 516" stroke="#1a1a2e" stroke-width="4" fill="none" opacity="0.7" stroke-linecap="round"/>
    `),
  },
  {
    id: "anime-emerald",
    name: "Emerald Gaze",
    layer: "eyes",
    rarity: "epic",
    weight: 6,
    families: ["humanoid", "feline", "spirit", "rabbit"],
    svg: wrapSvg(`
      <ellipse cx="456" cy="516" rx="32" ry="22" fill="url(#eyeGradEmerald)" opacity="0.95"/>
      <ellipse cx="568" cy="516" rx="32" ry="22" fill="url(#eyeGradEmerald)" opacity="0.95"/>
      <ellipse cx="456" cy="516" rx="18" ry="12" fill="#000000" opacity="0.3"/>
      <ellipse cx="568" cy="516" rx="18" ry="12" fill="#000000" opacity="0.3"/>
      <circle cx="446" cy="508" r="6" fill="#ffffff" opacity="0.9"/>
      <circle cx="558" cy="508" r="6" fill="#ffffff" opacity="0.9"/>
      <circle cx="464" cy="522" r="3" fill="#ffffff" opacity="0.5"/>
      <circle cx="576" cy="522" r="3" fill="#ffffff" opacity="0.5"/>
      <path d="M424 516 C440 490 472 490 488 516" stroke="#1a1a2e" stroke-width="4" fill="none" opacity="0.7" stroke-linecap="round"/>
      <path d="M536 516 C552 490 584 490 600 516" stroke="#1a1a2e" stroke-width="4" fill="none" opacity="0.7" stroke-linecap="round"/>
    `),
  },
  {
    id: "dual-slit",
    name: "Dual Slit",
    layer: "eyes",
    rarity: "common",
    weight: 18,
    families: ["mech", "canine", "dragon"],
    svg: wrapSvg(`
      <ellipse cx="456" cy="516" rx="30" ry="16" fill="url(#glowCyan)" opacity="0.95" filter="url(#softGlow)"/>
      <ellipse cx="568" cy="516" rx="30" ry="16" fill="url(#glowCyan)" opacity="0.95" filter="url(#softGlow)"/>
      <ellipse cx="456" cy="516" rx="11" ry="6" fill="#ffffff" opacity="0.88"/>
      <ellipse cx="568" cy="516" rx="11" ry="6" fill="#ffffff" opacity="0.88"/>
    `),
  },
  {
    id: "tri-visor",
    name: "Tri Visor",
    layer: "eyes",
    rarity: "common",
    weight: 14,
    families: ["mech", "canine", "dragon"],
    svg: wrapSvg(`
      <rect x="410" y="494" width="204" height="42" rx="18" fill="#12243d" opacity="0.9"/>
      <circle cx="450" cy="515" r="12" fill="url(#glowRose)" opacity="0.9" filter="url(#softGlow)"/>
      <circle cx="512" cy="515" r="12" fill="url(#glowRose)" opacity="0.9" filter="url(#softGlow)"/>
      <circle cx="574" cy="515" r="12" fill="url(#glowRose)" opacity="0.9" filter="url(#softGlow)"/>
    `),
  },
  {
    id: "mono-orb",
    name: "Mono Orb",
    layer: "eyes",
    rarity: "uncommon",
    weight: 10,
    families: ["mech", "avian", "dragon"],
    svg: wrapSvg(`
      <circle cx="512" cy="515" r="42" fill="#0e1f35" opacity="0.9"/>
      <circle cx="512" cy="515" r="26" fill="url(#glowLime)" opacity="0.94" filter="url(#softGlow)"/>
      <circle cx="512" cy="515" r="8" fill="#ffffff" opacity="0.9"/>
    `),
  },
  {
    id: "runic-ring",
    name: "Runic Ring",
    layer: "eyes",
    rarity: "rare",
    weight: 8,
    families: ["spirit", "humanoid", "feline"],
    svg: wrapSvg(`
      <circle cx="512" cy="515" r="78" fill="none" stroke="#d7a5ff" stroke-width="6" opacity="0.7" filter="url(#softGlow)"/>
      <circle cx="456" cy="515" r="18" fill="url(#glowCyan)" opacity="0.88"/>
      <circle cx="568" cy="515" r="18" fill="url(#glowCyan)" opacity="0.88"/>
      <path d="M435 465 L455 448 L475 465" stroke="#eecfff" stroke-width="4" fill="none" opacity="0.78"/>
      <path d="M549 465 L569 448 L589 465" stroke="#eecfff" stroke-width="4" fill="none" opacity="0.78"/>
    `),
  },
  {
    id: "predator-tilt",
    name: "Predator Tilt",
    layer: "eyes",
    rarity: "uncommon",
    weight: 10,
    families: ["canine", "feline", "dragon"],
    svg: wrapSvg(`
      <path d="M420 516 C445 486 480 494 492 516 C480 538 445 546 420 516 Z" fill="url(#glowLime)" opacity="0.86" filter="url(#softGlow)"/>
      <path d="M604 516 C579 486 544 494 532 516 C544 538 579 546 604 516 Z" fill="url(#glowLime)" opacity="0.86" filter="url(#softGlow)"/>
      <line x1="466" y1="500" x2="466" y2="534" stroke="#ffffff" stroke-width="4" opacity="0.75"/>
      <line x1="558" y1="500" x2="558" y2="534" stroke="#ffffff" stroke-width="4" opacity="0.75"/>
    `),
  },
  {
    id: "mech-grid",
    name: "Mech Grid",
    layer: "eyes",
    rarity: "epic",
    weight: 6,
    families: ["mech", "humanoid"],
    svg: wrapSvg(`
      <rect x="404" y="488" width="216" height="54" rx="8" fill="#162948" opacity="0.9"/>
      <line x1="424" y1="488" x2="424" y2="542" stroke="#9de3ff" stroke-width="2" opacity="0.55"/>
      <line x1="460" y1="488" x2="460" y2="542" stroke="#9de3ff" stroke-width="2" opacity="0.55"/>
      <line x1="496" y1="488" x2="496" y2="542" stroke="#9de3ff" stroke-width="2" opacity="0.55"/>
      <line x1="532" y1="488" x2="532" y2="542" stroke="#9de3ff" stroke-width="2" opacity="0.55"/>
      <line x1="568" y1="488" x2="568" y2="542" stroke="#9de3ff" stroke-width="2" opacity="0.55"/>
      <line x1="604" y1="488" x2="604" y2="542" stroke="#9de3ff" stroke-width="2" opacity="0.55"/>
      <line x1="404" y1="515" x2="620" y2="515" stroke="#9de3ff" stroke-width="3" opacity="0.7" filter="url(#softGlow)"/>
    `),
  },
  {
    id: "dream-arc",
    name: "Dream Arc",
    layer: "eyes",
    rarity: "legendary",
    weight: 2,
    families: ["spirit", "rabbit"],
    svg: wrapSvg(`
      <path d="M420 516 C450 480 474 480 502 516" stroke="#ffd5fb" stroke-width="7" fill="none" opacity="0.85" filter="url(#softGlow)"/>
      <path d="M522 516 C550 480 574 480 604 516" stroke="#ffd5fb" stroke-width="7" fill="none" opacity="0.85" filter="url(#softGlow)"/>
      <circle cx="478" cy="520" r="10" fill="#fff" opacity="0.85"/>
      <circle cx="546" cy="520" r="10" fill="#fff" opacity="0.85"/>
      <circle cx="512" cy="474" r="18" fill="#dca8ff" opacity="0.5" filter="url(#softGlow)"/>
    `),
  },
];

const HAIR: TraitDefinition[] = [
  {
    id: "none",
    name: "None",
    layer: "headgear",
    rarity: "common",
    weight: 20,
    families: ["universal"],
    svg: wrapSvg(""),
  },
  {
    id: "spiky-blue",
    name: "Spiky Blue",
    layer: "headgear",
    rarity: "common",
    weight: 16,
    families: ["humanoid"],
    svg: wrapSvg(`
      <path d="M380 420 L360 320 L400 380 L420 280 L450 360 L480 260 L512 340 L544 260 L574 360 L604 280 L624 380 L664 320 L644 420 C620 440 580 460 512 460 C444 460 404 440 380 420 Z" fill="url(#hairGradBlue)" opacity="0.92"/>
      <path d="M420 380 L440 300 L470 360 L512 280 L554 360 L584 300 L604 380" fill="none" stroke="#81d4fa" stroke-width="2" opacity="0.4"/>
      <circle cx="480" cy="320" r="4" fill="#ffffff" opacity="0.3"/>
      <circle cx="544" cy="300" r="3" fill="#ffffff" opacity="0.25"/>
    `),
  },
  {
    id: "long-pink",
    name: "Long Pink",
    layer: "headgear",
    rarity: "common",
    weight: 14,
    families: ["humanoid", "feline", "spirit"],
    svg: wrapSvg(`
      <path d="M370 440 C370 360 420 300 512 280 C604 300 654 360 654 440 C654 500 640 580 620 660 C600 740 580 800 560 850 L520 850 C540 800 560 740 570 660 C580 580 590 500 590 440 C590 380 560 340 512 330 C464 340 434 380 434 440 C434 500 444 580 454 660 C464 740 484 800 504 850 L464 850 C444 800 424 740 404 660 C384 580 370 500 370 440 Z" fill="url(#hairGradPink)" opacity="0.9"/>
      <path d="M400 400 C420 360 460 340 512 330 C564 340 604 360 624 400" fill="none" stroke="#f8bbd0" stroke-width="3" opacity="0.4"/>
      <circle cx="440" cy="380" r="4" fill="#ffffff" opacity="0.25"/>
      <circle cx="584" cy="380" r="4" fill="#ffffff" opacity="0.25"/>
    `),
  },
  {
    id: "short-silver",
    name: "Short Silver",
    layer: "headgear",
    rarity: "uncommon",
    weight: 12,
    families: ["humanoid", "mech", "spirit"],
    svg: wrapSvg(`
      <path d="M370 440 C370 360 420 300 512 280 C604 300 654 360 654 440 C654 480 640 520 620 560 C600 580 580 600 560 600 L540 580 C560 560 580 540 590 500 C600 460 610 420 610 440 C610 380 570 340 512 330 C454 340 414 380 414 440 C414 420 424 460 434 500 C444 540 464 560 484 580 L464 600 C444 600 424 580 404 560 C384 520 370 480 370 440 Z" fill="url(#hairGradSilver)" opacity="0.92"/>
      <path d="M400 400 C420 360 460 340 512 330 C564 340 604 360 624 400" fill="none" stroke="#e0e0e0" stroke-width="2" opacity="0.4"/>
      <path d="M440 350 L460 320 L480 340 L512 310 L544 340 L564 320 L584 350" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.3"/>
    `),
  },
  {
    id: "twin-tails",
    name: "Twin Tails",
    layer: "headgear",
    rarity: "rare",
    weight: 8,
    families: ["humanoid", "feline", "rabbit"],
    svg: wrapSvg(`
      <path d="M370 440 C370 360 420 300 512 280 C604 300 654 360 654 440 C654 480 640 520 620 560 C600 580 580 600 560 600 L540 580 C560 560 580 540 590 500 C600 460 610 420 610 440 C610 380 570 340 512 330 C454 340 414 380 414 440 C414 420 424 460 434 500 C444 540 464 560 484 580 L464 600 C444 600 424 580 404 560 C384 520 370 480 370 440 Z" fill="url(#hairGradPurple)" opacity="0.9"/>
      <path d="M380 440 C360 460 340 520 320 600 C300 680 280 760 260 820 L300 820 C320 760 340 680 360 600 C380 520 400 460 400 440 Z" fill="url(#hairGradPurple)" opacity="0.85"/>
      <path d="M644 440 C664 460 684 520 704 600 C724 680 744 760 764 820 L724 820 C704 760 684 680 664 600 C644 520 624 460 624 440 Z" fill="url(#hairGradPurple)" opacity="0.85"/>
      <circle cx="380" cy="440" r="12" fill="#ce93d8" opacity="0.7"/>
      <circle cx="644" cy="440" r="12" fill="#ce93d8" opacity="0.7"/>
      <path d="M400 400 C420 360 460 340 512 330 C564 340 604 360 624 400" fill="none" stroke="#e1bee7" stroke-width="2" opacity="0.4"/>
    `),
  },
  {
    id: "wild-red",
    name: "Wild Red",
    layer: "headgear",
    rarity: "uncommon",
    weight: 10,
    families: ["humanoid", "dragon", "feline"],
    svg: wrapSvg(`
      <path d="M360 440 C350 360 400 280 512 260 C624 280 674 360 664 440 C664 480 650 520 630 560 C610 580 590 600 570 600 L550 580 C570 560 590 540 600 500 C610 460 620 420 620 440 C620 380 580 320 512 310 C444 320 404 380 404 440 C404 420 414 460 424 500 C434 540 454 560 474 580 L454 600 C434 600 414 580 394 560 C374 520 360 480 360 440 Z" fill="url(#hairGradRed)" opacity="0.92"/>
      <path d="M400 360 L420 300 L440 340 L480 280 L512 320 L544 280 L584 340 L604 300 L624 360" fill="none" stroke="#ff8a80" stroke-width="2" opacity="0.4"/>
      <path d="M440 320 L460 260 L480 300 L512 240 L544 300 L564 260 L584 320" fill="url(#hairGradRed)" opacity="0.7"/>
    `),
  },
  {
    id: "ponytail-gold",
    name: "Ponytail Gold",
    layer: "headgear",
    rarity: "rare",
    weight: 6,
    families: ["humanoid", "feline", "spirit"],
    svg: wrapSvg(`
      <path d="M370 440 C370 360 420 300 512 280 C604 300 654 360 654 440 C654 480 640 520 620 560 C600 580 580 600 560 600 L540 580 C560 560 580 540 590 500 C600 460 610 420 610 440 C610 380 570 340 512 330 C454 340 414 380 414 440 C414 420 424 460 434 500 C444 540 464 560 484 580 L464 600 C444 600 424 580 404 560 C384 520 370 480 370 440 Z" fill="url(#hairGradGold)" opacity="0.9"/>
      <path d="M512 300 C540 280 560 300 580 340 C600 380 620 440 640 520 C660 600 680 680 700 760 L660 760 C640 680 620 600 600 520 C580 440 560 380 540 340 C520 300 500 280 512 300 Z" fill="url(#hairGradGold)" opacity="0.85"/>
      <circle cx="512" cy="300" r="14" fill="#fdd835" opacity="0.7"/>
      <path d="M400 400 C420 360 460 340 512 330 C564 340 604 360 624 400" fill="none" stroke="#fff9c4" stroke-width="2" opacity="0.4"/>
    `),
  },
  {
    id: "bob-green",
    name: "Bob Green",
    layer: "headgear",
    rarity: "epic",
    weight: 4,
    families: ["humanoid", "feline", "rabbit"],
    svg: wrapSvg(`
      <path d="M370 440 C370 360 420 300 512 280 C604 300 654 360 654 440 C654 480 640 520 620 560 C600 580 580 600 560 600 L540 580 C560 560 580 540 590 500 C600 460 610 420 610 440 C610 380 570 340 512 330 C454 340 414 380 414 440 C414 420 424 460 434 500 C444 540 464 560 484 580 L464 600 C444 600 424 580 404 560 C384 520 370 480 370 440 Z" fill="url(#hairGradGreen)" opacity="0.92"/>
      <path d="M370 440 C360 460 350 500 340 540 C330 580 320 620 310 660 L350 660 C360 620 370 580 380 540 C390 500 400 460 400 440 Z" fill="url(#hairGradGreen)" opacity="0.8"/>
      <path d="M654 440 C664 460 674 500 684 540 C694 580 704 620 714 660 L674 660 C664 620 654 580 644 540 C634 500 624 460 624 440 Z" fill="url(#hairGradGreen)" opacity="0.8"/>
      <path d="M400 400 C420 360 460 340 512 330 C564 340 604 360 624 400" fill="none" stroke="#b9f6ca" stroke-width="2" opacity="0.4"/>
      <circle cx="440" cy="380" r="3" fill="#ffffff" opacity="0.25"/>
      <circle cx="584" cy="380" r="3" fill="#ffffff" opacity="0.25"/>
    `),
  },
];

const HEADGEAR: TraitDefinition[] = [
  {
    id: "aegis-full-helmet",
    name: "Aegis Full Helmet",
    layer: "headgear",
    rarity: "common",
    weight: 20,
    families: ["universal"],
    svg: wrapSvg(`
      <path d="M350 600 C360 410 430 300 512 270 C594 300 664 410 674 600 Z" fill="#111f39" opacity="0.94"/>
      <path d="M392 562 C410 420 460 340 512 320 C564 340 614 420 632 562" fill="none" stroke="#9bdcff" stroke-width="5" opacity="0.55"/>
      <rect x="420" y="468" width="184" height="58" rx="18" fill="#15365f" opacity="0.82"/>
    `),
  },
  {
    id: "samurai-halo",
    name: "Samurai Halo",
    layer: "headgear",
    rarity: "common",
    weight: 18,
    families: ["humanoid", "feline", "dragon"],
    svg: wrapSvg(`
      <path d="M336 462 C390 324 634 324 688 462 L646 556 L378 556 Z" fill="#261a3c" opacity="0.94"/>
      <path d="M372 470 C420 370 604 370 652 470" fill="none" stroke="#d7a5ff" stroke-width="5" opacity="0.7"/>
      <polygon points="512,268 548,356 476,356" fill="#f6c1ff" opacity="0.72"/>
    `),
  },
  {
    id: "antenna-crown",
    name: "Antenna Crown",
    layer: "headgear",
    rarity: "uncommon",
    weight: 14,
    families: ["mech", "avian", "universal"],
    svg: wrapSvg(`
      <path d="M372 570 C386 430 448 340 512 318 C576 340 638 430 652 570 Z" fill="#1a2945" opacity="0.92"/>
      <line x1="452" y1="316" x2="424" y2="224" stroke="#9ce8ff" stroke-width="6" opacity="0.72"/>
      <line x1="572" y1="316" x2="600" y2="224" stroke="#9ce8ff" stroke-width="6" opacity="0.72"/>
      <circle cx="424" cy="224" r="14" fill="#7de8ff" opacity="0.85"/>
      <circle cx="600" cy="224" r="14" fill="#7de8ff" opacity="0.85"/>
    `),
  },
  {
    id: "horned-mask",
    name: "Horned Mask",
    layer: "headgear",
    rarity: "rare",
    weight: 10,
    families: ["dragon", "canine", "feline"],
    svg: wrapSvg(`
      <path d="M366 586 C376 444 446 340 512 318 C578 340 648 444 658 586 Z" fill="#3a1e24" opacity="0.92"/>
      <path d="M420 352 L362 270 L448 300 Z" fill="#ff9e88" opacity="0.82"/>
      <path d="M604 352 L662 270 L576 300 Z" fill="#ff9e88" opacity="0.82"/>
      <path d="M416 500 C458 462 566 462 608 500" fill="none" stroke="#ffc3b2" stroke-width="5" opacity="0.7"/>
    `),
  },
  {
    id: "aviator-hood",
    name: "Aviator Hood",
    layer: "headgear",
    rarity: "uncommon",
    weight: 14,
    families: ["avian", "humanoid", "rabbit"],
    svg: wrapSvg(`
      <path d="M350 598 C360 430 430 336 512 308 C594 336 664 430 674 598 L620 620 C562 648 462 648 404 620 Z" fill="#263a52" opacity="0.94"/>
      <ellipse cx="512" cy="470" rx="124" ry="88" fill="#9ad7ff" opacity="0.28"/>
      <ellipse cx="512" cy="470" rx="96" ry="66" fill="#2a4d76" opacity="0.68"/>
    `),
  },
  {
    id: "crystal-diadem",
    name: "Crystal Diadem",
    layer: "headgear",
    rarity: "epic",
    weight: 6,
    families: ["spirit", "humanoid", "feline"],
    svg: wrapSvg(`
      <path d="M372 572 C390 434 452 344 512 324 C572 344 634 434 652 572" fill="none" stroke="#d7b3ff" stroke-width="7" opacity="0.55"/>
      <polygon points="512,248 548,334 512,396 476,334" fill="#efceff" opacity="0.84" filter="url(#softGlow)"/>
      <polygon points="432,290 452,350 428,394 404,350" fill="#d8b1ff" opacity="0.7"/>
      <polygon points="592,290 620,350 596,394 568,350" fill="#d8b1ff" opacity="0.7"/>
    `),
  },
  {
    id: "rabbit-band",
    name: "Rabbit Band",
    layer: "headgear",
    rarity: "legendary",
    weight: 2,
    families: ["rabbit"],
    svg: wrapSvg(`
      <rect x="372" y="430" width="280" height="74" rx="24" fill="#1c304f" opacity="0.9"/>
      <rect x="430" y="240" width="36" height="190" rx="18" fill="#b5ebff" opacity="0.78"/>
      <rect x="558" y="240" width="36" height="190" rx="18" fill="#b5ebff" opacity="0.78"/>
      <circle cx="512" cy="468" r="24" fill="#91e8ff" opacity="0.86" filter="url(#softGlow)"/>
    `),
  },
];

const CLOTHING: TraitDefinition[] = [
  {
    id: "neon-trench",
    name: "Neon Trench",
    layer: "clothing",
    rarity: "common",
    weight: 20,
    families: ["humanoid", "canine", "feline", "rabbit"],
    svg: wrapSvg(`
      <path d="M338 850 C360 748 418 642 512 618 C606 642 664 748 686 850 Z" fill="url(#clothDark)" opacity="0.96"/>
      <line x1="404" y1="668" x2="620" y2="668" stroke="#65d8ff" stroke-width="5" opacity="0.72"/>
      <line x1="512" y1="620" x2="512" y2="850" stroke="#86e8ff" stroke-width="4" opacity="0.7"/>
      <rect x="470" y="700" width="84" height="28" rx="14" fill="#84e0ff" opacity="0.72"/>
    `),
  },
  {
    id: "plated-armor",
    name: "Plated Armor",
    layer: "clothing",
    rarity: "common",
    weight: 18,
    families: ["mech", "dragon", "canine"],
    svg: wrapSvg(`
      <rect x="360" y="628" width="304" height="222" rx="20" fill="#243a58" opacity="0.95"/>
      <rect x="390" y="658" width="244" height="42" fill="#5a84b4" opacity="0.62"/>
      <rect x="390" y="722" width="244" height="42" fill="#5a84b4" opacity="0.62"/>
      <rect x="390" y="786" width="244" height="42" fill="#5a84b4" opacity="0.62"/>
      <polygon points="512,620 548,676 512,734 476,676" fill="#bde7ff" opacity="0.62"/>
    `),
  },
  {
    id: "kimono-tech",
    name: "Kimono Tech",
    layer: "clothing",
    rarity: "uncommon",
    weight: 14,
    families: ["humanoid", "spirit", "feline"],
    svg: wrapSvg(`
      <path d="M330 850 C354 760 430 652 512 628 C594 652 670 760 694 850 Z" fill="#2d1f46" opacity="0.94"/>
      <path d="M430 660 C470 640 554 640 594 660" stroke="#d4a5ff" stroke-width="4" opacity="0.6" fill="none"/>
      <path d="M512 628 L512 850" stroke="#c89bff" stroke-width="3" opacity="0.5"/>
      <circle cx="512" cy="700" r="16" fill="#d4a5ff" opacity="0.5" filter="url(#softGlow)"/>
    `),
  },
  {
    id: "stealth-suit",
    name: "Stealth Suit",
    layer: "clothing",
    rarity: "rare",
    weight: 10,
    families: ["humanoid", "mech", "feline"],
    svg: wrapSvg(`
      <path d="M350 850 C370 750 430 640 512 620 C594 640 654 750 674 850 Z" fill="#0a0f18" opacity="0.96"/>
      <path d="M400 680 C440 660 584 660 624 680" stroke="#1a3050" stroke-width="3" opacity="0.6" fill="none"/>
      <path d="M420 720 C460 700 564 700 604 720" stroke="#1a3050" stroke-width="3" opacity="0.6" fill="none"/>
      <path d="M440 760 C480 740 544 740 584 760" stroke="#1a3050" stroke-width="3" opacity="0.6" fill="none"/>
      <circle cx="512" cy="680" r="8" fill="#0ec2ff" opacity="0.5" filter="url(#softGlow)"/>
    `),
  },
  {
    id: "energy-robe",
    name: "Energy Robe",
    layer: "clothing",
    rarity: "epic",
    weight: 6,
    families: ["spirit", "dragon", "avian"],
    svg: wrapSvg(`
      <path d="M320 850 C340 740 420 630 512 610 C604 630 684 740 704 850 Z" fill="#1a0a30" opacity="0.9"/>
      <path d="M380 680 C440 660 584 660 644 680" stroke="#a855f7" stroke-width="4" opacity="0.5" fill="none" filter="url(#softGlow)"/>
      <path d="M400 720 C460 700 564 700 624 720" stroke="#a855f7" stroke-width="3" opacity="0.4" fill="none" filter="url(#softGlow)"/>
      <circle cx="512" cy="680" r="20" fill="#a855f7" opacity="0.3" filter="url(#heavyGlow)"/>
      <circle cx="512" cy="680" r="8" fill="#d8b4fe" opacity="0.6"/>
    `),
  },
  {
    id: "cyber-vest",
    name: "Cyber Vest",
    layer: "clothing",
    rarity: "legendary",
    weight: 2,
    families: ["humanoid", "mech", "canine"],
    svg: wrapSvg(`
      <path d="M340 850 C360 750 420 640 512 620 C604 640 664 750 684 850 Z" fill="#1a2a40" opacity="0.96"/>
      <rect x="400" y="660" width="224" height="30" rx="6" fill="#2a4a6a" opacity="0.7"/>
      <rect x="420" y="700" width="184" height="20" rx="4" fill="#3a6a8a" opacity="0.5"/>
      <rect x="440" y="730" width="144" height="16" rx="4" fill="#4a8aaa" opacity="0.4"/>
      <circle cx="460" cy="675" r="6" fill="#0ec2ff" opacity="0.7" filter="url(#softGlow)"/>
      <circle cx="512" cy="675" r="6" fill="#0ec2ff" opacity="0.7" filter="url(#softGlow)"/>
      <circle cx="564" cy="675" r="6" fill="#0ec2ff" opacity="0.7" filter="url(#softGlow)"/>
      <path d="M512 620 L512 850" stroke="#0ec2ff" stroke-width="2" opacity="0.3"/>
    `),
  },
];

const ACCESSORIES: TraitDefinition[] = [
  {
    id: "none",
    name: "None",
    layer: "accessories",
    rarity: "common",
    weight: 30,
    families: ["universal"],
    svg: wrapSvg(""),
  },
  {
    id: "energy-blade",
    name: "Energy Blade",
    layer: "accessories",
    rarity: "uncommon",
    weight: 14,
    families: ["humanoid", "mech", "dragon"],
    svg: wrapSvg(`
      <path d="M680 700 L720 500 L730 480 L740 500 L700 700 Z" fill="#0ec2ff" opacity="0.7" filter="url(#softGlow)"/>
      <path d="M690 680 L720 520 L730 500 L725 520 L700 680 Z" fill="#ffffff" opacity="0.5"/>
      <rect x="670" y="700" width="40" height="12" rx="4" fill="#2a3a50"/>
    `),
  },
  {
    id: "holo-shield",
    name: "Holo Shield",
    layer: "accessories",
    rarity: "rare",
    weight: 10,
    families: ["humanoid", "mech", "spirit"],
    svg: wrapSvg(`
      <ellipse cx="340" cy="680" rx="60" ry="80" fill="none" stroke="#0ec2ff" stroke-width="4" opacity="0.5" filter="url(#softGlow)"/>
      <ellipse cx="340" cy="680" rx="50" ry="70" fill="#0ec2ff" opacity="0.1"/>
      <path d="M300 620 L340 580 L380 620 L380 740 L340 780 L300 740 Z" fill="none" stroke="#0ec2ff" stroke-width="2" opacity="0.3"/>
    `),
  },
  {
    id: "data-orb",
    name: "Data Orb",
    layer: "accessories",
    rarity: "epic",
    weight: 6,
    families: ["spirit", "avian", "rabbit"],
    svg: wrapSvg(`
      <circle cx="700" cy="600" r="40" fill="#a855f7" opacity="0.3" filter="url(#heavyGlow)"/>
      <circle cx="700" cy="600" r="28" fill="#a855f7" opacity="0.4"/>
      <circle cx="700" cy="600" r="16" fill="#d8b4fe" opacity="0.6"/>
      <circle cx="690" cy="590" r="6" fill="#ffffff" opacity="0.7"/>
      <circle cx="710" cy="610" r="4" fill="#ffffff" opacity="0.4"/>
    `),
  },
  {
    id: "plasma-whip",
    name: "Plasma Whip",
    layer: "accessories",
    rarity: "legendary",
    weight: 2,
    families: ["feline", "dragon", "humanoid"],
    svg: wrapSvg(`
      <path d="M680 700 C720 680 760 620 780 540 C790 500 800 460 820 420" fill="none" stroke="#ff4d6d" stroke-width="4" opacity="0.7" filter="url(#softGlow)"/>
      <path d="M680 700 C720 680 760 620 780 540 C790 500 800 460 820 420" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
      <circle cx="820" cy="420" r="8" fill="#ff4d6d" opacity="0.8" filter="url(#softGlow)"/>
      <rect x="670" y="700" width="20" height="10" rx="3" fill="#3a1a20"/>
    `),
  },
];

const EFFECTS: TraitDefinition[] = [
  {
    id: "none",
    name: "None",
    layer: "effects",
    rarity: "common",
    weight: 30,
    families: ["universal"],
    svg: wrapSvg(""),
  },
  {
    id: "aura-cyan",
    name: "Cyan Aura",
    layer: "effects",
    rarity: "uncommon",
    weight: 14,
    families: ["universal"],
    svg: wrapSvg(`
      <ellipse cx="512" cy="580" rx="200" ry="260" fill="#0ec2ff" opacity="0.06" filter="url(#heavyGlow)"/>
      <ellipse cx="512" cy="580" rx="160" ry="220" fill="#0ec2ff" opacity="0.08" filter="url(#softGlow)"/>
      <circle cx="400" cy="450" r="3" fill="#0ec2ff" opacity="0.6" filter="url(#softGlow)"/>
      <circle cx="624" cy="480" r="2" fill="#0ec2ff" opacity="0.5" filter="url(#softGlow)"/>
      <circle cx="480" cy="700" r="3" fill="#0ec2ff" opacity="0.4" filter="url(#softGlow)"/>
      <circle cx="560" cy="380" r="2" fill="#0ec2ff" opacity="0.5" filter="url(#softGlow)"/>
    `),
  },
  {
    id: "aura-rose",
    name: "Rose Aura",
    layer: "effects",
    rarity: "uncommon",
    weight: 14,
    families: ["universal"],
    svg: wrapSvg(`
      <ellipse cx="512" cy="580" rx="200" ry="260" fill="#ff4d6d" opacity="0.06" filter="url(#heavyGlow)"/>
      <ellipse cx="512" cy="580" rx="160" ry="220" fill="#ff4d6d" opacity="0.08" filter="url(#softGlow)"/>
      <circle cx="420" cy="420" r="3" fill="#ff4d6d" opacity="0.6" filter="url(#softGlow)"/>
      <circle cx="604" cy="500" r="2" fill="#ff4d6d" opacity="0.5" filter="url(#softGlow)"/>
      <circle cx="500" cy="720" r="3" fill="#ff4d6d" opacity="0.4" filter="url(#softGlow)"/>
      <circle cx="540" cy="360" r="2" fill="#ff4d6d" opacity="0.5" filter="url(#softGlow)"/>
    `),
  },
  {
    id: "aura-purple",
    name: "Purple Aura",
    layer: "effects",
    rarity: "rare",
    weight: 10,
    families: ["universal"],
    svg: wrapSvg(`
      <ellipse cx="512" cy="580" rx="220" ry="280" fill="#a855f7" opacity="0.06" filter="url(#heavyGlow)"/>
      <ellipse cx="512" cy="580" rx="180" ry="240" fill="#a855f7" opacity="0.08" filter="url(#softGlow)"/>
      <circle cx="380" cy="440" r="4" fill="#a855f7" opacity="0.6" filter="url(#softGlow)"/>
      <circle cx="644" cy="460" r="3" fill="#a855f7" opacity="0.5" filter="url(#softGlow)"/>
      <circle cx="460" cy="740" r="3" fill="#a855f7" opacity="0.4" filter="url(#softGlow)"/>
      <circle cx="580" cy="340" r="3" fill="#a855f7" opacity="0.5" filter="url(#softGlow)"/>
      <circle cx="512" cy="300" r="4" fill="#d8b4fe" opacity="0.6" filter="url(#softGlow)"/>
    `),
  },
  {
    id: "lightning-arc",
    name: "Lightning Arc",
    layer: "effects",
    rarity: "epic",
    weight: 6,
    families: ["universal"],
    svg: wrapSvg(`
      <polyline points="380,400 420,380 400,350 440,320 420,290 460,260" fill="none" stroke="#0ec2ff" stroke-width="3" opacity="0.7" filter="url(#softGlow)"/>
      <polyline points="644,420 604,400 624,370 584,340 604,310 564,280" fill="none" stroke="#0ec2ff" stroke-width="3" opacity="0.7" filter="url(#softGlow)"/>
      <polyline points="380,400 420,380 400,350 440,320 420,290 460,260" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
      <polyline points="644,420 604,400 624,370 584,340 604,310 564,280" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.5"/>
      <circle cx="460" cy="260" r="6" fill="#0ec2ff" opacity="0.8" filter="url(#softGlow)"/>
      <circle cx="564" cy="280" r="6" fill="#0ec2ff" opacity="0.8" filter="url(#softGlow)"/>
    `),
  },
  {
    id: "void-echo",
    name: "Void Echo",
    layer: "effects",
    rarity: "legendary",
    weight: 2,
    families: ["universal"],
    svg: wrapSvg(`
      <ellipse cx="512" cy="580" rx="240" ry="300" fill="#000000" opacity="0.15" filter="url(#heavyGlow)"/>
      <ellipse cx="512" cy="580" rx="200" ry="260" fill="none" stroke="#a855f7" stroke-width="2" opacity="0.3" filter="url(#softGlow)"/>
      <ellipse cx="512" cy="580" rx="160" ry="220" fill="none" stroke="#d8b4fe" stroke-width="1" opacity="0.2"/>
      <circle cx="400" cy="400" r="4" fill="#d8b4fe" opacity="0.7" filter="url(#softGlow)"/>
      <circle cx="624" cy="420" r="3" fill="#d8b4fe" opacity="0.6" filter="url(#softGlow)"/>
      <circle cx="460" cy="760" r="4" fill="#d8b4fe" opacity="0.5" filter="url(#softGlow)"/>
      <circle cx="580" cy="320" r="3" fill="#d8b4fe" opacity="0.6" filter="url(#softGlow)"/>
      <circle cx="512" cy="280" r="5" fill="#ffffff" opacity="0.8" filter="url(#softGlow)"/>
    `),
  },
];

export const COLLECTION_NAME = "Vessel Agent Souls";
export const COLLECTION_DESCRIPTION = "Autonomous AI agents with unique cyberpunk identities on Solana.";

export const TRAIT_LIBRARY: Record<LayerName, TraitDefinition[]> = {
  background: BACKGROUNDS,
  body: BODIES,
  clothing: CLOTHING,
  eyes: EYES,
  hair: HAIR,
  headgear: HEADGEAR,
  accessories: ACCESSORIES,
  effects: EFFECTS,
};

export const LAYER_ORDER: LayerName[] = ["background", "body", "clothing", "eyes", "hair", "headgear", "accessories", "effects"];

export function traitsForLayer(layer: LayerName): TraitDefinition[] {
  return TRAIT_LIBRARY[layer] ?? [];
}

export function isTraitCompatible(trait: TraitDefinition, family: CharacterFamily): boolean {
  if (!trait.families || trait.families.length === 0) {
    return trait.family === family || trait.family === undefined;
  }
  return trait.families.includes("universal") || trait.families.includes(family);
}

export function rarityScore(tier: RarityTier): number {
  const scores: Record<RarityTier, number> = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5 };
  return scores[tier] ?? 1;
}
