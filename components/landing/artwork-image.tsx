"use client";

import { useEffect, useMemo, useState, memo } from "react";

import { getCyberpunkAgentDataUrl } from "@/lib/agent-avatar";

export const ArtworkImage = memo(function ArtworkImage({ artworkUrl, alt }: { artworkUrl: string; alt: string }) {
  const [mounted, setMounted] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(artworkUrl);
  const fallbackSrc = useMemo(() => getCyberpunkAgentDataUrl(artworkUrl), [artworkUrl]);

  useEffect(() => {
    setMounted(true);
    setCurrentSrc(artworkUrl);
  }, [artworkUrl]);

  if (!mounted) {
    return <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f33] via-[#14244a] to-[#0f3568]" />;
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      onError={() => {
        setCurrentSrc((previous) => (previous === fallbackSrc ? previous : fallbackSrc));
      }}
      className="absolute inset-0 h-full w-full object-cover object-center"
    />
  );
});
