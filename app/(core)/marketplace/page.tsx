"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Search } from "lucide-react";
import { motion } from "framer-motion";

import { useMarketplace } from "@/hooks/useMarketplace";

type TabKey = "all" | "trending" | "new" | "my" | "rented";

type SoulCard = {
  id: string;
  name: string;
  owner: string;
  reputation: number;
  volume: string;
  floorSol: number;
  tag: "LEGENDARY" | "EPIC" | "RARE" | "ULTRA";
  imageSeed: number;
  listedAt?: string;
  isRental?: boolean;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "ALL SOULS" },
  { key: "trending", label: "TRENDING" },
  { key: "new", label: "NEW DROPS" },
  { key: "my", label: "MY LISTINGS" },
  { key: "rented", label: "RENTED" },
];

const fallbackCards: SoulCard[] = [
  { id: "xenos-7", name: "XENOS-7", owner: "0xVessel...9f2", reputation: 98.4, volume: "1.2M", floorSol: 42.5, tag: "LEGENDARY", imageSeed: 1 },
  { id: "aurora-02", name: "AURORA-02", owner: "Sol_Master", reputation: 84.2, volume: "450K", floorSol: 18.2, tag: "EPIC", imageSeed: 2 },
  { id: "titan-core", name: "TITAN-CORE", owner: "Whale_Alpha", reputation: 92.0, volume: "890K", floorSol: 85.0, tag: "RARE", imageSeed: 3 },
  { id: "nebula-ix", name: "NEBULA-IX", owner: "Stark_Soul", reputation: 76.8, volume: "120K", floorSol: 9.4, tag: "ULTRA", imageSeed: 4 },
];

function seedToCardGradient(seed: number) {
  const gradients = [
    "from-[#0b1016] via-[#131b24] to-[#0e1219]",
    "from-[#0c1017] via-[#122233] to-[#11161f]",
    "from-[#141618] via-[#22272d] to-[#181b1e]",
    "from-[#0d1216] via-[#182329] to-[#0f1519]",
  ];
  return gradients[(seed - 1) % gradients.length];
}

