export interface PlanLimits {
  slug: string;
  maxEvents: number;
  maxAttendees: number;
  unlimited: boolean;
  canCSV: boolean;
  canExport: boolean;
  canRemoveBranding: boolean;
  canUseAPI: boolean;
  canCreatePaidEvents: boolean;
  canCreateOrganizations: boolean;
}

const FREE_LIMITS: PlanLimits = {
  slug: "free",
  maxEvents: 1,
  maxAttendees: 50,
  unlimited: false,
  canCSV: false,
  canExport: false,
  canRemoveBranding: false,
  canUseAPI: false,
  canCreatePaidEvents: false,
  canCreateOrganizations: false,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getUserPlan(supabase: any, userId: string): Promise<PlanLimits> {
  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan:plans(slug, max_events, max_attendees)")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  const plan = sub?.plan as {
    slug: string;
    max_events: number;
    max_attendees: number;
  } | null;

  if (!plan) return FREE_LIMITS;

  const isUnlimited = plan.max_events >= 999;

  return {
    slug: plan.slug,
    maxEvents: plan.max_events,
    maxAttendees: plan.max_attendees,
    unlimited: isUnlimited,
    canCSV: plan.slug !== "free",
    canExport: plan.slug === "pro" || plan.slug === "enterprise",
    canRemoveBranding: plan.slug !== "free",
    canUseAPI: plan.slug === "pro" || plan.slug === "enterprise",
    canCreatePaidEvents: plan.slug !== "free",
    canCreateOrganizations: plan.slug !== "free",
  };
}
