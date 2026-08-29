import Sidebar from "@/components/dashboard/Sidebar";
import MobileNav from "@/components/dashboard/MobileNav";
import { Ticket, Star } from "lucide-react";

interface Props {
  fullName: string;
  email: string;
  planSlug?: string;
  children: React.ReactNode;
}

export default function AppShell({ fullName, email, planSlug, children }: Props) {
  const initials = fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="flex h-screen overflow-hidden bg-neutral-50">
      {/* Desktop sidebar */}
      <Sidebar fullName={fullName} email={email} planSlug={planSlug} />

      {/* Content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Mobile top bar ──────────────────────────────────────── */}
        <header className="lg:hidden shrink-0 bg-white border-b border-neutral-100">
          <div className="flex items-center justify-between px-4 h-14">
            {/* Wordmark */}
            <div className="flex items-center gap-2">
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
                <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full text-purple-700 border border-purple-200"
                  style={{ background: "linear-gradient(135deg, #F3E8FF, #E9D5FF)" }}>
                  STARTER
                </span>
              )}
              {planSlug === "pro" && (
                <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full text-amber-700 border border-amber-200"
                  style={{ background: "linear-gradient(135deg, #FEF3C7, #FDE68A)" }}>
                  PRO
                </span>
              )}
            </div>

            {/* User avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
            >
              {initials}
            </div>
          </div>
        </header>

        {/* ── Scrollable content ───────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto pb-28 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <MobileNav />
    </div>
  );
}
