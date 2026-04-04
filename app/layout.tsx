import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Toaster } from "sonner";

import { SmoothScrollProvider } from "@/components/layout/smooth-scroll-provider";
import { VesselWalletProvider } from "@/components/wallet/wallet-provider";

import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

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
    <html lang="en" className={`${inter.variable} dark h-full antialiased`}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <VesselWalletProvider>
          <SmoothScrollProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              toastOptions={{
                className: "border border-white/10 bg-[#111111] text-zinc-100",
              }}
            />
          </SmoothScrollProvider>
        </VesselWalletProvider>
      </body>
    </html>
  );
}
