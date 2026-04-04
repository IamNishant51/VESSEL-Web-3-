"use client";

import { Lock } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletConnectButton } from "@/components/wallet/connect-button";

type Props = {
  children: React.ReactNode;
};

export function WalletGate({ children }: Props) {
  const { connected } = useWallet();

  if (connected) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl items-center justify-center px-4 py-24">
      <Card className="w-full border-white/10 bg-black/50 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Lock className="h-4 w-4 text-[#14F195]" />
            Connect Your Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-zinc-300">
          <p>
            Vessel uses your Solana wallet for identity and agent ownership.
            Connect to continue.
          </p>
          <WalletConnectButton />
        </CardContent>
      </Card>
    </div>
  );
}
