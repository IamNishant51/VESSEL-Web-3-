import { AppShell } from "@/components/layout/app-shell";
import { WalletGate } from "@/components/wallet/wallet-gate";

type Props = {
  children: React.ReactNode;
};

export default function CoreLayout({ children }: Props) {
  return (
    <AppShell>
      <WalletGate>{children}</WalletGate>
    </AppShell>
  );
}
