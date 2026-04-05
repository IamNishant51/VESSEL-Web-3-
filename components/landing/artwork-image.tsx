"use client";

import Image from "next/image";
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
    <Image
      src={artworkUrl}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
      className="object-cover object-center"
    />
  );
});
