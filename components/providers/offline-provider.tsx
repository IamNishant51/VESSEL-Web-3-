"use client";

import React, { useEffect, useState } from "react";
import { useVesselStore } from "@/store/useVesselStore";

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { setOnlineStatus } = useVesselStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("Service Worker registered", reg);
        })
        .catch((err) => {
          console.warn("Service Worker registration failed:", err);
        });
    }

    // Track online/offline status
    const handleOnline = () => {
      setOnlineStatus(true);
      console.log("App is online");

      // Trigger background sync when back online
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        navigator.serviceWorker.ready.then((reg) => {
          reg.sync.register("sync-conversations").catch(console.error);
          reg.sync.register("sync-preferences").catch(console.error);
        });
      }
    };

    const handleOffline = () => {
      setOnlineStatus(false);
      console.log("App is offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial status
    setOnlineStatus(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [setOnlineStatus]);

  if (!mounted) return <>{children}</>;

  return <>{children}</>;
}
