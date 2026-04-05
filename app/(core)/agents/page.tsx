"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, ShoppingBag, Bot as BotIcon, Trash2, ExternalLink, X, Wallet, ShieldCheck, Sparkles, Filter, ChevronRight } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

import { WalletConnectButton } from "@/components/wallet/connect-button";
import { useAgent } from "@/hooks/useAgent";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { getAgentArtworkUrl, getAgentCoverGradientClass } from "@/lib/agent-visuals";
import { isPremadeDerivedAgent } from "@/lib/premade-agents";
import { shortAddress } from "@/lib/utils";
import { useVesselStore } from "@/store/useVesselStore";
import type { Agent } from "@/types/agent";

const ListAgentModal = dynamic(
  () => import("@/components/marketplace/ListAgentModal").then((m) => m.ListAgentModal),
  { ssr: false },
);

const DeleteConfirmModal = dynamic(
  () => import("@/components/agents/DeleteConfirmModal").then((m) => m.DeleteConfirmModal),
  { ssr: false },
);

type ViewMode = "my-agents" | "marketplace";

type SortKey = "popularity" | "reputation" | "actions" | "newest";

type CategoryKey = "all" | "defi" | "trading" | "analytics" | "social" | "payments" | "nfts";

function mapCategory(tools?: string[]): CategoryKey {
  const text = (tools ?? []).join(" ").toLowerCase();
  if (text.includes("swap") || text.includes("trade") || text.includes("exchange")) {
    return "trading";
  }
  if (text.includes("social") || text.includes("tweet") || text.includes("broadcast")) {
    return "social";
  }
  if (text.includes("oracle") || text.includes("price") || text.includes("watch")) {
    return "analytics";
  }
  if (text.includes("stake") || text.includes("delegate")) {
    return "payments";
  }
  if (text.includes("nft") || text.includes("mint")) {
    return "nfts";
  }
  if (text.includes("lend") || text.includes("borrow") || text.includes("defi") || text.includes("yield")) {
    return "defi";
  }
  return "defi";
}

