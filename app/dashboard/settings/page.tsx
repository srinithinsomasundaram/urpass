import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ShieldCheck,
  CreditCard,
  Check,
  Sparkles,
  Zap,
  Crown,
  ExternalLink,
} from "lucide-react";
import { getUserPlan } from "@/lib/plan";
import PasswordResetButton from "./PasswordResetButton";
import ProfileForm from "./ProfileForm";
import SignOutButton from "./SignOutButton";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your URPASS account — update your profile, reset your password, and view your plan details.",
};

const PLAN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  free: Sparkles,
  starter: Zap,
  pro: Crown,
};

const PLAN_FEATURES: Record<string, string[]> = {
  free: ["1 active event", "50 attendees/event", "Digital passes", "QR check-in", "Basic dashboard", "URPASS branding"],
  starter: ["5 active events", "500 attendees/event", "CSV upload", "QR check-in", "Remove branding"],
  pro: ["Unlimited events", "2 000 attendees/event", "CSV upload", "Custom branding", "Data export"],
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: profile }, plan, { data: subData }, { count: activeEventCount }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
      getUserPlan(supabase, user!.id),
      supabase
        .from("subscriptions")
        .select("current_period_end, cancel_at_period_end, plan:plans(name, price_monthly, slug)")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .single(),
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("organizer_id", user!.id)
        .in("status", ["draft", "active"]),
    ]);

  const fullName = profile?.full_name ?? user?.email?.split("@")[0] ?? "";
  const email = profile?.email ?? user?.email ?? "";
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0] ?? "")
    .join("")
    .toUpperCase() || "U";

  const planRaw = Array.isArray(subData?.plan) ? subData.plan[0] : subData?.plan;
  const currentPlan = (planRaw as { name: string; price_monthly: number; slug: string } | null | undefined) ?? null;
  const renewalDate = subData?.current_period_end
    ? new Date(subData.current_period_end).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const PlanIcon = PLAN_ICONS[plan.slug] ?? Sparkles;
  const planFeatures = PLAN_FEATURES[plan.slug] ?? PLAN_FEATURES.free;
  const eventUsagePct = plan.unlimited ? 15 : Math.min(100, ((activeEventCount ?? 0) / plan.maxEvents) * 100);

  return (
    <div className="max-w-xl mx-auto page-in">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-1">Account</p>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-neutral-400 mt-0.5">Manage your profile, security, and plan.</p>
      </div>

      {/* Profile */}
      <ProfileForm fullName={fullName} email={email} initials={initials} />

      {/* Security */}
      <div className="bg-white border border-neutral-100 rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-brand" />
          </div>
          <h2 className="text-sm font-semibold text-neutral-800">Security</h2>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-800">Password</p>
              <p className="text-xs text-neutral-400 mt-0.5">
                We&apos;ll send a reset link to <span className="font-medium text-neutral-600">{email}</span>
              </p>
            </div>
            <PasswordResetButton />
          </div>
        </div>
      </div>

      {/* Plan & billing */}
      <div className="bg-white border border-neutral-100 rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
              <CreditCard className="w-3.5 h-3.5 text-brand" />
            </div>
            <h2 className="text-sm font-semibold text-neutral-800">Plan &amp; billing</h2>
          </div>
          <Link
            href="/billing"
            className="flex items-center gap-1 text-xs text-brand hover:underline font-medium"
          >
            Manage
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* Current plan card */}
        <div className="bg-neutral-900 text-white rounded-2xl p-5 mb-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <PlanIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-white/40">
                  Current plan
                </p>
                <p className="text-base font-bold text-white">
                  {currentPlan?.name ?? "Free"}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xl font-bold text-white">
                {currentPlan
                  ? currentPlan.price_monthly === 0
                    ? "₹0"
                    : `₹${(currentPlan.price_monthly / 100).toFixed(0)}`
                  : "₹0"}
              </p>
              {currentPlan && currentPlan.price_monthly > 0 && (
                <p className="text-[10px] text-white/40">/month</p>
              )}
            </div>
          </div>

          {/* Usage bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-white/50">Events used</p>
              <p className="text-[10px] text-white/50">
                {activeEventCount ?? 0} / {plan.unlimited ? "∞" : plan.maxEvents}
              </p>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/60 rounded-full transition-all"
                style={{ width: `${eventUsagePct}%` }}
              />
            </div>
          </div>

          {renewalDate && currentPlan && currentPlan.price_monthly > 0 && (
            <p className="text-[10px] text-white/30">
              {subData?.cancel_at_period_end ? "Cancels" : "Renews"} {renewalDate}
            </p>
          )}
        </div>

        {/* Features list */}
        <ul className="flex flex-col gap-2.5">
          {planFeatures.map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-brand" />
              </span>
              <span className="text-xs text-neutral-600">{f}</span>
            </li>
          ))}
        </ul>

        {plan.slug !== "pro" && (
          <Link
            href="/billing"
            className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "#6D28D9" }}
          >
            Upgrade plan
          </Link>
        )}
      </div>

      {/* Sign out / Danger zone */}
      <div className="bg-white border border-neutral-100 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4">Account</h2>
        <div className="flex flex-col gap-3">
          <SignOutButton />
          <div className="border-t border-neutral-100 pt-3">
            <p className="text-xs text-neutral-400 mb-2">
              Need to delete your account? Contact us at{" "}
              <a
                href="mailto:support@urpass.space"
                className="text-neutral-700 font-medium hover:underline"
              >
                support@urpass.space
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
