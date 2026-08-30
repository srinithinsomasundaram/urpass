"use client";

import { useState } from "react";
import { KeyRound, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { sendPasswordReset } from "@/app/actions/auth";

export default function PasswordResetButton() {
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function handleReset() {
    setState("loading");
    const result = await sendPasswordReset();
    if (result.error) {
      setError(result.error);
      setState("error");
    } else {
      setState("sent");
    }
  }

  if (state === "sent") {
    return (
      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-xl">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
        Reset link sent
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={handleReset}
        disabled={state === "loading"}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all disabled:opacity-50 shrink-0"
      >
        {state === "loading"
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <KeyRound className="w-3.5 h-3.5 text-neutral-500" />
        }
        {state === "loading" ? "Sending…" : "Reset password"}
      </button>
      {state === "error" && (
        <div className="flex items-center gap-1.5 text-xs text-red-500">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
}
