"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { WalletConnectButton } from "../wallet/connect-button";

const navLinks: Array<{ href: string; label: string; external?: boolean }> = [
  { href: "/agents", label: "AGENTS" },
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/marketplace", label: "MARKETPLACE" },
  { href: "/forge", label: "FORGE" },
  { href: "/preview", label: "PREVIEW" },
  { href: "/docs", label: "DOCS" },
];

interface LandingNavigationProps {
  darkSectionsRefs?: React.RefObject<HTMLElement | null>[];
  forceLight?: boolean;
  forceDark?: boolean;
}

export function LandingNavigation({
  darkSectionsRefs = [],
  forceLight = false,
  forceDark = false
}: LandingNavigationProps) {
  const pathname = usePathname();
  const [isNavOnDark, setIsNavOnDark] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (forceLight) {
      setIsNavOnDark(false);
      return;
    }
    if (forceDark) {
      setIsNavOnDark(true);
      return;
    }

    let ticking = false;
    const updateNavTheme = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const probeY = window.scrollY + 56;
        const darkSections = darkSectionsRefs
          .map(ref => ref?.current)
          .filter((element): element is HTMLElement => element !== null && element !== undefined);

        const isDarkNow = darkSections.some((section) => {
          const start = section.offsetTop;
          const end = start + section.offsetHeight;
          return probeY >= start && probeY <= end;
        });

        setIsNavOnDark(isDarkNow);
        ticking = false;
      });
    };

    updateNavTheme();
    window.addEventListener("scroll", updateNavTheme, { passive: true });
    window.addEventListener("resize", updateNavTheme);

    return () => {
      window.removeEventListener("scroll", updateNavTheme);
      window.removeEventListener("resize", updateNavTheme);
    };
  }, [darkSectionsRefs, forceLight, forceDark]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto max-w-[1320px] px-3 pt-3 sm:px-4 sm:pt-4 lg:px-10">
        <div
          className={`flex items-center justify-between rounded-xl px-3 py-2 backdrop-blur-md transition-colors duration-300 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center ${
            isNavOnDark ? "bg-black/35" : forceLight ? "bg-white/65" : "bg-white/45"
          }`}
        >
          <motion.button
            onClick={() => {
              window.location.href = '/';
            }}
            className={`text-[15px] font-medium tracking-[0.16em] transition-colors duration-200 cursor-pointer hover:opacity-80 lg:justify-self-start ${
              isNavOnDark ? "text-white" : "text-black"
            }`}
            whileHover={{ y: -1 }}
          >
            VESSEL
          </motion.button>

          <nav
            className={`hidden items-center gap-9 text-[10px] font-medium tracking-[0.14em] transition-colors duration-200 lg:flex lg:justify-self-center ${
              isNavOnDark ? "text-white" : "text-black"
            }`}
          >
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"));
              return link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className={`relative transition-all duration-200 hover:-translate-y-0.5 after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-current after:transition-all after:duration-200 ${
                    isActive
                      ? "opacity-100 after:w-full"
                      : "opacity-90 hover:opacity-65 after:w-0 hover:after:w-full"
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative transition-all duration-200 hover:-translate-y-0.5 after:absolute after:-bottom-1 after:left-0 after:h-px after:bg-current after:transition-all after:duration-200 ${
                    isActive
                      ? "opacity-100 after:w-full"
                      : "opacity-90 hover:opacity-65 after:w-0 hover:after:w-full"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden lg:block lg:justify-self-end">
            <WalletConnectButton />
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`btn-press flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg lg:hidden ${
              isNavOnDark ? "bg-white/10 text-white" : "bg-black/10 text-black"
            }`}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.button
              aria-label="Close mobile menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="absolute inset-x-0 top-full z-50 px-4 pt-2 lg:hidden"
            >
              <div className={`rounded-2xl border p-4 shadow-xl backdrop-blur-xl ${
                isNavOnDark ? "border-white/10 bg-black/80" : "border-black/10 bg-white/90"
              }`}>
                <nav className="flex flex-col gap-1">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"));
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`rounded-lg px-4 py-3 text-xs font-medium tracking-[0.14em] transition-colors ${
                          isNavOnDark
                            ? isActive
                              ? "bg-white/10 text-white"
                              : "text-white/70 hover:bg-white/10"
                            : isActive
                              ? "bg-black/5 text-black"
                              : "text-black/70 hover:bg-black/5"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <WalletConnectButton className="!w-full" />
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
