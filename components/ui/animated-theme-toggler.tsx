"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useVesselStore } from "@/store/useVesselStore";

export function AnimatedThemeToggler() {
  const { userPreferences, updateUserPreferences } = useVesselStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = userPreferences.theme || "dark";

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    updateUserPreferences({ theme });

    // Apply theme to DOM immediately
    const root = document.documentElement;
    if (theme === "system") {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", isDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-black/10 bg-black/5 p-1 dark:border-white/10 dark:bg-white/5">
      {/* Light mode button */}
      <button
        onClick={() => handleThemeChange("light")}
        className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-all ${
          currentTheme === "light"
            ? "bg-white text-black shadow-md dark:bg-slate-800 dark:text-white"
            : "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
        }`}
        title="Light mode"
      >
        <Sun className="h-4 w-4" />
      </button>

      {/* Dark mode button */}
      <button
        onClick={() => handleThemeChange("dark")}
        className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-all ${
          currentTheme === "dark"
            ? "bg-white text-black shadow-md dark:bg-slate-800 dark:text-white"
            : "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
        }`}
        title="Dark mode"
      >
        <Moon className="h-4 w-4" />
      </button>

      {/* System mode button */}
      <button
        onClick={() => handleThemeChange("system")}
        className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-all ${
          currentTheme === "system"
            ? "bg-white text-black shadow-md dark:bg-slate-800 dark:text-white"
            : "text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white"
        }`}
        title="System theme"
      >
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14l4 4V5c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v3z" />
        </svg>
      </button>
    </div>
  );
}
