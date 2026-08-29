"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, QrCode, CheckCircle2, Ticket } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface EventRow { id: string; name: string; venue: string; event_date: string; status: string; }

function statusPill(status: string) {
  if (status === "active") return "bg-green-50 text-green-700 border border-green-100";
  if (status === "draft") return "bg-neutral-100 text-neutral-500 border border-neutral-200";
  if (status === "completed") return "bg-blue-50 text-blue-600 border border-blue-100";
  return "bg-red-50 text-red-600 border border-red-100";
}

function StatCard({ label, value, Icon, color, bg }: {
  label: string; value: number;
  Icon: React.ComponentType<{ className?: string }>;
  color: string; bg: string;
}) {
  return (
    <div className="bg-white border border-neutral-100 rounded-2xl p-5 hover:border-neutral-200 hover:shadow-sm transition-all">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
    </div>
  );
}

function EventRowSkeleton() {
  return (
    <div className="flex items-center justify-between bg-white border border-neutral-100 rounded-2xl px-5 py-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="skeleton w-8 h-8 rounded-xl shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="skeleton h-3.5 rounded w-40" />
          <div className="skeleton h-3 rounded w-28" />
        </div>
      </div>
      <div className="skeleton h-5 w-14 rounded-full shrink-0 ml-3" />
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardContent() {
  const [firstName, setFirstName] = useState("");
  const [greeting] = useState(getGreeting);
  const [stats, setStats] = useState({ total: 0, active: 0, passes: 0, checkedIn: 0 });
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: profile }, { data: eventRows }] = await Promise.all([
        supabase.from("profiles").select("full_name").eq("user_id", user.id).single(),
        supabase.from("events").select("id, name, venue, event_date, status")
          .eq("organizer_id", user.id).order("created_at", { ascending: false }),
      ]);

      const allIds = eventRows?.map((e) => e.id) ?? [];
      const totalEvents = allIds.length;
      const activeEvents = eventRows?.filter((e) => e.status === "active").length ?? 0;

      const [{ count: totalPasses }, { count: totalCheckedIn }] = await Promise.all([
        allIds.length
          ? supabase.from("passes").select("*", { count: "exact", head: true }).in("event_id", allIds)
          : Promise.resolve({ count: 0 }),
        allIds.length
          ? supabase.from("check_ins").select("*", { count: "exact", head: true }).in("event_id", allIds)
          : Promise.resolve({ count: 0 }),
      ]);

      setFirstName(profile?.full_name?.split(" ")[0] ?? "there");
      setStats({ total: totalEvents, active: activeEvents, passes: totalPasses ?? 0, checkedIn: totalCheckedIn ?? 0 });
      setEvents((eventRows ?? []).slice(0, 5));
      setLoaded(true);
    }
    load();
  }, []);

  const statCards = [
    { label: "Total Events",  value: stats.total,     Icon: Calendar,    color: "text-neutral-600", bg: "bg-neutral-100" },
    { label: "Active Events", value: stats.active,    Icon: Ticket,      color: "text-brand",       bg: "bg-brand-50" },
    { label: "Total Passes",  value: stats.passes,    Icon: QrCode,      color: "text-blue-600",    bg: "bg-blue-50" },
    { label: "Checked In",    value: stats.checkedIn, Icon: CheckCircle2,color: "text-emerald-600", bg: "bg-emerald-50" },
  ];

  return (
    <div className="max-w-4xl mx-auto page-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-1">Overview</p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {greeting}{firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="text-sm text-neutral-400 mt-0.5">
            Here&apos;s what&apos;s happening across your events
          </p>
        </div>
        <Link
          href="/create-event"
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shrink-0"
          style={{ background: "#6D28D9" }}
        >
          <Plus className="w-4 h-4" />
          New event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {loaded ? (
          statCards.map((s) => <StatCard key={s.label} {...s} />)
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white border border-neutral-100 rounded-2xl p-5">
              <div className="skeleton w-8 h-8 rounded-xl mb-3" />
              <div className="skeleton h-7 w-12 rounded mb-1.5" />
              <div className="skeleton h-3 w-20 rounded" />
            </div>
          ))
        )}
      </div>

      {/* Recent events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-neutral-900">Recent events</h2>
          <Link href="/dashboard/events" className="text-xs text-neutral-400 hover:text-brand transition-colors font-medium">
            View all →
          </Link>
        </div>

        {!loaded ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => <EventRowSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-dashed border-neutral-200 rounded-2xl p-14 text-center content-in">
            <div className="w-12 h-12 bg-brand-50 border border-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-5 h-5 text-brand" />
            </div>
            <p className="text-sm font-medium text-neutral-700 mb-1">No events yet</p>
            <p className="text-xs text-neutral-400 mb-5">Create your first event to start issuing passes</p>
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
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className="flex items-center justify-between bg-white border border-neutral-100 rounded-2xl px-5 py-4 hover:border-brand-100 hover:shadow-sm transition-all group"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-brand" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate text-neutral-900 group-hover:text-brand transition-colors">
                      {event.name}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {event.venue} &middot;{" "}
                      {new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ml-3 ${statusPill(event.status)}`}>
                  {event.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
