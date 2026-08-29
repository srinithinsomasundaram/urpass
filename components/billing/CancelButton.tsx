"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { cancelSubscription } from "@/app/actions/billing";

export default function CancelButton() {
  const [confirm, setConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleCancel() {
    setError("");
    startTransition(async () => {
      const result = await cancelSubscription();
      if (result?.error) {
        setError(result.error);
        setConfirm(false);
      } else {
        router.refresh();
        setConfirm(false);
      }
    });
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
      >
        Cancel plan
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 items-end">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setConfirm(false)}
          className="text-xs text-neutral-400 hover:text-neutral-700"
        >
          Keep plan
        </button>
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="flex items-center gap-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
          Confirm cancel
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
