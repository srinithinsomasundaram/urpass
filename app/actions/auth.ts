"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type ActionResult = { success?: boolean; error?: string };

export async function sendPasswordReset(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(user.email!, {
    redirectTo: `${appUrl}/auth/reset-password`,
  });

  if (error) return { error: error.message };
  return { success: true };
}

export async function updateProfileName(fullName: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const trimmed = fullName.trim();
  if (!trimmed || trimmed.length < 2) return { error: "Name must be at least 2 characters." };

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: trimmed })
    .eq("user_id", user.id);

  if (error) return { error: error.message };
  return { success: true };
}
