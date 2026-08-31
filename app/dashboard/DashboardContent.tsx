"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Calendar,
  QrCode,
  CheckCircle2,
  Ticket,
  ArrowUpRight,
  ScanLine,
  Zap,
  ChevronRight,
  TrendingUp,
  Users,
  Clock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface EventRow {
  id: string;
  name: string;
  venue: string;
  event_date: string;
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  active:    { label: "Active",    cls: "bg-green-50 text-green-700 border border-green-100",    dot: "bg-green-500" },
  draft:     { label: "Draft",     cls: "bg-neutral-100 text-neutral-500 border border-neutral-200", dot: "bg-neutral-400" },
  completed: { label: "Completed", cls: "bg-blue-50 text-blue-600 border border-blue-100",       dot: "bg-blue-500" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600 border border-red-100",          dot: "bg-red-500" },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long",
  });
}

function StatCard({
  label, value, icon: Icon, accent, loaded,
}: {
  label: string; value: number;
  icon: React.ComponentType<{ className?: string }>;
  accent: string; loaded: boolean;
}) {
  if (!loaded) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="skeleton w-8 h-8 rounded-xl mb-4" />
        <div className="skeleton h-8 w-14 rounded mb-1.5" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-3xl font-bold tracking-tight tabular-nums text-neutral-900">{value.toLocaleString()}</p>
      <p className="text-xs text-neutral-400 mt-1 font-medium">{label}</p>
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm">
      <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="skeleton h-4 rounded w-48" />
        <div className="skeleton h-3 rounded w-32" />
      </div>
      <div className="skeleton h-5 w-16 rounded-full" />
    </div>
  );
}

