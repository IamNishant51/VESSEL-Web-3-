"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { WalletConnectButton } from "@/components/wallet/connect-button";

const navLinks = [
  { href: "/agents", label: "AGENTS" },
  { href: "/dashboard", label: "DASHBOARD" },
  { href: "/marketplace", label: "MARKETPLACE" },
  { href: "/forge", label: "FORGE" },
  { href: "/preview", label: "PREVIEW" },
  { href: "/docs", label: "DOCS" },
];

export function AppHeader() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-full items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-10">
          {/* Logo */}
          <Link href="/" className="text-lg font-bold tracking-wider text-black hover:opacity-70">
            VESSEL
          </Link>

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
            <WalletConnectButton />

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-lg border border-black/10 text-black hover:bg-black/5"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-black/10 bg-white/95 px-4 py-3 sm:px-6 lg:hidden">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold tracking-widest transition ${
                      isActive
                        ? "bg-black/5 text-black"
                        : "text-black/70 hover:bg-black/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Spacer to prevent content overlap */}
      <div className="h-16" />
    </>
  );
}
