"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { attendeeSchema, type AttendeeInput } from "@/lib/validations/attendee";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendApplicationConfirmationEmail, sendPassEmail } from "@/lib/email";
import { getUserPlan } from "@/lib/plan";

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

type ActionResult = { error: string } | undefined;

function revalidateEvent(eventId: string) {
  revalidatePath(`/event/${eventId}/attendees`);
  revalidatePath(`/event/${eventId}`);
}

async function getEventForOrganizer(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string,
  userId: string
) {
  const { data } = await supabase
    .from("events")
    .select("id, attendee_limit, status, application_enabled")
    .eq("id", eventId)
    .eq("organizer_id", userId)
    .single();
  return data;
}

export async function approveAttendee(
  attendeeId: string,
  eventId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const event = await getEventForOrganizer(supabase, eventId, user.id);
  if (!event) return { error: "Event not found." };

  const { count: approvedCount } = await supabase
    .from("attendees")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("application_status", "approved");

  if ((approvedCount ?? 0) >= event.attendee_limit) {
    return {
      error: `Event is at capacity (${event.attendee_limit}). Increase the limit in Settings to approve more.`,
    };
  }

  const { error } = await supabase
    .from("attendees")
    .update({ application_status: "approved" })
    .eq("id", attendeeId)
    .eq("event_id", eventId);

  if (error) return { error: error.message };
  revalidateEvent(eventId);
}

export async function rejectAttendee(
  attendeeId: string,
  eventId: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const event = await getEventForOrganizer(supabase, eventId, user.id);
  if (!event) return { error: "Event not found." };

  const { error } = await supabase
    .from("attendees")
    .update({ application_status: "rejected" })
    .eq("id", attendeeId)
    .eq("event_id", eventId);

  if (error) return { error: error.message };
  revalidateEvent(eventId);
}

export async function addAttendee(
  eventId: string,
  data: AttendeeInput
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const event = await getEventForOrganizer(supabase, eventId, user.id);
  if (!event) return { error: "Event not found." };

  const parsed = attendeeSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { error } = await supabase.from("attendees").insert({
    event_id: eventId,
    ...parsed.data,
    application_status: "approved",
  });

  if (error) {
    if (error.code === "23505")
      return { error: "An attendee with this email already exists for this event." };
    return { error: error.message };
  }

  revalidateEvent(eventId);
}

export async function bulkAddAttendees(
  eventId: string,
  rows: AttendeeInput[]
): Promise<{ added: number; skipped: number; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { added: 0, skipped: 0, error: "Not authenticated." };

  const plan = await getUserPlan(supabase, user.id);
  if (!plan.canCSV) {
    return {
      added: 0,
      skipped: 0,
      error: "CSV upload is available on Starter and Pro plans. Upgrade to use this feature.",
    };
  }

  const event = await getEventForOrganizer(supabase, eventId, user.id);
  if (!event) return { added: 0, skipped: 0, error: "Event not found." };

  const valid = rows.filter((r) => attendeeSchema.safeParse(r).success);
  if (valid.length === 0)
    return { added: 0, skipped: rows.length, error: "No valid rows found. Check CSV format." };

  // Insert one by one to count actual inserts vs skipped duplicates
  let added = 0;
  let skipped = rows.length - valid.length;

  for (const row of valid) {
    const { error } = await supabase.from("attendees").insert({
      event_id: eventId,
      ...row,
      application_status: "approved",
    });
    if (error && error.code === "23505") {
      skipped++;
    } else if (error) {
      return { added, skipped, error: error.message };
    } else {
      added++;
    }
  }

  revalidateEvent(eventId);
  return { added, skipped };
}

export async function submitApplication(
  eventId: string,
  data: AttendeeInput
): Promise<{ error?: string; passToken?: string } | undefined> {
  const admin = adminClient();

  const { data: event } = await admin
    .from("events")
    .select("id, status, application_enabled, auto_approve, attendee_limit, name, event_date, venue")
    .eq("id", eventId)
    .eq("status", "active")
    .eq("application_enabled", true)
    .single();

  if (!event) return { error: "Applications are not open for this event." };

  const parsed = attendeeSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (event.auto_approve) {
    // Capacity check before auto-approving
    const { count: approvedCount } = await admin
      .from("attendees")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("application_status", "approved");

    if ((approvedCount ?? 0) >= event.attendee_limit) {
      return { error: "This event is at capacity." };
    }

    // Insert as approved immediately
    const { data: attendee, error: attendeeError } = await admin
      .from("attendees")
      .insert({ event_id: eventId, ...parsed.data, application_status: "approved" })
      .select("id, pass_type")
      .single();

    if (attendeeError) {
      if (attendeeError.code === "23505")
        return { error: "You have already applied to this event." };
      return { error: attendeeError.message };
    }

    // Generate pass immediately
    const { data: pass, error: passError } = await admin
      .from("passes")
      .insert({ event_id: eventId, attendee_id: attendee.id, pass_type: attendee.pass_type })
      .select("pass_token")
      .single();

    if (!passError && pass) {
      await admin.from("attendees").update({ pass_status: "generated" }).eq("id", attendee.id);

      sendPassEmail({
        to: parsed.data.email,
        attendeeName: parsed.data.name,
        eventName: event.name,
        eventDate: event.event_date,
        venue: event.venue,
        passToken: pass.pass_token,
      }).catch(() => {});

      return { passToken: pass.pass_token };
    }

    // Pass generation failed — still accepted, treat as pending
    return {};
  }

  // Manual approval flow
  const { error } = await admin.from("attendees").insert({
    event_id: eventId,
    ...parsed.data,
    application_status: "pending",
  });

  if (error) {
    if (error.code === "23505")
      return { error: "You have already applied to this event." };
    return { error: error.message };
  }

  sendApplicationConfirmationEmail({
    to: parsed.data.email,
    attendeeName: parsed.data.name,
    eventName: event.name,
    eventDate: event.event_date,
    venue: event.venue,
  }).catch(() => {});
}

export async function exportAttendeesCSV(
  eventId: string
): Promise<{ csv?: string; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated." };

  const plan = await getUserPlan(supabase, user.id);
  if (!plan.canExport) {
    return { error: "Data export is available on the Pro plan. Upgrade to use this feature." };
  }

  const event = await getEventForOrganizer(supabase, eventId, user.id);
  if (!event) return { error: "Event not found." };

  const { data: attendees } = await supabase
    .from("attendees")
    .select("name, email, phone, pass_type, application_status, pass_status, created_at")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (!attendees || attendees.length === 0) return { csv: "" };

  const headers = [
    "Name", "Email", "Phone", "Pass Type",
    "Application Status", "Pass Status", "Registered At",
  ];
  const rows = attendees.map((a) => [
    a.name,
    a.email,
    a.phone ?? "",
    a.pass_type,
    a.application_status,
    a.pass_status,
    new Date(a.created_at).toLocaleDateString("en-IN"),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  return { csv };
}