function toUsd(sol: number) {
  const solPrice = 74.5;
  return (sol * solPrice).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function MarketplacePage() {
  const { listings, getListings } = useMarketplace();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");
  const [descendingPrice, setDescendingPrice] = useState(true);

  const liveListings = getListings();

  const cards = useMemo(() => {
    if (liveListings.length === 0) {
      return fallbackCards;
    }

    return liveListings.map((listing, index) => ({
      id: listing.id,
      name: listing.name.toUpperCase(),
      owner: listing.seller ?? listing.owner,
      reputation: Math.max(70, Math.min(99.9, listing.reputation ?? 80)),
      volume: `${Math.max(60, (listing.totalActions ?? 0) * 10)}K`,
      floorSol: listing.price ?? 1,
      tag: (listing.isRental ? "EPIC" : "RARE") as SoulCard["tag"],
      imageSeed: (index % 4) + 1,
      listedAt: listing.createdAt,
      isRental: listing.isRental,
    }));
  }, [liveListings]);

  const filtered = useMemo(() => {
    let list = [...cards];

    if (activeTab === "new") {
      list = list.sort((a, b) => (b.listedAt ?? "").localeCompare(a.listedAt ?? ""));
    } else if (activeTab === "rented") {
      list = list.filter((item) => item.isRental);
    } else if (activeTab === "trending") {
      list = list.sort((a, b) => b.reputation - a.reputation);
    }

    if (activeTab === "my") {
      list = list.filter((item) => listings.some((l) => l.id === item.id));
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(q) || item.owner.toLowerCase().includes(q));
    }

    list.sort((a, b) => (descendingPrice ? b.floorSol - a.floorSol : a.floorSol - b.floorSol));
    return list;
  }, [activeTab, cards, descendingPrice, listings, query]);

  return (
    <div className="-mx-4 -mt-8 min-h-screen bg-[#f5f5f6] px-4 pb-10 pt-4 text-[#171819] sm:-mx-6 sm:px-6">
      <div className="mx-auto w-full max-w-[1320px] space-y-6">
        <section className="grid gap-5 rounded-sm bg-[#ececee] p-5 lg:grid-cols-[1fr_280px]">
          <div>
            <h1 className="text-[64px] font-semibold leading-[0.94] tracking-[-0.03em] text-[#1d1f21]">
              Agent Souls
              <br />
              <span className="text-[#0b7d82] italic tracking-[0.01em]">MARKETPLACE</span>
            </h1>
            <p className="mt-4 max-w-[640px] text-[15px] leading-relaxed text-black/65">
              The premiere destination for high-performance cNFT Agent Souls. Deploy, trade, and rent the next generation of Solana-native AI orchestrators.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.push("/agents")}
                className="inline-flex h-10 cursor-pointer items-center rounded-[4px] bg-[#0b7d82] px-5 text-[12px] font-semibold tracking-[0.06em] text-white transition-colors hover:bg-[#09696d]"
              >
                Sell Your Agent →
              </button>
              <button
                onClick={() => window.scrollTo({ top: 420, behavior: "smooth" })}
                className="inline-flex h-10 cursor-pointer items-center rounded-[4px] border border-black/10 bg-white px-5 text-[12px] font-semibold tracking-[0.06em] text-black/80 transition-colors hover:bg-black/5"
              >
                View Collections
              </button>
            </div>
          </div>

          <div className="relative h-[260px] overflow-hidden rounded-xl bg-gradient-to-br from-[#131313] to-[#1f1f1f]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(22,207,212,0.2),transparent_40%)]" />
            <Image
              src="/women-hero-section-main-asset.png"
              alt="Marketplace hero"
              width={450}
              height={550}
              className="absolute right-[-10px] top-[-12px] h-[290px] w-auto object-contain"
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-5">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`cursor-pointer border-b-2 pb-1 text-[12px] font-semibold tracking-[0.1em] transition-colors ${
                    activeTab === tab.key
                      ? "border-[#0b7d82] text-[#0b7d82]"
                      : "border-transparent text-black/60 hover:text-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Souls..."
                  className="h-10 w-[220px] rounded-[4px] border border-black/10 bg-white pl-9 pr-3 text-[12px] text-black outline-none focus:border-[#0b7d82]"
                />
              </div>
              <button
                onClick={() => setDescendingPrice((v) => !v)}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[4px] border border-black/10 bg-white px-3 text-[12px] font-semibold text-black/70 hover:bg-black/5"
              >
                <Filter className="h-3.5 w-3.5" />
                {descendingPrice ? "Filters" : "Price ↑"}
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {filtered.slice(0, 8).map((card, idx) => (
              <motion.div
                key={card.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="rounded-md border border-black/10 bg-white p-3"
              >
                <div className={`relative h-[190px] overflow-hidden rounded-[4px] bg-gradient-to-b ${seedToCardGradient(card.imageSeed)}`}>
                  <div className="absolute right-2 top-2 rounded-full border border-black/10 bg-white px-2 py-0.5 text-[9px] font-semibold tracking-[0.1em] text-black/75">
                    {card.tag}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
                </div>

                <div className="mt-3 flex items-start justify-between">
                  <p className="text-[31px] font-semibold tracking-[-0.02em] text-black">{card.name}</p>
                  <span className="text-[11px] text-black/55">#{(idx + 1) * 1112}</span>
                </div>
                <p className="mt-1 text-[12px] text-black/6">Owner: <span className="text-[#0b7d82]">{card.owner}</span></p>

                <div className="mt-3 grid grid-cols-2 gap-2 rounded-[4px] bg-[#f2f3f4] p-2">
                  <div>
                    <p className="text-[9px] font-semibold tracking-[0.1em] text-black/45">REPUTATION</p>
                    <p className="mt-1 text-[16px] font-semibold text-black">★ {card.reputation.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold tracking-[0.1em] text-black/45">VOLUME</p>
                    <p className="mt-1 text-[16px] font-semibold text-black">{card.volume}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-semibold tracking-[0.1em] text-black/45">FLOOR PRICE</p>
                    <p className="text-[39px] font-semibold leading-none tracking-[-0.02em] text-black">{card.floorSol.toFixed(1)}<span className="text-[16px]"> SOL</span></p>
                  </div>
                  <p className="text-[11px] text-black/55">≈ ${toUsd(card.floorSol)}</p>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => router.push(`/marketplace/${card.id}?action=buy`)}
                    className="h-9 cursor-pointer rounded-[4px] bg-[#171819] text-[12px] font-semibold text-white hover:bg-black"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => router.push(`/marketplace/${card.id}?action=rent`)}
                    className="h-9 cursor-pointer rounded-[4px] border border-black/10 bg-[#f1f2f3] text-[12px] font-semibold text-black/80 hover:bg-black/5"
                  >
                    Rent
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="pt-6 text-center">
            <button className="inline-flex h-10 cursor-pointer items-center rounded-[4px] border border-black/10 bg-white px-5 text-[12px] font-semibold tracking-[0.08em] text-black/70 hover:bg-black/5">
              LOAD MORE AGENTS
            </button>
          </div>
        </section>

        <footer className="pt-14 text-center">
          <p className="text-[12px] tracking-[0.16em] text-black/60">VESSEL</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-5 text-[11px] tracking-[0.12em] text-black/55">
            <a href="/terms" className="transition-colors hover:text-black">TERMS</a>
            <a href="/privacy" className="transition-colors hover:text-black">PRIVACY</a>
            <a href="#" className="transition-colors hover:text-black">STATUS</a>
            <a href="#" className="transition-colors hover:text-black">TWITTER</a>
            <a href="#" className="transition-colors hover:text-black">DISCORD</a>
          </div>
          <p className="mt-4 pb-4 text-[10px] tracking-[0.12em] text-black/50">© 2024 VESSEL ENGINE. ALL RIGHTS RESERVED.</p>
        </footer>
      </div>
    </div>
  );
}
