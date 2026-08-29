"use client";

import { useState } from "react";
import { KeyRound, Loader2, CheckCircle } from "lucide-react";
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
      <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
        <div>
          <p className="text-sm font-medium text-green-800">Reset email sent</p>
          <p className="text-xs text-green-600 mt-0.5">
            Check your inbox and follow the link to set a new password.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleReset}
        disabled={state === "loading"}
        className="flex items-center gap-2 px-4 py-2.5 border border-neutral-200 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === "loading" ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <KeyRound className="w-4 h-4 text-neutral-500" />
        )}
        {state === "loading" ? "Sending…" : "Send reset email"}
      </button>
      {state === "error" && (
        <p className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
