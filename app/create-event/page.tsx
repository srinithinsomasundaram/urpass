import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/plan";
import CreateEventForm from "./CreateEventForm";

export default async function CreateEventPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [plan, { count: activeEventCount }] = await Promise.all([
    getUserPlan(supabase, user.id),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("organizer_id", user.id)
      .in("status", ["draft", "active"]),
  ]);

  return (
    <CreateEventForm
      maxAttendees={plan.maxAttendees}
      activeEventCount={activeEventCount ?? 0}
      maxEvents={plan.maxEvents}
      unlimited={plan.unlimited}
      canCreatePaidEvents={plan.canCreatePaidEvents}
    />
  );
}
