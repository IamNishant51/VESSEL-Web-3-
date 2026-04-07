"use client";

import { LandingNavigation } from "@/components/layout/landing-navigation";

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      <LandingNavigation forceDark />

        <main className="relative mx-auto w-full max-w-[1320px] px-4 pb-12 pt-4 sm:px-6">
        {children}
      </main>
    </div>
  );
}
