"use server";

import { createHash, randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUserPlan } from "@/lib/plan";

type ActionResult<T = undefined> =
  | (T extends undefined ? { error: string } : { error: string } | { data: T })
  | undefined;

export async function createApiKey(
  name: string
): Promise<{ error: string } | { key: string; id: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const plan = await getUserPlan(supabase, user.id);
  if (plan.slug !== "pro") {
    return { error: "API access is only available on the Pro plan." };
  }

  if (!name || name.trim().length < 2) {
    return { error: "Key name must be at least 2 characters." };
  }

  // Check limit: max 10 keys per user
  const { count } = await supabase
    .from("api_keys")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_active", true);

  if ((count ?? 0) >= 10) {
    return { error: "You have reached the maximum of 10 active API keys." };
  }

  const rawKey = `urp_live_${randomBytes(24).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.slice(0, 16);

  const { data, error } = await supabase
    .from("api_keys")
    .insert({
      user_id: user.id,
      name: name.trim(),
      key_hash: keyHash,
      key_prefix: keyPrefix,
      permissions: ["events:read", "attendees:read"],
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/dashboard/api-keys");
  return { key: rawKey, id: data.id };
}

export async function revokeApiKey(keyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("api_keys")
    .update({ is_active: false })
    .eq("id", keyId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/api-keys");
}

export async function deleteApiKey(keyId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("api_keys")
    .delete()
    .eq("id", keyId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/api-keys");
}