export default function DashboardContent() {
  const [firstName, setFirstName] = useState("");
  const [planSlug, setPlanSlug] = useState("free");
  const [stats, setStats] = useState({ total: 0, active: 0, passes: 0, checkedIn: 0 });
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { data: eventRows }, { data: sub }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("user_id", user.id).single(),
        supabase.from("events").select("id, name, venue, event_date, status")
          .eq("organizer_id", user.id).order("created_at", { ascending: false }),
        supabase.from("subscriptions").select("plan:plans(slug)").eq("user_id", user.id).eq("status", "active").single(),
      ]);

      const allIds = eventRows?.map((e) => e.id) ?? [];
      const [{ count: totalPasses }, { count: totalCheckedIn }] = await Promise.all([
        allIds.length
          ? supabase.from("passes").select("*", { count: "exact", head: true }).in("event_id", allIds)
          : Promise.resolve({ count: 0 }),
        allIds.length
          ? supabase.from("check_ins").select("*", { count: "exact", head: true }).in("event_id", allIds)
          : Promise.resolve({ count: 0 }),
      ]);

      const slug = (sub?.plan as unknown as { slug: string } | null)?.slug ?? "free";
      setFirstName(profile?.full_name?.split(" ")[0] ?? "there");
      setPlanSlug(slug);
      setStats({
        total: allIds.length,
        active: eventRows?.filter((e) => e.status === "active").length ?? 0,
        passes: totalPasses ?? 0,
        checkedIn: totalCheckedIn ?? 0,
      });
      setEvents((eventRows ?? []).slice(0, 6));
      setLoaded(true);
    }
    load();
  }, []);

  const statCards = [
    { label: "Total Events",  value: stats.total,     icon: Calendar,     accent: "bg-neutral-100 text-neutral-600" },
    { label: "Active Events", value: stats.active,    icon: Ticket,       accent: "bg-brand-50 text-brand" },
    { label: "Passes Issued", value: stats.passes,    icon: QrCode,       accent: "bg-blue-50 text-blue-600" },
    { label: "Checked In",    value: stats.checkedIn, icon: CheckCircle2, accent: "bg-emerald-50 text-emerald-600" },
  ];

  const quickActions = [
    { label: "New event",    href: "/create-event",     icon: Plus,     primary: true },
    { label: "Open scanner", href: "/scan",              icon: ScanLine, primary: false },
    { label: "All events",   href: "/dashboard/events", icon: Calendar, primary: false },
  ];

  return (
    <div className="max-w-4xl mx-auto page-in space-y-8">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-neutral-400 mb-1">
            {formatDate()}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {getGreeting()}{firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p className="text-sm text-neutral-400 mt-1">
            Here&apos;s what&apos;s happening across your events
          </p>
        </div>

        <Link
          href="/create-event"
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shrink-0 shadow-sm"
          style={{ background: "#6D28D9" }}
        >
          <Plus className="w-4 h-4" />
          New event
        </Link>
      </div>

      {/* ── Stats grid ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} loaded={loaded} />
        ))}
      </div>

      {/* ── Quick actions ─────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-3">
          Quick actions
        </p>
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map(({ label, href, icon: Icon, primary }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-2.5 rounded-2xl px-4 py-5 text-center transition-all hover:scale-[1.02] active:scale-[0.98] ${
                primary
                  ? "text-white shadow-md hover:opacity-90"
                  : "bg-white text-neutral-700 shadow-sm hover:shadow-md"
              }`}
              style={primary ? { background: "linear-gradient(135deg, #6D28D9 0%, #4c1d95 100%)" } : {}}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-semibold">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Upgrade prompt (free plan only) ──────────────────────── */}
      {loaded && planSlug === "free" && (
        <div
          className="relative overflow-hidden rounded-2xl px-6 py-5 flex items-center justify-between gap-4"
          style={{ background: "linear-gradient(135deg, #6D28D9 0%, #4c1d95 100%)" }}
        >
          <div className="absolute right-0 top-0 w-48 h-48 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(20%, -30%)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-yellow-300" />
              <p className="text-sm font-bold text-white">Upgrade to Starter</p>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Unlock 5 events, 500 attendees, CSV upload &amp; remove branding
            </p>
          </div>
          <Link
            href="/billing"
            className="flex items-center gap-1.5 bg-white text-brand px-4 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-white/90 transition-colors"
          >
            Upgrade <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* ── Recent events ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
            Recent events
          </p>
          <Link
            href="/dashboard/events"
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-brand transition-colors font-medium"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!loaded ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => <EventSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-2xl p-14 text-center shadow-sm border border-dashed border-neutral-200">
            <div className="w-12 h-12 bg-brand-50 border border-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-5 h-5 text-brand" />
            </div>
            <p className="text-sm font-semibold text-neutral-800 mb-1">No events yet</p>
            <p className="text-xs text-neutral-400 mb-5 max-w-xs mx-auto">
              Create your first event to start issuing digital passes and scanning attendees
            </p>
            <Link
              href="/create-event"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: "#6D28D9" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Create your first event
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2 content-in">
            {events.map((event) => {
              const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.cancelled;
              const dateStr = new Date(event.event_date).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              });
              const isPast = new Date(event.event_date) < new Date();

              return (
                <Link
                  key={event.id}
                  href={`/event/${event.id}`}
                  className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all group"
                >
                  {/* Date block */}
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-brand group-hover:border-brand transition-all">
                    <span className="text-[8px] font-bold text-brand/70 uppercase group-hover:text-white/70 leading-none">
                      {new Date(event.event_date).toLocaleDateString("en-IN", { month: "short" })}
                    </span>
                    <span className="text-sm font-bold text-brand group-hover:text-white leading-none mt-0.5">
                      {new Date(event.event_date).getDate()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate group-hover:text-brand transition-colors">
                      {event.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-neutral-400 truncate">{event.venue}</span>
                      <span className="text-neutral-200 text-xs">·</span>
                      <span className="flex items-center gap-1 text-xs text-neutral-400 shrink-0">
                        {isPast ? <Clock className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        {dateStr}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${cfg.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Bottom tip ────────────────────────────────────────────── */}
      {loaded && events.length > 0 && (
        <div className="flex items-center gap-3 bg-white rounded-2xl px-5 py-4 shadow-sm">
          <div className="w-8 h-8 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed">
            Tip: Open the <span className="font-semibold text-neutral-700">Scanner</span> on your phone at the event entrance to check in attendees instantly via QR code.
          </p>
          <Link href="/scan" className="text-xs font-semibold text-brand shrink-0 hover:underline">
            Open →
          </Link>
        </div>
      )}
    </div>
  );
}
