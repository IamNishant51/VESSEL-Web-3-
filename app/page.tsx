"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { AnimatedBeamMultipleOutputDemo } from "@/components/landing/animated-beam-multi-output-demo";
import { AnimatedBeamDemo } from "@/components/landing/animated-beam-demo";

const navLinks: Array<{ href: string; label: string; external?: boolean }> = [
  { href: "/agents", label: "AGENTS" },
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/marketplace", label: "MARKETPLACE" },
  { href: "/forge", label: "FORGE" },
  { href: "/docs", label: "DOCS" },
];

const marketplaceHighlights = [
  {
    id: "x-trader-alpha",
    name: "X-TRADER ALPHA",
    rating: 4.8,
    reviews: "2.4k",
    price: 4.2,
    tags: ["DeFi", "Auto-Trade"],
    description: "AI-powered DeFi execution agent with tactical market optimization and autonomous signal generation.",
    returns: "+24.5%",
    users: "1,240",
  },
  {
    id: "sol-yield-keeper",
    name: "SOL YIELD KEEPER",
    rating: 4.6,
    reviews: "1.8k",
    price: 3.6,
    tags: ["Staking", "Risk-Aware"],
    description: "Validator-aware yield router that rebalances staking across pools with budget and drawdown safeguards.",
    returns: "+17.2%",
    users: "910",
  },
  {
    id: "pulse-social-scout",
    name: "PULSE SOCIAL SCOUT",
    rating: 4.7,
    reviews: "1.3k",
    price: 2.9,
    tags: ["Social", "Signals"],
    description: "Monitors social and on-chain sentiment to generate real-time action prompts for your execution stack.",
    returns: "+19.1%",
    users: "760",
  },
];

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
  const [isNavOnDark, setIsNavOnDark] = useState(false);
  const [loaderStage, setLoaderStage] = useState<"intro" | "travel" | "fade" | "done">("intro");
  const [loaderTargets, setLoaderTargets] = useState({
    textX: 0,
    textY: 0,
    textFontSize: 132,
    circleX: 0,
    circleY: 0,
    circleScale: 1,
  });

  const forgeSectionRef = useRef<HTMLElement>(null);
  const orchestraSectionRef = useRef<HTMLElement>(null);
  const sideTitleRef = useRef<HTMLSpanElement>(null);
  const heroCircleRef = useRef<HTMLDivElement>(null);
  const loaderTextRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const updateNavTheme = () => {
      const probeY = window.scrollY + 56;
      const darkSections = [forgeSectionRef.current, orchestraSectionRef.current].filter(Boolean) as HTMLElement[];

      const isDarkNow = darkSections.some((section) => {
        const start = section.offsetTop;
        const end = start + section.offsetHeight;
        return probeY >= start && probeY <= end;
      });

      setIsNavOnDark(isDarkNow);
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
    const introTimer = window.setTimeout(() => setLoaderStage("travel"), 700);
    const fadeTimer = window.setTimeout(() => setLoaderStage("fade"), 1500);
    const doneTimer = window.setTimeout(() => setLoaderStage("done"), 1850);

    return () => {
      window.clearTimeout(introTimer);
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
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
        // Use actual rect delta so text lands exactly where the target title sits.
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
    if (loaderStage === "travel") {
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
          ...prev,
          textX: sideRect.left - loaderTextRect.left,
          textY: sideRect.top - loaderTextRect.top,
          circleX: circleRect.left + circleRect.width / 2 - viewportCenterX,
          circleY: circleRect.top + circleRect.height / 2 - viewportCenterY,
          circleScale: circleRect.width / 260,
        }));
      });

      return () => window.cancelAnimationFrame(frame);
    }
  }, [loaderStage]);

  return (
    <main className="bg-black text-white antialiased [text-rendering:optimizeLegibility]">
      <AnimatePresence>
        {loaderStage !== "done" && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-20 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={loaderStage === "fade" ? { opacity: 0 } : { opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 1 }}
              animate={loaderStage === "intro" ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.45, ease: "easeInOut" }}
            />

            <motion.div
              className="relative flex h-[260px] w-[260px] items-center justify-center rounded-full bg-[#ff2338]"
              initial={{ scale: 0.9, opacity: 0.85 }}
              animate={
                loaderStage === "travel"
                  ? {
                      scale: loaderTargets.circleScale,
                      x: loaderTargets.circleX,
                      y: loaderTargets.circleY,
                      opacity: 1,
                    }
                  : loaderStage === "fade"
                    ? {
                        scale: loaderTargets.circleScale,
                        x: loaderTargets.circleX,
                        y: loaderTargets.circleY,
                        opacity: 0.95,
                      }
                    : { scale: 1, x: 0, y: 0, opacity: 1 }
              }
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <motion.p
                ref={loaderTextRef}
                className="absolute font-black leading-none tracking-tight text-white"
                style={{ writingMode: "vertical-rl", fontSize: `${loaderTargets.textFontSize}px` }}
                initial={{ opacity: 0, y: 2 }}
                animate={
                  loaderStage === "travel"
                    ? { opacity: 1, x: loaderTargets.textX, y: loaderTargets.textY, rotate: 180 }
                    : loaderStage === "fade"
                      ? { opacity: 0.85, x: loaderTargets.textX, y: loaderTargets.textY, rotate: 180 }
                      : { opacity: 1, x: 0, y: 0, rotate: 0 }
                }
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                VESSEL
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={false}
        animate={loaderStage === "intro" ? { opacity: 0, y: 16 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto max-w-[1320px] px-6 pt-5 sm:px-10">
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
            <nav
              className={`hidden items-center gap-9 text-[10px] font-medium tracking-[0.14em] transition-colors duration-200 md:flex ${
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
          </div>
        </div>
      </header>

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.15 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="relative bg-gradient-to-b from-[#d7d7da] via-[#d1d1d4] to-[#1a1a1d] pt-16 text-black"
      >
        <div className="mx-auto max-w-[1320px] px-6 pb-6 pt-7 sm:px-10">
          <div className="relative mt-4 grid min-h-[560px] grid-cols-1 items-center gap-4 md:grid-cols-[110px_1fr_620px]">
            <div className="hidden h-full items-center justify-center md:flex">
              <span
                ref={sideTitleRef}
                className="rotate-180 text-[132px] font-black leading-none tracking-tight lg:text-[150px]"
                style={{ writingMode: "vertical-rl" }}
              >
                VESSEL
              </span>
            </div>

            <div className="z-10 mx-auto w-full max-w-[520px] pt-6 md:ml-auto md:translate-x-20 md:pt-0 lg:translate-x-28">
              <h1 className="text-[44px] font-semibold leading-[1.04] tracking-[-0.025em] text-black md:text-[52px]">
                Give Your Ideas a Soul
              </h1>
              <p className="mt-2 text-[11px] text-black/65">
                Solana-Native AI Agent Orchestrator &amp; Marketplace
              </p>
              <p className="mt-1 text-[11px] text-black/52">From forge to ownership to collaborative execution.</p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <motion.button
                  onClick={() => router.push("/forge")}
                  className="inline-flex h-10 cursor-pointer items-center bg-black px-5 text-[12px] font-semibold tracking-[0.06em] text-white shadow-sm transition-all duration-200 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/35"
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Forge Your First Agent
                </motion.button>
                <WalletMultiButton
                  style={{ borderRadius: 0, background: "#BDBDBD", color: "#000000" }}
                  className="!h-10 !cursor-pointer !rounded-none !border !border-black/20 !bg-[#BDBDBD] !px-5 !text-[12px] !font-semibold !tracking-[0.06em] !text-black !transition-all !duration-200 hover:!bg-[#B3B3B3] hover:!shadow-sm"
                />
              </div>

              <motion.button
                onClick={() => router.push(connected ? "/dashboard" : "/agents")}
                className="mt-4 inline-flex cursor-pointer items-center gap-1 text-[11px] font-medium text-black/70 hover:text-black"
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
              >
                {connected ? "Go to Dashboard" : "Explore Agents"}
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            </div>

            <div className="pointer-events-none relative mx-auto w-full max-w-[780px] translate-y-10 self-end md:mx-0 md:ml-auto md:translate-y-16 lg:max-w-[860px]">
              <motion.div
                ref={heroCircleRef}
                initial={false}
                animate={loaderStage === "done" ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="absolute left-1/2 top-[36%] z-0 aspect-square w-[84%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff2338]"
              />
              <Image
                src="/women-hero-section-main-asset.png"
                alt="Vessel hero character"
                width={890}
                height={990}
                className="relative z-10 h-full w-full object-contain"
                priority
              />
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
        <div className="mx-auto max-w-[1320px] px-6 sm:px-10">
          <div className="rounded-[2px] bg-[#030303] px-6 py-10 sm:px-10 sm:py-12">
            <h2 className="text-[48px] font-semibold tracking-tight text-white sm:text-[56px]">The Forge</h2>

            <div className="mt-10 grid gap-8 md:grid-cols-[1fr_1fr_260px]">
              <div className="-m-3 max-w-[290px] rounded-lg border border-transparent p-3 transition-colors duration-200 hover:border-white/10 hover:bg-white/[0.02]">
                <p className="text-[30px] text-zinc-100">Step 01</p>
                <h3 className="mt-1 text-[34px] font-semibold leading-[1.08] text-white">Name &amp; Personality</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
                  Define the essence. From technical analyst to aggressive trader, shape your neural architecture.
                </p>
              </div>

              <div className="-m-3 max-w-[290px] rounded-lg border border-transparent p-3 transition-colors duration-200 hover:border-white/10 hover:bg-white/[0.02]">
                <p className="text-[30px] text-zinc-100">STEP 02</p>
                <h3 className="mt-1 text-[34px] font-semibold leading-[1.08] text-white">Tools &amp; Capabilities</h3>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-400">
                  Connect Jupiter, Orca, or Helius. Give your seeker the hands to move across agents the way you command.
                </p>
              </div>

              <div className="relative min-h-[190px]" />
            </div>

            <AnimatedBeamMultipleOutputDemo className="-mt-24 h-[680px]" />
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
        <div className="mx-auto max-w-[1320px] px-6 sm:px-10">
          <div className="mb-4 text-center">
            <h2 className="text-[54px] font-bold tracking-tight sm:text-[66px]">Agent Marketplace</h2>
            <p className="mt-3 text-center text-[14px] text-black/60">Discover and deploy AI agents optimized for your strategy</p>
          </div>
          
          <div className="mx-auto mt-16 grid max-w-[1150px] gap-6 md:grid-cols-3">
            {marketplaceHighlights.map((item) => (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-black/20 hover:shadow-[0_14px_32px_rgba(0,0,0,0.16)]"
              >
                {/* Card Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-black/5" />
                
                {/* Visualization Area */}
                <div className="relative h-[240px] overflow-hidden bg-gradient-to-br from-[#1a1e2e] via-[#16213e] to-[#0f3460] p-6">
                  {/* Glow effects */}
                  <div className="absolute left-1/2 top-[28%] h-12 w-20 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#ff2e3b] via-[#ff6b35] to-[#ff2e3b] blur-[24px] opacity-60" />
                  <div className="absolute left-[38%] top-[35%] h-3 w-5 -translate-x-1/2 rounded-full bg-[#ff1e1e]" />
                  <div className="absolute left-[62%] top-[35%] h-3 w-5 -translate-x-1/2 rounded-full bg-[#ff1e1e]" />
                  
                  {/* Grid background */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)", backgroundSize: "20px 20px"}} />
                  </div>
                </div>

                {/* Content Area */}
                <div className="relative p-5">
                  {/* Header with rating */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold tracking-tight text-black">{item.name}</h3>
                      <div className="mt-2 flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-[12px] ${i < Math.round(item.rating) ? "text-[#ffc107]" : "text-black/20"}`}>★</span>
                        ))}
                        <span className="ml-1 text-[11px] text-black/60">({item.reviews} reviews)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[20px] font-bold text-[#118ca0]">{item.price}</div>
                      <div className="text-[9px] text-black/50 tracking-wider">SOL</div>
                    </div>
                  </div>

                  {/* Category Tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#118ca0]/10 px-3 py-1 text-[10px] font-semibold text-[#118ca0] transition-colors duration-200 hover:bg-[#118ca0]/15">{item.tags[0]}</span>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-[10px] font-semibold text-black/70 transition-colors duration-200 hover:bg-black/10">{item.tags[1]}</span>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-[12px] leading-relaxed text-black/70">
                    {item.description}
                  </p>

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-black/10 pt-4">
                    <div>
                      <div className="text-[10px] text-black/50 tracking-wide uppercase">Returns</div>
                      <div className="mt-1 text-[14px] font-bold text-[#118ca0]">{item.returns}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-black/50 tracking-wide uppercase">Users</div>
                      <div className="mt-1 text-[14px] font-bold text-black">{item.users}</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-5 flex gap-3">
                    <button className="flex-1 cursor-pointer rounded-lg border-2 border-[#ff2338] bg-[#ff2338] px-4 py-2.5 text-[12px] font-semibold text-white shadow-md transition-all duration-200 hover:bg-[#e21930] hover:border-[#e21930] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2338]/35 active:translate-y-px">
                      BUY AGENT
                    </button>
                    <button className="flex-1 cursor-pointer rounded-lg border-2 border-[#ff2338] px-4 py-2.5 text-[12px] font-semibold text-[#ff2338] transition-all duration-200 hover:bg-[#ff2338]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2338]/30 active:translate-y-px">
                      RENT
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View All Section */}
          <div className="mt-16 text-center">
            <motion.button
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-black px-8 py-4 text-[14px] font-semibold text-white shadow-lg transition-all duration-200 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/35"
              whileHover={{ y: -2, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
            >
              Explore All Agents
              <span className="text-[16px]">→</span>
            </motion.button>
            <p className="mt-4 text-[12px] text-black/60">1,420+ agents available • Verified & audited</p>
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
        <div className="mx-auto max-w-[1320px] px-6 sm:px-10">
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
              className="inline-flex h-11 cursor-pointer items-center rounded-lg border-2 border-[#ff2338] bg-[#ff2338] px-6 text-[12px] font-semibold tracking-[0.06em] text-white transition-all duration-200 hover:border-[#e21930] hover:bg-[#e21930] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2338]/35"
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
      </motion.div>
    </main>
  );
}
