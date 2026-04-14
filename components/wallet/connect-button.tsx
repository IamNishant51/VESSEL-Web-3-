"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Copy, ExternalLink, LogOut, ChevronDown, Check } from "lucide-react";
import { cn, shortAddress } from "@/lib/utils";

const WALLET_INTENT_KEY = "vessel_wallet_should_stay_connected";
const WALLET_EXPLICIT_DISCONNECT_KEY = "vessel_wallet_explicit_disconnect";

type Props = {
  className?: string;
};

export function WalletConnectButton({ className }: Props) {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopyAddress = async () => {
    if (publicKey) {
      try {
        await navigator.clipboard.writeText(publicKey.toBase58());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy address:", error);
      }
    }
    setShowDropdown(false);
  };

  const handleViewExplorer = () => {
    if (publicKey) {
      const network = process.env.NEXT_PUBLIC_WALLET_ADAPTER_NETWORK || "devnet";
      const explorerUrl = network === "mainnet" 
        ? `https://solscan.io/account/${publicKey.toBase58()}`
        : `https://explorer.solana.com/account/${publicKey.toBase58()}?cluster=devnet`;
      window.open(explorerUrl, "_blank", "noopener,noreferrer");
    }
    setShowDropdown(false);
  };

  const handleLogout = () => {
    localStorage.setItem(WALLET_EXPLICIT_DISCONNECT_KEY, "1");
    localStorage.removeItem(WALLET_INTENT_KEY);
    window.dispatchEvent(new CustomEvent("vessel:wallet-explicit-disconnect"));
    setShowDropdown(false);
    void disconnect();
  };

  if (connected && publicKey) {
    const walletAddress = publicKey.toBase58();
    const truncatedAddress = shortAddress(walletAddress);

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={cn(
            "btn-press inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-lg bg-black px-4 text-[12px] font-semibold tracking-[0.06em] text-white transition-all duration-200 hover:bg-black/85",
            className
          )}
        >
          <span className="max-w-[120px] truncate">{truncatedAddress}</span>
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showDropdown && "rotate-180")} />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full z-50 mt-2 w-[200px] rounded-lg border border-black/10 bg-white py-1 shadow-lg">
            <div className="border-b border-black/10 px-3 py-2">
              <p className="text-[10px] text-black/50 uppercase tracking-wider">Connected Wallet</p>
              <p className="mt-1 truncate text-[12px] font-medium text-black">{truncatedAddress}</p>
            </div>
            
            <button
              onClick={handleCopyAddress}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-black/80 transition-colors hover:bg-black/5"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Address
                </>
              )}
            </button>
            
            <button
              onClick={handleViewExplorer}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-black/80 transition-colors hover:bg-black/5"
            >
              <ExternalLink className="h-4 w-4" />
              View on Explorer
            </button>
            
            <div className="border-t border-black/10 mt-1 pt-1" />
            
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-[13px] text-red-600 transition-colors hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => {
        localStorage.removeItem(WALLET_EXPLICIT_DISCONNECT_KEY);
        setVisible(true);
      }}
      className={cn(
        "btn-press inline-flex min-h-[44px] cursor-pointer items-center rounded-lg bg-black px-5 text-[12px] font-semibold tracking-[0.06em] text-white transition-all duration-200 hover:bg-black/85",
        className
      )}
    >
      Connect Wallet
    </button>
  );
}
