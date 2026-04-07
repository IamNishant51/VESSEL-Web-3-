"use client"

import React, { forwardRef, useRef } from "react"

import { cn } from "@/lib/utils"
import { AnimatedBeam } from "@/registry/magicui/animated-beam"

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "z-10 flex size-20 items-center justify-center rounded-full border-2 bg-white p-4 shadow-[0_0_28px_-10px_rgba(0,0,0,0.85)] [&>svg]:h-11 [&>svg]:w-11",
        className
      )}
    >
      {children}
    </div>
  )
})

Circle.displayName = "Circle"

export function ForgeBeamDemo({
  className,
}: {
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const div1Ref = useRef<HTMLDivElement>(null)
  const div2Ref = useRef<HTMLDivElement>(null)
  const div3Ref = useRef<HTMLDivElement>(null)

  return (
    <div
      className={cn(
        "relative flex h-[280px] w-full max-w-[980px] items-center justify-center overflow-hidden px-3 sm:h-[320px] sm:px-16",
        className
      )}
      ref={containerRef}
    >
      <div className="flex w-full max-w-[760px] flex-row items-center justify-center gap-2 sm:justify-between sm:gap-0">
        <Circle ref={div1Ref} className="size-16 [&>svg]:h-8 [&>svg]:w-8 sm:size-24 sm:[&>svg]:h-14 sm:[&>svg]:w-14">
          <Icons.user />
        </Circle>
        <Circle ref={div2Ref} className="size-16 [&>svg]:h-8 [&>svg]:w-8 sm:size-24 sm:[&>svg]:h-14 sm:[&>svg]:w-14">
          <Icons.neuron />
        </Circle>
        <Circle ref={div3Ref} className="size-16 [&>svg]:h-8 [&>svg]:w-8 sm:size-24 sm:[&>svg]:h-14 sm:[&>svg]:w-14">
          <Icons.rocket />
        </Circle>
      </div>

      <AnimatedBeam
        duration={5}
        containerRef={containerRef}
        fromRef={div1Ref}
        toRef={div2Ref}
        strokeWidth={4}
        curvature={0}
      />
      <AnimatedBeam
        duration={5}
        containerRef={containerRef}
        fromRef={div2Ref}
        toRef={div3Ref}
        strokeWidth={4}
        curvature={0}
      />
    </div>
  )
}

const Icons = {
  neuron: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#171819" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a10 10 0 0 1 7.38 16.75" />
      <path d="M12 8a10 10 0 0 0 1.42-4.75" />
      <path d="M12 8a2 2 0 1 1 0-4" />
      <path d="M12 2v3" />
      <path d="M12 12v3" />
      <circle cx="12" cy="12" r="2" />
      <path d="M8 6a2 2 0 0 0-2 2v2.5a2 2 0 0 1 0 4" />
      <path d="M16 6a2 2 0 0 1 2 2v2.5a2 2 0 0 0 0 4" />
    </svg>
  ),
  rocket: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#171819" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  user: () => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#171819" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
}
