"use client";

import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider, useWalletModal } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { BackpackWalletAdapter } from "@solana/wallet-adapter-backpack";
import { WalletReadyState, WalletName } from "@solana/wallet-adapter-base";
import { useEffect, useMemo, useRef, useState } from "react";

import { solanaRpcUrl } from "@/lib/solana";

type Props = {
  children: React.ReactNode;
};

const WALLET_INTENT_KEY = "vessel_wallet_should_stay_connected";
const WALLET_EXPLICIT_DISCONNECT_KEY = "vessel_wallet_explicit_disconnect";

function WalletReconnectGuard({ children }: Props) {
  const { wallet, select, connected, connecting } = useWallet();
  const isConnectingRef = useRef(false);

  useEffect(() => {
    if (connected) {
      localStorage.setItem(WALLET_INTENT_KEY, "1");
      localStorage.removeItem(WALLET_EXPLICIT_DISCONNECT_KEY);
      return;
    }

    if (connecting || isConnectingRef.current) {
      return;
    }

    const explicitlyDisconnected = localStorage.getItem(WALLET_EXPLICIT_DISCONNECT_KEY) === "1";
    if (explicitlyDisconnected) return;

    const hasIntent = localStorage.getItem(WALLET_INTENT_KEY) === "1";
    if (!hasIntent) return;

    const selectedWalletName = wallet?.adapter?.name;
    if (!selectedWalletName) return;

    const adapter = wallet?.adapter;
    const readyState = adapter?.readyState;
    if (readyState !== WalletReadyState.Installed && readyState !== WalletReadyState.Loadable) {
      return;
    }

    isConnectingRef.current = true;

    const attemptReconnect = async () => {
      try {
        select(selectedWalletName as WalletName<string>);
        await adapter.connect();
      } catch {
        // User cancelled or wallet not ready.
      } finally {
        isConnectingRef.current = false;
      }
    };

    const timeout = setTimeout(attemptReconnect, 500);

    return () => {
      clearTimeout(timeout);
      isConnectingRef.current = false;
    };
  }, [wallet, connected, connecting, select]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const markExplicitDisconnect = () => {
      localStorage.setItem(WALLET_EXPLICIT_DISCONNECT_KEY, "1");
      localStorage.removeItem(WALLET_INTENT_KEY);
    };

    window.addEventListener("vessel:wallet-explicit-disconnect", markExplicitDisconnect as EventListener);
    return () => {
      window.removeEventListener("vessel:wallet-explicit-disconnect", markExplicitDisconnect as EventListener);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeUnload = () => {
      if (connected) {
        localStorage.setItem(WALLET_INTENT_KEY, "1");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [connected]);

  return <>{children}</>;
}

function WalletModalInterceptor({ children }: Props) {
  const { wallet, select, connected, connecting } = useWallet();
  const { visible } = useWalletModal();
  const prevVisibleRef = useRef(false);
  const [hasResetOnOpen, setHasResetOnOpen] = useState(false);

  useEffect(() => {
    if (!prevVisibleRef.current && visible) {
      setHasResetOnOpen(false);
    }
    prevVisibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!visible) return;
    if (hasResetOnOpen) return;

    const resetAndPrepare = async () => {
      if (wallet?.adapter && !connected) {
        try {
          if (wallet.adapter.connected || wallet.adapter.connecting) {
            await wallet.adapter.disconnect();
          }
        } catch {
          // Ignore
        }
      }
      setHasResetOnOpen(true);
    };

    void resetAndPrepare();
  }, [visible, wallet, connected, hasResetOnOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!visible) return;

    const handleWalletClick = async (e: Event) => {
      const target = e.target as HTMLElement;
      const walletButton = target.closest('button') || target.closest('li');
      
      if (!walletButton) return;

      const textContent = (walletButton.textContent || "").trim();
      const imgAlt = walletButton.querySelector("img")?.alt || "";
      const combinedText = `${textContent} ${imgAlt}`.toLowerCase();

      let walletName: string | null = null;
      if (combinedText.includes("phantom")) {
        walletName = "Phantom";
      } else if (combinedText.includes("backpack")) {
        walletName = "Backpack";
      } else if (combinedText.includes("brave")) {
        walletName = "Brave Wallet";
      }

      if (walletName) {
        e.preventDefault();
        e.stopPropagation();

        if (wallet?.adapter && (wallet.adapter.connected || wallet.adapter.connecting || connecting)) {
          try {
            await wallet.adapter.disconnect();
          } catch {}
          await new Promise(resolve => setTimeout(resolve, 150));
        }

        select(walletName as WalletName<string>);
      }
    };

    document.addEventListener("click", handleWalletClick, true);

    return () => {
      document.removeEventListener("click", handleWalletClick, true);
    };
  }, [visible, wallet, select, connecting]);

  return <>{children}</>;
}

export function VesselWalletProvider({ children }: Props) {
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    [],
  );

  return (
    <ConnectionProvider endpoint={solanaRpcUrl}>
      <WalletProvider 
        wallets={wallets} 
        autoConnect={false}
        onError={(error) => {
          if (
            error?.name === "WalletNotReadyError" ||
            error?.name === "WalletSendTransactionError" ||
            error?.name === "WalletSignTransactionError"
          ) {
            return;
          }
          console.error("Wallet connection error:", error);
        }}
      >
        <WalletModalProvider>
          <WalletModalInterceptor>
            <WalletReconnectGuard>{children}</WalletReconnectGuard>
          </WalletModalInterceptor>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
