import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Billing",
  description: "Manage your URPASS subscription, upgrade your plan, and view billing details.",
  robots: { index: false, follow: false },
};
import Link from "next/link";
import {
  Check,
  Zap,
  Crown,
  Sparkles,
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Calendar,
  Users,
  Building2,
  Mail,
} from "lucide-react";
import CheckoutButton from "@/components/billing/CheckoutButton";
import CancelButton from "@/components/billing/CancelButton";
import SwitchPlanButton from "@/components/billing/SwitchPlanButton";
import { getUserPlan } from "@/lib/plan";
import ProCelebration from "@/components/billing/ProCelebration";

interface Plan {
  id: string;
  name: string;
  slug: string;
  price_monthly: number;
  max_events: number;
  max_attendees: number;
  features: string[];
}

interface Subscription {
  status: string;
  provider: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan: Plan;
}

const PLAN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  free: Sparkles,
  starter: Zap,
  pro: Crown,
  enterprise: Building2,
};

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: subData }, { data: plans }, { data: profile }, plan, { count: activeEventCount }] =
    await Promise.all([
      supabase
        .from("subscriptions")
        .select("status, provider, current_period_end, cancel_at_period_end, plan:plans(*)")
        .eq("user_id", user.id)
        .single(),
      supabase
        .from("plans")
        .select("id, name, slug, price_monthly, max_events, max_attendees, features")
        .eq("is_active", true)
        .order("price_monthly", { ascending: true }),
      supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", user.id)
        .single(),
      getUserPlan(supabase, user.id),
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("organizer_id", user.id)
        .in("status", ["draft", "active"]),
    ]);

  const sub = subData as Subscription | null;
  const currentPlanSlug = (sub?.plan as Plan | null)?.slug ?? "free";
  const allPlans: Plan[] = (plans ?? []) as Plan[];

  const renewalDate = sub?.current_period_end
    ? new Date(sub.current_period_end).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const userName = profile?.full_name ?? user.email?.split("@")[0] ?? "";
  const userEmail = profile?.email ?? user.email ?? "";
  const currentPlan = allPlans.find((p) => p.slug === currentPlanSlug);

  return (
    <div className="min-h-screen bg-neutral-950 page-in">
      <ProCelebration />

      {/* ── Dark hero ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-5 pt-10 pb-20">
        {/* Glow */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 75% 60%, #6D28D9 0%, transparent 55%)",
          }}
        />

        <div className="relative max-w-3xl mx-auto">
          {/* Back */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>

          {/* Icon badge */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
          >
            <CreditCard className="w-6 h-6 text-white" />
          </div>

          <p className="text-[10px] font-bold tracking-widest uppercase text-brand-200 mb-2">
            Billing
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
            Plan &amp; subscription
          </h1>
          <p className="text-sm text-white/35 mt-2">
            Manage your plan and billing details
          </p>

          {/* Current plan strip */}
          {currentPlan && (
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 bg-white/[0.06] border border-white/[0.08] rounded-2xl px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/30 mb-1">
                  Current plan
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-white">{currentPlan.name}</p>
                  <p className="text-sm text-white/40">
                    {currentPlan.price_monthly === 0
                      ? "Free forever"
                      : `₹${(currentPlan.price_monthly / 100).toFixed(0)}/mo`}
                  </p>
                </div>
                {currentPlanSlug !== "free" && renewalDate && (
                  <p className="text-xs text-white/30 mt-0.5">
                    {sub?.cancel_at_period_end
                      ? `Cancels ${renewalDate}`
                      : `Renews ${renewalDate}`}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {sub && (
                  <span
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full border tracking-wide uppercase ${
                      sub.status === "active"
                        ? "bg-green-400/10 text-green-300 border-green-400/20"
                        : "bg-amber-400/10 text-amber-300 border-amber-400/20"
                    }`}
                  >
                    {sub.status}
                  </span>
                )}
                {currentPlanSlug !== "free" && sub && !sub.cancel_at_period_end && (
                  <CancelButton />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── White card slides up ────────────────────────────────────── */}
      <div className="bg-neutral-50 rounded-t-3xl -mt-8 min-h-[60vh]">
        <div className="max-w-3xl mx-auto px-5 pt-8 pb-12">

          {/* Usage */}
          <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-4">
            Your usage
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {/* Events */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-brand-50 border border-brand-100 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-brand" />
                </div>
                <p className="text-xs font-medium text-neutral-700">Active events</p>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold tracking-tight">{activeEventCount ?? 0}</span>
                <span className="text-sm text-neutral-400">
                  / {plan.unlimited ? "∞" : plan.maxEvents}
                </span>
              </div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: plan.unlimited
                      ? "20%"
                      : `${Math.min(100, ((activeEventCount ?? 0) / plan.maxEvents) * 100)}%`,
                    background: "#6D28D9",
                  }}
                />
              </div>
            </div>

            {/* Attendees per event */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <p className="text-xs font-medium text-neutral-700">Attendees per event</p>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-bold tracking-tight">{plan.maxAttendees.toLocaleString()}</span>
                <span className="text-sm text-neutral-400">max</span>
              </div>
              <p className="text-xs text-neutral-400">
                {plan.slug === "free"
                  ? "Upgrade to allow up to 500 or 2 000 per event"
                  : plan.slug === "starter"
                  ? "Upgrade to Pro for up to 2 000 per event"
                  : "Maximum attendees per event on your plan"}
              </p>
            </div>
          </div>

          <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-5">
            Available plans · {allPlans.length}
          </p>

          {/* Plan grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allPlans.map((plan) => {
              const isCurrent = plan.slug === currentPlanSlug;
              const isRecommended = plan.slug === "starter";
              const isUpgrade =
                !isCurrent &&
                plan.price_monthly >
                  (allPlans.find((p) => p.slug === currentPlanSlug)?.price_monthly ?? 0);
              const Icon = PLAN_ICONS[plan.slug] ?? Sparkles;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-6 flex flex-col gap-5 transition-all ${
                    isCurrent
                      ? "bg-neutral-900 text-white shadow-xl"
                      : isRecommended
                      ? "bg-white border-2 border-brand shadow-sm"
                      : "bg-white border border-neutral-100 hover:border-neutral-200 hover:shadow-sm"
                  }`}
                >
                  {/* Badge */}
                  {isCurrent && (
                    <span className="absolute -top-3 left-5 text-[10px] font-bold tracking-widest bg-brand text-white px-3 py-1 rounded-full uppercase">
                      Your plan
                    </span>
                  )}
                  {isRecommended && !isCurrent && (
                    <span className="absolute -top-3 left-5 text-[10px] font-bold tracking-widest bg-brand text-white px-3 py-1 rounded-full uppercase">
                      Recommended
                    </span>
                  )}

                  {/* Icon + price */}
                  <div>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${
                        isCurrent ? "bg-white/10" : "bg-brand-50 border border-brand-100"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isCurrent ? "text-white" : "text-brand"}`} />
                    </div>
                    <p
                      className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${
                        isCurrent ? "text-white/40" : "text-neutral-400"
                      }`}
                    >
                      {plan.name}
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-bold tracking-tight ${isCurrent ? "text-white" : "text-neutral-900"}`}>
                        {plan.price_monthly === 0
                          ? "Free"
                          : `₹${(plan.price_monthly / 100).toFixed(0)}`}
                      </span>
                      {plan.price_monthly > 0 && (
                        <span className={`text-xs ${isCurrent ? "text-white/40" : "text-neutral-400"}`}>
                          /mo (+18% GST)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="flex flex-col gap-2.5 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5">
                        <span
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                            isCurrent ? "bg-white/10" : "bg-brand-50 border border-brand-100"
                          }`}
                        >
                          <Check className={`w-2.5 h-2.5 ${isCurrent ? "text-white/70" : "text-brand"}`} />
                        </span>
                        <span className={`text-xs leading-relaxed ${isCurrent ? "text-white/65" : "text-neutral-600"}`}>
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div>
                    {isCurrent ? (
                      <div className="w-full text-center text-xs font-semibold py-2.5 rounded-xl border border-white/10 text-white/30">
                        Active plan
                      </div>
                    ) : plan.price_monthly > 0 ? (
                      <CheckoutButton
                        planSlug={plan.slug}
                        planName={plan.name}
                        userEmail={userEmail}
                        userName={userName}
                        className="w-full py-3 text-sm font-semibold rounded-xl text-white hover:opacity-90 transition-opacity disabled:opacity-50 upgrade-pulse"
                        style={{ background: "#6D28D9" }}
                      >
                        {isUpgrade ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`}
                      </CheckoutButton>
                    ) : (
                      <SwitchPlanButton
                        planSlug={plan.slug}
                        planName={plan.name}
                        className="w-full py-2.5 text-xs font-medium rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enterprise banner */}
          <div className="mt-4 border-2 border-neutral-900 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="p-6 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-neutral-700" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
                      Enterprise
                    </p>
                    <p className="text-xl font-bold tracking-tight">Custom pricing</p>
                  </div>
                </div>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Need more than Pro? Get volume discounts, dedicated support, custom SLAs,
                  invoice billing, and a tailored onboarding experience.
                </p>
              </div>
              <div className="p-6 flex flex-col justify-center gap-3 md:border-l border-t md:border-t-0 border-neutral-100">
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                  {[
                    "Everything in Pro",
                    "Dedicated support",
                    "Custom SLAs",
                    "Volume discounts",
                    "Invoice billing",
                    "Onboarding help",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-neutral-600">
                      <Check className="w-3 h-3 text-brand shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 mt-2 py-2.5 px-5 rounded-xl text-sm font-semibold bg-neutral-900 text-white hover:bg-neutral-700 transition-colors w-full md:w-auto"
                >
                  <Mail className="w-4 h-4" />
                  Contact sales
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2.5 mt-10">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
            <p className="text-xs text-neutral-400">
              Payments processed securely via Razorpay · Prices include 18% GST
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
