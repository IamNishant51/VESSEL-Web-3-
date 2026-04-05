import path from "node:path";

export type RarityTier = "common" | "uncommon" | "rare" | "epic" | "legendary";

export type LayerName =
  | "background"
  | "body"
  | "clothing"
  | "eyes"
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
      <rect width="1024" height="1024" fill="#0b1020"/>
      <polygon points="0,1024 250,340 420,340 250,1024" fill="#182643"/>
      <polygon points="1024,1024 780,340 610,340 780,1024" fill="#182643"/>
      <rect x="452" y="280" width="120" height="560" rx="8" fill="#111d35"/>
      <rect x="470" y="320" width="84" height="120" fill="#0ec2ff" opacity="0.45"/>
      <rect x="470" y="500" width="84" height="120" fill="#ff4d6d" opacity="0.45"/>
      <line x1="0" y1="740" x2="1024" y2="740" stroke="#47c0ff" stroke-width="3" opacity="0.45"/>
      <line x1="0" y1="820" x2="1024" y2="820" stroke="#ff6488" stroke-width="2" opacity="0.35"/>
      <circle cx="512" cy="350" r="220" fill="#0ec2ff" opacity="0.08"/>
    `, true),
  },
  {
    id: "orbital-hangar",
    name: "Orbital Hangar",
    layer: "background",
    rarity: "common",
    weight: 22,
    svg: wrapSvg(`
      <rect width="1024" height="1024" fill="#11141e"/>
      <ellipse cx="512" cy="470" rx="420" ry="330" fill="#1d2538"/>
      <ellipse cx="512" cy="470" rx="340" ry="250" fill="#0e1728"/>
      <rect x="220" y="640" width="584" height="220" rx="24" fill="#1a2236"/>
      <rect x="240" y="670" width="544" height="36" fill="#2e4365"/>
      <rect x="240" y="730" width="544" height="18" fill="#86d7ff" opacity="0.45"/>
      <line x1="170" y1="470" x2="854" y2="470" stroke="#8bcfff" stroke-width="2" opacity="0.25"/>
      <line x1="220" y1="530" x2="804" y2="530" stroke="#8bcfff" stroke-width="2" opacity="0.25"/>
    `, true),
  },
  {
    id: "crystal-cavern",
    name: "Crystal Cavern",
    layer: "background",
    rarity: "uncommon",
    weight: 16,
    svg: wrapSvg(`
      <rect width="1024" height="1024" fill="#120b22"/>
      <polygon points="0,1024 0,520 190,620 350,1024" fill="#1e1337"/>
      <polygon points="1024,1024 1024,520 834,620 674,1024" fill="#1e1337"/>
      <polygon points="220,200 320,420 150,500" fill="#8f6bff" opacity="0.45"/>
      <polygon points="790,180 900,410 720,500" fill="#8f6bff" opacity="0.45"/>
      <polygon points="460,120 610,380 420,430" fill="#c4a2ff" opacity="0.55"/>
      <circle cx="512" cy="550" r="260" fill="#8f6bff" opacity="0.1"/>
      <line x1="240" y1="780" x2="784" y2="780" stroke="#dcbfff" stroke-width="3" opacity="0.35"/>
    `, true),
  },
  {
    id: "ruined-temple",
    name: "Ruined Temple",
    layer: "background",
    rarity: "uncommon",
    weight: 14,
    svg: wrapSvg(`
      <rect width="1024" height="1024" fill="#191512"/>
      <rect x="180" y="240" width="664" height="500" fill="#2a231d"/>
      <rect x="260" y="180" width="504" height="80" fill="#3a3129"/>
      <rect x="240" y="320" width="80" height="320" fill="#41362c"/>
      <rect x="704" y="320" width="80" height="320" fill="#41362c"/>
      <polygon points="412,740 612,740 668,1024 356,1024" fill="#2f261f"/>
      <circle cx="512" cy="470" r="140" fill="#c29c68" opacity="0.15"/>
      <line x1="250" y1="420" x2="770" y2="420" stroke="#c29c68" stroke-width="2" opacity="0.3"/>
    `, true),
  },
  {
    id: "data-vault",
    name: "Data Vault",
    layer: "background",
    rarity: "rare",
    weight: 10,
    svg: wrapSvg(`
      <rect width="1024" height="1024" fill="#071423"/>
      <rect x="128" y="128" width="768" height="768" rx="42" fill="#0f243d"/>
      <rect x="188" y="188" width="648" height="648" rx="28" fill="#09182a"/>
      <circle cx="512" cy="512" r="210" fill="none" stroke="#2ed4ff" stroke-width="6" opacity="0.55"/>
      <circle cx="512" cy="512" r="120" fill="none" stroke="#2ed4ff" stroke-width="3" opacity="0.45"/>
      <line x1="512" y1="188" x2="512" y2="836" stroke="#2ed4ff" stroke-width="2" opacity="0.4"/>
      <line x1="188" y1="512" x2="836" y2="512" stroke="#2ed4ff" stroke-width="2" opacity="0.4"/>
      <rect x="472" y="472" width="80" height="80" fill="#2ed4ff" opacity="0.25"/>
    `, true),
  },
  {
    id: "storm-plaza",
    name: "Storm Plaza",
    layer: "background",
    rarity: "rare",
    weight: 8,
    svg: wrapSvg(`
      <rect width="1024" height="1024" fill="#1b202d"/>
      <rect x="0" y="760" width="1024" height="264" fill="#101722"/>
      <polygon points="120,760 220,420 320,760" fill="#2b384f"/>
      <polygon points="704,760 804,380 904,760" fill="#2b384f"/>
      <polyline points="220,250 310,420 250,420 360,620" fill="none" stroke="#b9dcff" stroke-width="5" opacity="0.8"/>
      <polyline points="760,200 690,390 760,390 650,620" fill="none" stroke="#b9dcff" stroke-width="5" opacity="0.8"/>
      <circle cx="512" cy="370" r="210" fill="#9bc9ff" opacity="0.08"/>
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
      <polygon points="420,180 604,180 650,780 374,780" fill="#1c1611"/>
      <polygon points="220,660 340,480 390,660" fill="#5f4330"/>
      <polygon points="720,660 804,470 860,660" fill="#5f4330"/>
      <circle cx="512" cy="300" r="140" fill="#ffbe73" opacity="0.3"/>
      <line x1="120" y1="760" x2="904" y2="760" stroke="#dca36f" stroke-width="3" opacity="0.45"/>
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
      <rect x="170" y="340" width="684" height="260" rx="28" fill="#314d6a"/>
      <rect x="220" y="390" width="584" height="50" fill="#89c9ff" opacity="0.6"/>
      <rect x="220" y="470" width="584" height="24" fill="#b8e2ff" opacity="0.75"/>
      <circle cx="512" cy="230" r="110" fill="#9ad8ff" opacity="0.2"/>
      <line x1="140" y1="740" x2="884" y2="740" stroke="#8ac8ff" stroke-width="4" opacity="0.5"/>
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
      <path d="M340 850 C355 665 430 520 512 470 C594 520 669 665 684 850 Z" fill="url(#metalBlue)" opacity="0.95"/>
      <path d="M430 520 C455 460 485 425 512 420 C539 425 569 460 594 520" fill="none" stroke="#dff8ff" stroke-width="8" opacity="0.55"/>
      <rect x="430" y="640" width="164" height="120" rx="24" fill="#0f2f52" opacity="0.85"/>
      <circle cx="512" cy="702" r="28" fill="#71dcff" opacity="0.8"/>
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
      <path d="M320 850 C350 665 420 530 505 500 C580 520 654 655 706 850 Z" fill="url(#metalBlue)" opacity="0.94"/>
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
    id: "dual-slit",
    name: "Dual Slit",
    layer: "eyes",
    rarity: "common",
    weight: 22,
    families: ["universal"],
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
    weight: 18,
    families: ["universal"],
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
    weight: 14,
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
    weight: 10,
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
    weight: 14,
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
      <path d="M388 642 L512 840 L636 642" fill="none" stroke="#f1ceff" stroke-width="8" opacity="0.65"/>
      <line x1="400" y1="712" x2="624" y2="712" stroke="#d6a4ff" stroke-width="5" opacity="0.55"/>
      <rect x="462" y="694" width="100" height="26" rx="13" fill="#ffd6ff" opacity="0.62"/>
    `),
  },
  {
    id: "pilot-suit",
    name: "Pilot Suit",
    layer: "clothing",
    rarity: "uncommon",
    weight: 14,
    families: ["avian", "humanoid", "rabbit"],
    svg: wrapSvg(`
      <path d="M348 850 C368 742 424 646 512 624 C600 646 656 742 676 850 Z" fill="#17314f" opacity="0.94"/>
      <rect x="434" y="652" width="156" height="186" rx="28" fill="#264f7b" opacity="0.82"/>
      <line x1="512" y1="632" x2="512" y2="850" stroke="#8ad7ff" stroke-width="5" opacity="0.72"/>
      <circle cx="512" cy="706" r="22" fill="#e5f8ff" opacity="0.75"/>
    `),
  },
  {
    id: "monk-robe",
    name: "Monk Robe",
    layer: "clothing",
    rarity: "rare",
    weight: 10,
    families: ["spirit", "dragon", "avian"],
    svg: wrapSvg(`
      <path d="M320 850 C348 728 428 648 512 640 C596 648 676 728 704 850 Z" fill="#3b2d22" opacity="0.95"/>
      <path d="M376 688 C446 664 578 664 648 688" fill="none" stroke="#c9a57a" stroke-width="7" opacity="0.6"/>
      <rect x="440" y="728" width="144" height="30" rx="15" fill="url(#clothGold)" opacity="0.8"/>
      <line x1="512" y1="640" x2="512" y2="850" stroke="#e5c79d" stroke-width="4" opacity="0.56"/>
    `),
  },
  {
    id: "hazard-jacket",
    name: "Hazard Jacket",
    layer: "clothing",
    rarity: "epic",
    weight: 6,
    families: ["mech", "canine", "humanoid"],
    svg: wrapSvg(`
      <path d="M344 850 C364 736 424 650 512 624 C600 650 660 736 680 850 Z" fill="#2f2f12" opacity="0.96"/>
      <line x1="392" y1="684" x2="632" y2="684" stroke="#ffe86e" stroke-width="8" opacity="0.78"/>
      <line x1="392" y1="736" x2="632" y2="736" stroke="#ffe86e" stroke-width="8" opacity="0.78"/>
      <rect x="470" y="652" width="84" height="178" rx="18" fill="#4f4f22" opacity="0.9"/>
    `),
  },
  {
    id: "royal-cape",
    name: "Royal Cape",
    layer: "clothing",
    rarity: "legendary",
    weight: 2,
    families: ["universal"],
    svg: wrapSvg(`
      <path d="M306 850 C340 722 416 646 512 626 C608 646 684 722 718 850 Z" fill="#24133b" opacity="0.95"/>
      <path d="M360 690 C430 646 594 646 664 690" fill="none" stroke="#ffd7ff" stroke-width="8" opacity="0.66"/>
      <rect x="440" y="660" width="144" height="34" rx="17" fill="url(#clothGold)" opacity="0.86"/>
      <circle cx="512" cy="678" r="12" fill="#ffffff" opacity="0.9"/>
    `),
  },
];

const ACCESSORIES: TraitDefinition[] = [
  {
    id: "neck-ring",
    name: "Neck Ring",
    layer: "accessories",
    rarity: "common",
    weight: 20,
    families: ["universal"],
    svg: wrapSvg(`
      <ellipse cx="512" cy="804" rx="66" ry="32" fill="none" stroke="#91e9ff" stroke-width="7" opacity="0.78" filter="url(#softGlow)"/>
      <circle cx="512" cy="804" r="10" fill="#ffffff" opacity="0.86"/>
    `),
  },
  {
    id: "chain-grid",
    name: "Chain Grid",
    layer: "accessories",
    rarity: "common",
    weight: 18,
    families: ["universal"],
    svg: wrapSvg(`
      <path d="M408 742 C452 714 572 714 616 742" fill="none" stroke="#ffd8a1" stroke-width="6" opacity="0.72"/>
      <circle cx="438" cy="738" r="8" fill="#fff1d8" opacity="0.8"/>
      <circle cx="474" cy="726" r="8" fill="#fff1d8" opacity="0.8"/>
      <circle cx="512" cy="722" r="8" fill="#fff1d8" opacity="0.8"/>
      <circle cx="550" cy="726" r="8" fill="#fff1d8" opacity="0.8"/>
      <circle cx="586" cy="738" r="8" fill="#fff1d8" opacity="0.8"/>
    `),
  },
  {
    id: "shoulder-drones",
    name: "Shoulder Drones",
    layer: "accessories",
    rarity: "uncommon",
    weight: 14,
    families: ["mech", "avian", "humanoid"],
    svg: wrapSvg(`
      <circle cx="390" cy="642" r="34" fill="#1c3356" opacity="0.86"/>
      <circle cx="634" cy="642" r="34" fill="#1c3356" opacity="0.86"/>
      <circle cx="390" cy="642" r="12" fill="#9fe8ff" opacity="0.88" filter="url(#softGlow)"/>
      <circle cx="634" cy="642" r="12" fill="#9fe8ff" opacity="0.88" filter="url(#softGlow)"/>
      <line x1="424" y1="642" x2="600" y2="642" stroke="#7bd3ff" stroke-width="3" opacity="0.55"/>
    `),
  },
  {
    id: "ear-comms",
    name: "Ear Comms",
    layer: "accessories",
    rarity: "uncommon",
    weight: 14,
    families: ["canine", "feline", "rabbit", "humanoid"],
    svg: wrapSvg(`
      <rect x="356" y="480" width="36" height="102" rx="12" fill="#223e63" opacity="0.9"/>
      <rect x="632" y="480" width="36" height="102" rx="12" fill="#223e63" opacity="0.9"/>
      <circle cx="374" cy="530" r="14" fill="#8ce4ff" opacity="0.84"/>
      <circle cx="650" cy="530" r="14" fill="#8ce4ff" opacity="0.84"/>
    `),
  },
  {
    id: "chest-insignia",
    name: "Chest Insignia",
    layer: "accessories",
    rarity: "rare",
    weight: 10,
    families: ["universal"],
    svg: wrapSvg(`
      <polygon points="512,646 564,682 544,748 480,748 460,682" fill="#ffd374" opacity="0.85" filter="url(#softGlow)"/>
      <polygon points="512,670 538,688 528,726 496,726 486,688" fill="#fff4ce" opacity="0.92"/>
    `),
  },
  {
    id: "dual-katana-hilts",
    name: "Dual Katana Hilts",
    layer: "accessories",
    rarity: "epic",
    weight: 6,
    families: ["dragon", "humanoid", "spirit"],
    svg: wrapSvg(`
      <rect x="366" y="688" width="24" height="180" rx="8" fill="#d9f1ff" opacity="0.8" transform="rotate(-24 378 778)"/>
      <rect x="634" y="688" width="24" height="180" rx="8" fill="#ffd2ea" opacity="0.8" transform="rotate(24 646 778)"/>
      <rect x="362" y="764" width="32" height="26" rx="8" fill="#0f1f36" opacity="0.9" transform="rotate(-24 378 777)"/>
      <rect x="630" y="764" width="32" height="26" rx="8" fill="#0f1f36" opacity="0.9" transform="rotate(24 646 777)"/>
    `),
  },
];

const EFFECTS: TraitDefinition[] = [
  {
    id: "ember-rain",
    name: "Ember Rain",
    layer: "effects",
    rarity: "common",
    weight: 18,
    families: ["universal"],
    svg: wrapSvg(`
      <circle cx="380" cy="290" r="6" fill="#ff9a7f" opacity="0.58"/>
      <circle cx="450" cy="360" r="5" fill="#ff9a7f" opacity="0.58"/>
      <circle cx="520" cy="280" r="7" fill="#ff9a7f" opacity="0.58"/>
      <circle cx="590" cy="350" r="5" fill="#ff9a7f" opacity="0.58"/>
      <circle cx="660" cy="290" r="6" fill="#ff9a7f" opacity="0.58"/>
      <line x1="388" y1="300" x2="370" y2="336" stroke="#ffbd9f" stroke-width="2" opacity="0.5"/>
      <line x1="528" y1="292" x2="506" y2="338" stroke="#ffbd9f" stroke-width="2" opacity="0.5"/>
      <line x1="668" y1="302" x2="646" y2="348" stroke="#ffbd9f" stroke-width="2" opacity="0.5"/>
    `),
  },
  {
    id: "circuit-aura",
    name: "Circuit Aura",
    layer: "effects",
    rarity: "common",
    weight: 18,
    families: ["universal"],
    svg: wrapSvg(`
      <ellipse cx="512" cy="560" rx="290" ry="356" fill="none" stroke="#78dfff" stroke-width="4" opacity="0.25"/>
      <ellipse cx="512" cy="560" rx="240" ry="306" fill="none" stroke="#78dfff" stroke-width="3" opacity="0.23"/>
      <line x1="232" y1="560" x2="792" y2="560" stroke="#78dfff" stroke-width="2" opacity="0.22"/>
      <line x1="512" y1="214" x2="512" y2="906" stroke="#78dfff" stroke-width="2" opacity="0.22"/>
    `),
  },
  {
    id: "glitch-shards",
    name: "Glitch Shards",
    layer: "effects",
    rarity: "uncommon",
    weight: 14,
    families: ["universal"],
    svg: wrapSvg(`
      <polygon points="280,300 330,360 250,390" fill="#74f0ff" opacity="0.34"/>
      <polygon points="720,320 780,370 700,410" fill="#74f0ff" opacity="0.34"/>
      <polygon points="320,640 370,700 290,740" fill="#ff7cc6" opacity="0.34"/>
      <polygon points="700,660 760,710 680,750" fill="#ff7cc6" opacity="0.34"/>
      <polygon points="500,220 560,280 480,320" fill="#a2ffbe" opacity="0.3"/>
    `),
  },
  {
    id: "halo-rays",
    name: "Halo Rays",
    layer: "effects",
    rarity: "rare",
    weight: 10,
    families: ["spirit", "avian", "humanoid"],
    svg: wrapSvg(`
      <line x1="512" y1="180" x2="512" y2="980" stroke="#fff4bf" stroke-width="2" opacity="0.15"/>
      <line x1="120" y1="560" x2="904" y2="560" stroke="#fff4bf" stroke-width="2" opacity="0.15"/>
      <line x1="220" y1="268" x2="804" y2="852" stroke="#fff4bf" stroke-width="2" opacity="0.15"/>
      <line x1="804" y1="268" x2="220" y2="852" stroke="#fff4bf" stroke-width="2" opacity="0.15"/>
      <circle cx="512" cy="560" r="250" fill="none" stroke="#fff4bf" stroke-width="3" opacity="0.2"/>
    `),
  },
  {
    id: "smoke-veil",
    name: "Smoke Veil",
    layer: "effects",
    rarity: "epic",
    weight: 6,
    families: ["dragon", "spirit", "canine"],
    svg: wrapSvg(`
      <ellipse cx="412" cy="730" rx="120" ry="64" fill="#d0d7ff" opacity="0.12"/>
      <ellipse cx="610" cy="760" rx="140" ry="70" fill="#d0d7ff" opacity="0.12"/>
      <ellipse cx="500" cy="820" rx="180" ry="82" fill="#d0d7ff" opacity="0.12"/>
      <path d="M330 740 C380 690 450 700 500 740 C550 780 620 790 690 760" fill="none" stroke="#dfe4ff" stroke-width="5" opacity="0.24"/>
    `),
  },
  {
    id: "lightning-loop",
    name: "Lightning Loop",
    layer: "effects",
    rarity: "legendary",
    weight: 2,
    families: ["mech", "dragon", "universal"],
    svg: wrapSvg(`
      <polyline points="348,320 420,440 390,440 470,590 438,590 522,750" fill="none" stroke="#8ae1ff" stroke-width="6" opacity="0.72" filter="url(#softGlow)"/>
      <polyline points="676,320 604,440 634,440 554,590 586,590 502,750" fill="none" stroke="#ffb3e2" stroke-width="6" opacity="0.72" filter="url(#softGlow)"/>
      <circle cx="512" cy="560" r="280" fill="none" stroke="#9ce6ff" stroke-width="2" opacity="0.25"/>
    `),
  },
];

export const TRAIT_LIBRARY: TraitDefinition[] = [
  ...BACKGROUNDS,
  ...BODIES,
  ...CLOTHING,
  ...EYES,
  ...HEADGEAR,
  ...ACCESSORIES,
  ...EFFECTS,
];

export const LAYER_ORDER: LayerName[] = [
  "background",
  "body",
  "clothing",
  "eyes",
  "headgear",
  "accessories",
  "effects",
];

export const COLLECTION_NAME = "Vessel Cyber Sentients";
export const COLLECTION_DESCRIPTION = "Premium two-phase cNFT collection generated from handcrafted trait PNG layers.";

export function traitsForLayer(layer: LayerName): TraitDefinition[] {
  return TRAIT_LIBRARY.filter((trait) => trait.layer === layer);
}

export function traitOutputPath(rootDir: string, trait: TraitDefinition): string {
  return path.join(rootDir, trait.layer, `${trait.id}.png`);
}

export function isTraitCompatible(trait: TraitDefinition, family: CharacterFamily): boolean {
  if (!trait.families || trait.families.length === 0) {
    return true;
  }
  return trait.families.includes("universal") || trait.families.includes(family);
}

export function rarityScore(rarity: RarityTier): number {
  switch (rarity) {
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
