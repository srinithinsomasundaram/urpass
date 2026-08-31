import Sidebar from "@/components/dashboard/Sidebar";
import MobileNav from "@/components/dashboard/MobileNav";
import { Ticket, Zap } from "lucide-react";
import Link from "next/link";

interface Props {
  fullName: string;
  email: string;
  planSlug?: string;
  children: React.ReactNode;
}

const PLAN_BADGE: Record<string, { label: string; cls: string }> = {
  starter:    { label: "Starter",    cls: "text-violet-300 border-violet-500/30 bg-violet-500/15" },
  pro:        { label: "Pro",        cls: "text-amber-300  border-amber-500/30  bg-amber-500/15"  },
  enterprise: { label: "Ent",        cls: "text-slate-300  border-slate-500/30  bg-slate-500/15"  },
};

export default function AppShell({ fullName, email, planSlug, children }: Props) {
  const initials = fullName
    .split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase() || "U";

  const badge = planSlug ? PLAN_BADGE[planSlug] : null;
  const isPaid = planSlug && planSlug !== "free";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0e0c16" }}>
      <Sidebar fullName={fullName} email={email} planSlug={planSlug} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden" style={{ background: "#f5f4fa" }}>

        {/* ── Mobile top bar ─────────────────────────────────────────── */}
        <header className="lg:hidden shrink-0" style={{ background: "linear-gradient(180deg, #14111f 0%, #100e1a 100%)" }}>
          <div
            className="flex items-center justify-between px-4 h-14"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Wordmark + plan badge */}
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-[10px] flex items-center justify-center shadow-lg"
                style={{ background: "linear-gradient(145deg, #7c3aed, #4c1d95)" }}
              >
                <Ticket className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-black tracking-[0.15em] uppercase text-white leading-none">
                  URPASS
                </span>
                {badge && (
                  <span className={`text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full border ${badge.cls}`}>
                    {badge.label}
                  </span>
                )}
              </div>
            </Link>

            {/* Right: upgrade pill or avatar */}
            {!isPaid ? (
              <Link
                href="/billing"
                className="flex items-center gap-1.5 text-white text-[11px] font-bold px-3.5 py-2 rounded-xl transition-opacity hover:opacity-90 active:opacity-75"
                style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
              >
                <Zap className="w-3.5 h-3.5 text-yellow-300" />
                Upgrade
              </Link>
            ) : (
              <Link
                href="/dashboard/settings"
                className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white ring-2 ring-white/10 transition-opacity hover:opacity-80 active:opacity-60"
                style={{ background: "linear-gradient(145deg, #7c3aed, #4c1d95)" }}
                title={email}
              >
                {initials}
              </Link>
            )}
          </div>
        </header>

        {/* ── Scrollable content ──────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto pb-[88px] lg:pb-0">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
