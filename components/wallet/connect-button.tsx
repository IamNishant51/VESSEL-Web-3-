"use client";

import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const WalletMultiButton = dynamic(
  async () => (await import("@solana/wallet-adapter-react-ui")).WalletMultiButton,
  {
    ssr: false,
  },
);

type Props = {
  className?: string;
};

export function WalletConnectButton({ className }: Props) {
  return (
    <div className={cn("wallet-button-wrap", className)}>
      <WalletMultiButton />
    </div>
  );
}
