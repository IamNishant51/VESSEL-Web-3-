"use client";

import { motion } from "framer-motion";
import { useId, useLayoutEffect, useRef, useState } from "react";

type RefEl = React.RefObject<HTMLElement | null>;

type AnimatedBeamProps = {
  containerRef: RefEl;
  fromRef: RefEl;
  toRef: RefEl;
  duration?: number;
  className?: string;
  strokeWidth?: number;
  curvature?: number;
};

export function AnimatedBeam({
  containerRef,
  fromRef,
  toRef,
  duration = 3,
  className,
  strokeWidth = 2,
  curvature = 0.16,
}: AnimatedBeamProps) {
  const [pathD, setPathD] = useState("");
  const [pathLen, setPathLen] = useState(0);
  const beamRef = useRef<SVGPathElement | null>(null);
  const gradientId = useId().replace(/:/g, "");
  const glowGradientId = `${gradientId}-glow`;

  useLayoutEffect(() => {
    const update = () => {
      const container = containerRef.current;
      const from = fromRef.current;
      const to = toRef.current;

      if (!container || !from || !to) {
        setPathD("");
        return;
      }

      const cRect = container.getBoundingClientRect();
      const fRect = from.getBoundingClientRect();
      const tRect = to.getBoundingClientRect();

      const startX = fRect.left + fRect.width / 2 - cRect.left;
      const startY = fRect.top + fRect.height / 2 - cRect.top;
      const endX = tRect.left + tRect.width / 2 - cRect.left;
      const endY = tRect.top + tRect.height / 2 - cRect.top;

      const midX = (startX + endX) / 2;
      const curve = Math.max(0, Math.abs(endX - startX) * curvature);

      setPathD(`M ${startX} ${startY} C ${midX + curve} ${startY}, ${midX - curve} ${endY}, ${endX} ${endY}`);
    };

    update();

    const resizeObserver = new ResizeObserver(update);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", update);
    const raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
    };
  }, [containerRef, fromRef, toRef]);

  useLayoutEffect(() => {
    if (!beamRef.current) {
      setPathLen(0);
      return;
    }

    setPathLen(beamRef.current.getTotalLength());
  }, [pathD]);

  if (!pathD) {
    return null;
  }

  return (
    <svg
      className={className ?? "pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible"}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14F195" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#6f78ff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#9945FF" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id={glowGradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#14F195" stopOpacity="0" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor="#9945FF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        ref={beamRef}
        d={pathD}
        fill="none"
        stroke="#ffffff"
        strokeWidth={strokeWidth}
        strokeOpacity={0.95}
        strokeLinecap="round"
      />
      {pathLen > 0 && (
        <motion.path
          d={pathD}
          fill="none"
          stroke={`url(#${glowGradientId})`}
          strokeWidth={strokeWidth + 1.2}
          strokeLinecap="round"
          strokeDasharray={`${Math.max(18, pathLen * 0.2)} ${pathLen}`}
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -pathLen }}
          transition={{ duration, ease: "linear", repeat: Infinity }}
        />
      )}
    </svg>
  );
}
