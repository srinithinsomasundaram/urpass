"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type ActionResult = { error: string } | undefined;

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function revalidateBillingPaths() {
  revalidatePath("/billing");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
}

export async function cancelSubscription(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = adminClient();
  const { error } = await admin
    .from("subscriptions")
    .update({ cancel_at_period_end: true })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  revalidateBillingPaths();
}

export async function switchPlan(planSlug: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = adminClient();
  const { data: targetPlan } = await admin
    .from("plans")
    .select("id, slug, price_monthly")
    .eq("slug", planSlug)
    .eq("is_active", true)
    .single();

  if (!targetPlan) return { error: "Plan not found." };

  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { error } = await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: user.id,
        plan_id: targetPlan.id,
        status: "active",
        provider: planSlug === "free" ? "free" : "razorpay",
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) return { error: error.message };
  revalidateBillingPaths();
}

export async function activatePaidSubscription(
  planSlug: string,
  paymentId?: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const admin = adminClient();
  const { data: targetPlan } = await admin
    .from("plans")
    .select("id, slug")
    .eq("slug", planSlug)
    .eq("is_active", true)
    .single();

  if (!targetPlan) return { error: "Plan not found." };

  const periodStart = new Date();
  const periodEnd = new Date(periodStart);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { error } = await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: user.id,
        plan_id: targetPlan.id,
        status: "active",
        provider: "razorpay",
        provider_subscription_id: paymentId ?? null,
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) return { error: error.message };
  revalidateBillingPaths();
}
