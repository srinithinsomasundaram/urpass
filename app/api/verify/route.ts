import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { passToken, eventId } = body ?? {};

  if (!passToken || !eventId) {
    return NextResponse.json({ error: "Missing passToken or eventId" }, { status: 400 });
  }

  // Verify organizer owns this event
  const { data: event } = await supabase
    .from("events")
    .select("id, name")
    .eq("id", eventId)
    .eq("organizer_id", user.id)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 403 });
  }

  // Fetch pass by token, scoped to this event
  const { data: pass } = await supabase
    .from("passes")
    .select("id, pass_token, pass_type, status, attendee_id, event_id")
    .eq("pass_token", passToken)
    .eq("event_id", eventId)
    .single();

  if (!pass) {
    return NextResponse.json({ error: "Invalid pass — not found for this event" }, { status: 404 });
  }

  if (pass.status === "checked_in") {
    // Already checked in — return info without creating duplicate
    const { data: attendee } = await supabase
      .from("attendees")
      .select("name, email, pass_type")
      .eq("id", pass.attendee_id)
      .single();

    return NextResponse.json({
      alreadyCheckedIn: true,
      attendee: attendee ?? { name: "Unknown", email: "", pass_type: pass.pass_type },
      passType: pass.pass_type,
    });
  }

  // Fetch attendee
  const { data: attendee } = await supabase
    .from("attendees")
    .select("id, name, email, pass_type, application_status")
    .eq("id", pass.attendee_id)
    .single();

  if (!attendee || attendee.application_status !== "approved") {
    return NextResponse.json(
      { error: "Attendee is not approved for this event" },
      { status: 422 }
    );
  }

  // Insert check-in — unique constraint (pass_id) acts as duplicate guard
  const { error: ciError } = await supabase.from("check_ins").insert({
    pass_id: pass.id,
    event_id: eventId,
    attendee_id: pass.attendee_id,
    checked_in_by: user.id,
  });

  if (ciError) {
    // Constraint violation means already checked in concurrently
    if (ciError.code === "23505") {
      return NextResponse.json({
        alreadyCheckedIn: true,
        attendee: { name: attendee.name, email: attendee.email, pass_type: attendee.pass_type },
        passType: pass.pass_type,
      });
    }
    return NextResponse.json({ error: ciError.message }, { status: 500 });
  }

  // Mark pass as checked_in
  await supabase
    .from("passes")
    .update({ status: "checked_in" })
    .eq("id", pass.id);

  // Mark attendee as checked_in
  await supabase
    .from("attendees")
    .update({ pass_status: "checked_in" })
    .eq("id", pass.attendee_id);

  return NextResponse.json({
    success: true,
    attendee: { name: attendee.name, email: attendee.email, pass_type: attendee.pass_type },
    passType: pass.pass_type,
  });
}
