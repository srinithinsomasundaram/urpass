"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendPassEmail } from "@/lib/email";

type GenerateResult = { passToken?: string; error?: string };

export async function generatePass(
  attendeeId: string,
  eventId: string
): Promise<GenerateResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Verify organizer owns this event
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();
  if (!event) return { error: "Event not found." };

  // Verify attendee belongs to event and is approved
  const { data: attendee } = await supabase
    .from("attendees")
    .select("id, pass_type, pass_status, application_status")
    .eq("id", attendeeId)
    .eq("event_id", eventId)
    .single();
  if (!attendee) return { error: "Attendee not found." };
  if (attendee.application_status !== "approved")
    return { error: "Attendee must be approved before generating a pass." };

  // If pass already exists, return its token
  if (attendee.pass_status !== "not_generated") {
    const { data: existing } = await supabase
      .from("passes")
      .select("pass_token")
      .eq("attendee_id", attendeeId)
      .eq("event_id", eventId)
      .single();
    if (existing) return { passToken: existing.pass_token };
  }

  // Insert — DB generates pass_token via gen_random_bytes default
  const { data: pass, error } = await supabase
    .from("passes")
    .insert({
      event_id: eventId,
      attendee_id: attendeeId,
      pass_type: attendee.pass_type,
    })
    .select("pass_token")
    .single();

  if (error) {
    if (error.code === "23505") {
      // Race: pass was just created — fetch it
      const { data: existing } = await supabase
        .from("passes")
        .select("pass_token")
        .eq("attendee_id", attendeeId)
        .eq("event_id", eventId)
        .single();
      if (existing) return { passToken: existing.pass_token };
    }
    return { error: error.message };
  }

  // Mark attendee pass as generated
  await supabase
    .from("attendees")
    .update({ pass_status: "generated" })
    .eq("id", attendeeId);

  // Attendees page is realtime-driven — no revalidation needed

  // Send pass email — fire-and-forget
  const [{ data: attendeeInfo }, { data: eventInfo }] = await Promise.all([
    supabase.from("attendees").select("name, email, pass_type").eq("id", attendeeId).single(),
    supabase.from("events").select("name, event_date, venue").eq("id", eventId).single(),
  ]);

  if (attendeeInfo && eventInfo) {
    sendPassEmail({
      to: attendeeInfo.email,
      attendeeName: attendeeInfo.name,
      eventName: eventInfo.name,
      eventDate: eventInfo.event_date,
      venue: eventInfo.venue,
      passToken: pass.pass_token,
      passType: attendeeInfo.pass_type,
    }).catch((err: unknown) => console.error("[email]", err));
  }

  return { passToken: pass.pass_token };
}
