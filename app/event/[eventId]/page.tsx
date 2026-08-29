import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EventOverview from "./EventOverview";

export default async function EventPage({
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
    .select("id, name, application_enabled, attendee_limit, status, apply_slug")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) notFound();

  // Attendees are fetched client-side inside EventOverview (instant render)
  return <EventOverview event={event} />;
}
