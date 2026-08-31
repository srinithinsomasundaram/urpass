import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/plan";
import CreateEventForm from "./CreateEventForm";

export default async function CreateEventPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { org: orgId } = await searchParams;

  const [plan, { count: activeEventCount }] = await Promise.all([
    getUserPlan(supabase, user.id),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("organizer_id", user.id)
      .in("status", ["draft", "active"]),
  ]);

  // Fetch org name if creating under an org
  let orgName: string | undefined;
  if (orgId) {
    const { data: org } = await supabase
      .from("organizations")
      .select("name")
      .eq("id", orgId)
      .single();
    orgName = org?.name;
  }

  return (
    <CreateEventForm
      maxAttendees={plan.maxAttendees}
      activeEventCount={activeEventCount ?? 0}
      maxEvents={plan.maxEvents}
      unlimited={plan.unlimited}
      canCreatePaidEvents={plan.canCreatePaidEvents}
      organizationId={orgId}
      organizationName={orgName}
    />
  );
}
