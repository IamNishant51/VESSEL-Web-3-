"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Loader2, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";

import { WalletConnectButton } from "@/components/wallet/connect-button";
import { SmoothScrollProvider } from "@/components/layout/smooth-scroll-provider";
import { useAgent } from "@/hooks/useAgent";
import { useMarketplace } from "@/hooks/useMarketplace";
import { PREMADE_FREE_AGENTS } from "@/lib/premade-agents";
import type { Agent } from "@/types/agent";
import { getAgentArtworkUrl } from "@/lib/agent-visuals";
import { ArtworkImage } from "@/components/landing/artwork-image";

const AnimatedBeamMultipleOutputDemo = dynamic(
  () => import("@/components/landing/animated-beam-multi-output-demo").then((m) => m.AnimatedBeamMultipleOutputDemo),
  {
    ssr: false,
    loading: () => <div className="hidden h-[680px] lg:block" aria-hidden="true" />,
  },
);

const AnimatedBeamDemo = dynamic(
  () => import("@/components/landing/animated-beam-demo").then((m) => m.AnimatedBeamDemo),
  {
    ssr: false,
    loading: () => <div className="h-[420px] sm:h-[500px]" aria-hidden="true" />,
  },
);

const navLinks: Array<{ href: string; label: string; external?: boolean }> = [
  { href: "/agents", label: "AGENTS" },
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/marketplace", label: "MARKETPLACE" },
  { href: "/forge", label: "FORGE" },
  { href: "/preview", label: "PREVIEW" },
  { href: "/docs", label: "DOCS" },
];

type LandingMarketplaceCard = {
  id: string;
  name: string;
  rating: number;
  reviews: string;
  price: number;
  currency: "SOL" | "USDC";
  tags: string[];
  description: string;
  reputation: string;
  actions: string;
  artworkUrl: string;
};

const orchestraPillars = [
  {
    title: "Planner Layer",
    detail: "Turns intent into deterministic multi-step execution plans.",
    meta: "Prompt -> Plan graph",
  },
  {
    title: "Policy Engine",
    detail: "Applies budgets, action allowlists, and risk posture before execution.",
    meta: "Risk + Budget guardrails",
  },
  {
    title: "Tool Router",
    detail: "Selects best tool path across Jupiter, Orca, Helius and wallet actions.",
    meta: "Smart tool selection",
  },
  {
    title: "Settlement + Trace",
    detail: "Captures signatures, outcomes, and replay-safe execution traces.",
    meta: "On-chain accountability",
  },
];

const orchestraStats = [
  { label: "Avg Decision Latency", value: "< 420ms" },
  { label: "Policy Checks / Run", value: "14" },
  { label: "Execution Success Rate", value: "99.2%" },
  { label: "Daily Agent Actions", value: "18.4k" },
];

