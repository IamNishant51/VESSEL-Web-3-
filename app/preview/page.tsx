"use client";

import Link from "next/link";

import { LandingNavigation } from "@/components/layout/landing-navigation";
import { PREMADE_FREE_AGENTS } from "@/lib/premade-agents";
import { getAgentArtworkUrl, getAgentVisualSeed } from "@/lib/agent-visuals";
import { getCyberpunkAgentDataUrl } from "@/lib/agent-avatar";

const previewAgents = PREMADE_FREE_AGENTS.map((agent) => ({
  id: agent.id,
  name: agent.name,
  personality: agent.personality,
  riskLevel: agent.riskLevel ?? "Balanced",
  seed: getAgentVisualSeed(agent),
  artworkUrl: getAgentArtworkUrl(agent, 1024),
  tagline: agent.tagline,
  reputation: agent.reputation ?? 80,
  tools: agent.tools ?? [],
}));

export default function PreviewPage() {
  return (
    <>
      <LandingNavigation forceDark />
      <div className="-mx-4 -mt-8 min-h-screen bg-[#fafafa] px-4 pb-10 pt-28 text-[#171819] sm:-mx-6 sm:px-6">
      <div className="mx-auto w-full max-w-[1320px]">
        <section className="mb-6 grid gap-4 rounded-[6px] border border-black/10 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] sm:grid-cols-[1.2fr_0.8fr] sm:gap-6 sm:p-6 lg:p-8">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] text-black/45">PREVIEW GALLERY</p>
            <h1 className="mt-2 max-w-3xl text-[24px] font-semibold leading-[0.95] tracking-[-0.03em] text-[#1d1f21] sm:mt-3 sm:text-[32px] lg:text-[48px]">
              Compare the full cNFT visual set before you mint.
            </h1>
            <p className="mt-2 max-w-2xl text-[13px] leading-[1.55] text-black/65 sm:mt-3 sm:text-[14px] sm:text-[15px]">
              Each agent is rendered from a deterministic seed, so the same agent always gets the same image.
              The updated SVG pipeline adds motion, layered glow, and stronger silhouette variation for a more
              polished collection look.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5 sm:mt-5 sm:gap-3">
              <Link href="/forge" className="inline-flex h-9 items-center justify-center rounded-[4px] bg-[#171819] px-4 text-[11px] font-semibold tracking-[0.08em] text-white transition-colors hover:bg-[#111111] sm:h-10 sm:px-5 sm:text-[12px]">
                OPEN FORGE
              </Link>
              <Link href="/marketplace" className="inline-flex h-9 items-center justify-center rounded-[4px] border border-black/10 bg-white px-4 text-[11px] font-semibold tracking-[0.08em] text-black/70 transition-colors hover:bg-black/5 sm:h-10 sm:px-5 sm:text-[12px]">
                VIEW MARKETPLACE
              </Link>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
            <div className="rounded-[4px] border border-black/10 bg-[#f6f7f8] p-3 sm:p-4">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-black/45">DETERMINISTIC</p>
              <p className="mt-1.5 text-[15px] font-semibold tracking-[-0.02em] text-[#1d1f21] sm:mt-2 sm:text-[18px]">One agent, one visual identity.</p>
              <p className="mt-1 text-[12px] leading-[1.5] text-black/60 sm:mt-1.5 sm:text-[13px]">Seeded from agent identity and mint metadata, so previews and minted artwork stay stable.</p>
            </div>
            <div className="rounded-[4px] border border-black/10 bg-[#f6f7f8] p-3 sm:p-4">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-black/45">MOTION</p>
              <p className="mt-1.5 text-[15px] font-semibold tracking-[-0.02em] text-[#1d1f21] sm:mt-2 sm:text-[18px]">Animated SVG overlays.</p>
              <p className="mt-1 text-[12px] leading-[1.5] text-black/60 sm:mt-1.5 sm:text-[13px]">Orbit rings, drifting glows, and subtle float motion keep the art alive without changing mint flow.</p>
            </div>
            <div className="rounded-[4px] border border-black/10 bg-[#f6f7f8] p-3 sm:col-span-2 sm:p-4">
              <p className="text-[10px] font-semibold tracking-[0.18em] text-black/45">HOW TO READ</p>
              <p className="mt-1 text-[12px] leading-[1.55] text-black/65 sm:mt-2 sm:text-[13px]">
                Compare silhouette, background style, color temperature, and risk posture. The goal is a clean
                collection that feels hand-directed while staying machine-deterministic.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {previewAgents.map((agent) => (
            <article key={agent.id} className="overflow-hidden rounded-[6px] border border-black/10 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#0b0f16]">
                <img
                  src={agent.artworkUrl}
                  alt={`${agent.name} cNFT artwork`}
                  loading={agent.id === previewAgents[0]?.id ? "eager" : "lazy"}
                  onError={(event) => {
                    const target = event.currentTarget;
                    target.onerror = null;
                    target.src = getCyberpunkAgentDataUrl(agent.id);
                  }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.1),transparent_30%),linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.15)_58%,rgba(0,0,0,0.65)_100%)]" />
                <div className="absolute left-2 top-2 rounded-[2px] bg-[#171819] px-2 py-0.5 text-[8px] font-semibold tracking-[0.12em] text-white/80 sm:left-2.5 sm:top-2.5 sm:text-[9px]">
                  {agent.riskLevel.toUpperCase()}
                </div>
                <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2 sm:bottom-2.5 sm:left-2.5 sm:right-2.5">
                  <div>
                    <p className="text-[8px] font-semibold tracking-[0.15em] text-white/40 sm:text-[9px]">SEED {agent.seed}</p>
                    <h2 className="mt-0.5 text-[14px] font-semibold tracking-[-0.02em] text-white sm:text-[18px]">{agent.name}</h2>
                  </div>
                  <span className="shrink-0 rounded-[2px] bg-[#e7f3f2] px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.12em] text-[#171819] sm:text-[9px]">
                    {agent.reputation}% REP
                  </span>
                </div>
              </div>

              <div className="space-y-2 p-2.5 sm:space-y-3 sm:p-3">
                <p className="min-h-[40px] text-[11px] leading-[1.5] text-black/70 sm:min-h-[56px] sm:text-[12px] sm:leading-[1.55]">
                  {agent.tagline}
                </p>
                <div className="flex flex-wrap gap-1">
                  {agent.tools.slice(0, 3).map((tool) => (
                    <span key={tool} className="rounded-[2px] bg-black/[0.04] px-1.5 py-0.5 text-[8px] font-medium tracking-[0.08em] text-black/60 sm:text-[9px]">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>

        <footer className="mt-12 border-t border-black/10 pt-5 text-center">
          <div className="flex flex-wrap items-center justify-center gap-5 text-[11px] tracking-[0.12em] text-black/55">
            <a href="/terms" className="transition-colors hover:text-black">TERMS</a>
            <a href="/privacy" className="transition-colors hover:text-black">PRIVACY</a>
            <a href="#" className="transition-colors hover:text-black">STATUS</a>
            <a href="#" className="transition-colors hover:text-black">TWITTER</a>
            <a href="#" className="transition-colors hover:text-black">DISCORD</a>
          </div>
          <p className="mt-3 pb-1 text-[10px] tracking-[0.12em] text-black/50">&copy; 2026 VESSEL ENGINE. ALL RIGHTS RESERVED.</p>
        </footer>
      </div>
      </div>
    </>
  );
}
