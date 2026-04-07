"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookText, Braces, Cpu, Rocket, Shield, Terminal } from "lucide-react";

import { LandingNavigation } from "@/components/layout/landing-navigation";

const sideMenu = [
  { label: "Documentation", icon: BookText, href: "#introduction" },
  { label: "Quick Start", icon: Rocket, href: "#quick-start" },
  { label: "API Reference", icon: Braces, href: "#api-reference" },
  { label: "Architecture", icon: Terminal, href: "#architecture" },
  { label: "Security", icon: Shield, href: "#security" },
];

const conceptLinks = [
  "Orchestration Loops",
  "Token Gating",
  "Agent Identity",
  "Compute Providers",
];

const onThisPage = [
  { label: "Introduction", href: "#introduction" },
  { label: "Getting Started", href: "#getting-started" },
  { label: "Installation", href: "#installation" },
  { label: "Key Principles", href: "#key-principles" },
  { label: "Quick Start", href: "#quick-start" },
  { label: "API Reference", href: "#api-reference" },
  { label: "Architecture", href: "#architecture" },
  { label: "Security", href: "#security" },
];

export default function DocsPage() {
  const [activeHash, setActiveHash] = useState("#introduction");

  useEffect(() => {
    const updateFromHash = () => {
      setActiveHash(window.location.hash || "#introduction");
    };

    updateFromHash();
    window.addEventListener("hashchange", updateFromHash);

    return () => {
      window.removeEventListener("hashchange", updateFromHash);
    };
  }, []);

   return (
     <>
       <LandingNavigation forceLight />
       <div className="min-h-screen bg-[#fafafa] px-4 pt-8 sm:px-6">
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-[230px_minmax(0,1fr)] lg:grid-cols-[250px_minmax(0,1fr)_200px] lg:gap-8 mx-auto max-w-[1320px]">
        <aside className="rounded-xl border border-black/10 bg-white p-4 md:sticky md:top-28 md:h-fit">
          <p className="text-[12px] font-semibold tracking-[0.14em] text-black">DOCS</p>
          <p className="mt-1 text-[10px] font-medium tracking-[0.1em] text-[#ff2338]">v1.0.4-alpha</p>

          <div className="mt-5 space-y-1">
            {sideMenu.map((item) => {
              const Icon = item.icon;
              const isActive = item.href === activeHash;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setActiveHash(item.href)}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-left text-[11px] font-semibold tracking-[0.1em] transition-colors duration-150 ${
                    isActive
                      ? "border-black/10 bg-[#151517] text-white"
                      : "border-transparent text-black/70 hover:border-black/10 hover:bg-black/5"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </a>
              );
            })}
          </div>

          <div className="mt-8 border-t border-black/10 pt-4">
            <p className="text-[9px] font-semibold tracking-[0.18em] text-black/50">CORE CONCEPTS</p>
            <div className="mt-3 space-y-2">
              {conceptLinks.map((item) => (
                <a
                  key={item}
                  href="#architecture"
                  className="block cursor-pointer text-left text-[11px] text-black/65 transition-colors duration-150 hover:text-black"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </aside>

        <main className="rounded-xl border border-black/10 bg-white p-5 sm:p-8 lg:p-10">
          <p className="text-[11px] tracking-[0.08em] text-black/60">Documentation  &gt;  Overview</p>

          <section id="introduction" className="mt-4 border-b border-black/10 pb-8">
            <h1 className="text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-black sm:text-[56px]">
              Introduction to Vessel Engine
            </h1>
            <p className="mt-4 max-w-[860px] text-[27px] leading-[1.35] tracking-[-0.02em] text-black/70 sm:text-[32px]">
              Vessel is the high-performance orchestration layer for Solana-native AI agents.
            </p>
            <p className="mt-3 max-w-[860px] text-[17px] leading-relaxed text-black/75 sm:text-[18px]">
              Build, deploy, and scale autonomous entities with cryptographically secured identities and atomic execution.
            </p>
          </section>

          <section id="getting-started" className="mt-8">
            <h2 className="text-[33px] font-semibold tracking-[-0.02em] text-black">Getting Started</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-black/70">
              To begin building with Vessel, install the SDK and connect a Solana wallet. Start by creating your first forge draft,
              define policy limits, and publish to marketplace when your strategy is ready.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-black/10 bg-white p-4">
                <Rocket className="h-4 w-4 text-[#ff2338]" />
                <p className="mt-3 text-[17px] font-semibold text-black">Instant Deployment</p>
                <p className="mt-2 text-[14px] text-black/70">
                  Push your local agent logic to the global Vessel runtime in under 30 seconds.
                </p>
              </div>
              <div className="rounded-lg border border-black/10 bg-white p-4">
                <Shield className="h-4 w-4 text-[#ff2338]" />
                <p className="mt-3 text-[17px] font-semibold text-black">Atomic Settlements</p>
                <p className="mt-2 text-[14px] text-black/70">
                  Every approved execution can emit signed outcomes and settle directly on-chain.
                </p>
              </div>
            </div>
          </section>

          <section id="installation" className="mt-10">
            <h2 className="text-[33px] font-semibold tracking-[-0.02em] text-black">Installation</h2>
            <p className="mt-3 text-[16px] text-black/70">Run this command in your terminal to install the orchestration toolkit:</p>

            <div className="mt-4 rounded-lg border border-black/15 bg-[#161617] p-4 text-white">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <button className="cursor-pointer rounded border border-white/15 px-2 py-1 text-[10px] text-white/70 hover:bg-white/10">
                  Copy
                </button>
              </div>
              <code className="text-[13px] sm:text-[14px]">npm install -g @vessel-engine/sdk</code>
            </div>
          </section>

          <section id="key-principles" className="mt-10 border-b border-black/10 pb-8">
            <h2 className="text-[33px] font-semibold tracking-[-0.02em] text-black">Key Principles</h2>
            <div className="mt-4 space-y-4">
              <div className="flex gap-3 rounded-lg border border-black/10 bg-white p-4">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ff2338]/15 text-[12px] font-semibold text-[#ff2338]">
                  1
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-black">Sovereign Identity</p>
                  <p className="mt-1 text-[14px] text-black/70">
                    Every agent is assigned a unique identity and policy envelope, ensuring clean ownership boundaries.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border border-black/10 bg-white p-4">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#ff2338]/15 text-[12px] font-semibold text-[#ff2338]">
                  2
                </span>
                <div>
                  <p className="text-[15px] font-semibold text-black">Execution Integrity</p>
                  <p className="mt-1 text-[14px] text-black/70">
                    Vessel validates policy constraints before routing actions to tool providers and settlement layers.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-lg border-l-2 border-[#ff2338] bg-[#ff2338]/8 p-4">
              <p className="text-[15px] font-semibold text-[#85111f]">Alpha Notice</p>
              <p className="mt-1 text-[13px] leading-relaxed text-black/70">
                Vessel is currently in public alpha. Cross-chain bridges and advanced tenancy controls are actively evolving.
              </p>
            </div>
          </section>

          <section id="quick-start" className="mt-10 border-b border-black/10 pb-8">
            <h2 className="text-[33px] font-semibold tracking-[-0.02em] text-black">Quick Start</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-black/70">
              Follow this four-step flow to launch your first policy-aware Vessel agent.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-black/10 bg-white p-4">
                <p className="text-[11px] font-semibold tracking-[0.1em] text-black/55">STEP 01</p>
                <p className="mt-2 text-[17px] font-semibold text-black">Forge Draft</p>
                <p className="mt-1 text-[14px] text-black/70">Define agent name, system prompt, and baseline behavior profile.</p>
              </div>
              <div className="rounded-lg border border-black/10 bg-white p-4">
                <p className="text-[11px] font-semibold tracking-[0.1em] text-black/55">STEP 02</p>
                <p className="mt-2 text-[17px] font-semibold text-black">Tool Scope</p>
                <p className="mt-1 text-[14px] text-black/70">Attach tool permissions such as swaps, staking, transfers, and minting.</p>
              </div>
              <div className="rounded-lg border border-black/10 bg-white p-4">
                <p className="text-[11px] font-semibold tracking-[0.1em] text-black/55">STEP 03</p>
                <p className="mt-2 text-[17px] font-semibold text-black">Policy Limits</p>
                <p className="mt-1 text-[14px] text-black/70">Set max SOL per transaction and daily/weekly USDC budgets.</p>
              </div>
              <div className="rounded-lg border border-black/10 bg-white p-4">
                <p className="text-[11px] font-semibold tracking-[0.1em] text-black/55">STEP 04</p>
                <p className="mt-2 text-[17px] font-semibold text-black">Run + Observe</p>
                <p className="mt-1 text-[14px] text-black/70">Execute from dashboard and review signed traces and outcomes.</p>
              </div>
            </div>
          </section>

          <section id="api-reference" className="mt-10 border-b border-black/10 pb-8">
            <h2 className="text-[33px] font-semibold tracking-[-0.02em] text-black">API Reference</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-black/70">
              Vessel exposes focused endpoints for execution and tooling. Use these as your orchestration surface.
            </p>
            <div className="mt-5 space-y-3">
              <div className="rounded-lg border border-black/10 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[14px] font-semibold text-black">POST /api/agents/[id]/run</p>
                  <span className="rounded border border-[#ff2338]/40 bg-[#ff2338]/10 px-2 py-1 text-[10px] font-semibold text-[#9e1422]">RUN</span>
                </div>
                <p className="mt-2 text-[14px] text-black/70">Execute agent with user message and receive structured response + optional tx signature.</p>
              </div>
              <div className="rounded-lg border border-black/10 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[14px] font-semibold text-black">GET /api/agents/tools</p>
                  <span className="rounded border border-[#ff2338]/40 bg-[#ff2338]/10 px-2 py-1 text-[10px] font-semibold text-[#9e1422]">TOOLS</span>
                </div>
                <p className="mt-2 text-[14px] text-black/70">Fetch available tool categories for forge setup and capability binding.</p>
              </div>
            </div>
          </section>

          <section id="architecture" className="mt-10 border-b border-black/10 pb-8">
            <h2 className="text-[33px] font-semibold tracking-[-0.02em] text-black">Architecture</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-black/70">
              Vessel runtime composes four deterministic layers so agent execution remains explainable and safe.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { title: "Planner", text: "Transforms prompt intent into deterministic action graph.", icon: Cpu },
                { title: "Policy Engine", text: "Applies budget, risk, and allowed-action constraints.", icon: Shield },
                { title: "Tool Router", text: "Chooses optimal provider path per action type.", icon: Braces },
                { title: "Settlement", text: "Collects transaction signatures and trace logs.", icon: Terminal },
              ].map((node) => {
                const Icon = node.icon;
                return (
                  <div key={node.title} className="rounded-lg border border-black/10 bg-white p-4">
                    <Icon className="h-4 w-4 text-[#ff2338]" />
                    <p className="mt-2 text-[16px] font-semibold text-black">{node.title}</p>
                    <p className="mt-1 text-[14px] text-black/70">{node.text}</p>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="security" className="mt-10 border-b border-black/10 pb-8">
            <h2 className="text-[33px] font-semibold tracking-[-0.02em] text-black">Security</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-black/70">
              Security is enforced by design through identity, policy constraints, and execution traceability.
            </p>
            <ul className="mt-4 space-y-2 text-[14px] leading-relaxed text-black/75">
              <li className="rounded-md border border-black/10 bg-white px-3 py-2">Policy checks occur before tool invocation.</li>
              <li className="rounded-md border border-black/10 bg-white px-3 py-2">Wallet identity is used for ownership and access gating.</li>
              <li className="rounded-md border border-black/10 bg-white px-3 py-2">Actions include deterministic metadata for replay-safe analysis.</li>
              <li className="rounded-md border border-black/10 bg-white px-3 py-2">Budget and risk settings prevent overspending by default.</li>
            </ul>
          </section>

          <div className="mt-8 flex items-center justify-between text-[12px]">
            <button className="cursor-pointer text-left text-black/65 transition-colors hover:text-black">
              <p className="tracking-[0.1em]">PREVIOUS</p>
              <p className="mt-1 font-semibold text-[#85111f]">Documentation Home</p>
            </button>
            <button className="cursor-pointer text-right text-black/65 transition-colors hover:text-black">
              <p className="tracking-[0.1em]">NEXT</p>
              <p className="mt-1 font-semibold text-[#85111f]">Setting Up Solana CLI</p>
            </button>
          </div>
        </main>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-xl border border-black/10 bg-white p-4">
              <p className="text-[10px] font-semibold tracking-[0.16em] text-black/60">ON THIS PAGE</p>
              <div className="mt-3 space-y-2">
                {onThisPage.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setActiveHash(item.href)}
                    className={`block cursor-pointer text-left text-[12px] transition-colors duration-150 ${
                      item.href === activeHash ? "text-[#85111f]" : "text-black/60 hover:text-black"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-4">
              <p className="text-[11px] font-semibold tracking-[0.08em] text-black">Need help?</p>
              <div className="mt-3 space-y-2">
                <button className="flex w-full cursor-pointer items-center justify-between rounded-md border border-black/10 px-3 py-2 text-[11px] text-black/70 hover:bg-black/5">
                  Join Discord
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button className="flex w-full cursor-pointer items-center justify-between rounded-md border border-black/10 px-3 py-2 text-[11px] text-black/70 hover:bg-black/5">
                  Edit Page
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <footer className="border-t border-black/10 py-8">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-center gap-3 px-4 text-[11px] tracking-[0.12em] text-black/55 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/terms" className="transition-colors hover:text-black">TERMS</Link>
            <Link href="/privacy" className="transition-colors hover:text-black">PRIVACY</Link>
            <a href="#" className="transition-colors hover:text-black">STATUS</a>
            <a href="#" className="transition-colors hover:text-black">TWITTER</a>
            <a href="#" className="transition-colors hover:text-black">DISCORD</a>
          </div>
          <p className="mt-1 text-[12px] font-semibold tracking-[0.2em] text-black/60">VESSEL ENGINE</p>
          <p className="text-[10px]">© 2026 Vessel Engine. All rights reserved.</p>
        </div>
      </footer>
      </div>
    </>
  );
}
