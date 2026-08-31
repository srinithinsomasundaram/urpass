import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrganization } from "@/app/actions/organizations";

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  active:    { label: "Active",    cls: "bg-green-50 text-green-700 border border-green-100",    dot: "bg-green-500" },
  draft:     { label: "Draft",     cls: "bg-neutral-100 text-neutral-500 border border-neutral-200", dot: "bg-neutral-400" },
  completed: { label: "Completed", cls: "bg-blue-50 text-blue-600 border border-blue-100",       dot: "bg-blue-500" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600 border border-red-100",          dot: "bg-red-500" },
};

export default async function OrgEventsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await getOrganization(orgSlug);
  if (!result) notFound();
  const { org, userRole } = result;
  if (!userRole) redirect("/dashboard/organizations");

  let eventsQuery = supabase
    .from("events")
    .select("id, name, venue, event_date, status, attendee_limit")
    .eq("organization_id", org.id)
    .order("event_date", { ascending: false });

  // Event managers only see assigned events
  if (userRole === "event_manager") {
    const { data: assignments } = await supabase
      .from("event_assignments")
      .select("event_id, member:organization_members!inner(user_id)")
      .eq("organization_members.user_id", user.id);
    const ids = (assignments ?? []).map((a) => a.event_id);
    if (ids.length === 0) {
      return (
        <div className="bg-white rounded-2xl p-14 text-center shadow-sm border border-dashed border-neutral-200">
          <Calendar className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-neutral-700 mb-1">No events assigned</p>
          <p className="text-xs text-neutral-400">Ask an admin to assign events to you</p>
        </div>
      );
    }
    eventsQuery = eventsQuery.in("id", ids);
  }

  const { data: events } = await eventsQuery;

  const canCreateEvent = userRole === "owner" || userRole === "admin";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">All events</p>
        {canCreateEvent && (
          <Link
            href={`/create-event?org=${org.id}`}
            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            style={{ background: "#6D28D9" }}
          >
            <Plus className="w-3 h-3" />
            New event
          </Link>
        )}
      </div>

      {!events || events.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center shadow-sm border border-dashed border-neutral-200">
          <Calendar className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-neutral-700 mb-1">No events yet</p>
          <p className="text-xs text-neutral-400 mb-4">
            {canCreateEvent ? "Create your first event for this organization" : "No events have been created yet"}
          </p>
          {canCreateEvent && (
            <Link
              href={`/create-event?org=${org.id}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: "#6D28D9" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Create event
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((event) => {
            const cfg = STATUS_CONFIG[event.status] ?? STATUS_CONFIG.cancelled;
            return (
              <Link
                key={event.id}
                href={`/event/${event.id}`}
                className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex flex-col items-center justify-center shrink-0 group-hover:bg-brand group-hover:border-brand transition-all">
                  <span className="text-[8px] font-bold text-brand/70 uppercase group-hover:text-white/70 leading-none">
                    {new Date(event.event_date).toLocaleDateString("en-IN", { month: "short" })}
                  </span>
                  <span className="text-sm font-bold text-brand group-hover:text-white leading-none mt-0.5">
                    {new Date(event.event_date).getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate group-hover:text-brand transition-colors">{event.name}</p>
                  <p className="text-xs text-neutral-400 truncate">{event.venue} · {event.attendee_limit} seats</p>
                </div>
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
  );
}
