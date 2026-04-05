"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
}

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse relative overflow-hidden bg-gradient-to-r from-neutral-200 via-neutral-100 to-neutral-200 dark:from-neutral-800 dark:via-neutral-700 dark:to-neutral-800",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10" />
    </div>
  )
}

export function SkeletonImage({
  src,
  alt,
  className,
  fallbackSrc,
}: SkeletonImageProps) {
  const [isLoaded, setIsLoaded] = React.useState(false)
  const [hasError, setHasError] = React.useState(false)
  const [showFallback, setShowFallback] = React.useState(false)

  const currentSrc = hasError && fallbackSrc ? fallbackSrc : src

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {!isLoaded && !showFallback && (
        <Skeleton className="absolute inset-0 z-10" />
      )}
      
      <img
        src={currentSrc}
        alt={alt}
        loading="eager"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          if (fallbackSrc && !showFallback) {
            setShowFallback(true)
          } else {
            setHasError(true)
          }
        }}
        className={cn(
          "h-full w-full object-contain transition-all duration-500",
          isLoaded || showFallback ? "opacity-100" : "opacity-0",
          showFallback && "opacity-100"
        )}
      />
    </div>
  )
}
