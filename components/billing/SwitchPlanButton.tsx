"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { switchPlan } from "@/app/actions/billing";

interface Props {
  planSlug: string;
  planName: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function SwitchPlanButton({
  planSlug,
  planName,
  className = "",
  style,
}: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSwitch() {
    setError("");
    startTransition(async () => {
      const result = await switchPlan(planSlug);
      if (result?.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <button
        onClick={handleSwitch}
        disabled={isPending}
        className={`flex items-center justify-center gap-2 ${className}`}
        style={style}
      >
        {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {isPending ? "Switching…" : `Switch to ${planName}`}
      </button>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
