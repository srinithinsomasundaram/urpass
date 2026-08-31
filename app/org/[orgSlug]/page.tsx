import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Calendar, Users, CheckCircle2, QrCode } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getOrganization } from "@/app/actions/organizations";

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  active:    { label: "Active",    cls: "bg-green-50 text-green-700 border border-green-100",    dot: "bg-green-500" },
  draft:     { label: "Draft",     cls: "bg-neutral-100 text-neutral-500 border border-neutral-200", dot: "bg-neutral-400" },
  completed: { label: "Completed", cls: "bg-blue-50 text-blue-600 border border-blue-100",       dot: "bg-blue-500" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-600 border border-red-100",          dot: "bg-red-500" },
};

export default async function OrgPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await getOrganization(orgSlug);
  if (!result) notFound();
  const { org, userRole } = result;
  if (!userRole) redirect("/dashboard/organizations");

  const [{ data: events }, { count: memberCount }] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, venue, event_date, status")
      .eq("organization_id", org.id)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("organization_members")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", org.id)
      .eq("status", "active"),
  ]);

  const eventIds = (events ?? []).map((e) => e.id);
  const [{ count: passCount }, { count: checkinCount }] = await Promise.all([
    eventIds.length
      ? supabase.from("passes").select("*", { count: "exact", head: true }).in("event_id", eventIds)
      : Promise.resolve({ count: 0 }),
    eventIds.length
      ? supabase.from("check_ins").select("*", { count: "exact", head: true }).in("event_id", eventIds)
      : Promise.resolve({ count: 0 }),
  ]);

  const canCreateEvent = userRole === "owner" || userRole === "admin";

  const stats = [
    { label: "Events",     value: events?.length ?? 0,  icon: Calendar,     accent: "bg-neutral-100 text-neutral-600" },
    { label: "Members",    value: memberCount ?? 0,      icon: Users,        accent: "bg-brand-50 text-brand" },
    { label: "Passes",     value: passCount ?? 0,        icon: QrCode,       accent: "bg-blue-50 text-blue-600" },
    { label: "Checked In", value: checkinCount ?? 0,     icon: CheckCircle2, accent: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${accent}`}>
              <Icon className="w-4 h-4" />
            </div>
            <p className="text-3xl font-bold tracking-tight tabular-nums text-neutral-900">{value.toLocaleString()}</p>
            <p className="text-xs text-neutral-400 mt-1 font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Recent events</p>
          <div className="flex items-center gap-2">
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
            <Link
              href={`/org/${orgSlug}/events`}
              className="text-xs text-neutral-400 hover:text-brand transition-colors font-medium"
            >
              View all
            </Link>
          </div>
        </div>

        {!events || events.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-dashed border-neutral-200">
            <Calendar className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-700 mb-1">No events yet</p>
            <p className="text-xs text-neutral-400 mb-4">Create your first event for this organization</p>
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
                    <p className="text-xs text-neutral-400 truncate">{event.venue}</p>
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
    </div>
  );
}
