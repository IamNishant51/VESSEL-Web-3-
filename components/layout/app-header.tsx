"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, TrendingUp, TrendingDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { WalletConnectButton } from "@/components/wallet/connect-button";

const navLinks = [
  { href: "/agents", label: "AGENTS" },
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/marketplace", label: "MARKETPLACE" },
  { href: "/forge", label: "FORGE" },
  { href: "/preview", label: "PREVIEW" },
  { href: "/docs", label: "DOCS" },
];

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
}

export function AppHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [prices, setPrices] = useState<PriceData[]>([
    { symbol: "SOL", price: 74.5, change24h: 2.1 },
    { symbol: "BTC", price: 43250, change24h: 1.8 },
  ]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const response = await fetch("/api/agent/price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ symbols: ["sol", "btc"] }),
        });
        const data = await response.json();
        if (data.success && data.data) {
          const priceList = Array.isArray(data.data) ? data.data : [data.data];
          setPrices(priceList);
        }
      } catch (error) {
        console.error("Failed to fetch prices:", error);
      } finally {
        setIsLoadingPrices(false);
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex flex-col border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-10">
          {/* Logo */}
          <Link href="/" className="text-lg font-bold tracking-wider text-[var(--text-primary)] hover:opacity-70">
            VESSEL
          </Link>

          {/* Live Prices - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            {prices.map((p) => (
              <div key={p.symbol} className="flex items-center gap-2 rounded-lg bg-[var(--bg-subtle)] px-3 py-1.5">
                <span className="text-xs font-bold text-[var(--text-primary)]">{p.symbol}</span>
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  ${p.price.toLocaleString(undefined, { maximumFractionDigits: p.price > 1000 ? 0 : 2 })}
                </span>
                <span className={`flex items-center text-[10px] font-medium ${p.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {p.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(p.change24h).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden gap-8 lg:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-semibold tracking-widest transition-opacity ${
                    isActive ? "opacity-100 underline" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side: Wallet + Mobile Menu */}
          <div className="ml-auto flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn-press lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <WalletConnectButton />
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 sm:px-6 lg:hidden overflow-hidden"
            >
              <nav className="flex flex-col gap-2 pb-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`rounded-lg px-3 py-3 text-sm font-semibold tracking-widest transition ${
                        isActive
                          ? "bg-[var(--bg-subtle)] text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer to prevent content overlap - matches header height */}
      <div className="h-[56px] sm:h-[60px]" />
    </>
  );
}
