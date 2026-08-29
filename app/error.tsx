"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
        <AlertTriangle className="w-6 h-6 text-red-400" />
      </div>
      <h1 className="text-xl font-bold tracking-tight mb-2">Something went wrong</h1>
      <p className="text-sm text-neutral-500 mb-8 max-w-xs">
        An unexpected error occurred. Try again or go back to the dashboard.
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="bg-neutral-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-neutral-700 transition-colors"
        >
          Try again
        </button>
        <a
          href="/dashboard"
          className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          Go to dashboard
        </a>
      </div>
      {error.digest && (
        <p className="mt-6 text-xs text-neutral-300 font-mono">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