function relativeTime(lastActionAt?: string) {
  if (!lastActionAt) {
    return "Never";
  }

  const t = new Date(lastActionAt).getTime();
  if (Number.isNaN(t)) {
    return "Never";
  }

  const diff = Date.now() - t;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) {
    return "Just now";
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AgentsPage() {
  const { publicKey } = useWallet();
  const { agents, deleteAgent } = useAgent();
  const listings = useVesselStore((state) => state.marketplaceListings);
  const removeListing = useVesselStore((state) => state.removeListing);
  const getAgentById = useVesselStore((state) => state.getAgentById);
  const hasHydrated = useStoreHydrated();
  const router = useRouter();

  const [viewMode, setViewMode] = useState<ViewMode>("my-agents");
  const [query, setQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [listModalAgents, setListModalAgents] = useState<typeof agents>([]);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; agentId: string | null; agentName: string }>({
    isOpen: false,
    agentId: null,
    agentName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const categories: Array<{ key: CategoryKey; label: string }> = [
    { key: "all", label: "All" },
    { key: "defi", label: "DeFi" },
    { key: "trading", label: "Trading" },
    { key: "analytics", label: "Analytics" },
    { key: "social", label: "Social" },
    { key: "payments", label: "Payments" },
    { key: "nfts", label: "NFTs" },
  ];

  const myListings = useMemo(() => {
    return listings.filter((l: Agent & { seller: string; listed: true }) => l.seller === publicKey?.toBase58());
  }, [listings, publicKey]);

  const marketplaceListings = useMemo(() => {
    return listings;
  }, [listings]);

  const filteredMyAgents = useMemo(() => {
    let list = [...agents];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.personality.toLowerCase().includes(q) ||
          (item.tagline && item.tagline.toLowerCase().includes(q)),
      );
    }

    if (activeCategory !== "all") {
      list = list.filter((item) => mapCategory(item.tools) === activeCategory);
    }

    switch (sortKey) {
      case "reputation":
        list.sort((a, b) => (b.reputation ?? 80) - (a.reputation ?? 80));
        break;
      case "actions":
        list.sort((a, b) => (b.totalActions ?? 0) - (a.totalActions ?? 0));
        break;
      case "newest":
        list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        break;
      default:
        list.sort((a, b) => (b.reputation ?? 80) - (a.reputation ?? 80));
    }

    return list;
  }, [agents, activeCategory, query, sortKey]);

  const filteredMarketplace = useMemo(() => {
    let list = [...marketplaceListings];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.personality.toLowerCase().includes(q),
      );
    }

    if (activeCategory !== "all") {
      list = list.filter((item) => mapCategory(item.tools) === activeCategory);
    }

    switch (sortKey) {
      case "reputation":
        list.sort((a, b) => (b.reputation ?? 80) - (a.reputation ?? 80));
        break;
      case "actions":
        list.sort((a, b) => (b.totalActions ?? 0) - (a.totalActions ?? 0));
        break;
      case "newest":
        list.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        break;
      default:
        list.sort((a, b) => (b.reputation ?? 80) - (a.reputation ?? 80));
    }

    return list;
  }, [marketplaceListings, activeCategory, query, sortKey]);

  const displayedAgents = viewMode === "my-agents" ? filteredMyAgents : filteredMarketplace;

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleDeleteAgent = (agentId: string, agentName: string) => {
    setDeleteModal({ isOpen: true, agentId, agentName });
  };

  const confirmDelete = async () => {
    if (!deleteModal.agentId) return;
    
    setIsDeleting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const agentToDelete = getAgentById(deleteModal.agentId);
      if (agentToDelete?.listed) {
        removeListing(deleteModal.agentId);
      }
      deleteAgent(deleteModal.agentId);
      toast.success(`${deleteModal.agentName} deleted`);
      setDeleteModal({ isOpen: false, agentId: null, agentName: "" });
    } catch {
      toast.error("Failed to delete agent");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleForgeAgent = () => {
    router.push("/forge");
  };

  const handleViewAgent = (agentId: string) => {
    router.push(`/agents/${agentId}`);
  };

  const handleBuyAgent = (agentId: string) => {
    router.push(`/marketplace/${agentId}?action=buy`);
  };

  const handleRentAgent = (agentId: string) => {
    router.push(`/marketplace/${agentId}?action=rent`);
  };

  const openListModal = (selectedAgentId?: string) => {
    const availableAgents = agents.filter((a: Agent) => !a.listed && !a.isRental && !isPremadeDerivedAgent(a));
    if (availableAgents.length === 0) {
      toast.info("No available agents to list.");
      return;
    }

    if (selectedAgentId) {
      const selected = availableAgents.find((a: Agent) => a.id === selectedAgentId);
      if (!selected) {
        toast.info("This agent is already listed or rented.");
        return;
      }
      setListModalAgents([selected]);
    } else {
      setListModalAgents(availableAgents);
    }

    setIsListModalOpen(true);
  };

  const handleUnlist = (agentId: string, agentName: string) => {
    removeListing(agentId);
    toast.success(`${agentName} removed from marketplace.`);
  };

  if (!hasHydrated) {
    return (
      <div className="-mx-4 -mt-8 min-h-screen bg-[#f5f5f6] px-4 pb-10 pt-4 text-[#171819] sm:-mx-6 sm:px-6">
        <div className="mx-auto w-full max-w-[1320px]">
          <div className="mb-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-36 animate-pulse rounded-[4px] bg-black/10" />
              <div className="h-10 w-40 animate-pulse rounded-[4px] bg-black/10" />
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 flex-1 animate-pulse rounded-[4px] bg-black/10 sm:max-w-[320px]" />
              <div className="h-10 w-32 animate-pulse rounded-[6px] bg-black/10" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
            <div className="hidden h-64 animate-pulse rounded-[4px] bg-black/5 lg:block" />
            <div>
              <div className="mb-8">
                <div className="h-14 w-64 animate-pulse rounded bg-black/10" />
                <div className="mt-2 h-5 w-96 animate-pulse rounded bg-black/5" />
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-80 animate-pulse rounded-[6px] border border-black/10 bg-white" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mx-4 -mt-8 min-h-screen bg-[#f5f5f6] px-4 pb-10 pt-4 text-[#171819] sm:-mx-6 sm:px-6">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="mb-6 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => handleViewModeChange("my-agents")}
              className={`flex shrink-0 items-center gap-2 rounded-[4px] px-3 py-2 text-[12px] font-semibold transition-colors sm:px-4 ${
                viewMode === "my-agents"
                  ? "bg-[#171819] text-white"
                  : "bg-white text-black/70 hover:bg-black/5"
              }`}
            >
              <BotIcon className="h-4 w-4" />
              MY AGENTS
              {agents.length > 0 && (
                <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{agents.length}</span>
              )}
            </button>
            <button
              onClick={() => handleViewModeChange("marketplace")}
              className={`flex shrink-0 items-center gap-2 rounded-[4px] px-3 py-2 text-[12px] font-semibold transition-colors sm:px-4 ${
                viewMode === "marketplace"
                  ? "bg-[#171819] text-white"
                  : "bg-white text-black/70 hover:bg-black/5"
              }`}
            >
              <ShoppingBag className="h-4 w-4" />
              MARKETPLACE
              {marketplaceListings.length > 0 && (
                <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{marketplaceListings.length}</span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <motion.div
              layout
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className={`overflow-hidden sm:hidden ${isMobileSearchOpen ? "min-w-0 flex-1" : "w-10"}`}
            >
              <AnimatePresence initial={false} mode="wait">
                {isMobileSearchOpen ? (
                  <motion.div
                    key="mobile-search-open"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.14, ease: "easeOut" }}
                    className="relative"
                  >
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45" />
                    <input
                      id="agents-mobile-search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search agents..."
                      autoFocus
                      className="h-10 w-full rounded-[6px] border border-[#171819]/30 bg-white pl-9 pr-9 text-[12px] text-black outline-none focus:border-[#171819]"
                    />
                    <button
                      aria-label="Close search"
                      onClick={() => setIsMobileSearchOpen(false)}
                      className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-black/55 hover:bg-black/5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="mobile-search-closed"
                    aria-label="Search"
                    aria-expanded={isMobileSearchOpen}
                    aria-controls="agents-mobile-search"
                    onClick={() => setIsMobileSearchOpen(true)}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-[6px] border text-black/65 hover:bg-black/5 ${
                      query.trim() ? "border-[#171819]/30 bg-black/[0.04]" : "border-black/10 bg-white"
                    }`}
                  >
                    <Search className="h-4 w-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
            <div className="relative hidden min-w-0 flex-1 sm:block sm:max-w-[320px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/45" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search agents..."
                className="h-10 w-full rounded-[4px] border border-black/10 bg-white pl-9 pr-3 text-[12px] text-black outline-none focus:border-[#171819]"
              />
            </div>
            <AnimatePresence initial={false}>
              {!isMobileSearchOpen && (
                <motion.div
                  layout
                  key="mobile-action-control"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.14, ease: "easeOut" }}
                  className="shrink-0"
                >
                  {publicKey ? (
                    <button
                      onClick={handleForgeAgent}
                      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-[6px] bg-[#171819] px-3 text-[12px] font-semibold text-white transition-colors hover:bg-[#111111] sm:px-4"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">FORGE AGENT</span>
                      <span className="sm:hidden">FORGE</span>
                    </button>
                  ) : (
                    <WalletConnectButton />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMobileFiltersOpen((p) => !p)}
              className="flex w-full items-center justify-between rounded-[4px] border border-black/10 bg-white px-4 py-2.5 text-[12px] font-semibold text-black/70 transition hover:bg-black/5"
            >
              <span className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                FILTERS & SORT
              </span>
              <ChevronRight className={`h-4 w-4 transition-transform ${isMobileFiltersOpen ? "rotate-90" : ""}`} />
            </button>
            <AnimatePresence>
              {isMobileFiltersOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-[4px] border border-black/8 bg-white p-4">
                    <p className="text-[10px] font-semibold tracking-[0.18em] text-black/58">CATEGORY</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {categories.map((item) => (
                        <button
                          key={item.key}
                          onClick={() => setActiveCategory(item.key)}
                          className={`h-7 rounded-[4px] px-2.5 text-[11px] transition-colors ${
                            activeCategory === item.key
                              ? "bg-[#e7f3f2] text-[#171819]"
                              : "bg-transparent text-black/65 hover:bg-black/5"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold tracking-[0.18em] text-black/58">SORT BY</p>
                      <select
                        value={sortKey}
                        onChange={(e) => setSortKey(e.target.value as SortKey)}
                        className="mt-2 h-9 w-full rounded-[4px] border border-black/12 bg-[#f1f2f3] px-3 text-[12px] text-black/75 outline-none focus:border-[#171819]"
                      >
                        <option value="newest">Newest</option>
                        <option value="popularity">Popularity</option>
                        <option value="reputation">Reputation</option>
                        <option value="actions">Most Actions</option>
                      </select>
                    </div>
                    {viewMode === "my-agents" && publicKey && (
                      <div className="mt-4">
                        <button
                          onClick={() => openListModal()}
                          disabled={agents.length === 0}
                          className="w-full rounded-[4px] bg-[#171819] py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#111111] disabled:opacity-50"
                        >
                          LIST ON MARKETPLACE
                        </button>
                        {myListings.length > 0 && (
                          <p className="mt-2 text-center text-[10px] text-black/55">
                            {myListings.length} agent{myListings.length !== 1 ? "s" : ""} listed
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <aside className="hidden h-fit border-r border-black/5 pr-0 lg:block lg:pr-6">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-black/58">FILTERS</p>
            <p className="mt-1 text-[9px] tracking-[0.15em] text-black/35">REFINE SEARCH</p>

            <div className="mt-7 border-b border-black/10 pb-5">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-black/58">CATEGORY</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveCategory(item.key)}
                    className={`h-6 rounded-[4px] px-2 text-[11px] transition-colors ${
                      activeCategory === item.key
                        ? "bg-[#e7f3f2] text-[#171819]"
                        : "bg-transparent text-black/65 hover:bg-black/5"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-black/58">SORT BY</p>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="mt-3 h-9 w-full rounded-[4px] border border-black/12 bg-[#f1f2f3] px-3 text-[12px] text-black/75 outline-none focus:border-[#171819]"
              >
                <option value="newest">Newest</option>
                <option value="popularity">Popularity</option>
                <option value="reputation">Reputation</option>
                <option value="actions">Most Actions</option>
              </select>
            </div>

            {viewMode === "my-agents" && publicKey && (
              <div className="mt-6">
                <button
                  onClick={() => openListModal()}
                  disabled={agents.filter((a: Agent) => !a.listed && !a.isRental && !isPremadeDerivedAgent(a)).length === 0}
                  className="w-full rounded-[4px] bg-[#171819] py-2 text-[11px] font-semibold text-white transition-colors hover:bg-[#111111] disabled:opacity-50"
                >
                  LIST ON MARKETPLACE
                </button>
                {myListings.length > 0 && (
                  <p className="mt-2 text-center text-[10px] text-black/55">
                    {myListings.length} agent{myListings.length !== 1 ? "s" : ""} listed
                  </p>
                )}
              </div>
            )}
          </aside>

          <section>
            <div className="mb-8 flex items-end justify-between gap-3">
              <div>
                <h1 className="text-[50px] font-semibold leading-[0.95] tracking-[-0.03em] text-[#1d1f21] sm:text-[56px]">
                  {viewMode === "my-agents" ? "My Agents" : "Marketplace"}
                </h1>
                <p className="mt-2 max-w-[560px] text-[14px] leading-[1.35] tracking-[-0.02em] text-black/70 sm:text-[16px]">
                  {viewMode === "my-agents"
                    ? `${agents.length} agent${agents.length !== 1 ? "s" : ""} in your collection. Chat, manage, and list them.`
                    : `Browse ${marketplaceListings.length} agent${marketplaceListings.length !== 1 ? "s" : ""} available for purchase or rent.`}
                </p>
              </div>
              <p className="hidden text-[11px] font-semibold tracking-[0.15em] text-black/45 md:block">
                SHOWING {displayedAgents.length.toLocaleString()} RESULTS
              </p>
            </div>

            {!publicKey && viewMode === "my-agents" ? (
              <div className="overflow-hidden rounded-[10px] border border-black/10 bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
                <div className="relative border-b border-black/8 bg-[linear-gradient(135deg,#0f1215_0%,#172027_55%,#10161b_100%)] p-5 text-white sm:p-6">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,199,204,0.22),transparent_42%)]" />
                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <p className="inline-flex items-center gap-2 rounded-[4px] border border-white/20 bg-white/10 px-2 py-1 text-[10px] font-semibold tracking-[0.12em] text-white/90">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        SECURE ACCESS
                      </p>
                      <h2 className="mt-3 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-white sm:text-[28px]">
                        Connect Wallet
                      </h2>
                      <p className="mt-2 max-w-[560px] text-[13px] leading-relaxed text-white/75 sm:text-[14px]">
                        Link your Solana wallet to unlock agent ownership, run history, and marketplace controls.
                      </p>
                    </div>
                    <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border border-white/20 bg-white/10 sm:inline-flex">
                      <Wallet className="h-5 w-5 text-white/95" />
                    </div>
                  </div>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  <div className="grid gap-2.5 text-[12px] text-black/70 sm:grid-cols-2">
                    <p className="inline-flex items-center gap-2 rounded-[6px] border border-black/8 bg-[#f6f7f8] px-3 py-2">
                      <Sparkles className="h-4 w-4 text-[#171819]" />
                      Build and run your agents
                    </p>
                    <p className="inline-flex items-center gap-2 rounded-[6px] border border-black/8 bg-[#f6f7f8] px-3 py-2">
                      <ShieldCheck className="h-4 w-4 text-[#171819]" />
                      Manage listings and rentals
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[12px] text-black/55">
                      No signature needed to connect. You only approve when taking on-chain actions.
                    </p>
                    <WalletConnectButton className="h-11 justify-center rounded-[4px] px-6 text-[12px] tracking-[0.08em]" />
                  </div>
                </div>
              </div>
            ) : displayedAgents.length === 0 ? (
              <div className="rounded-[6px] border border-black/10 bg-white p-8 text-center">
                <BotIcon className="mx-auto h-12 w-12 text-black/30" />
                <p className="mt-4 text-[20px] font-semibold text-black">
                  {viewMode === "my-agents" ? "No agents yet" : "No marketplace listings"}
                </p>
                <p className="mt-2 text-[14px] text-black/65">
                  {viewMode === "my-agents"
                    ? "Forge your first agent to get started."
                    : "Be the first to list an agent on the marketplace!"}
                </p>
                {viewMode === "my-agents" ? (
                  <button
                    onClick={handleForgeAgent}
                    className="mt-4 h-10 rounded-[4px] bg-[#171819] px-5 text-[12px] font-semibold tracking-[0.08em] text-white hover:bg-[#111111]"
                  >
                    GO TO FORGE
                  </button>
                ) : (
                  <button
                    onClick={() => handleViewModeChange("my-agents")}
                    className="mt-4 h-10 rounded-[4px] bg-[#171819] px-5 text-[12px] font-semibold tracking-[0.08em] text-white hover:bg-[#111111]"
                  >
                    VIEW MY AGENTS
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {displayedAgents.map((agent) => {
                  const coverGradient = getAgentCoverGradientClass(agent);
                  const artworkUrl = getAgentArtworkUrl(agent, 960);

                  return (
                  <article
                    key={agent.id}
                    className="group rounded-[6px] border border-black/10 bg-white p-3 transition-shadow hover:shadow-md"
                  >
                    <div className={`relative h-[180px] overflow-hidden rounded-[4px] bg-gradient-to-b ${coverGradient}`}>
                      <img
                        src={artworkUrl}
                        alt={`${agent.name || "Agent"} cNFT artwork`}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_30%,rgba(16,199,204,0.2),transparent_45%)]" />
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />
                      {agent.listed && (
                        <span className="absolute right-2 top-2 rounded-[2px] bg-[#171819] px-2 py-1 text-[9px] font-semibold text-white">
                          LISTED
                        </span>
                      )}
                      {agent.isRental && (
                        <span className="absolute right-2 top-2 rounded-[2px] bg-blue-500 px-2 py-1 text-[9px] font-semibold text-white">
                          RENTAL
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-[24px] font-semibold leading-none tracking-[-0.02em] text-black truncate">
                          {agent.name || "UNTITLED_AGENT"}
                        </p>
                        {agent.tagline && (
                          <p className="mt-1 text-[10px] text-black/50 truncate">{agent.tagline}</p>
                        )}
                      </div>
                      <span className="shrink-0 rounded-[2px] bg-[#e7f3f2] px-2 py-1 text-[9px] font-semibold tracking-[0.1em] text-[#171819]">
                        {mapCategory(agent.tools).toUpperCase()}
                      </span>
                    </div>

                    <p className="mt-2 text-[10px] tracking-[0.08em] text-black/48">
                      BY <span className="text-[#171819]">@{shortAddress(agent.owner)}</span>
                    </p>
                    <p className="mt-3 min-h-[40px] text-[13px] leading-relaxed text-black/72 line-clamp-2">
                      {agent.personality || "Autonomous Solana-native agent."}
                    </p>

                    <div className="mt-4 grid grid-cols-4 gap-2 border-t border-black/8 pt-3 text-center">
                      <div>
                        <p className="text-[8px] tracking-[0.12em] text-black/45">REP</p>
                        <p className="mt-0.5 text-[13px] font-semibold text-black">{agent.reputation ?? 80}%</p>
                      </div>
                      <div>
                        <p className="text-[8px] tracking-[0.12em] text-black/45">ACTIONS</p>
                        <p className="mt-0.5 text-[13px] font-semibold text-black">{(agent.totalActions ?? 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[8px] tracking-[0.12em] text-black/45">ACTIVE</p>
                        <p className="mt-0.5 text-[13px] font-semibold text-black">{relativeTime(agent.lastActionAt)}</p>
                      </div>
                      <div>
                        <p className="text-[8px] tracking-[0.12em] text-black/45">RISK</p>
                        <p className="mt-0.5 text-[11px] font-semibold text-black">
                          {agent.riskLevel ? agent.riskLevel.slice(0, 4).toUpperCase() : "BAL"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      {viewMode === "my-agents" ? (
                        <>
                          <button
                            onClick={() => handleViewAgent(agent.id)}
                            className="h-10 flex-1 rounded-[3px] bg-[#171819] text-[11px] font-semibold tracking-[0.11em] text-white transition-colors hover:bg-[#111111]"
                          >
                            RUN AGENT
                          </button>
                          {agent.listed ? (
                            <button
                              onClick={() => handleUnlist(agent.id, agent.name)}
                              className="inline-flex h-10 items-center justify-center rounded-[3px] border border-black/10 bg-[#f1f2f3] px-3 text-[10px] font-semibold tracking-[0.08em] text-black/70 transition-colors hover:bg-black/5"
                              aria-label="Unlist from marketplace"
                              title="Unlist from marketplace"
                            >
                              UNLIST
                            </button>
                          ) : (
                            <button
                              onClick={() => openListModal(agent.id)}
                              disabled={agent.isRental || isPremadeDerivedAgent(agent)}
                              className="inline-flex h-10 w-10 items-center justify-center rounded-[3px] border border-black/10 bg-[#f1f2f3] text-black/70 transition-colors hover:bg-black/5 disabled:opacity-50"
                              aria-label="List on marketplace"
                              title="List on marketplace"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAgent(agent.id, agent.name)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-[3px] border border-black/10 bg-[#f1f2f3] text-red-500/70 transition-colors hover:bg-red-50 hover:text-red-500"
                            aria-label="Delete agent"
                            title="Delete agent"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          {publicKey && agent.seller === publicKey.toBase58() ? (
                            <>
                              <button
                                onClick={() => handleViewAgent(agent.id)}
                                className="h-10 flex-1 rounded-[3px] bg-[#171819] text-[11px] font-semibold tracking-[0.11em] text-white transition-colors hover:bg-[#111111]"
                              >
                                OPEN AGENT
                              </button>
                              <button
                                onClick={() => handleUnlist(agent.id, agent.name)}
                                className="inline-flex h-10 items-center justify-center rounded-[3px] border border-black/10 bg-[#f1f2f3] px-3 text-[10px] font-semibold tracking-[0.08em] text-black/70 transition-colors hover:bg-black/5"
                                aria-label="Unlist from marketplace"
                                title="Unlist from marketplace"
                              >
                                UNLIST
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => (agent.isRental ? handleRentAgent(agent.id) : handleBuyAgent(agent.id))}
                              className="h-10 flex-1 rounded-[3px] bg-[#171819] text-[11px] font-semibold tracking-[0.11em] text-white transition-colors hover:bg-[#111111]"
                            >
                              {agent.isRental ? "RENT NOW" : "BUY NOW"}
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/marketplace/${agent.id}`)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-[3px] border border-black/10 bg-[#f1f2f3] text-black/70 transition-colors hover:bg-black/5"
                            aria-label="View agent"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>

                    {agent.price && (
                      <div className="mt-3 flex items-center justify-center gap-2 rounded-[3px] bg-black/[0.03] py-2">
                        <span className="text-[16px] font-semibold text-[#171819]">
                          {agent.price} {agent.priceCurrency || "SOL"}
                        </span>
                        {agent.isRental && <span className="text-[10px] text-black/50">per 7 days</span>}
                      </div>
                    )}
                  </article>
                );
                })}
              </div>
            )}
          </section>
        </div>

        <footer className="mt-16 border-t border-black/10 pt-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] tracking-[0.12em] text-black/55">
            <a href="/terms" className="transition-colors hover:text-black">TERMS</a>
            <a href="/privacy" className="transition-colors hover:text-black">PRIVACY</a>
            <a href="#" className="transition-colors hover:text-black">STATUS</a>
            <a href="#" className="transition-colors hover:text-black">TWITTER</a>
            <a href="#" className="transition-colors hover:text-black">DISCORD</a>
          </div>
          <p className="mt-4 pb-1 text-[10px] tracking-[0.12em] text-black/50">© 2026 VESSEL ENGINE. ALL RIGHTS RESERVED.</p>
        </footer>
      </div>

      <ListAgentModal
        agents={listModalAgents}
        isOpen={isListModalOpen}
        onClose={() => {
          setIsListModalOpen(false);
          setListModalAgents([]);
        }}
        ownerAddress={publicKey?.toBase58() || ""}
        instantListOnSelect
        onListed={(agentId) => {
          router.push(`/marketplace/${agentId}`);
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        agentName={deleteModal.agentName}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, agentId: null, agentName: "" })}
        isDeleting={isDeleting}
      />
    </div>
  );
}
