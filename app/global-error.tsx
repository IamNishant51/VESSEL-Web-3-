"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-white">
        <div className="max-w-md space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-black">Something went wrong</h2>
          <p className="text-sm text-black/60">{error.message || "An unexpected error occurred"}</p>
          <button
            onClick={reset}
            className="rounded-lg bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-black/80"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
