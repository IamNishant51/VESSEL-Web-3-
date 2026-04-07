"use client";

import React, { useEffect, useState } from "react";
import { useVesselStore } from "@/store/useVesselStore";

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const { setOnlineStatus } = useVesselStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let swUpdateIntervalId: NodeJS.Timeout | undefined;

    // Register service worker - gracefully handle registration errors
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("✓ Service Worker registered successfully", reg);

          // Check for updates periodically
          swUpdateIntervalId = setInterval(() => {
            reg.update().catch((error) => {
              console.warn("[SW] Update check failed:", error);
            });
          }, 60000); // Check every minute
        })
        .catch((err) => {
          console.warn("[SW] Registration failed (this is OK in development):", err.message);
          // Service worker registration failure is non-critical
          // App will still work, just without offline support
        });
    }

    // Track online/offline status
    const handleOnline = () => {
      setOnlineStatus(true);
      console.log("✓ App is online");

      // Trigger background sync when back online
      if ("serviceWorker" in navigator && "SyncManager" in window) {
        navigator.serviceWorker.ready
          .then((reg) => {
            void (reg as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync?.register("sync-conversations").catch(console.error);
            void (reg as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync?.register("sync-preferences").catch(console.error);
          })
          .catch((error) => {
            console.warn("[Sync] Background sync unavailable:", error);
          });
      }
    };

    const handleOffline = () => {
      setOnlineStatus(false);
      console.log("⚠ App is offline - using cached content");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial status
    setOnlineStatus(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      if (swUpdateIntervalId) clearInterval(swUpdateIntervalId);
    };
  }, [setOnlineStatus]);

  if (!mounted) return <>{children}</>;

  return <>{children}</>;
}
