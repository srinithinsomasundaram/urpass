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
} from "lucide-react";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Events", href: "/dashboard/events", icon: Calendar },
  { label: "Scanner", href: "/scan", icon: ScanLine },
  { label: "Billing", href: "/billing", icon: CreditCard },
];

const bottom = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

type Props = {
  email: string;
  fullName: string;
  planSlug?: string;
};

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
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-neutral-100 h-screen sticky top-0 px-4 py-6">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-8">
        <div className="relative shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: planSlug === "pro"
                ? "linear-gradient(135deg, #F59E0B, #B45309)"
                : planSlug === "starter"
                ? "linear-gradient(135deg, #8B5CF6, #6D28D9)"
                : "linear-gradient(135deg, #6D28D9, #4c1d95)",
            }}
          >
            <Ticket className="w-3.5 h-3.5 text-white" />
          </div>
          {planSlug === "starter" && (
            <div className="absolute -top-1 -right-1 bg-amber-400 border border-white rounded-full p-0.5 shadow-sm">
              <Star className="w-2 h-2 fill-neutral-950 text-neutral-950" />
            </div>
          )}
        </div>
        <span className="text-sm font-bold tracking-widest uppercase text-neutral-900">
          URPASS
        </span>
        {planSlug === "starter" && (
          <span
            className="flex items-center gap-0.5 text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full text-purple-700 border border-purple-200"
            style={{ background: "linear-gradient(135deg, #F3E8FF, #E9D5FF)" }}
          >
            STARTER
          </span>
        )}
        {planSlug === "pro" && (
          <span
            className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full text-amber-700 border border-amber-200"
            style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)" }}
          >
            PRO
          </span>
        )}
      </Link>

      {/* Primary nav */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {nav.map(({ label, href, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                active
                  ? "bg-brand-50 text-brand font-semibold border border-brand-100"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-brand" : "")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-0.5">
        {bottom.map(({ label, href, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                active
                  ? "bg-brand-50 text-brand font-semibold border border-brand-100"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-brand" : "")} />
              {label}
            </Link>
          );
        })}

        <div className="mt-3 pt-3 border-t border-neutral-100">
          {/* User pill */}
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1 rounded-xl hover:bg-neutral-50 transition-colors">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold text-white"
              style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
            >
              {initials || "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate text-neutral-900">{fullName}</span>
              <span className="text-[10px] text-neutral-400 truncate">{email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-all w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
