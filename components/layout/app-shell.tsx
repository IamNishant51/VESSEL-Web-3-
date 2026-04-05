"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { WalletConnectButton } from "@/components/wallet/connect-button";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
};

const links: Array<{ href: string; label: string; external?: boolean }> = [
  { href: "/agents", label: "AGENTS" },
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/marketplace", label: "MARKETPLACE" },
  { href: "/forge", label: "FORGE" },
  { href: "/docs", label: "DOCS" },
];

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    for (const link of links) {
      if (!link.external) {
        router.prefetch(link.href);
      }
    }
  }, [router]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#f5f5f6] text-black">
      <header className="sticky top-0 z-50 bg-[#f5f5f6] px-5 pt-5 sm:px-8">
        <div className="mx-auto flex h-12 w-full max-w-[1540px] items-center justify-between rounded-2xl bg-[#ececee] px-4 shadow-[0_1px_0_rgba(0,0,0,0.06)]">
          <Link href="/" className="group inline-flex items-center gap-2">
            <span className="text-[13px] font-semibold tracking-[0.2em] text-black">VESSEL</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((link) => {
              if (link.external) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="relative text-[11px] font-medium tracking-[0.12em] text-black/72 transition-all duration-200 hover:text-black after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-current after:transition-all after:duration-200 hover:after:w-full"
                  >
                    {link.label}
                  </a>
                );
              }

              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative text-[11px] font-medium tracking-[0.12em] transition-all duration-200 after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-current after:transition-all after:duration-200",
                    isActive
                      ? "text-black after:w-full"
                      : "text-black/70 hover:text-black after:w-0 hover:after:w-full",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="appshell-wallet hidden md:block">
            <WalletConnectButton />
          </div>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl border border-black/15 bg-white text-black hover:bg-black/5 md:hidden"
                />
              }
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent className="border-black/10 bg-[#f5f5f6] p-0 text-black">
              <div className="flex h-full flex-col">
                <div className="border-b border-black/10 bg-[#efeff1] px-4 pb-4 pt-6">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-black/55">NAVIGATION</p>
                  <div className="appshell-wallet mt-3">
                    <WalletConnectButton className="w-full !h-10 !rounded-[10px] !bg-[#171819] !text-[11px] !text-white hover:!bg-[#111111]" />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-5">
                  <div className="space-y-2">
                    {links.map((link) =>
                      link.external ? (
                        <a
                          key={link.href}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="block rounded-[10px] border border-black/10 bg-white px-4 py-2.5 text-[19px] font-medium tracking-[-0.015em] text-black/85 transition hover:bg-black/5"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={cn(
                            "block rounded-[10px] border px-4 py-2.5 text-[21px] font-medium leading-[1.05] tracking-[-0.018em] transition",
                            pathname === link.href
                              ? "border-black/10 bg-[#171819] text-white"
                              : "border-black/10 bg-white text-black/78 hover:bg-black/5",
                          )}
                        >
                          {link.label}
                        </Link>
                      ),
                    )}
                  </div>
                </div>

                <div className="border-t border-black/10 px-4 py-3 text-center text-[10px] tracking-[0.12em] text-black/45">
                  VESSEL ENGINE
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative mx-auto w-full max-w-[1320px] px-4 pb-12 pt-8 sm:px-6"
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
