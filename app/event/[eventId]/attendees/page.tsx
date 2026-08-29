import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AttendeeTable from "@/components/event/AttendeeTable";
import { getUserPlan } from "@/lib/plan";

interface Props {
  params: Promise<{ eventId: string }>;
}

export default async function AttendeesPage({ params }: Props) {
  const { eventId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("id, name, attendee_limit, application_enabled, apply_slug")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) redirect("/dashboard");

  const [{ data: attendees }, { data: passes }, plan] = await Promise.all([
    supabase
      .from("attendees")
      .select("id, name, email, phone, pass_type, application_status, pass_status, created_at")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false }),
    supabase
      .from("passes")
      .select("attendee_id, pass_token")
      .eq("event_id", eventId),
    getUserPlan(supabase, user.id),
  ]);

  const rows = attendees ?? [];
  const approvedCount = rows.filter((a) => a.application_status === "approved").length;
  const initialPassTokens: Record<string, string> = Object.fromEntries(
    (passes ?? []).map((p) => [p.attendee_id, p.pass_token])
  );

  return (
    <div className="p-6 max-w-5xl mx-auto page-in">
      {/* Capacity strip */}
      <div className="mb-6 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-neutral-500">Capacity</span>
            <span className="text-xs font-medium">
              {approvedCount} / {event.attendee_limit}
            </span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-neutral-900 rounded-full transition-all"
              style={{ width: `${Math.min((approvedCount / event.attendee_limit) * 100, 100)}%` }}
            />
          </div>
        </div>

        {event.application_enabled && event.apply_slug && (
          <div className="shrink-0">
            <a
              href={`/apply/${event.apply_slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-neutral-500 border border-neutral-200 rounded-xl px-3 py-2 hover:bg-neutral-50 transition-colors"
            >
              <span className="font-mono font-medium text-neutral-700">{event.apply_slug}</span>
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        )}
      </div>

      <AttendeeTable
        attendees={rows}
        eventId={eventId}
        initialPassTokens={initialPassTokens}
        canCSV={plan.canCSV}
        canExport={plan.canExport}
      />
    </div>
  );
}
