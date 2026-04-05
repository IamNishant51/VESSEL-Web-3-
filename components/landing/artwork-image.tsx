"use client";

import { useEffect, useState, memo } from "react";

export const ArtworkImage = memo(function ArtworkImage({ artworkUrl, alt }: { artworkUrl: string; alt: string }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f33] via-[#14244a] to-[#0f3568]" />;
  }

  return (
    <img
      src={artworkUrl}
      alt={alt}
      loading="lazy"
      className="absolute inset-0 h-full w-full object-cover object-center"
    />
  );
});
