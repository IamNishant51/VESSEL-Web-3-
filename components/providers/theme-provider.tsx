"use client";

import React, { useEffect, useState } from "react";
import { useVesselStore } from "@/store/useVesselStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { userPreferences, loadUserPreferences } = useVesselStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load preferences from server on mount
    loadUserPreferences().catch(console.error);
    setMounted(true);

    // Apply theme on mount
    applyTheme(userPreferences.theme || "dark");
  }, [loadUserPreferences, userPreferences]);

  if (!mounted) {
    // Return with default dark theme to prevent flash
    return <>{children}</>;
  }

  function applyTheme(theme: string) {
    const root = document.documentElement;

    if (theme === "system") {
      // Listen to system preference changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const isDark = mediaQuery.matches;
      root.classList.toggle("dark", isDark);

      // Update when system preference changes
      const handler = (e: MediaQueryListEvent) => {
        root.classList.toggle("dark", e.matches);
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else if (theme === "light") {
      root.classList.remove("dark");
    } else {
      // dark theme
      root.classList.add("dark");
    }
  }

  return <>{children}</>;
}
