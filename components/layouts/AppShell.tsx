import Sidebar from "@/components/dashboard/Sidebar";
import MobileNav from "@/components/dashboard/MobileNav";
import { Ticket, Star, Zap } from "lucide-react";
import Link from "next/link";

interface Props {
  fullName: string;
  email: string;
  planSlug?: string;
  children: React.ReactNode;
}

export default function AppShell({ fullName, email, planSlug, children }: Props) {
  const initials = fullName
    .split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase() || "U";

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0e0c16" }}>
      <Sidebar fullName={fullName} email={email} planSlug={planSlug} />

      {/* Right column: tinted bg so white cards stand out */}
      <div
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
        style={{ background: "#f0f2f8" }}
      >
        {/* ── Mobile top bar ──────────────────────────────────────── */}
        <header
          className="lg:hidden shrink-0 border-b"
          style={{ background: "#13111c", borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between px-4 h-14">

            {/* Wordmark */}
            <div className="flex items-center gap-2">
              <div className="relative shrink-0">
                <div
                  className="w-7 h-7 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
                >
                  <Ticket className="w-3.5 h-3.5 text-white" />
                </div>
                {planSlug === "starter" && (
                  <div className="absolute -top-1 -right-1 bg-amber-400 border-2 border-[#1e0a3c] rounded-full w-3 h-3 flex items-center justify-center">
                    <Star className="w-1.5 h-1.5 fill-neutral-950 text-neutral-950" />
                  </div>
                )}
              </div>
              <span className="text-sm font-black tracking-widest uppercase text-white">
                URPASS
              </span>
              {planSlug === "starter" && (
                <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full text-purple-300 border border-purple-500/30 bg-purple-500/15">
                  STARTER
                </span>
              )}
              {planSlug === "pro" && (
                <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full text-amber-300 border border-amber-500/30 bg-amber-500/15">
                  PRO
                </span>
              )}
              {planSlug === "enterprise" && (
                <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full text-slate-300 border border-slate-500/30 bg-slate-500/15">
                  ENT
                </span>
              )}
            </div>

            {/* Right: upgrade pill or avatar */}
            {(!planSlug || planSlug === "free") ? (
              <Link
                href="/billing"
                className="flex items-center gap-1.5 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg"
                style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
              >
                <Zap className="w-3 h-3 text-yellow-300" />
                Upgrade
              </Link>
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-white/10"
                style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
              >
                {initials}
              </div>
            )}
          </div>
        </header>

        {/* ── Scrollable content area ──────────────────────────────── */}
        <main className="flex-1 overflow-y-auto pb-28 lg:pb-0">
          {children}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
