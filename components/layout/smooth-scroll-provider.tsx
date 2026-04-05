"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

type Props = {
  children: React.ReactNode;
};

export function SmoothScrollProvider({ children }: Props) {
  const lenisRef = useRef<Lenis | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.9,
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1,
    });

    lenisRef.current = lenis;

    let lastScrollTime = Date.now();
    let rafId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);

      // Stop rAF loop if no scroll activity for 2 seconds (saves CPU/battery)
      const now = Date.now();
      if (now - lastScrollTime > 2000) {
        cancelAnimationFrame(rafId);
        // Restart on next wheel event
        const restart = () => {
          rafId = requestAnimationFrame(raf);
        window.removeEventListener("wheel", restart);
        window.removeEventListener("touchstart", restart);
        };
        window.addEventListener("wheel", restart, { passive: true });
        window.addEventListener("touchstart", restart, { passive: true });
      }
      lastScrollTime = now;
    };

    rafId = requestAnimationFrame(raf);
    frameRef.current = rafId;

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
