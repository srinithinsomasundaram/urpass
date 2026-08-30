"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, MapPin, ChevronRight, Search, SlidersHorizontal } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Event {
  id: string; name: string; venue: string; event_date: string; status: string;
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  active:    { label: "Active",    cls: "bg-green-50 text-green-700 border border-green-100",     dot: "bg-green-500" },
  draft:     { label: "Draft",     cls: "bg-neutral-100 text-neutral-500 border border-neutral-200", dot: "bg-neutral-300" },
  completed: { label: "Completed", cls: "bg-blue-50 text-blue-600 border border-blue-100",        dot: "bg-blue-500" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600 border border-red-100",           dot: "bg-red-500" },
};

const FILTERS = ["all", "active", "draft", "completed"] as const;
type Filter = typeof FILTERS[number];

function RowSkeleton() {
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm">
      <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <div className="skeleton h-4 rounded w-52" />
        <div className="skeleton h-3 rounded w-36" />
      </div>
      <div className="skeleton h-5 w-16 rounded-full" />
      <div className="skeleton w-5 h-5 rounded" />
    </div>
  );
}

export default function EventsContent() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

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

  const filtered = events.filter((e) => {
    const matchFilter = filter === "all" || e.status === filter;
    const matchSearch = !search ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const counts = FILTERS.reduce<Record<string, number>>((acc, f) => {
    acc[f] = f === "all" ? events.length : events.filter((e) => e.status === f).length;
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto page-in">

      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-1">Events</p>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">All events</h1>
        </div>
        <Link
          href="/create-event"
          className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
          style={{ background: "#6D28D9" }}
        >
          <Plus className="w-4 h-4" />
          New event
        </Link>
      </div>

      {/* ── Search + filter bar ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events…"
            className="w-full pl-10 pr-4 py-2.5 bg-white shadow-sm rounded-xl text-sm outline-none focus:ring-2 focus:ring-brand/20 transition-all placeholder:text-neutral-300"
          />
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 bg-white shadow-sm rounded-xl p-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-300 mx-1.5 shrink-0" />
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize whitespace-nowrap ${
                filter === f
                  ? "bg-brand text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50"
              }`}
            >
              {f === "all" ? "All" : f}
              {loaded && (
                <span className={`ml-1.5 tabular-nums ${filter === f ? "text-white/70" : "text-neutral-300"}`}>
                  {counts[f]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Event list ───────────────────────────────────────────── */}
      {!loaded ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-dashed border-neutral-200 content-in">
          <div className="w-12 h-12 bg-brand-50 border border-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-5 h-5 text-brand" />
          </div>
          <p className="text-sm font-semibold text-neutral-800 mb-1">No events yet</p>
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
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center shadow-sm">
          <Search className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">No events match your search</p>
          <button
            onClick={() => { setSearch(""); setFilter("all"); }}
            className="text-xs text-brand font-medium mt-2 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2 content-in">
          {filtered.map((event) => {
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
                {/* Date badge */}
                <div
                  className="w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 transition-all group-hover:scale-105"
                  style={{
                    background: isPast
                      ? "linear-gradient(135deg, #f5f5f5, #e5e7eb)"
                      : "linear-gradient(135deg, #ede9fe, #ddd6fe)",
                  }}
                >
                  <span className="text-[9px] font-bold uppercase leading-none"
                    style={{ color: isPast ? "#9ca3af" : "#7c3aed" }}>
                    {new Date(event.event_date).toLocaleDateString("en-IN", { month: "short" })}
                  </span>
                  <span className="text-base font-black leading-tight"
                    style={{ color: isPast ? "#6b7280" : "#6D28D9" }}>
                    {new Date(event.event_date).getDate()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate group-hover:text-brand transition-colors">
                    {event.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                    <span className="flex items-center gap-1 text-xs text-neutral-400">
                      <MapPin className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[160px]">{event.venue}</span>
                    </span>
                    <span className="text-neutral-200 text-xs hidden sm:inline">·</span>
                    <span className="text-xs text-neutral-400 hidden sm:inline">{dateStr}</span>
                  </div>
                </div>

                {/* Status */}
                <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${cfg.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>

                <ChevronRight className="w-4 h-4 text-neutral-200 group-hover:text-brand transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

      {loaded && filtered.length > 0 && (
        <p className="text-center text-xs text-neutral-300 mt-8">
          {filtered.length} event{filtered.length === 1 ? "" : "s"} shown
        </p>
      )}
    </div>
  );
}
