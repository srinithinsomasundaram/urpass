"use client";

import { useState } from "react";
import {
  User,
  ShieldCheck,
  CreditCard,
  Puzzle,
  AlertTriangle,
  Check,
  Sparkles,
  Zap,
  Crown,
  Building2,
  ArrowUpRight,
  ChevronRight,
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

const NAV: {
  id: Section;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  danger?: boolean;
}[] = [
  { id: "profile",      label: "Profile",       icon: User,          group: "Account" },
  { id: "security",     label: "Security",       icon: ShieldCheck,   group: "Account" },
  { id: "billing",      label: "Plan & Billing", icon: CreditCard,    group: "Workspace" },
  { id: "integrations", label: "Integrations",   icon: Puzzle,        group: "Workspace" },
  { id: "danger",       label: "Danger zone",    icon: AlertTriangle, group: "", danger: true },
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

function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold tracking-tight text-neutral-900">{title}</h2>
      {subtitle && <p className="text-sm text-neutral-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export default function SettingsShell({
  fullName, email, initials, plan, currentPlan,
  renewalDate, cancelAtPeriodEnd, activeEventCount, existingPaymentKeyId,
}: Props) {
  const [section, setSection] = useState<Section>("profile");

  const PlanIcon      = PLAN_ICONS[plan.slug] ?? Sparkles;
  const planGradient  = PLAN_GRADIENT[plan.slug] ?? PLAN_GRADIENT.free;
  const planAccent    = PLAN_ACCENT[plan.slug] ?? PLAN_ACCENT.free;
  const planFeatures  = PLAN_FEATURES[plan.slug] ?? PLAN_FEATURES.free;
  const eventUsagePct = plan.unlimited
    ? 18
    : Math.min(100, ((activeEventCount) / plan.maxEvents) * 100);
  const attendeeDisplay = plan.unlimited ? "Unlimited" : plan.maxAttendees.toLocaleString();

  /* ── grouped nav rendering ────────────────────────────── */
  const groups = ["Account", "Workspace", ""];
  function renderNavItems(mobile?: boolean) {
    return (
      <>
        {groups.map((group) => {
          const items = NAV.filter((n) => n.group === group);
          if (items.length === 0) return null;
          return (
            <div key={group || "ungrouped"} className={mobile ? "contents" : "mb-1"}>
              {group && !mobile && (
                <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 px-3 mb-1 mt-3">
                  {group}
                </p>
              )}
              {items.map(({ id, label, icon: Icon, danger }) => {
                const active = section === id;
                return (
                  <button
                    key={id}
                    onClick={() => setSection(id)}
                    className={`flex items-center gap-2.5 w-full text-left transition-colors
                      ${mobile
                        ? `flex-col gap-1 px-3 py-2 rounded-xl text-[11px] font-semibold shrink-0 ${
                            active
                              ? danger ? "bg-red-50 text-red-600" : "bg-brand/10 text-brand"
                              : danger ? "text-red-400 hover:bg-red-50/60" : "text-neutral-500 hover:bg-neutral-100"
                          }`
                        : `px-3 py-2.5 rounded-xl text-sm font-medium ${
                            active
                              ? danger ? "bg-red-50 text-red-600" : "bg-neutral-100 text-neutral-900"
                              : danger ? "text-red-400 hover:bg-red-50" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
                          }`
                      }`}
                  >
                    <Icon className={`shrink-0 ${mobile ? "w-4 h-4" : "w-4 h-4"}`} />
                    {mobile ? label.split(" ")[0] : label}
                    {!mobile && active && (
                      <ChevronRight className="w-3.5 h-3.5 ml-auto text-current opacity-40" />
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </>
    );
  }

  /* ── section content ──────────────────────────────────── */
  function renderContent() {
    switch (section) {

      case "profile":
        return (
          <div className="max-w-xl">
            <SectionTitle title="Profile" subtitle="Update your name and view your account email." />
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <ProfileForm fullName={fullName} email={email} initials={initials} />
            </div>
          </div>
        );

      case "security":
        return (
          <div className="max-w-xl">
            <SectionTitle title="Security" subtitle="Manage your password and account access." />
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Password</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Send a reset link to{" "}
                    <span className="font-medium text-neutral-600">{email}</span>
                  </p>
                </div>
                <PasswordResetButton />
              </div>
            </div>
          </div>
        );

      case "billing":
        return (
          <div className="max-w-xl">
            <SectionTitle title="Plan & Billing" subtitle="Your current plan, usage, and upgrade options." />

            {/* Dark plan card */}
            <div className="rounded-2xl p-5 relative overflow-hidden mb-4" style={{ background: planGradient }}>
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
                    {currentPlan ? (currentPlan.price_monthly === 0 ? "₹0" : `₹${(currentPlan.price_monthly / 100).toFixed(0)}`) : "₹0"}
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
                    <div className="h-full rounded-full" style={{ width: `${eventUsagePct}%`, background: planAccent }} />
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
            <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
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
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity"
                style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                Upgrade plan
              </Link>
            ) : (
              <Link
                href="/billing"
                className="flex items-center justify-center gap-1.5 w-full py-3 rounded-xl text-sm font-semibold text-brand bg-brand-50 hover:bg-brand-100 transition-colors"
              >
                Manage billing <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        );

      case "integrations":
        return (
          <div className="max-w-xl">
            <SectionTitle
              title="Integrations"
              subtitle="Connect payment gateways and third-party tools."
            />

            <div>
              <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-3">
                Payment gateways
              </p>
              <RazorpayCard
                canUsePayments={plan.slug !== "free"}
                existingKeyId={existingPaymentKeyId}
              />
            </div>
          </div>
        );

      case "danger":
        return (
          <div className="max-w-xl">
            <SectionTitle title="Danger zone" subtitle="Irreversible account actions." />
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <SignOutButton />
              <div className="pt-3 border-t border-neutral-50">
                <p className="text-xs font-semibold text-neutral-700 mb-1">Delete account</p>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Permanently removes your account and all data. This cannot be undone. Email{" "}
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
      {/* Page header */}
      <div className="mb-6">
        <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-1">Account</p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Settings</h1>
      </div>

      {/* Mobile tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-5 lg:hidden scrollbar-none">
        {renderNavItems(true)}
      </div>

      {/* Desktop: sidebar + content */}
      <div className="flex gap-6 items-start">

        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-48 shrink-0 bg-white rounded-2xl shadow-sm p-2 sticky top-6">
          {renderNavItems()}
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
