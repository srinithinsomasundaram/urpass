"use server";

import { createClient } from "@/lib/supabase/server";
import { eventSchema, type EventInput } from "@/lib/validations/event";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateApplySlug } from "@/lib/utils";
import { getUserPlan } from "@/lib/plan";

type ActionResult = { error: string } | undefined;

export async function createEvent(data: EventInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = eventSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check plan limits
  const plan = await getUserPlan(supabase, user.id);

  const { count: activeCount } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("organizer_id", user.id)
    .in("status", ["draft", "active"]);

  if (!plan.unlimited && (activeCount ?? 0) >= plan.maxEvents) {
    return {
      error: `You've reached your event limit (${plan.maxEvents} on ${plan.slug}). Upgrade your plan to create more events.`,
    };
  }

  if (parsed.data.attendee_limit > plan.maxAttendees) {
    return {
      error: `Your ${plan.slug} plan supports up to ${plan.maxAttendees} attendees per event. Upgrade to increase this limit.`,
    };
  }

  // Generate a unique slug — retry once on collision (vanishingly rare)
  let apply_slug = generateApplySlug();
  const { count: slugExists } = await supabase
    .from("events")
    .select("*", { count: "exact", head: true })
    .eq("apply_slug", apply_slug);
  if ((slugExists ?? 0) > 0) apply_slug = generateApplySlug();

  const { data: event, error } = await supabase
    .from("events")
    .insert({ ...parsed.data, organizer_id: user.id, apply_slug })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  redirect(`/event/${event.id}`);
}

export async function updateEvent(
  eventId: string,
  data: EventInput
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const parsed = eventSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const plan = await getUserPlan(supabase, user.id);
  if (parsed.data.attendee_limit > plan.maxAttendees) {
    return {
      error: `Your ${plan.slug} plan supports up to ${plan.maxAttendees} attendees per event. Upgrade to increase this limit.`,
    };
  }

  const { error } = await supabase
    .from("events")
    .update(parsed.data)
    .eq("id", eventId)
    .eq("organizer_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/event/${eventId}`);
  revalidatePath(`/event/${eventId}/settings`);
  revalidatePath("/dashboard/events");
}

export async function updateEventStatus(
  eventId: string,
  status: "draft" | "active" | "completed" | "cancelled"
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("events")
    .update({ status })
    .eq("id", eventId)
    .eq("organizer_id", user.id);

  if (error) return { error: error.message };

  revalidatePath(`/event/${eventId}`);
  revalidatePath(`/event/${eventId}/settings`);
  revalidatePath("/dashboard/events");
  revalidatePath("/dashboard");
}

export async function deleteEvent(eventId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("organizer_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  redirect("/dashboard/events");
}
