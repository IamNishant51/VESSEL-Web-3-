import Image from "next/image";
import Link from "next/link";

import { PREMADE_FREE_AGENTS } from "@/lib/premade-agents";
import { getAgentArtworkUrl, getAgentVisualSeed } from "@/lib/agent-visuals";

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
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(20,241,149,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(153,69,255,0.16),_transparent_30%),linear-gradient(180deg,_#07080c_0%,_#0c0f16_42%,_#0a0b10_100%)] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8">
        <section className="grid gap-6 border border-white/10 bg-white/[0.04] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.34em] text-emerald-300/90">PREVIEW GALLERY</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Compare the full cNFT visual set before you mint.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/72 sm:text-[15px]">
              Each agent is rendered from a deterministic seed, so the same agent always gets the same image.
              The updated SVG pipeline adds motion, layered glow, and stronger silhouette variation for a more
              polished collection look.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/forge" className="inline-flex h-10 items-center justify-center rounded-none bg-white px-5 text-[12px] font-semibold tracking-[0.08em] text-black transition-colors hover:bg-white/90">
                OPEN FORGE
              </Link>
              <Link href="/marketplace" className="inline-flex h-10 items-center justify-center rounded-none border border-white/14 bg-white/[0.03] px-5 text-[12px] font-semibold tracking-[0.08em] text-white transition-colors hover:bg-white/[0.06]">
                VIEW MARKETPLACE
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-emerald-400/20 bg-emerald-400/[0.08] p-4">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-emerald-200">DETERMINISTIC</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">One agent, one visual identity.</p>
              <p className="mt-2 text-sm leading-6 text-white/68">Seeded from agent identity and mint metadata, so previews and minted artwork stay stable.</p>
            </div>
            <div className="rounded-[18px] border border-fuchsia-400/20 bg-fuchsia-400/[0.08] p-4">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-fuchsia-200">MOTION</p>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-white">Animated SVG overlays.</p>
              <p className="mt-2 text-sm leading-6 text-white/68">Orbit rings, drifting glows, and subtle float motion keep the art alive without changing mint flow.</p>
            </div>
            <div className="rounded-[18px] border border-white/10 bg-white/[0.03] p-4 sm:col-span-2">
              <p className="text-[10px] font-semibold tracking-[0.22em] text-white/50">HOW TO READ</p>
              <p className="mt-3 text-sm leading-6 text-white/72">
                Compare silhouette, background style, color temperature, and risk posture. The goal is a clean
                collection that feels hand-directed while staying machine-deterministic.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {previewAgents.map((agent) => (
            <article key={agent.id} className="overflow-hidden border border-white/10 bg-white/[0.04] shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur-md">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#0b0f16]">
                <Image
                  src={agent.artworkUrl}
                  alt={`${agent.name} cNFT artwork`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                  priority={agent.id === previewAgents[0]?.id}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.14),transparent_28%),linear-gradient(180deg,transparent_0%,rgba(0,0,0,0.2)_58%,rgba(0,0,0,0.75)_100%)]" />
                <div className="absolute left-3 top-3 rounded-full border border-white/12 bg-black/40 px-3 py-1 text-[9px] font-semibold tracking-[0.2em] text-white/72 backdrop-blur">
                  {agent.riskLevel.toUpperCase()}
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold tracking-[0.2em] text-white/48">SEED {agent.seed}</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">{agent.name}</h2>
                  </div>
                  <span className="rounded-full border border-emerald-300/20 bg-emerald-300/[0.12] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-emerald-200">
                    {agent.reputation}% REP
                  </span>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <p className="min-h-[72px] text-sm leading-6 text-white/72">
                  {agent.tagline}
                </p>
                <div className="flex flex-wrap gap-2">
                  {agent.tools.slice(0, 3).map((tool) => (
                    <span key={tool} className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] text-white/70">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
