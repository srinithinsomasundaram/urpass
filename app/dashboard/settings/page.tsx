import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/plan";
import SettingsShell from "./SettingsShell";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your URPASS account — update your profile, reset your password, and view your plan details.",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: profile },
    plan,
    { data: subData },
    { count: activeEventCount },
    { data: paymentSettings },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", user!.id).single(),
    getUserPlan(supabase, user!.id),
    supabase
      .from("subscriptions")
      .select("current_period_end, cancel_at_period_end, plan:plans(name, price_monthly, slug)")
      .eq("user_id", user!.id)
      .eq("status", "active")
      .single(),
    supabase
      .from("events")
      .select("*", { count: "exact", head: true })
      .eq("organizer_id", user!.id)
      .in("status", ["draft", "active"]),
    supabase
      .from("payment_settings")
      .select("razorpay_key_id")
      .eq("user_id", user!.id)
      .single(),
  ]);

  const fullName = profile?.full_name ?? user?.email?.split("@")[0] ?? "";
  const email    = profile?.email ?? user?.email ?? "";
  const initials = fullName.split(" ").slice(0, 2).map((w: string) => w[0] ?? "").join("").toUpperCase() || "U";

  const planRaw    = Array.isArray(subData?.plan) ? subData.plan[0] : subData?.plan;
  const currentPlan = (planRaw as { name: string; price_monthly: number; slug: string } | null) ?? null;
  const renewalDate = subData?.current_period_end
    ? new Date(subData.current_period_end).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric",
      })
    : null;

  return (
    <SettingsShell
      fullName={fullName}
      email={email}
      initials={initials}
      plan={plan}
      currentPlan={currentPlan}
      renewalDate={renewalDate}
      cancelAtPeriodEnd={subData?.cancel_at_period_end ?? false}
      activeEventCount={activeEventCount ?? 0}
      existingPaymentKeyId={paymentSettings?.razorpay_key_id ?? null}
    />
  );
}
