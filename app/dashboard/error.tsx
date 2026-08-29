"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
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
    <div className="flex flex-col items-center justify-center py-24 text-center px-6">
      <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-5">
        <AlertTriangle className="w-5 h-5 text-red-400" />
      </div>
      <h2 className="text-base font-semibold mb-1">Something went wrong</h2>
      <p className="text-sm text-neutral-500 mb-6 max-w-xs">
        Failed to load this page. Check your connection or try again.
      </p>
      <button
        onClick={reset}
        className="bg-neutral-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-neutral-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
