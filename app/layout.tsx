import type { Metadata } from "next";

import { Toaster } from "sonner";

import { VesselWalletProvider } from "@/components/wallet/wallet-provider";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { OfflineProvider } from "@/components/providers/offline-provider";

import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://vessel-agent.vercel.app"),
  title: {
    default: "Vessel - AI Agents on Solana",
    template: "%s | Vessel",
  },
  description: "Create, deploy, and trade AI agents as compressed NFTs on Solana. Powered by Groq LLMs.",
  keywords: ["AI", "agents", "Solana", "NFT", "Web3", "LLM", "DeAI", "compressed NFT", "cNFT"],
  authors: [{ name: "Vessel", url: "https://vessel-agent.vercel.app" }],
  creator: "Vessel",
  publisher: "Vessel",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vessel-agent.vercel.app",
    siteName: "Vessel",
    title: "Vessel - AI Agents on Solana",
    description: "Create, deploy, and trade AI agents as compressed NFTs on Solana. Powered by Groq LLMs.",
    images: [
      {
        url: "/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vessel - AI Agents Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vessel - AI Agents on Solana",
    description: "Create, deploy, and trade AI agents as compressed NFTs on Solana.",
    creator: "@vessel_ai",
    images: ["/assets/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/assets/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/favicon.ico", type: "image/x-icon" },
      { url: "/assets/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/assets/favicon.ico", type: "image/x-icon" }],
    apple: [{ url: "/assets/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body suppressHydrationWarning className="min-h-full bg-background font-sans text-foreground">
        <OfflineProvider>
          <VesselWalletProvider>
            <NavigationProgress />
            {children}
            <Toaster
              position="top-right"
              richColors
              toastOptions={{
                className: "border border-white/10 bg-[#111111] text-zinc-100 dark:border-white/10 dark:bg-[#111111] dark:text-zinc-100",
              }}
            />
          </VesselWalletProvider>
        </OfflineProvider>
      </body>
    </html>
  );
}
