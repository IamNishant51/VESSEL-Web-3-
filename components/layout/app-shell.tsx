"use client";

import { usePathname } from "next/navigation";

import { LandingNavigation } from "@/components/layout/landing-navigation";

type Props = {
  children: React.ReactNode;
};

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const isAgentDetail = /^\/agents\/[^/]+$/.test(pathname);
  const hideNavigation = isAgentDetail;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      {!hideNavigation && <LandingNavigation forceDark />}

        <main
          className={
            isAgentDetail
              ? "relative h-[100dvh] w-full p-0"
              : "relative mx-auto w-full max-w-[1320px] px-4 pb-12 pt-4 sm:px-6"
          }
        >
        {children}
      </main>
    </div>
  );
}
