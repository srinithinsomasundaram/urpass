import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import AppShell from "@/components/layouts/AppShell";
import EventSubNav from "@/components/event/EventSubNav";
import { ArrowLeft, MapPin, Calendar } from "lucide-react";

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

function statusStyle(status: string) {
  if (status === "active") return "bg-green-50 text-green-700 border border-green-100";
  if (status === "draft") return "bg-neutral-100 text-neutral-500 border border-neutral-200";
  if (status === "completed") return "bg-blue-50 text-blue-600 border border-blue-100";
  return "bg-red-50 text-red-600 border border-red-100";
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

  const [{ data: event }, { data: profile }] = await Promise.all([
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
  ]);

  if (!event) notFound();

  const fullName = profile?.full_name ?? user.email?.split("@")[0] ?? "Organizer";
  const email = profile?.email ?? user.email ?? "";

  const formattedDate = new Date(event.event_date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <AppShell fullName={fullName} email={email}>
      {/* Event header */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="px-4 lg:px-8 pt-5 pb-0">
          <Link
            href="/dashboard/events"
            className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-brand transition-colors mb-4 font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Events
          </Link>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold tracking-tight truncate">
                {event.name}
              </h1>
              <div className="flex items-center gap-4 mt-1.5">
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <MapPin className="w-3 h-3" />
                  {event.venue}
                </span>
                <span className="flex items-center gap-1.5 text-xs text-neutral-400">
                  <Calendar className="w-3 h-3" />
                  {formattedDate}
                </span>
              </div>
            </div>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusStyle(event.status)}`}
            >
              {event.status}
            </span>
          </div>

          <EventSubNav eventId={eventId} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-8 py-6">{children}</div>
    </AppShell>
  );
}
