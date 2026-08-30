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

  const { data: { user } } = await supabase.auth.getUser();
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

  const initialPassTokens: Record<string, string> = Object.fromEntries(
    (passes ?? []).map((p) => [p.attendee_id, p.pass_token])
  );

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-0 py-6 page-in">
      <AttendeeTable
        attendees={attendees ?? []}
        eventId={eventId}
        attendeeLimit={event.attendee_limit}
        applySlug={event.apply_slug}
        applicationEnabled={event.application_enabled}
        initialPassTokens={initialPassTokens}
        canCSV={plan.canCSV}
        canExport={plan.canExport}
      />
    </div>
  );
}
