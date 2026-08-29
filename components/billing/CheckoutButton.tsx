"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { activatePaidSubscription } from "@/app/actions/billing";

interface Props {
  planSlug: string;
  planName: string;
  userEmail: string;
  userName: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CheckoutButton({
  planSlug,
  planName,
  userEmail,
  userName,
  children,
  className = "",
  style,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleClick() {
    setLoading(true);
    setError("");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Could not load payment SDK. Check your connection.");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not create order");
        setLoading(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "URPASS",
        description: `${planName} plan — monthly`,
        order_id: data.orderId,
        prefill: { name: userName, email: userEmail },
        theme: { color: "#0a0a0a" },
        modal: { ondismiss: () => setLoading(false) },
        handler: async (response: { razorpay_payment_id?: string }) => {
          // Payment captured — activate subscription immediately via server action
          await activatePaidSubscription(planSlug, response?.razorpay_payment_id);
          router.refresh();
          setLoading(false);
        },
      });

      rzp.open();
    } catch {
      setError("Payment failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center justify-center gap-2 ${className}`}
        style={style}
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {children}
      </button>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
