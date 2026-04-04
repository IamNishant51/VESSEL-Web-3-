"use client";

import { useEffect } from "react";
import Lenis from "lenis";

type Props = {
  children: React.ReactNode;
};

export function SmoothScrollProvider({ children }: Props) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.9,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1,
    });

    let frameId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    };

    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
