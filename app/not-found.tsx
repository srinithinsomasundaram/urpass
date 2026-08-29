import Link from "next/link";
import { Ticket } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
        <Ticket className="w-6 h-6 text-neutral-400" />
      </div>
      <p className="text-xs font-mono text-neutral-400 mb-2">404</p>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Page not found</h1>
      <p className="text-sm text-neutral-500 mb-8 max-w-xs">
        This page doesn&apos;t exist or was moved.
      </p>
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-neutral-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-neutral-700 transition-colors"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
