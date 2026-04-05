"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";

import { LandingNavigation } from "@/components/layout/landing-navigation";
import { getAgentArtworkUrl, getAgentCoverGradientClass, getAgentVisualSeed } from "@/lib/agent-visuals";
import { getCyberpunkAgentDataUrl } from "@/lib/agent-avatar";
import { PREMADE_FREE_AGENTS } from "@/lib/premade-agents";
import { useVesselStore } from "@/store/useVesselStore";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import type { Agent } from "@/types/agent";

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
  artworkUrl: string;
  coverGradient: string;
  listedAt?: string;
  isRental?: boolean;
  seller?: string;
  priceCurrency?: "SOL" | "USDC";
  isPremade?: boolean;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "ALL SOULS" },
  { key: "trending", label: "TRENDING" },
  { key: "new", label: "NEW DROPS" },
  { key: "my", label: "MY LISTINGS" },
  { key: "rented", label: "RENTED" },
];

function toUsd(sol: number) {
  const solPrice = 74.5;
  return (sol * solPrice).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function MarketplacePage() {
  const listings = useVesselStore((state) => state.marketplaceListings);
  const agents = useVesselStore((state) => state.usersAgents);
  const removeListing = useVesselStore((state) => state.removeListing);
  const hasHydrated = useStoreHydrated();
  const { publicKey } = useWallet();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");
  const [descendingPrice, setDescendingPrice] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  const currentWallet = publicKey?.toBase58();

  const cards = useMemo<SoulCard[]>(() => {
    return listings.map((listing: Agent & { seller: string; listed: true }) => ({
      id: listing.id,
      name: listing.name.toUpperCase(),
      owner: listing.seller ?? listing.owner,
      reputation: Math.max(70, Math.min(99.9, listing.reputation ?? 80)),
      volume: `${Math.max(60, (listing.totalActions ?? 0) * 10)}K`,
      floorSol: listing.price ?? 1,
      tag: (listing.isRental ? "EPIC" : "RARE") as SoulCard["tag"],
      imageSeed: getAgentVisualSeed(listing),
      artworkUrl: getAgentArtworkUrl(listing, 960),
      coverGradient: getAgentCoverGradientClass(listing),
      listedAt: listing.createdAt,
      isRental: listing.isRental,
      seller: listing.seller,
      priceCurrency: listing.priceCurrency ?? "SOL",
    }));
  }, [listings]);

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
      list = currentWallet
        ? list.filter((item) => item.seller === currentWallet)
        : [];
    }

    if (activeTab === "rented") {
      list = currentWallet
        ? agents
            .filter((agent: Agent) => agent.owner === currentWallet && agent.isRental)
            .map((agent: Agent) => ({
              id: agent.id,
              name: agent.name.toUpperCase(),
              owner: agent.owner,
              reputation: Math.max(70, Math.min(99.9, agent.reputation ?? 80)),
              volume: `${Math.max(1, (agent.totalActions ?? 0) / 1000).toFixed(1)}k`,
              floorSol: agent.price ?? 0,
              tag: "EPIC" as SoulCard["tag"],
              imageSeed: getAgentVisualSeed(agent),
              artworkUrl: getAgentArtworkUrl(agent, 960),
              coverGradient: getAgentCoverGradientClass(agent),
              listedAt: agent.createdAt,
              isRental: true,
              seller: agent.seller,
              priceCurrency: agent.priceCurrency ?? "SOL",
            }))
        : [];
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((item) => item.name.toLowerCase().includes(q) || item.owner.toLowerCase().includes(q));
    }

    list.sort((a, b) => (descendingPrice ? b.floorSol - a.floorSol : a.floorSol - b.floorSol));
    return list;
  }, [activeTab, agents, cards, currentWallet, descendingPrice, query]);

  const visibleCards = filtered.slice(0, visibleCount);
  const canLoadMore = visibleCount < filtered.length;
  const freePremadeCards = PREMADE_FREE_AGENTS.map((agent) => ({
    id: agent.id,
    name: agent.name.toUpperCase(),
    owner: agent.owner,
    reputation: Math.max(70, Math.min(99.9, agent.reputation ?? 80)),
    volume: "FREE",
    floorSol: 0,
    tag: "ULTRA" as SoulCard["tag"],
    imageSeed: getAgentVisualSeed(agent),
    artworkUrl: getAgentArtworkUrl(agent, 960),
    coverGradient: getAgentCoverGradientClass(agent),
    listedAt: agent.createdAt,
    isRental: false,
    seller: agent.seller,
    priceCurrency: "SOL" as const,
    isPremade: true,
  }));

  if (!hasHydrated) {
    return (
      <div className="-mx-4 -mt-8 min-h-screen bg-[#f5f5f6] px-4 pb-10 pt-4 text-[#171819] sm:-mx-6 sm:px-6">
        <div className="mx-auto w-full max-w-[1320px]">
          <div className="mb-6 flex gap-2">
            {tabs.map((t) => (
              <div key={t.key} className="h-9 w-28 animate-pulse rounded bg-black/10" />
            ))}
          </div>
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 flex-1 animate-pulse rounded bg-black/10 sm:max-w-[320px]" />
            <div className="h-10 w-24 animate-pulse rounded bg-black/10" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-[6px] border border-black/10 bg-white" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <LandingNavigation forceLight />
      <div className="-mx-4 -mt-8 min-h-screen bg-[#f5f5f6] px-4 pb-10 pt-4 text-[#171819] sm:-mx-6 sm:px-6">
      <div className="mx-auto w-full max-w-[1320px] space-y-6">
        <section className="grid gap-5 rounded-sm bg-[#ececee] p-4 sm:p-5 lg:grid-cols-[1fr_280px]">
          <div>
            <h1 className="text-[40px] font-semibold leading-[0.94] tracking-[-0.03em] text-[#1d1f21] sm:text-[52px] lg:text-[64px]">
              Agent Souls
              <br />
              <span className="text-[#171819] tracking-[0.01em]">MARKETPLACE</span>
            </h1>
            <p className="mt-3 max-w-[640px] text-[14px] leading-relaxed text-black/65 sm:mt-4 sm:text-[15px]">
              The premiere destination for high-performance cNFT Agent Souls. Deploy, trade, and rent the next generation of Solana-native AI orchestrators.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.push("/agents")}
                className="inline-flex h-10 cursor-pointer items-center rounded-[4px] bg-[#171819] px-5 text-[12px] font-semibold tracking-[0.06em] text-white transition-colors hover:bg-[#111111]"
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

          <div className="relative h-[210px] overflow-hidden rounded-xl bg-gradient-to-br from-[#131313] to-[#1f1f1f] sm:h-[260px]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(22,207,212,0.2),transparent_40%)]" />
            <img
              src="https://ik.imagekit.io/9pfz6g8ri/VESSSEL/women-hero-section-main-asset.png"
              alt="Marketplace hero"
              loading="eager"
              className="absolute right-[-6px] top-[-8px] h-[230px] w-auto object-contain sm:right-[-10px] sm:top-[-12px] sm:h-[290px]"
            />
          </div>
        </section>

        <section className="space-y-4 rounded-sm border border-black/10 bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.14em] text-black/45">PREMADE COLLECTION</p>
              <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-black sm:text-[28px]">Free agents for everyone</h2>
              <p className="mt-1 max-w-[760px] text-[13px] text-black/55 sm:text-[14px]">
                Claim these curated agents at no cost. Each one is specialized for a different job so you can start with a focused workflow immediately.
              </p>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 420, behavior: "smooth" })}
              className="inline-flex h-10 items-center rounded-[4px] border border-black/10 bg-[#f1f2f3] px-4 text-[12px] font-semibold tracking-[0.06em] text-black/75 transition-colors hover:bg-black/5"
            >
              View paid market
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {freePremadeCards.map((card) => (
              <motion.article
                key={card.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="rounded-md border border-black/10 bg-white p-3"
              >
                <div className={`relative h-[190px] overflow-hidden rounded-[4px] bg-gradient-to-b ${card.coverGradient}`}>
                  <img
                    src={card.artworkUrl}
                    alt={`${card.name} premade artwork`}
                    loading="lazy"
                    onError={(event) => {
                      const target = event.currentTarget;
                      target.onerror = null;
                      target.src = getCyberpunkAgentDataUrl(card.id);
                    }}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                  />
                  <div className="absolute left-2 top-2 rounded-full border border-black/10 bg-[#171819] px-2 py-0.5 text-[9px] font-semibold tracking-[0.1em] text-white">
                    FREE
                  </div>
                  <div className="absolute right-2 top-2 rounded-full border border-black/10 bg-white px-2 py-0.5 text-[9px] font-semibold tracking-[0.1em] text-black/75">
                    PREMADE
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
                </div>

                <div className="mt-3 flex items-start justify-between gap-3">
                  <p className="min-w-0 truncate text-[22px] font-semibold tracking-[-0.02em] text-black sm:text-[31px]">{card.name}</p>
                  <span className="text-[11px] text-black/55">FREE</span>
                </div>
                <p className="mt-1 text-[12px] text-black/62">Owner: <span className="break-all text-[#171819]">{card.owner}</span></p>
                <p className="mt-1 text-[11px] text-black/50">
                  Specialized agent built for a different job inside the SOL ecosystem.
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2 rounded-[4px] bg-[#f2f3f4] p-2">
                  <div>
                    <p className="text-[9px] font-semibold tracking-[0.1em] text-black/45">REPUTATION</p>
                    <p className="mt-1 text-[16px] font-semibold text-black">★ {card.reputation.toFixed(1)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold tracking-[0.1em] text-black/45">ROLE</p>
                    <p className="mt-1 text-[16px] font-semibold text-black">{card.name.split(" ")[1] || "Agent"}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2">
                  <button
                    onClick={() => router.push(`/marketplace/${card.id}`)}
                    className="h-9 cursor-pointer rounded-[4px] bg-[#171819] text-[12px] font-semibold text-white hover:bg-[#111111]"
                  >
                    Use for Free
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="-mx-1 overflow-x-auto px-1 pb-1">
              <div className="flex min-w-max items-center gap-5">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`cursor-pointer border-b-2 pb-1 text-[12px] font-semibold tracking-[0.1em] transition-colors ${
                    activeTab === tab.key
                      ? "border-[#171819] text-[#171819]"
                      : "border-transparent text-black/60 hover:text-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              </div>
            </div>

            <div className="flex w-full items-center gap-2 lg:w-auto">
              <div className="relative min-w-0 flex-1 lg:w-[220px] lg:flex-none">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search agents..."
                  className="h-10 w-full rounded-[4px] border border-black/10 bg-white pl-9 pr-3 text-[12px] text-black outline-none focus:border-[#171819]"
                />
              </div>
              <button
                onClick={() => setDescendingPrice((v) => !v)}
                className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-[4px] border border-black/10 bg-white px-3 text-[12px] font-semibold text-black/70 hover:bg-black/5"
              >
                <Filter className="h-3.5 w-3.5" />
                {descendingPrice ? "Filters" : "Price ↑"}
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-md border border-black/10 bg-white p-10 text-center">
              <p className="text-[26px] font-semibold tracking-[-0.02em] text-black">No live listings found</p>
              <p className="mt-2 text-[14px] text-black/62">
                {listings.length === 0
                  ? "No agents are listed yet. List your agent from the agents page to see it here."
                  : "Try a different search, tab, or price sort to find matching agents."}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => router.push("/agents")}
                  className="inline-flex h-10 items-center rounded-[4px] bg-[#171819] px-5 text-[12px] font-semibold tracking-[0.06em] text-white transition-colors hover:bg-[#111111]"
                >
                  GO TO AGENTS
                </button>
                <button
                  onClick={() => {
                    setActiveTab("all");
                    setQuery("");
                  }}
                  className="inline-flex h-10 items-center rounded-[4px] border border-black/10 bg-[#f1f2f3] px-5 text-[12px] font-semibold tracking-[0.06em] text-black/80 transition-colors hover:bg-black/5"
                >
                  RESET FILTERS
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {visibleCards.map((card, idx) => (
                  (() => {
                    const isTradable = listings.some((listing: Agent & { seller: string; listed: true }) => listing.id === card.id);
                    const isOwnListing = !!currentWallet && card.seller === currentWallet;
                    return (
                  <motion.article
                    key={card.id}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="rounded-md border border-black/10 bg-white p-3"
                  >
                    <div className={`relative h-[190px] overflow-hidden rounded-[4px] bg-gradient-to-b ${card.coverGradient}`}>
                      <img
                        src={card.artworkUrl}
                        alt={`${card.name} cNFT artwork`}
                        loading="lazy"
                        onError={(event) => {
                          const target = event.currentTarget;
                          target.onerror = null;
                          target.src = getCyberpunkAgentDataUrl(card.id);
                        }}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                      />
                      <div className="absolute right-2 top-2 rounded-full border border-black/10 bg-white px-2 py-0.5 text-[9px] font-semibold tracking-[0.1em] text-black/75">
                        {card.tag}
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
                    </div>

                    <div className="mt-3 flex items-start justify-between gap-3">
                      <p className="min-w-0 truncate text-[22px] font-semibold tracking-[-0.02em] text-black sm:text-[31px]">{card.name}</p>
                      <span className="text-[11px] text-black/55">#{(idx + 1) * 1112}</span>
                    </div>
                    <p className="mt-1 text-[12px] text-black/62">Owner: <span className="break-all text-[#171819]">{card.owner}</span></p>
                    {isOwnListing && (
                      <p className="mt-1 text-[10px] font-semibold tracking-[0.08em] text-black/45">YOUR LISTING</p>
                    )}

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
                        <p className="text-[31px] font-semibold leading-none tracking-[-0.02em] text-black sm:text-[39px]">
                          {card.floorSol.toFixed(1)}<span className="text-[16px]"> {card.priceCurrency || "SOL"}</span>
                        </p>
                      </div>
                      <p className="text-[10px] text-black/55 sm:text-[11px]">≈ ${toUsd(card.floorSol)}</p>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {isTradable && !isOwnListing ? (
                        <>
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
                        </>
                      ) : isOwnListing ? (
                        <>
                          <button
                            onClick={() => router.push(`/agents/${card.id}`)}
                            className="h-9 cursor-pointer rounded-[4px] bg-[#171819] text-[12px] font-semibold text-white hover:bg-[#111111]"
                          >
                            Open Agent
                          </button>
                          <button
                            onClick={() => removeListing(card.id)}
                            className="h-9 cursor-pointer rounded-[4px] border border-black/10 bg-[#f1f2f3] text-[12px] font-semibold text-black/80 hover:bg-black/5"
                          >
                            Unlist
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => router.push(`/agents/${card.id}`)}
                            className="h-9 cursor-pointer rounded-[4px] bg-[#171819] text-[12px] font-semibold text-white hover:bg-[#111111]"
                          >
                            Open Agent
                          </button>
                          <button
                            onClick={() => router.push("/agents")}
                            className="h-9 cursor-pointer rounded-[4px] border border-black/10 bg-[#f1f2f3] text-[12px] font-semibold text-black/80 hover:bg-black/5"
                          >
                            My Agents
                          </button>
                        </>
                      )}
                    </div>
                  </motion.article>
                    );
                  })()
                ))}
              </div>

              <div className="pt-6 text-center">
                {canLoadMore ? (
                  <button
                    onClick={() => setVisibleCount((count) => count + 8)}
                    className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-[4px] border border-black/10 bg-white px-5 text-[12px] font-semibold tracking-[0.08em] text-black/70 transition-colors hover:bg-black/5 sm:w-auto"
                  >
                    LOAD MORE AGENTS
                  </button>
                ) : (
                  <p className="text-[11px] font-medium tracking-[0.1em] text-black/40">
                    SHOWING {filtered.length.toLocaleString()} RESULT{filtered.length === 1 ? "" : "S"}
                  </p>
                )}
              </div>
            </>
          )}
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
          <p className="mt-4 pb-4 text-[10px] tracking-[0.12em] text-black/50">© 2026 VESSEL ENGINE. ALL RIGHTS RESERVED.</p>
        </footer>
      </div>
      </div>
    </>
  );
}
