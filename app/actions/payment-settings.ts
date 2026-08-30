"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getUserPlan } from "@/lib/plan";

export async function savePaymentSettings(
  keyId: string,
  keySecret: string
): Promise<{ error?: string; success?: boolean }> {
  const trimmedId = keyId.trim();
  const trimmedSecret = keySecret.trim();

  if (!trimmedId || !trimmedSecret) {
    return { error: "Both Key ID and Key Secret are required." };
  }
  if (!trimmedId.startsWith("rzp_")) {
    return { error: "Key ID must start with rzp_live_ or rzp_test_" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const plan = await getUserPlan(supabase, user.id);
  if (plan.slug === "free") {
    return { error: "Payment gateway integration requires a Starter plan or above." };
  }

  const { error } = await supabase.from("payment_settings").upsert(
    {
      user_id: user.id,
      razorpay_key_id: trimmedId,
      razorpay_key_secret: trimmedSecret,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: error.message };
  return { success: true };
}

export async function removePaymentSettings(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("payment_settings")
    .delete()
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return {};
}
