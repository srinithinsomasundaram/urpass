"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUserPlan } from "@/lib/plan";

export interface BrandingInput {
  org_name: string;
  brand_color: string;
  org_logo_url: string;
  hide_urpass_branding: boolean;
}

type ActionResult = { error: string } | undefined;

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export async function updateBranding(data: BrandingInput): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const plan = await getUserPlan(supabase, user.id);
  if (!plan.canRemoveBranding) {
    return { error: "Custom branding requires a Starter or Pro plan." };
  }

  const orgName = data.org_name.trim().slice(0, 64);
  const brandColor = HEX_RE.test(data.brand_color) ? data.brand_color : "#6D28D9";
  const orgLogoUrl = data.org_logo_url.trim().slice(0, 500);

  if (orgLogoUrl && !orgLogoUrl.startsWith("https://")) {
    return { error: "Logo URL must start with https://" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      org_name: orgName || null,
      brand_color: brandColor,
      org_logo_url: orgLogoUrl || null,
      hide_urpass_branding: data.hide_urpass_branding,
    })
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/branding");
  revalidatePath("/dashboard/settings");
}
