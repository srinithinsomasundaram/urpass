"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Calendar,
  ScanLine,
  CreditCard,
  Settings,
  LogOut,
  Ticket,
  Star,
  Key,
  Palette,
  Zap,
  ChevronRight,
} from "lucide-react";

const mainNav = [
  { label: "Dashboard", href: "/dashboard",        icon: LayoutDashboard, exact: true },
  { label: "Events",    href: "/dashboard/events", icon: Calendar,        exact: false },
  { label: "Scanner",   href: "/scan",              icon: ScanLine,        exact: false },
];

const bottomNav = [
  { label: "Billing",  href: "/billing",            icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

type Props = { email: string; fullName: string; planSlug?: string };

function NavLink({ href, icon: Icon, label, active }: {
  href: string; icon: React.ComponentType<{ className?: string }>;
  label: string; exact?: boolean; active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
        active
          ? "bg-white/10 text-white"
          : "text-white/45 hover:text-white/80 hover:bg-white/6"
      )}
    >
      <Icon className={cn("w-4 h-4 shrink-0", active ? "text-white" : "text-white/40")} />
      {label}
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-200 shrink-0" />}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-bold tracking-widest uppercase text-white/25 px-3 mb-1">
      {children}
    </p>
  );
}

export default function Sidebar({ email, fullName, planSlug }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = fullName
    .split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "U";

  const planBadge =
    planSlug === "enterprise" ? { label: "Enterprise", color: "#94a3b8" }
    : planSlug === "pro"      ? { label: "Pro",        color: "#fbbf24" }
    : planSlug === "starter"  ? { label: "Starter",    color: "#a78bfa" }
    : null;

  return (
    <aside
      className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0"
      style={{ background: "linear-gradient(160deg, #13111c 0%, #0e0c16 100%)" }}
    >
      {/* Subtle top glow */}
      <div
        className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(109,40,217,0.18) 0%, transparent 100%)" }}
      />

      <div className="relative flex flex-col h-full px-3 py-5 gap-5">

        {/* ── Logo ──────────────────────────────────────────────── */}
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 py-1 mb-1">
          <div className="relative shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
            >
              <Ticket className="w-4 h-4 text-white" />
            </div>
            {planSlug === "starter" && (
              <div className="absolute -top-1 -right-1 bg-amber-400 border-2 border-[#0f0620] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                <Star className="w-2 h-2 fill-neutral-950 text-neutral-950" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-widest uppercase text-white leading-none">
              URPASS
            </span>
            {planBadge && (
              <span
                className="text-[9px] font-bold tracking-widest uppercase leading-none mt-0.5"
                style={{ color: planBadge.color }}
              >
                {planBadge.label}
              </span>
            )}
          </div>
        </Link>

        {/* ── Main nav ──────────────────────────────────────────── */}
        <nav className="flex flex-col gap-0.5">
          <SectionLabel>Main</SectionLabel>
          {mainNav.map(({ label, href, icon, exact }) => (
            <NavLink key={href} href={href} icon={icon} label={label} exact={exact} active={isActive(href, exact)} />
          ))}
        </nav>

        {/* ── Tools nav ─────────────────────────────────────────── */}
        {planSlug && planSlug !== "free" && (
          <nav className="flex flex-col gap-0.5">
            <SectionLabel>Tools</SectionLabel>
            <NavLink href="/dashboard/branding" icon={Palette} label="Branding" active={isActive("/dashboard/branding")} />
            {(planSlug === "pro" || planSlug === "enterprise") && (
              <NavLink href="/dashboard/api-keys" icon={Key} label="API Keys" active={isActive("/dashboard/api-keys")} />
            )}
          </nav>
        )}

        {/* ── Spacer ────────────────────────────────────────────── */}
        <div className="flex-1" />

        {/* ── Upgrade CTA (free only) ───────────────────────────── */}
        {(!planSlug || planSlug === "free") && (
          <Link
            href="/billing"
            className="relative overflow-hidden flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.5), rgba(76,29,149,0.5))" }}
          >
            <div className="absolute inset-0 border border-white/10 rounded-2xl pointer-events-none" />
            <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white leading-none">Upgrade plan</p>
              <p className="text-[10px] text-white/50 mt-0.5 leading-none">Unlock more features</p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-white/30 shrink-0" />
          </Link>
        )}

        {/* ── Account nav ───────────────────────────────────────── */}
        <nav className="flex flex-col gap-0.5">
          <SectionLabel>Account</SectionLabel>
          {bottomNav.map(({ label, href, icon }) => (
            <NavLink key={href} href={href} icon={icon} label={label} active={isActive(href)} />
          ))}
        </nav>

        {/* ── User row ──────────────────────────────────────────── */}
        <div className="border-t border-white/8 pt-4">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-white/6 transition-colors group cursor-default">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white ring-2 ring-white/10"
              style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-white/80">{fullName}</p>
              <p className="text-[10px] text-white/30 truncate">{email}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/15 transition-all opacity-0 group-hover:opacity-100"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