export default function Home() {
  const { connected } = useWallet();
  const router = useRouter();
  const { agents } = useAgent();
  const { listings } = useMarketplace();
  const [isNavOnDark, setIsNavOnDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isForgeCtaLoading, setIsForgeCtaLoading] = useState(false);
  const [loaderStage, setLoaderStage] = useState<"intro" | "circle-travel" | "circle-arrived" | "text-travel" | "text-arrived" | "glow-pulse" | "fade-all" | "reveal" | "done">("intro");
  const [loaderTargets, setLoaderTargets] = useState({
    textX: 0,
    textY: 0,
    textFontSize: 132,
    circleX: 0,
    circleY: 0,
    circleScale: 1,
  });
  const [showGlow, setShowGlow] = useState(false);
  const [imageReveal, setImageReveal] = useState(false);

  const forgeSectionRef = useRef<HTMLElement>(null);
  const orchestraSectionRef = useRef<HTMLElement>(null);
  const sideTitleRef = useRef<HTMLSpanElement>(null);
  const heroCircleRef = useRef<HTMLDivElement>(null);
  const loaderTextRef = useRef<HTMLParagraphElement>(null);

  const totalAgents = agents.length;
  const totalListings = listings.length;
  const previewCards = useMemo(() => {
    return PREMADE_FREE_AGENTS.slice(0, 4).map((agent) => ({
      id: agent.id,
      name: agent.name.toUpperCase(),
      rating: Number((Math.max(70, Math.min(100, agent.reputation ?? 80)) / 20).toFixed(1)),
      reviews: agent.riskLevel === "Conservative" ? "1,204" : agent.riskLevel === "Aggressive" ? "2,806" : "1,842",
      price: 0,
      currency: "FREE",
      tags: [agent.allowedActions?.[0] || "Agent", agent.riskLevel || "Balanced"],
      description: agent.tagline || agent.personality,
      reputation: `${Math.max(70, Math.min(100, agent.reputation ?? 80)).toFixed(1)}%`,
      actions: (agent.totalActions ?? 0).toLocaleString(),
      artworkUrl: getAgentArtworkUrl(agent, 960),
    }));
  }, []);

  useEffect(() => {
    let ticking = false;
    const updateNavTheme = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const probeY = window.scrollY + 56;
        const darkSections = [forgeSectionRef.current, orchestraSectionRef.current].filter(Boolean) as HTMLElement[];

        const isDarkNow = darkSections.some((section) => {
          const start = section.offsetTop;
          const end = start + section.offsetHeight;
          return probeY >= start && probeY <= end;
        });

        setIsNavOnDark(isDarkNow);
        ticking = false;
      });
    };

    updateNavTheme();
    window.addEventListener("scroll", updateNavTheme, { passive: true });
    window.addEventListener("resize", updateNavTheme);

    return () => {
      window.removeEventListener("scroll", updateNavTheme);
      window.removeEventListener("resize", updateNavTheme);
    };
  }, []);

  useEffect(() => {
    const hasVisited = sessionStorage.getItem("vessel_landing_visited") === "true";

    if (hasVisited) {
      setLoaderStage("done");
      setImageReveal(true);
      setShowGlow(true);
      return;
    }

    // If the page is already scrolled past the hero (e.g. after reload with scroll restoration),
    // skip the entire loading animation to prevent visual glitches
    const isScrolledPastHero = window.scrollY > window.innerHeight * 0.5;

    if (isScrolledPastHero) {
      setLoaderStage("done");
      setImageReveal(true);
      setShowGlow(true);
      return;
    }

    const circleTravelTimer = window.setTimeout(() => setLoaderStage("circle-travel"), 500);
    const circleArrivedTimer = window.setTimeout(() => setLoaderStage("circle-arrived"), 1000);
    const textTravelTimer = window.setTimeout(() => setLoaderStage("text-travel"), 1150);
    const textArrivedTimer = window.setTimeout(() => setLoaderStage("text-arrived"), 1600);
    const glowPulseTimer = window.setTimeout(() => {
      setShowGlow(true);
      setLoaderStage("glow-pulse");
    }, 1700);
    const revealTimer = window.setTimeout(() => {
      setImageReveal(true);
      setLoaderStage("reveal");
    }, 1900);
    const doneTimer = window.setTimeout(() => {
      setLoaderStage("done");
      sessionStorage.setItem("vessel_landing_visited", "true");
    }, 2500);

    return () => {
      clearTimeout(circleTravelTimer);
      clearTimeout(circleArrivedTimer);
      clearTimeout(textTravelTimer);
      clearTimeout(textArrivedTimer);
      clearTimeout(glowPulseTimer);
      clearTimeout(revealTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  useEffect(() => {
    const syncTargets = () => {
      if (!sideTitleRef.current || !heroCircleRef.current || !loaderTextRef.current) {
        return;
      }

      const viewportCenterX = window.innerWidth / 2;
      const viewportCenterY = window.innerHeight / 2;

      const sideRect = sideTitleRef.current.getBoundingClientRect();
      const circleRect = heroCircleRef.current.getBoundingClientRect();
      const loaderTextRect = loaderTextRef.current.getBoundingClientRect();
      const computedSideStyle = window.getComputedStyle(sideTitleRef.current);
      const parsedSize = Number.parseFloat(computedSideStyle.fontSize);
      const clampedTargetSize = Number.isFinite(parsedSize)
        ? Math.min(parsedSize, 132)
        : 120;

      setLoaderTargets({
        textX: sideRect.left - loaderTextRect.left,
        textY: sideRect.top - loaderTextRect.top,
        textFontSize: clampedTargetSize,
        circleX: circleRect.left + circleRect.width / 2 - viewportCenterX,
        circleY: circleRect.top + circleRect.height / 2 - viewportCenterY,
        circleScale: circleRect.width / 260,
      });
    };

    const frame = window.requestAnimationFrame(syncTargets);
    window.addEventListener("resize", syncTargets);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", syncTargets);
    };
  }, []);

  useEffect(() => {
    if (loaderStage === "circle-travel" || loaderStage === "text-travel") {
      const frame = window.requestAnimationFrame(() => {
        if (!sideTitleRef.current || !loaderTextRef.current || !heroCircleRef.current) {
          return;
        }

        const viewportCenterX = window.innerWidth / 2;
        const viewportCenterY = window.innerHeight / 2;
        const sideRect = sideTitleRef.current.getBoundingClientRect();
        const circleRect = heroCircleRef.current.getBoundingClientRect();
        const loaderTextRect = loaderTextRef.current.getBoundingClientRect();

        setLoaderTargets((prev) => ({
          textX: sideRect.left - loaderTextRect.left,
          textY: sideRect.top - loaderTextRect.top,
          textFontSize: prev.textFontSize,
          circleX: circleRect.left + circleRect.width / 2 - viewportCenterX,
          circleY: circleRect.top + circleRect.height / 2 - viewportCenterY,
          circleScale: circleRect.width / 260,
        }));
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [loaderStage]);

  useEffect(() => {
    const prefetchTargets = ["/agents", "/dashboard", "/marketplace", "/forge", "/preview", "/docs"];
    for (const href of prefetchTargets) {
      router.prefetch(href);
    }
  }, [router]);

  const getCircleStyle = () => {
    const common = {
      scale: loaderTargets.circleScale,
      x: loaderTargets.circleX,
      y: loaderTargets.circleY,
    };
    switch (loaderStage) {
      case "circle-travel":
        return { ...common, opacity: 1 };
      case "circle-arrived":
      case "text-travel":
      case "text-arrived":
        return { ...common, opacity: 1, scale: loaderTargets.circleScale * 1.02 };
      case "glow-pulse":
        return { ...common, opacity: 1, scale: loaderTargets.circleScale * 1.05 };
      case "reveal":
        return { ...common, opacity: 0, scale: loaderTargets.circleScale * 1.1 };
      default:
        return { scale: 1, x: 0, y: 0, opacity: 1 };
    }
  };

  const getTextStyle = () => {
    const common = {
      x: loaderTargets.textX,
      y: loaderTargets.textY,
      rotate: 180,
    };
    switch (loaderStage) {
      case "circle-travel":
      case "circle-arrived":
        return { ...common, opacity: 0 };
      case "text-travel":
        return { ...common, opacity: 0.8, scale: 0.95 };
      case "text-arrived":
        return { ...common, opacity: 1 };
      case "glow-pulse":
        return { ...common, opacity: 1, scale: 1.05 };
      case "reveal":
        return { ...common, opacity: 0, scale: 1.1 };
      default:
        return { x: 0, y: 0, rotate: 0, opacity: 1 };
    }
  };

  return (
    <SmoothScrollProvider>
      <main className="bg-black text-white antialiased [text-rendering:optimizeLegibility]">
      <AnimatePresence>
        {loaderStage !== "done" && loaderStage !== "reveal" && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            />

            <motion.div
              className="relative flex h-[260px] w-[260px] items-center justify-center rounded-full bg-[#ff2338]"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={getCircleStyle()}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {showGlow && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-white"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 1.5 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              )}
              {showGlow && (
                <motion.div
                  className="absolute inset-[-20px] rounded-full bg-[#ff2338]/30 blur-xl"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: [0, 0.6, 0], scale: [0.9, 1.2, 1.5] }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              )}
            </motion.div>

            <motion.p
              ref={loaderTextRef}
              className="absolute font-black leading-none tracking-tight text-white"
              style={{ writingMode: "vertical-rl", fontSize: `${loaderTargets.textFontSize}px` }}
              initial={{ opacity: 0, y: 10 }}
              animate={getTextStyle()}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              VESSEL
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={loaderStage === "intro" ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative z-30"
      >
        <header className="fixed inset-x-0 top-0 z-50">
          <div className="mx-auto max-w-[1320px] px-4 pt-4 sm:px-6 lg:px-10">
            <div
              className={`flex items-center justify-between rounded-xl px-3 py-2 backdrop-blur-md transition-colors duration-300 ${
                isNavOnDark ? "bg-black/35" : "bg-white/45"
              }`}
            >
              <motion.p
                className={`text-[15px] font-medium tracking-[0.16em] transition-colors duration-200 ${
                  isNavOnDark ? "text-white" : "text-black"
                }`}
                whileHover={{ y: -1 }}
              >
                VESSEL
              </motion.p>
              
              <div className="hidden lg:flex items-center gap-9">
                <nav
                  className={`flex items-center gap-9 text-[10px] font-medium tracking-[0.14em] transition-colors duration-200 ${
                    isNavOnDark ? "text-white" : "text-black"
                  }`}
                >
                  {navLinks.map((link) =>
                    link.external ? (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="relative opacity-90 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-65 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-200 hover:after:w-full"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="relative opacity-90 transition-all duration-200 hover:-translate-y-0.5 hover:opacity-65 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-200 hover:after:w-full"
                      >
                        {link.label}
                      </Link>
                    ),
                  )}
                </nav>
                <WalletConnectButton />
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`flex h-10 w-10 items-center justify-center rounded-lg lg:hidden ${
                  isNavOnDark ? "bg-white/10 text-white" : "bg-black/10 text-black"
                }`}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </header>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-x-0 top-[72px] z-40 px-4 lg:hidden"
            >
              <div className={`rounded-2xl backdrop-blur-xl border p-4 ${
                isNavOnDark ? "bg-black/80 border-white/10" : "bg-white/90 border-black/10"
              }`}>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`rounded-lg px-4 py-3 text-xs font-medium tracking-[0.14em] transition-colors ${
                        isNavOnDark ? "text-white hover:bg-white/10" : "text-black hover:bg-black/5"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <WalletConnectButton className="!w-full" />
                  </div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative bg-gradient-to-b from-[#d7d7da] via-[#d1d1d4] to-[#1a1a1d] pt-16 text-black"
        >
          <div className="mx-auto max-w-[1320px] px-4 pb-6 pt-7 sm:px-6 lg:px-10">
            <div className="relative mt-4 grid min-h-[560px] grid-cols-1 items-center gap-4 md:grid-cols-[110px_1fr_620px]">
              <motion.div
                className="hidden h-full items-center justify-center lg:flex"
                initial={{ opacity: 0, x: -20 }}
                animate={imageReveal ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <span
                  ref={sideTitleRef}
                  className="rotate-180 text-[132px] font-black leading-none tracking-tight lg:text-[150px]"
                  style={{ writingMode: "vertical-rl" }}
                >
                  VESSEL
                </span>
              </motion.div>

              <div className="z-10 mx-auto w-full max-w-[520px] pt-6 md:ml-auto md:translate-x-20 md:pt-0 lg:translate-x-28">
                <motion.h1 
                  className="text-[44px] font-semibold leading-[1.04] tracking-[-0.025em] text-black md:text-[52px]"
                  initial={{ opacity: 0, y: 15 }}
                  animate={imageReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                >
                  Give Your Ideas a Soul
                </motion.h1>
                <motion.p 
                  className="mt-2 text-[11px] text-black/65"
                  initial={{ opacity: 0, y: 10 }}
                  animate={imageReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  Solana-Native AI Agent Orchestrator &amp; Marketplace
                </motion.p>
                <motion.p 
                  className="mt-1 text-[11px] text-black/52"
                  initial={{ opacity: 0, y: 10 }}
                  animate={imageReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                >
                  From forge to ownership to collaborative execution.
                </motion.p>

                <motion.div 
                  className="mt-7 flex flex-wrap items-center gap-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={imageReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.button
                    onClick={() => {
                      if (isForgeCtaLoading) {
                        return;
                      }

                      setIsForgeCtaLoading(true);
                      window.setTimeout(() => {
                        router.push("/forge");
                      }, 140);
                    }}
                    disabled={isForgeCtaLoading}
                    className="inline-flex h-10 min-w-[186px] cursor-pointer items-center justify-center gap-2 bg-black px-5 text-[12px] font-semibold tracking-[0.06em] text-white shadow-sm transition-all duration-200 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/35 disabled:cursor-not-allowed disabled:opacity-90"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.96 }}
                    animate={isForgeCtaLoading ? { scale: [1, 0.985, 1] } : { scale: 1 }}
                    transition={isForgeCtaLoading ? { duration: 0.7, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" } : { duration: 0.18, ease: "easeOut" }}
                  >
                    {isForgeCtaLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Opening Forge...
                      </>
                    ) : (
                      "Forge Your First Agent"
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => router.push("/preview")}
                    className="inline-flex h-10 min-w-[164px] cursor-pointer items-center justify-center gap-2 border border-black/14 bg-white px-5 text-[12px] font-semibold tracking-[0.06em] text-black shadow-sm transition-all duration-200 hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    Preview Gallery
                  </motion.button>
                  <WalletConnectButton className="!h-10 !cursor-pointer !rounded-none !border !border-black/20 !bg-[#BDBDBD] !px-5 !text-[12px] !font-semibold !tracking-[0.06em] !text-black !transition-all !duration-200 hover:!bg-[#B3B3B3] hover:!shadow-sm !hidden lg:!inline-flex" />
                </motion.div>

                <motion.button
                  onClick={() => router.push(connected ? "/dashboard" : "/agents")}
                  className="mt-4 inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-black/70 hover:text-black"
                  initial={{ opacity: 0, y: 10 }}
                  animate={imageReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {connected ? "Go to Dashboard" : "Explore Agents"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </motion.button>

                <motion.div 
                  className="mt-6 flex flex-wrap items-center gap-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={imageReveal ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="text-center">
                    <p className="text-[22px] font-bold text-black">{totalAgents}</p>
                    <p className="text-[9px] text-black/50 uppercase tracking-wider">Your Agents</p>
                  </div>
                  <div className="h-8 w-px bg-black/10" />
                  <div className="text-center">
                    <p className="text-[22px] font-bold text-black">{totalListings}</p>
                    <p className="text-[9px] text-black/50 uppercase tracking-wider">Listed</p>
                  </div>
                  <div className="h-8 w-px bg-black/10" />
                  <div className="text-center">
                    <p className="text-[22px] font-bold text-black">{totalListings > 0 ? totalListings : '1,420+'}</p>
                    <p className="text-[9px] text-black/50 uppercase tracking-wider">Available</p>
                  </div>
                </motion.div>
              </div>

              <div className="pointer-events-none relative mx-auto w-full max-w-[780px] translate-y-10 self-end md:mx-0 md:ml-auto md:translate-y-16 lg:max-w-[860px]">
                <motion.div
                  ref={heroCircleRef}
                  initial={false}
                  animate={imageReveal ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="absolute left-1/2 top-[36%] z-0 aspect-square w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff2338]"
                />
                <motion.div
                  initial={false}
                  animate={
                    imageReveal
                      ? { opacity: 1, clipPath: "circle(150% at 50% 50%)" }
                      : { opacity: 1, clipPath: "circle(0% at 50% 50%)" }
                  }
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="relative z-10 h-full w-full"
                >
                  <img
                    src="/women-hero-section-main-asset.png"
                    alt="Vessel hero"
                    loading="eager"
                    className="h-full w-full object-contain"
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          ref={forgeSectionRef}
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="bg-black py-16 sm:py-20"
        >
          <div className="mx-auto max-w-[1480px] px-4 sm:px-6 lg:px-10">
            <div className="rounded-[2px] bg-[#030303] px-4 py-10 sm:px-10 sm:py-12">
              <h2 className="text-[48px] font-semibold tracking-tight text-white sm:text-[56px]">The Forge</h2>

              <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1fr_260px]">
                <div className="-m-3 max-w-[290px] rounded-lg border border-transparent p-3 transition-colors duration-200 hover:border-white/10 hover:bg-white/[0.02]">
                  <p className="text-[30px] text-zinc-100">Step 01</p>
                  <h3 className="mt-1 text-[34px] font-semibold leading-[1.08] text-white">Name &amp; Personality</h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
                    Define the essence. From technical analyst to aggressive trader, shape your neural architecture.
                  </p>
                </div>

                <div className="-m-3 max-w-[290px] rounded-lg border border-transparent p-3 transition-colors duration-200 hover:border-white/10 hover:bg-white/[0.02]">
                  <p className="text-[30px] text-zinc-100">Step 02</p>
                  <h3 className="mt-1 text-[34px] font-semibold leading-[1.08] text-white">Tools &amp; Capabilities</h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
                    Connect Jupiter, Orca, or Helius. Give your seeker the hands to move across agents the way you command.
                  </p>
                </div>

                <div className="relative min-h-[190px]" />
              </div>

              <AnimatedBeamMultipleOutputDemo className="-mt-24 hidden h-[680px] lg:block" />
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative bg-gradient-to-b from-[#d7d7da] via-[#cbcbcf] to-[#202025] pb-24 pt-20 text-black sm:pb-28 sm:pt-28"
        >
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
            <div className="mb-4 text-center">
              <h2 className="text-[54px] font-bold tracking-tight sm:text-[66px]">Agent Marketplace</h2>
              <p className="mt-3 text-center text-[14px] text-black/60">Discover and deploy AI agents optimized for your strategy</p>
            </div>
            
            <div className="mx-auto mt-10 grid max-w-[1120px] gap-4 sm:mt-12 sm:gap-5 md:grid-cols-2 lg:mt-14 lg:grid-cols-3 xl:grid-cols-4">
              {previewCards.map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-[18px] border border-black/10 bg-white shadow-[0_8px_22px_rgba(0,0,0,0.16)]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-black/[0.03]" />
                  
                  <div className="relative h-[132px] overflow-hidden bg-gradient-to-br from-[#1a1f33] via-[#14244a] to-[#0f3568] sm:h-[144px]">
                    <ArtworkImage artworkUrl={item.artworkUrl} alt={`${item.name} cNFT artwork`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                  </div>

                  <div className="relative p-4 sm:p-4.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 pr-2">
                        <div className="inline-flex items-center rounded-full border border-black/10 bg-black/[0.03] px-2 py-0.5 text-[8px] font-semibold tracking-[0.13em] text-black/55">
                          PREMADE AGENT
                        </div>
                        <h3 className="mt-2 truncate text-[15px] font-semibold leading-[1.05] tracking-[-0.03em] text-black sm:text-[17px]">
                          {item.name}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-1 gap-y-0.5">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`text-[10px] ${i < Math.round(item.rating) ? "text-[#ffc107]" : "text-black/20"}`}>★</span>
                          ))}
                          <span className="ml-1 text-[9px] tracking-[0.05em] text-black/55">{item.reviews} signals</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-right pt-0.5">
                        <div className="inline-flex rounded-full border border-black/10 bg-[#171819] px-2 py-0.5 text-[8px] font-semibold tracking-[0.13em] text-white">
                          FREE
                        </div>
                        <div className="mt-1 text-[8px] tracking-[0.14em] text-black/45">CLAIMABLE</div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      <span className="rounded-full bg-[#118ca0]/10 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#118ca0]">{item.tags[0]}</span>
                      <span className="rounded-full bg-black/5 px-2.5 py-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-black/70">{item.tags[1]}</span>
                    </div>

                    <p className="mt-2.5 min-h-[44px] text-[11px] leading-[1.45] text-black/70 line-clamp-3 sm:min-h-[48px] sm:text-[12px]">
                      {item.description}
                    </p>

                    <div className="mt-3.5 grid grid-cols-2 gap-2.5 border-t border-black/10 pt-3">
                      <div>
                        <div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-black/45">Reputation</div>
                        <div className="mt-1 text-[13px] font-semibold tracking-[-0.02em] text-[#118ca0]">{item.reputation}</div>
                      </div>
                      <div>
                        <div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-black/45">Actions</div>
                        <div className="mt-1 text-[13px] font-semibold tracking-[-0.02em] text-black">{item.actions}</div>
                      </div>
                    </div>

                    <div className="mt-3.5 flex flex-col gap-2 sm:flex-row sm:gap-2.5">
                      <button onClick={() => router.push(`/marketplace/${item.id}`)} className="w-full cursor-pointer rounded-lg border border-black bg-black px-3 py-2 text-[10px] font-semibold tracking-[0.1em] text-white transition-colors hover:bg-[#111111] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/35 sm:flex-1">
                        CLAIM FREE
                      </button>
                      <button onClick={() => router.push(`/agents/${item.id}`)} className="w-full cursor-pointer rounded-lg border border-black/15 bg-white px-3 py-2 text-[10px] font-semibold tracking-[0.1em] text-black transition-colors hover:bg-black/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 sm:flex-1">
                        VIEW SPECS
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center sm:mt-14 lg:mt-16">
              <button
                onClick={() => router.push("/marketplace")}
                className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-black px-6 py-3.5 text-[13px] font-semibold text-white shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/35 sm:px-8 sm:py-4 sm:text-[14px]"
              >
                Explore All Agents
                <span className="text-[16px]">→</span>
              </button>
              <p className="mt-4 px-4 text-[11px] text-white/90 [text-shadow:0_1px_0_rgba(0,0,0,0.45)] sm:text-[12px]">4+ agents available • Verified & audited</p>
            </div>
          </div>

        </motion.section>

        <motion.section
          ref={orchestraSectionRef}
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="relative bg-black pb-24 pt-10 sm:pt-14"
        >
          <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="max-w-[680px] text-[52px] font-semibold leading-[0.98] tracking-tight sm:text-[66px]">
                VESSEL ORCHESTRA: THE CANVAS
              </h2>
              <p className="max-w-[390px] text-[12px] leading-relaxed text-zinc-400 sm:text-right">
                The runtime where intent becomes verifiable execution: plan, guard, route, and settle every action with traceable outcomes.
              </p>
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_1.35fr]">
              <div className="rounded-2xl border border-white/10 bg-[#070707] p-5 sm:p-6">
                <p className="text-[11px] font-medium tracking-[0.12em] text-zinc-400">RUNTIME STACK</p>
                <div className="mt-4 space-y-3">
                  {orchestraPillars.map((pillar) => (
                    <div
                      key={pillar.title}
                      className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.04]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-[16px] font-semibold text-white">{pillar.title}</h3>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.08em] text-zinc-300">
                          {pillar.meta}
                        </span>
                      </div>
                      <p className="mt-2 text-[12px] leading-relaxed text-zinc-400">{pillar.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#050505] p-4 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 font-medium tracking-[0.08em] text-emerald-300">
                    POLICY CHECKS: ACTIVE
                  </span>
                  <span className="rounded-full border border-white/15 px-3 py-1 font-medium tracking-[0.08em] text-zinc-300">
                    SOLANA DEVNET
                  </span>
                  <span className="rounded-full border border-white/15 px-3 py-1 font-medium tracking-[0.08em] text-zinc-300">
                    TRACE LOGGING ON
                  </span>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-[#020202]">
                  <AnimatedBeamDemo className="h-[420px] sm:h-[500px]" />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-500">Step 1</p>
                    <p className="mt-1 text-[12px] text-zinc-200">Interpret user intent into executable graph.</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-500">Step 2</p>
                    <p className="mt-1 text-[12px] text-zinc-200">Apply risk, budget, and action constraints.</p>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-500">Step 3</p>
                    <p className="mt-1 text-[12px] text-zinc-200">Execute tools and persist signed outcomes.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {orchestraStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-white/10 bg-[#070707] px-4 py-3 transition-colors duration-200 hover:border-white/20"
                >
                  <p className="text-[10px] uppercase tracking-[0.1em] text-zinc-500">{stat.label}</p>
                  <p className="mt-1 text-[20px] font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-white/30 bg-white px-6 text-[12px] font-semibold tracking-[0.06em] text-black transition-colors duration-200 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
              >
                Launch Control Room
              </button>
              <button
                onClick={() => router.push("/forge")}
                className="inline-flex h-11 cursor-pointer items-center rounded-lg border border-white/20 px-6 text-[12px] font-semibold tracking-[0.06em] text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/25"
              >
                Open Forge
              </button>
            </div>
          </div>
        </motion.section>

        <footer className="border-t border-white/10 bg-black py-8">
          <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-4 px-4 text-center sm:px-6 lg:flex-row lg:px-10 lg:text-left">
            <div>
              <p className="text-[12px] font-semibold tracking-[0.14em] text-white">VESSEL</p>
              <p className="mt-2 text-[11px] text-zinc-400">© 2026 Vessel Engine. All rights reserved.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] tracking-[0.1em] text-zinc-400 lg:justify-end">
              <Link href="/terms" className="hover:text-white">TERMS</Link>
              <Link href="/privacy" className="hover:text-white">PRIVACY</Link>
              <Link href="/docs" className="hover:text-white">DOCS</Link>
              <Link href="/marketplace" className="hover:text-white">MARKETPLACE</Link>
            </div>
          </div>
        </footer>
      </motion.div>
      </main>
    </SmoothScrollProvider>
  );
}
