"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonImageProps {
  src: string
  alt: string
  className?: string
  fallbackSrc?: string
}

export function SkeletonImage({
  src,
  alt,
  className,
  fallbackSrc,
}: SkeletonImageProps) {
  // Track remote image loading state
  const [isRemoteLoaded, setIsRemoteLoaded] = React.useState(false)
  const [remoteError, setRemoteError] = React.useState(false)

  // Preload remote image on mount
  React.useEffect(() => {
    if (!src || !fallbackSrc) return

    const img = new Image()

    img.onload = () => {
      setIsRemoteLoaded(true)
    }

    img.onerror = () => {
      setRemoteError(true)
    }

    img.src = src

    // Cleanup
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src, fallbackSrc])

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Local/Fallback Image - Always visible immediately */}
      <img
        src={fallbackSrc || src}
        alt={alt}
        loading="eager"
        className="h-full w-full object-contain"
      />

      {/* Remote Image - Overlays when loaded with smooth fade transition */}
      {isRemoteLoaded && !remoteError && (
        <img
          src={src}
          alt={alt}
          loading="eager"
          className="absolute inset-0 h-full w-full object-contain animate-in fade-in duration-300"
        />
      )}
    </div>
  )
}
