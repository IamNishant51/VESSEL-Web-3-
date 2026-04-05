"use client";

import { LandingNavigation } from "@/components/layout/landing-navigation";

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f5f5f6] text-black">
      <LandingNavigation forceDark />

      <main className="relative mx-auto w-full max-w-[1320px] px-4 pb-12 pt-24 sm:px-6">
        {children}
      </main>
    </div>
  );
}
