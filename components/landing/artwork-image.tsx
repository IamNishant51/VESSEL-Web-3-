"use client";

import { useEffect, useMemo, useState, memo } from "react";

import { getCyberpunkAgentDataUrl } from "@/lib/agent-avatar";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-[#1a1f33] via-[#14244a] to-[#0f3568] ${className || ""}`}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />
    </div>
  );
}

export const ArtworkImage = memo(function ArtworkImage({ artworkUrl, alt }: { artworkUrl: string; alt: string }) {
  const [mounted, setMounted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(artworkUrl);
  const fallbackSrc = useMemo(() => getCyberpunkAgentDataUrl(artworkUrl), [artworkUrl]);

  useEffect(() => {
    setMounted(true);
    setCurrentSrc(artworkUrl);
    setIsLoaded(false);
  }, [artworkUrl]);

  if (!mounted) {
    return <Skeleton className="absolute inset-0" />;
  }

  return (
    <div className="relative h-full w-full">
      {!isLoaded && <Skeleton className="absolute inset-0 z-10" />}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setCurrentSrc((previous) => (previous === fallbackSrc ? previous : fallbackSrc));
          setIsLoaded(true);
        }}
        className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
});
