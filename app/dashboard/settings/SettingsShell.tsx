"use client";

import { useState } from "react";
import {
  User, ShieldCheck, CreditCard, Puzzle, AlertTriangle,
  Check, Sparkles, Zap, Crown, Building2, ArrowUpRight,
  ChevronRight, Mail, KeyRound, LogOut,
} from "lucide-react";
import Link from "next/link";
import ProfileForm from "./ProfileForm";
import PasswordResetButton from "./PasswordResetButton";
import SignOutButton from "./SignOutButton";
import RazorpayCard from "./RazorpayCard";
import type { PlanLimits } from "@/lib/plan";

type Section = "profile" | "security" | "billing" | "integrations" | "danger";

interface Props {
  fullName: string;
  email: string;
  initials: string;
  plan: PlanLimits;
  currentPlan: { name: string; price_monthly: number; slug: string } | null;
  renewalDate: string | null;
  cancelAtPeriodEnd: boolean;
  activeEventCount: number;
  existingPaymentKeyId: string | null;
}

const NAV: { id: Section; label: string; icon: React.ComponentType<{ className?: string }>; danger?: boolean }[] = [
  { id: "profile",      label: "Profile",       icon: User },
  { id: "security",     label: "Security",       icon: ShieldCheck },
  { id: "billing",      label: "Plan & Billing", icon: CreditCard },
  { id: "integrations", label: "Integrations",   icon: Puzzle },
  { id: "danger",       label: "Danger zone",    icon: AlertTriangle, danger: true },
];

const PLAN_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  free: Sparkles, starter: Zap, pro: Crown, enterprise: Building2,
};
const PLAN_GRADIENT: Record<string, string> = {
  free:       "linear-gradient(135deg, #1c1c28 0%, #13111c 100%)",
  starter:    "linear-gradient(135deg, #1e1030 0%, #13111c 100%)",
  pro:        "linear-gradient(135deg, #2a1a00 0%, #13111c 100%)",
  enterprise: "linear-gradient(135deg, #0c1624 0%, #13111c 100%)",
};
const PLAN_ACCENT: Record<string, string> = {
  free: "#a78bfa", starter: "#a78bfa", pro: "#fbbf24", enterprise: "#94a3b8",
};
const PLAN_FEATURES: Record<string, string[]> = {
  free:       ["1 active event", "50 attendees/event", "Digital passes", "QR check-in"],
  starter:    ["5 active events", "500 attendees/event", "CSV upload", "Remove branding", "Paid events"],
  pro:        ["Unlimited events", "2,000 attendees/event", "Data export", "API access", "Paid events"],
  enterprise: ["Everything in Pro", "Dedicated support", "Custom SLAs", "Volume discounts"],
};

