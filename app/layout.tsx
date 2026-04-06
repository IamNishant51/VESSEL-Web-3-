import type { Metadata } from "next";

import { Toaster } from "sonner";

import { VesselWalletProvider } from "@/components/wallet/wallet-provider";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { ThemeProvider } from "@/components/providers/theme-provider";

import "./globals.css";
import "@solana/wallet-adapter-react-ui/styles.css";

export const metadata: Metadata = {
  title: "Vessel",
  description: "Give Your Ideas a Soul.",
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
      <body suppressHydrationWarning className="min-h-full bg-background font-sans text-foreground">
        <ThemeProvider>
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
        </ThemeProvider>
      </body>
    </html>
  );
}
