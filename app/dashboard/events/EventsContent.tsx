"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Event {
  id: string; name: string; venue: string; event_date: string; status: string;
}

function statusPill(status: string) {
  if (status === "active") return "bg-green-50 text-green-700 border border-green-100";
  if (status === "draft") return "bg-neutral-100 text-neutral-500 border border-neutral-200";
  if (status === "completed") return "bg-blue-50 text-blue-600 border border-blue-100";
  return "bg-red-50 text-red-600 border border-red-100";
}

function RowSkeleton() {
  return (
    <div className="flex items-center justify-between bg-white border border-neutral-100 rounded-2xl px-5 py-4">
      <div className="flex items-center gap-3 flex-1">
        <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="skeleton h-3.5 rounded w-44" />
          <div className="skeleton h-3 rounded w-32" />
        </div>
      </div>
      <div className="skeleton h-5 w-14 rounded-full shrink-0 ml-3" />
    </div>
  );
}

export default function EventsContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("events")
        .select("id, name, venue, event_date, status")
        .eq("organizer_id", user.id)
        .order("created_at", { ascending: false });
      setEvents(data ?? []);
      setLoaded(true);
    }
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto page-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-1">Events</p>
          <h1 className="text-2xl font-semibold tracking-tight">All events</h1>
        </div>
        <Link
          href="/create-event"
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ background: "#6D28D9" }}
        >
          <Plus className="w-4 h-4" />
          New event
        </Link>
      </div>

      {!loaded ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white border border-dashed border-neutral-200 rounded-2xl p-16 text-center content-in">
          <div className="w-12 h-12 bg-brand-50 border border-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-5 h-5 text-brand" />
          </div>
          <p className="text-sm font-medium text-neutral-700 mb-1">No events yet</p>
          <p className="text-xs text-neutral-400 mb-5">
            Create your first event to start collecting registrations
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
          {events.map((event) => (
            <Link
              key={event.id}
              href={`/event/${event.id}`}
              className="flex items-center justify-between bg-white border border-neutral-100 rounded-2xl px-5 py-4 hover:border-brand-100 hover:shadow-sm transition-all group"
            >
              <div className="min-w-0 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-brand" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-neutral-900 group-hover:text-brand transition-colors">
                    {event.name}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {event.venue}
                    </span>
                    <span className="text-xs text-neutral-300">·</span>
                    <span className="text-xs text-neutral-400">
                      {new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
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
  );
}