/* ── Shared section label ──────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 px-1 mb-2 mt-5 first:mt-0">
      {children}
    </p>
  );
}

/* ── Plan card (shared between mobile and desktop) ─────────────────────── */
function PlanCard({ plan, currentPlan, renewalDate, cancelAtPeriodEnd, activeEventCount }: {
  plan: PlanLimits;
  currentPlan: Props["currentPlan"];
  renewalDate: string | null;
  cancelAtPeriodEnd: boolean;
  activeEventCount: number;
}) {
  const PlanIcon     = PLAN_ICONS[plan.slug] ?? Sparkles;
  const planGradient = PLAN_GRADIENT[plan.slug] ?? PLAN_GRADIENT.free;
  const planAccent   = PLAN_ACCENT[plan.slug] ?? PLAN_ACCENT.free;
  const planFeatures = PLAN_FEATURES[plan.slug] ?? PLAN_FEATURES.free;
  const eventUsagePct = plan.unlimited
    ? 18
    : Math.min(100, (activeEventCount / plan.maxEvents) * 100);
  const attendeeDisplay = plan.unlimited ? "Unlimited" : plan.maxAttendees.toLocaleString();

  return (
    <div className="space-y-3">
      {/* Dark plan card */}
      <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: planGradient }}>
        <div
          className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${planAccent}, transparent 70%)` }}
        />
        <div className="relative flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: `${planAccent}25`, border: `1px solid ${planAccent}30`, color: planAccent }}
            >
              <PlanIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/30">Current plan</p>
              <p className="text-lg font-bold text-white">{currentPlan?.name ?? "Free"}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {currentPlan
                ? currentPlan.price_monthly === 0 ? "₹0" : `₹${(currentPlan.price_monthly / 100).toFixed(0)}`
                : "₹0"}
            </p>
            <p className="text-[10px] text-white/30">
              {currentPlan && currentPlan.price_monthly > 0 ? "/month" : "forever"}
            </p>
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl px-3 py-3" style={{ background: "rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] text-white/35 mb-1">Events used</p>
            <p className="text-sm font-bold text-white">
              {activeEventCount}
              <span className="text-white/35 font-normal"> / {plan.unlimited ? "∞" : plan.maxEvents}</span>
            </p>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-2.5">
              <div className="h-full rounded-full transition-all" style={{ width: `${eventUsagePct}%`, background: planAccent }} />
            </div>
          </div>
          <div className="rounded-xl px-3 py-3" style={{ background: "rgba(255,255,255,0.06)" }}>
            <p className="text-[10px] text-white/35 mb-1">Attendees/event</p>
            <p className="text-sm font-bold text-white">{attendeeDisplay}</p>
            <p className="text-[10px] text-white/25 mt-2.5">max capacity</p>
          </div>
        </div>

        {renewalDate && currentPlan && currentPlan.price_monthly > 0 && (
          <p className="relative text-[10px] text-white/25">
            {cancelAtPeriodEnd ? "Cancels" : "Renews"} {renewalDate}
          </p>
        )}
      </div>

      {/* Features */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-3">Included in your plan</p>
        <ul className="flex flex-col gap-2.5">
          {planFeatures.map((f) => (
            <li key={f} className="flex items-center gap-2.5">
              <span className="w-4 h-4 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 text-brand" />
              </span>
              <span className="text-sm text-neutral-600">{f}</span>
            </li>
          ))}
        </ul>
      </div>

      {plan.slug !== "pro" && plan.slug !== "enterprise" ? (
        <Link
          href="/billing"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
          style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
        >
          <Zap className="w-4 h-4 text-yellow-300" />
          Upgrade plan
        </Link>
      ) : (
        <Link
          href="/billing"
          className="flex items-center justify-center gap-1.5 w-full py-3.5 rounded-2xl text-sm font-semibold text-brand bg-brand-50 hover:bg-brand-100 transition-colors"
        >
          Manage billing <ArrowUpRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}

export default function SettingsShell({
  fullName, email, initials, plan, currentPlan,
  renewalDate, cancelAtPeriodEnd, activeEventCount, existingPaymentKeyId,
}: Props) {
  const [section, setSection] = useState<Section>("profile");

  /* ── Desktop section content ──────────────────────────────────────────── */
  function renderDesktopContent() {
    switch (section) {
      case "profile":
        return (
          <div className="max-w-xl">
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-tight text-neutral-900">Profile</h2>
              <p className="text-sm text-neutral-400 mt-0.5">Update your name and view your account email.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <ProfileForm fullName={fullName} email={email} initials={initials} />
            </div>
          </div>
        );

      case "security":
        return (
          <div className="max-w-xl">
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-tight text-neutral-900">Security</h2>
              <p className="text-sm text-neutral-400 mt-0.5">Manage your password and account access.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-neutral-900">Password</p>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Reset link sent to <span className="font-medium text-neutral-600">{email}</span>
                </p>
              </div>
              <PasswordResetButton />
            </div>
          </div>
        );

      case "billing":
        return (
          <div className="max-w-xl">
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-tight text-neutral-900">Plan & Billing</h2>
              <p className="text-sm text-neutral-400 mt-0.5">Your current plan, usage, and upgrade options.</p>
            </div>
            <PlanCard
              plan={plan} currentPlan={currentPlan} renewalDate={renewalDate}
              cancelAtPeriodEnd={cancelAtPeriodEnd} activeEventCount={activeEventCount}
            />
          </div>
        );

      case "integrations":
        return (
          <div className="max-w-xl">
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-tight text-neutral-900">Integrations</h2>
              <p className="text-sm text-neutral-400 mt-0.5">Connect payment gateways and third-party tools.</p>
            </div>
            <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-3">Payment gateways</p>
            <RazorpayCard canUsePayments={plan.slug !== "free"} existingKeyId={existingPaymentKeyId} />
          </div>
        );

      case "danger":
        return (
          <div className="max-w-xl">
            <div className="mb-6">
              <h2 className="text-lg font-bold tracking-tight text-neutral-900">Danger zone</h2>
              <p className="text-sm text-neutral-400 mt-0.5">Irreversible account actions.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
              <SignOutButton />
              <div className="pt-3 border-t border-neutral-100">
                <p className="text-xs font-semibold text-neutral-700 mb-1">Delete account</p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Permanently removes your account and all data. Email{" "}
                  <a href="mailto:support@urpass.space" className="font-semibold text-neutral-600 hover:text-brand transition-colors">
                    support@urpass.space
                  </a>{" "}
                  to request deletion.
                </p>
              </div>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="page-in">
      <div className="mb-6">
        <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-1">Account</p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Settings</h1>
      </div>

      {/* ════════════════════════════════════════════════════════
          MOBILE — single scrollable page
          ════════════════════════════════════════════════════════ */}
      <div className="lg:hidden space-y-1">

        {/* ── Profile ─────────────────────────────────────── */}
        <SectionLabel>Profile</SectionLabel>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <ProfileForm fullName={fullName} email={email} initials={initials} />
        </div>

        {/* ── Security ────────────────────────────────────── */}
        <SectionLabel>Security</SectionLabel>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-neutral-50">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 text-neutral-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900">Password</p>
              <p className="text-xs text-neutral-400 mt-0.5 truncate">
                Reset link → {email}
              </p>
            </div>
            <PasswordResetButton />
          </div>
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-neutral-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-900">Email</p>
              <p className="text-xs text-neutral-400 mt-0.5 truncate">{email}</p>
            </div>
            <span className="text-[10px] font-semibold text-neutral-300 bg-neutral-50 border border-neutral-100 px-2 py-0.5 rounded-full shrink-0">
              Fixed
            </span>
          </div>
        </div>

        {/* ── Plan & Billing ──────────────────────────────── */}
        <SectionLabel>Plan & Billing</SectionLabel>
        <PlanCard
          plan={plan} currentPlan={currentPlan} renewalDate={renewalDate}
          cancelAtPeriodEnd={cancelAtPeriodEnd} activeEventCount={activeEventCount}
        />

        {/* ── Integrations ────────────────────────────────── */}
        <SectionLabel>Integrations</SectionLabel>
        <RazorpayCard canUsePayments={plan.slug !== "free"} existingKeyId={existingPaymentKeyId} />

        {/* ── Account actions ─────────────────────────────── */}
        <SectionLabel>Account</SectionLabel>
        <SignOutButton />

        {/* ── Danger ──────────────────────────────────────── */}
        <SectionLabel>Danger zone</SectionLabel>
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <p className="text-xs font-semibold text-neutral-700 mb-1">Delete account</p>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Permanently removes your account and all data. Email{" "}
            <a href="mailto:support@urpass.space" className="font-semibold text-neutral-600 hover:text-brand transition-colors">
              support@urpass.space
            </a>{" "}
            to request deletion.
          </p>
        </div>

        {/* Bottom spacing for mobile nav */}
        <div className="h-4" />
      </div>

      {/* ════════════════════════════════════════════════════════
          DESKTOP — sidebar + sectioned content
          ════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex gap-6 items-start">

        {/* Sidebar */}
        <aside className="w-52 shrink-0 bg-white rounded-2xl shadow-sm p-2 sticky top-6">
          <div className="mb-1">
            <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 px-3 mb-1 mt-2">Account</p>
            {(["profile", "security"] as Section[]).map((id) => {
              const item = NAV.find((n) => n.id === id)!;
              const active = section === id;
              return (
                <button
                  key={id}
                  onClick={() => setSection(id)}
                  className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active ? "bg-neutral-100 text-neutral-900" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />}
                </button>
              );
            })}
          </div>

          <div className="mb-1">
            <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 px-3 mb-1 mt-3">Workspace</p>
            {(["billing", "integrations"] as Section[]).map((id) => {
              const item = NAV.find((n) => n.id === id)!;
              const active = section === id;
              return (
                <button
                  key={id}
                  onClick={() => setSection(id)}
                  className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    active ? "bg-neutral-100 text-neutral-900" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                  }`}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                  {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-neutral-100">
            <button
              onClick={() => setSection("danger")}
              className={`flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                section === "danger" ? "bg-red-50 text-red-600" : "text-red-400 hover:bg-red-50 hover:text-red-600"
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Danger zone
              {section === "danger" && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />}
            </button>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {renderDesktopContent()}
        </main>
      </div>
    </div>
  );
}
