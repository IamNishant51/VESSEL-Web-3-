"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";

type Props = {
  children: React.ReactNode;
};

export function SmoothScrollProvider({ children }: Props) {
  const lenisRef = useRef<Lenis | null>(null);
  const frameRef = useRef<number>(0);
  const restartRef = useRef<(() => void) | null>(null);

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
        if (!restartRef.current) {
          restartRef.current = () => {
            rafId = requestAnimationFrame(raf);
            window.removeEventListener("wheel", restartRef.current!);
            window.removeEventListener("touchstart", restartRef.current!);
          };
        }

        const restart = restartRef.current;
        if (restart) {
          rafId = requestAnimationFrame(raf);
          window.addEventListener("wheel", restart, { passive: true, once: true });
          window.addEventListener("touchstart", restart, { passive: true, once: true });
        }
      }
      lastScrollTime = now;
    };

    rafId = requestAnimationFrame(raf);
    frameRef.current = rafId;

    return () => {
      cancelAnimationFrame(rafId);
      if (restartRef.current) {
        window.removeEventListener("wheel", restartRef.current);
        window.removeEventListener("touchstart", restartRef.current);
        restartRef.current = null;
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
