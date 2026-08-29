import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing — Free, Starter & Pro Plans",
  description: "URPASS pricing: Free forever, Starter at ₹299/mo (+18% GST), Pro at ₹799/mo (+18% GST). Choose the plan that fits your event needs.",
  alternates: { canonical: "https://urpass.space/pricing" },
  openGraph: {
    title: "URPASS Pricing — Affordable Event Pass Plans",
    description: "Free, Starter at ₹299/mo (+18% GST), and Pro at ₹799/mo (+18% GST). Powerful event pass management for every organizer.",
    url: "https://urpass.space/pricing",
  },
};

const plans = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    features: [
      "1 active event",
      "50 attendees",
      "Digital passes",
      "QR check-in",
      "Basic dashboard",
      "URPASS branding",
    ],
    cta: "Get started",
    href: "/signup",
    highlight: false,
  },
  {
    name: "Starter",
    price: "₹299",
    period: "/month (+18% GST)",
    features: [
      "5 active events",
      "500 attendees/event",
      "CSV upload",
      "QR check-in",
      "Remove branding",
    ],
    cta: "Start Starter",
    href: "/signup",
    highlight: true,
  },
  {
    name: "Pro",
    price: "₹799",
    period: "/month (+18% GST)",
    features: [
      "Unlimited events",
      "2,000 attendees/event",
      "CSV upload",
      "Custom branding",
      "Check-in dashboard",
      "Export data",
    ],
    cta: "Go Pro",
    href: "/signup",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight text-base">
          URPASS
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            Log in
          </Link>
          <Link href="/signup" className="text-sm bg-neutral-900 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors">
            Get started
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h1 className="text-4xl font-semibold tracking-tight">
              Simple pricing
            </h1>
            <p className="mt-3 text-neutral-500 text-sm">
              Start free. Upgrade as you grow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-6 flex flex-col gap-6 ${
                  plan.highlight
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-100"
                }`}
              >
                <div>
                  <p
                    className={`text-xs font-medium uppercase tracking-widest mb-3 ${
                      plan.highlight ? "text-neutral-400" : "text-neutral-400"
                    }`}
                  >
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold">{plan.price}</span>
                    <span
                      className={`text-sm ${
                        plan.highlight ? "text-neutral-400" : "text-neutral-400"
                      }`}
                    >
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="flex flex-col gap-2 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <svg
                        className={`w-4 h-4 shrink-0 ${
                          plan.highlight ? "text-neutral-400" : "text-neutral-400"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className={plan.highlight ? "text-neutral-200" : "text-neutral-600"}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`w-full text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    plan.highlight
                      ? "bg-white text-neutral-900 hover:bg-neutral-100"
                      : "bg-neutral-900 text-white hover:bg-neutral-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
