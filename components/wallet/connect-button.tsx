"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { cn, shortAddress } from "@/lib/utils";

const WALLET_INTENT_KEY = "vessel_wallet_should_stay_connected";
const WALLET_EXPLICIT_DISCONNECT_KEY = "vessel_wallet_explicit_disconnect";

type Props = {
  className?: string;
};

export function WalletConnectButton({ className }: Props) {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  if (connected && publicKey) {
    return (
      <button
        onClick={() => {
          localStorage.setItem(WALLET_EXPLICIT_DISCONNECT_KEY, "1");
          localStorage.removeItem(WALLET_INTENT_KEY);
          window.dispatchEvent(new CustomEvent("vessel:wallet-explicit-disconnect"));
          void disconnect();
        }}
        className={cn(
          "inline-flex h-10 cursor-pointer items-center bg-black px-5 text-[12px] font-semibold tracking-[0.06em] text-white transition-all duration-200 hover:bg-black/85",
          className
        )}
      >
        {shortAddress(publicKey.toBase58())}
      </button>
    );
  }

  return (
    <button
      onClick={() => {
        localStorage.removeItem(WALLET_EXPLICIT_DISCONNECT_KEY);
        setVisible(true);
      }}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center bg-black px-5 text-[12px] font-semibold tracking-[0.06em] text-white transition-all duration-200 hover:bg-black/85",
        className
      )}
    >
      Connect Wallet
    </button>
  );
}
