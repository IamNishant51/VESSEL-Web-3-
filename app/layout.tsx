import type { Metadata } from "next";

import { Toaster } from "sonner";

import { VesselWalletProvider } from "@/components/wallet/wallet-provider";
import { NavigationProgress } from "@/components/layout/navigation-progress";

import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

export const metadata: Metadata = {
  title: "Vessel",
  description: "Give Your Ideas a Soul.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body suppressHydrationWarning className="min-h-full bg-background font-sans text-foreground">
        <VesselWalletProvider>
          <NavigationProgress />
          {children}
          <Toaster
            position="top-right"
            richColors
            toastOptions={{
              className: "border border-white/10 bg-[#111111] text-zinc-100",
            }}
          />
        </VesselWalletProvider>
      </body>
    </html>
  );
}
