"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  QrCode,
  CheckCircle2,
  Clock,
  UserPlus,
  XCircle,
  Wifi,
  ScanLine,
} from "lucide-react";
import CopyLinkButton from "@/components/event/CopyLinkButton";
import { createClient } from "@/lib/supabase/client";

type PassStatus = "not_generated" | "generated" | "checked_in";
type AppStatus = "pending" | "approved" | "rejected";

interface Attendee {
  id: string;
  name: string;
  email: string;
  pass_type: string;
  application_status: AppStatus;
  pass_status: PassStatus;
  created_at: string;
}

interface Event {
  id: string;
  name: string;
  application_enabled: boolean;
  attendee_limit: number;
  status: string;
  apply_slug: string | null;
}

interface Props {
  event: Event;
  initialAttendees?: Attendee[];
}

const APP_STATUS_CONFIG: Record<AppStatus, { label: string; cls: string }> = {
  approved: { label: "Approved", cls: "bg-green-50 text-green-700 border border-green-100" },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-600 border border-red-100" },
  pending:  { label: "Pending",  cls: "bg-amber-50 text-amber-700 border border-amber-100" },
};

const PASS_STATUS_CONFIG: Record<PassStatus, { label: string; cls: string }> = {
  checked_in:    { label: "Checked in",    cls: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
  generated:     { label: "Pass issued",   cls: "bg-blue-50 text-blue-600 border border-blue-100" },
  not_generated: { label: "No pass",       cls: "bg-neutral-100 text-neutral-500 border border-neutral-100" },
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase() || "?";
}

const AVATAR_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-blue-100 text-blue-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function avatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function EventOverview({ event, initialAttendees = [] }: Props) {
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("attendees")
      .select("id, name, email, pass_type, application_status, pass_status, created_at")
      .eq("event_id", event.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setAttendees(data); });
  }, [event.id]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`event-overview-${event.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "attendees", filter: `event_id=eq.${event.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setAttendees((prev) => [payload.new as Attendee, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setAttendees((prev) =>
              prev.map((a) => (a.id === payload.new.id ? { ...a, ...(payload.new as Attendee) } : a))
            );
          } else if (payload.eventType === "DELETE") {
            setAttendees((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => setLive(status === "SUBSCRIBED"));

    return () => { supabase.removeChannel(channel); };
  }, [event.id]);

  const total          = attendees.length;
  const approved       = attendees.filter((a) => a.application_status === "approved").length;
  const pending        = attendees.filter((a) => a.application_status === "pending").length;
  const rejected       = attendees.filter((a) => a.application_status === "rejected").length;
  const passesGenerated = attendees.filter(
    (a) => a.pass_status === "generated" || a.pass_status === "checked_in"
  ).length;
  const checkedIn      = attendees.filter((a) => a.pass_status === "checked_in").length;

  const capacityPct = event.attendee_limit > 0
    ? Math.min(100, Math.round((approved / event.attendee_limit) * 100))
    : 0;
  const atCapacity = event.attendee_limit > 0 && approved >= event.attendee_limit;

  const previewAttendees = attendees.slice(0, 10);

  return (
    <div className="max-w-4xl mx-auto page-in">

      {/* ── Action bar ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {event.application_enabled && event.apply_slug && (
            <CopyLinkButton applySlug={event.apply_slug} />
          )}
          <Link
            href={`/event/${event.id}/attendees`}
            className="flex items-center gap-2 bg-white border border-neutral-200 shadow-sm rounded-xl px-4 py-2 text-sm font-medium hover:shadow-md transition-shadow"
          >
            <UserPlus className="w-4 h-4" />
            Add attendee
          </Link>
          <Link
            href={`/event/${event.id}/checkins`}
            className="flex items-center gap-2 bg-white border border-neutral-200 shadow-sm rounded-xl px-4 py-2 text-sm font-medium hover:shadow-md transition-shadow"
          >
            <ScanLine className="w-4 h-4" />
            Check-ins
          </Link>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {live ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-600 font-medium">Live</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-neutral-300" />
              <span className="text-neutral-400">Connecting…</span>
            </>
          )}
        </div>
      </div>

      {/* ── Primary stats (3 big) ───────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {/* Total */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Total</span>
            <div className="w-7 h-7 rounded-xl bg-neutral-100 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-neutral-500" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight tabular-nums text-neutral-900">{total}</p>
          <p className="text-xs text-neutral-400">Registrations</p>
        </div>

        {/* Approved */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Approved</span>
            <div className="w-7 h-7 rounded-xl bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight tabular-nums text-neutral-900">{approved}</p>
          <p className="text-xs text-neutral-400">
            {total > 0 ? `${Math.round((approved / total) * 100)}% acceptance` : "No applications yet"}
          </p>
        </div>

        {/* Checked in */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wide">Checked in</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
          <p className="text-3xl font-bold tracking-tight tabular-nums text-neutral-900">{checkedIn}</p>
          <p className="text-xs text-neutral-400">
            {approved > 0 ? `${Math.round((checkedIn / approved) * 100)}% check-in rate` : "No approved attendees"}
          </p>
        </div>
      </div>

      {/* ── Secondary stats (3 small inline) ───────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums text-neutral-900">{passesGenerated}</p>
            <p className="text-[11px] text-neutral-400 leading-none mt-0.5">Passes issued</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums text-neutral-900">{pending}</p>
            <p className="text-[11px] text-neutral-400 leading-none mt-0.5">Pending review</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3.5 flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <XCircle className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums text-neutral-900">{rejected}</p>
            <p className="text-[11px] text-neutral-400 leading-none mt-0.5">Rejected</p>
          </div>
        </div>
      </div>

      {/* ── Capacity ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-3 gap-4">
          <div>
            <p className="text-sm font-semibold text-neutral-900">Capacity</p>
            <p className="text-xs text-neutral-400 mt-0.5">Approved registrations vs limit</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xl font-bold tabular-nums text-neutral-900">
              {approved}
              <span className="text-sm font-normal text-neutral-400"> / {event.attendee_limit}</span>
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              {atCapacity
                ? "At full capacity"
                : `${event.attendee_limit - approved} spots remaining`}
            </p>
          </div>
        </div>
        <div className="h-2.5 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${capacityPct}%`,
              background: atCapacity
                ? "linear-gradient(90deg, #dc2626, #ef4444)"
                : "linear-gradient(90deg, #6D28D9, #8B5CF6)",
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className={`text-xs font-medium ${atCapacity ? "text-red-500" : "text-neutral-400"}`}>
            {capacityPct}% filled
          </p>
          {atCapacity && (
            <p className="text-xs text-amber-600 font-medium">Applications may be turned off</p>
          )}
        </div>
      </div>

      {/* ── Recent attendees ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-50">
          <h2 className="text-sm font-semibold text-neutral-900">Recent registrations</h2>
          <Link
            href={`/event/${event.id}/attendees`}
            className="text-xs font-medium text-brand hover:underline underline-offset-2"
          >
            View all {total > 10 ? `(${total})` : ""}
          </Link>
        </div>

        {previewAttendees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-neutral-300" />
            </div>
            <p className="text-sm font-semibold text-neutral-600 mb-1">No registrations yet</p>
            {event.application_enabled && event.apply_slug ? (
              <p className="text-xs text-neutral-400">
                Share your application link to start collecting registrations.
              </p>
            ) : (
              <Link
                href={`/event/${event.id}/attendees`}
                className="text-xs text-brand font-semibold hover:underline mt-1"
              >
                Add attendees manually →
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-neutral-50">
            {previewAttendees.map((a) => {
              const appCfg  = APP_STATUS_CONFIG[a.application_status];
              const passCfg = PASS_STATUS_CONFIG[a.pass_status];
              const ini     = initials(a.name);
              const avCls   = avatarColor(a.name);
              return (
                <li
                  key={a.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50/60 transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${avCls}`}
                  >
                    {ini}
                  </div>

                  {/* Name + email */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{a.name}</p>
                    <p className="text-xs text-neutral-400 truncate">{a.email}</p>
                  </div>

                  {/* Pass type */}
                  <span className="hidden sm:inline text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full capitalize font-medium shrink-0">
                    {a.pass_type}
                  </span>

                  {/* Application status */}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${appCfg.cls}`}>
                    {appCfg.label}
                  </span>

                  {/* Pass status */}
                  <span className={`hidden md:inline text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${passCfg.cls}`}>
                    {passCfg.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
