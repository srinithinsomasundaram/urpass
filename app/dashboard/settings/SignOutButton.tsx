"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl border border-red-100 bg-red-50 text-sm font-semibold text-red-600 hover:bg-red-100 hover:border-red-200 transition-all disabled:opacity-60 group"
    >
      {loading
        ? <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        : <LogOut className="w-4 h-4 shrink-0 group-hover:-translate-x-0.5 transition-transform" />
      }
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
