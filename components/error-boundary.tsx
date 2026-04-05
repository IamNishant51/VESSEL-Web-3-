"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-700">Something went wrong</p>
            <p className="mt-1 text-sm text-red-500">{this.state.error?.message || "An unexpected error occurred"}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-3 rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
