import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppShell from "@/components/layouts/AppShell";
import EventSubNav from "@/components/event/EventSubNav";
import { ArrowLeft, MapPin, Calendar, Clock } from "lucide-react";
import { getUserPlan } from "@/lib/plan";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): Promise<Metadata> {
  const { eventId } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("name, venue")
    .eq("id", eventId)
    .single();

  if (!event) return { title: "Event" };
  return {
    title: event.name,
    description: `Manage attendees, passes, and check-in for ${event.name} at ${event.venue}.`,
    robots: { index: false, follow: false },
  };
}

type Status = "active" | "draft" | "completed" | "cancelled";

const STATUS_CONFIG: Record<Status, { label: string; dot: string; cls: string }> = {
  active:    { label: "Active",    dot: "bg-green-500",   cls: "bg-green-50 text-green-700 border-green-200" },
  draft:     { label: "Draft",     dot: "bg-neutral-400", cls: "bg-neutral-100 text-neutral-500 border-neutral-200" },
  completed: { label: "Completed", dot: "bg-blue-500",    cls: "bg-blue-50 text-blue-700 border-blue-200" },
  cancelled: { label: "Cancelled", dot: "bg-red-500",     cls: "bg-red-50 text-red-600 border-red-200" },
};

function formatTime(t: string) {
  const parts = t.split(":");
  const h = parseInt(parts[0]);
  const m = parts[1] ?? "00";
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

export default async function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: event }, { data: profile }, plan] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, status, event_date, start_time, end_time, venue")
      .eq("id", eventId)
      .eq("organizer_id", user.id)
      .single(),
    supabase
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", user.id)
      .single(),
    getUserPlan(supabase, user.id),
  ]);

  if (!event) notFound();

  const fullName = profile?.full_name ?? user.email?.split("@")[0] ?? "Organizer";
  const email    = profile?.email ?? user.email ?? "";

  const statusKey = (event.status as Status) in STATUS_CONFIG ? (event.status as Status) : "draft";
  const statusCfg = STATUS_CONFIG[statusKey];

  const formattedDate = new Date(event.event_date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <AppShell fullName={fullName} email={email} planSlug={plan.slug}>

      {/* ── Page header ───────────────────────────────────────── */}
      <div className="bg-white border-b border-neutral-100">
        <div className="px-4 lg:px-8 pt-5 pb-0">

          {/* Back link */}
          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors mb-4 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All events
          </Link>

          {/* Title row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight leading-tight truncate">
                {event.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
                  <MapPin className="w-3 h-3 shrink-0" />
                  {event.venue}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
                  <Calendar className="w-3 h-3 shrink-0" />
                  {formattedDate}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400">
                  <Clock className="w-3 h-3 shrink-0" />
                  {formatTime(event.start_time)} – {formatTime(event.end_time)}
                </span>
              </div>
            </div>

            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 capitalize ${statusCfg.cls}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusCfg.dot} ${statusKey === "active" ? "animate-pulse" : ""}`} />
              {statusCfg.label}
            </span>
          </div>

          {/* Tab nav */}
          <EventSubNav eventId={eventId} />
        </div>
      </div>

      {/* ── Page content ──────────────────────────────────────── */}
      <div className="px-4 lg:px-8 py-6">{children}</div>
    </AppShell>
  );
}
