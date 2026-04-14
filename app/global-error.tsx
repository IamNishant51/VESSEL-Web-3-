"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <div className="mx-4 max-w-md text-center">
          <div className="mb-6">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
            <p className="text-sm text-zinc-400">
              We encountered an unexpected error. Please try again.
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="mb-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Error Details
            </p>
            <p className="font-mono text-xs text-zinc-300">
              {error.message || "Unknown error occurred"}
            </p>
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              className="flex-1 border-white/20 text-white hover:bg-white/10"
            >
              Go Home
            </Button>
            <Button
              onClick={reset}
              className="flex-1 bg-[#14F195] text-black hover:bg-[#14F195]/90"
            >
              Try Again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}