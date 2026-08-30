import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckinDashboard from "./CheckinDashboard";

export default async function CheckinsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: event } = await supabase
    .from("events")
    .select("id, name, status, attendee_limit")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) notFound();

  const [{ data: attendees }, { data: checkins }] = await Promise.all([
    supabase
      .from("attendees")
      .select("id, name, email, pass_type, pass_status, application_status")
      .eq("event_id", eventId)
      .eq("application_status", "approved")
      .order("name", { ascending: true }),
    supabase
      .from("check_ins")
      .select("id, attendee_id, checked_in_at")
      .eq("event_id", eventId)
      .order("checked_in_at", { ascending: false }),
  ]);

  return (
    <CheckinDashboard
      event={event}
      initialAttendees={attendees ?? []}
      initialCheckins={checkins ?? []}
    />
  );
}
