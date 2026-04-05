"use client";

import { useEffect, useState } from "react";
import { useVesselStore } from "@/store/useVesselStore";

export function useStoreHydrated() {
  const hasHydrated = useVesselStore((state) => state._hasHydrated);
  const [isHydrated, setIsHydrated] = useState(hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      setIsHydrated(true);
    }
  }, [hasHydrated]);

  return isHydrated;
}
