import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Scanner",
  description: "Select an event to start scanning QR passes at the entrance.",
  robots: { index: false, follow: false },
};
import Link from "next/link";
import {
  ScanLine,
  ArrowLeft,
  ChevronRight,
  Calendar,
  MapPin,
  Ticket,
  QrCode,
} from "lucide-react";

export default async function ScanIndexPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: events } = await supabase
    .from("events")
    .select("id, name, event_date, venue, status")
    .eq("organizer_id", user.id)
    .eq("status", "active")
    .order("event_date", { ascending: true });

  return (
    <div className="min-h-screen bg-neutral-950 page-in">

      {/* ── Dark hero ──────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-5 pt-10 pb-20">
        {/* Glow */}
        <div
          className="absolute inset-0 opacity-25 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 75% 60%, #6D28D9 0%, transparent 55%)",
          }}
        />

        <div className="relative max-w-xl mx-auto">
          {/* Back */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>

          {/* Icon badge */}
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
            style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
          >
            <QrCode className="w-6 h-6 text-white" />
          </div>

          <p className="text-[10px] font-bold tracking-widest uppercase text-brand-200 mb-2">
            QR Check-in
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-white leading-tight">
            Scanner
          </h1>
          <p className="text-sm text-white/35 mt-2 leading-relaxed">
            Select an active event below to start scanning passes
          </p>
        </div>
      </div>

      {/* ── White card slides up ────────────────────────────────────── */}
      <div className="bg-neutral-50 rounded-t-3xl -mt-8 min-h-[60vh]">
        <div className="max-w-xl mx-auto px-5 pt-8 pb-12">

          {!events || events.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center text-center py-16">
              <div className="w-16 h-16 bg-white border border-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                <Ticket className="w-7 h-7 text-neutral-300" />
              </div>
              <p className="text-base font-semibold text-neutral-800 mb-1">
                No active events
              </p>
              <p className="text-sm text-neutral-400 mb-8 leading-relaxed max-w-xs">
                Publish an event first. Only active events appear in the scanner.
              </p>
              <Link
                href="/create-event"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                style={{ background: "#6D28D9" }}
              >
                <Ticket className="w-4 h-4" />
                Create an event
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Section label */}
              <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-1">
                Active events · {events.length}
              </p>

              {events.map((event, i) => {
                const dateStr = new Date(event.event_date).toLocaleDateString("en-IN", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <Link
                    key={event.id}
                    href={`/scan/${event.id}`}
                    className="group flex items-center gap-4 bg-white border border-neutral-100 rounded-2xl px-5 py-4 hover:border-brand/30 hover:shadow-md transition-all"
                  >
                    {/* Number badge */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold"
                      style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
                    >
                      {i + 1}
                    </div>

                    {/* Event info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate group-hover:text-brand transition-colors">
                        {event.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        <span className="flex items-center gap-1 text-xs text-neutral-400">
                          <Calendar className="w-3 h-3 shrink-0" />
                          {dateStr}
                        </span>
                        {event.venue && (
                          <span className="flex items-center gap-1 text-xs text-neutral-400">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate max-w-[140px]">{event.venue}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Scan CTA */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-brand bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-xl group-hover:bg-brand group-hover:text-white group-hover:border-brand transition-all">
                        <ScanLine className="w-3.5 h-3.5" />
                        Scan
                      </div>
                      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-brand transition-colors" />
                    </div>
                  </Link>
                );
              })}

              {/* Footer note */}
              <p className="text-center text-xs text-neutral-400 pt-6">
                Only active events are shown · Draft and ended events are hidden
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
