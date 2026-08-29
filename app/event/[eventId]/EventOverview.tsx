"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  QrCode,
  CheckCircle,
  Clock,
  UserPlus,
  XCircle,
  Wifi,
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

function passStatusBadge(ps: PassStatus) {
  if (ps === "checked_in") return "bg-green-50 text-green-700";
  if (ps === "generated") return "bg-blue-50 text-blue-600";
  return "bg-neutral-100 text-neutral-500";
}

function appStatusBadge(as: AppStatus) {
  if (as === "approved") return "bg-green-50 text-green-700";
  if (as === "rejected") return "bg-red-50 text-red-600";
  return "bg-amber-50 text-amber-600";
}

export default function EventOverview({ event, initialAttendees = [] }: Props) {
  const [attendees, setAttendees] = useState<Attendee[]>(initialAttendees);
  const [live, setLive] = useState(false);

  // Fetch attendees client-side on mount (no server suspension needed)
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
        {
          event: "*",
          schema: "public",
          table: "attendees",
          filter: `event_id=eq.${event.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setAttendees((prev) => [payload.new as Attendee, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setAttendees((prev) =>
              prev.map((a) =>
                a.id === payload.new.id ? { ...a, ...(payload.new as Attendee) } : a
              )
            );
          } else if (payload.eventType === "DELETE") {
            setAttendees((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        setLive(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [event.id]);

  const total = attendees.length;
  const approved = attendees.filter((a) => a.application_status === "approved").length;
  const pending = attendees.filter((a) => a.application_status === "pending").length;
  const rejected = attendees.filter((a) => a.application_status === "rejected").length;
  const passesGenerated = attendees.filter(
    (a) => a.pass_status === "generated" || a.pass_status === "checked_in"
  ).length;
  const checkedIn = attendees.filter((a) => a.pass_status === "checked_in").length;

  const stats = [
    { label: "Applications", value: total, icon: Users, color: "text-neutral-600" },
    { label: "Approved", value: approved, icon: CheckCircle, color: "text-green-600" },
    { label: "Passes", value: passesGenerated, icon: QrCode, color: "text-blue-600" },
    { label: "Checked In", value: checkedIn, icon: CheckCircle, color: "text-emerald-600" },
    { label: "Pending", value: pending, icon: Clock, color: "text-amber-600" },
    { label: "Rejected", value: rejected, icon: XCircle, color: "text-red-500" },
  ];

  const previewAttendees = attendees.slice(0, 8);

  return (
    <div className="max-w-4xl mx-auto page-in">
      {/* Quick actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div className="flex flex-wrap items-center gap-2">
          {event.application_enabled && event.apply_slug && (
            <CopyLinkButton applySlug={event.apply_slug} />
          )}
          <Link
            href={`/event/${event.id}/attendees`}
            className="flex items-center gap-2 border border-neutral-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-neutral-50 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add attendee
          </Link>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-400">
          {live ? (
            <>
              <Wifi className="w-3.5 h-3.5 text-green-500" />
              <span className="text-green-600 font-medium">Live</span>
            </>
          ) : (
            <>
              <Wifi className="w-3.5 h-3.5 text-neutral-300" />
              <span>Connecting…</span>
            </>
          )}
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="border border-neutral-100 rounded-2xl p-4 transition-all"
          >
            <Icon className={`w-4 h-4 mb-2 ${color}`} />
            <p className="text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Capacity bar */}
      <div className="border border-neutral-100 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">Capacity</p>
          <p className="text-sm text-neutral-500 tabular-nums">
            {approved} / {event.attendee_limit} approved
          </p>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-neutral-900 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, (approved / event.attendee_limit) * 100)}%`,
            }}
          />
        </div>
        {approved >= event.attendee_limit && (
          <p className="text-xs text-amber-600 mt-2">Event is at capacity</p>
        )}
      </div>

      {/* Recent attendees table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium">Recent attendees</h2>
          <Link
            href={`/event/${event.id}/attendees`}
            className="text-xs text-neutral-400 hover:text-neutral-900 transition-colors"
          >
            View all {total > 8 ? `(${total})` : ""}
          </Link>
        </div>

        {previewAttendees.length === 0 ? (
          <div className="border border-dashed border-neutral-200 rounded-2xl p-12 text-center">
            <Users className="w-8 h-8 text-neutral-200 mx-auto mb-3" />
            <p className="text-sm text-neutral-400 mb-1">No attendees yet</p>
            {event.application_enabled ? (
              <p className="text-xs text-neutral-400">
                Share your application link to start collecting registrations
              </p>
            ) : (
              <Link
                href={`/event/${event.id}/attendees`}
                className="text-xs text-neutral-900 font-medium hover:underline"
              >
                Add attendees manually
              </Link>
            )}
          </div>
        ) : (
          <div className="border border-neutral-100 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3 hidden sm:table-cell">Pass type</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Application</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3 hidden md:table-cell">Pass</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {previewAttendees.map((a) => (
                  <tr key={a.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm">{a.name}</p>
                      <p className="text-xs text-neutral-400">{a.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-neutral-600 capitalize">{a.pass_type}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${appStatusBadge(a.application_status)}`}>
                        {a.application_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${passStatusBadge(a.pass_status)}`}>
                        {a.pass_status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
