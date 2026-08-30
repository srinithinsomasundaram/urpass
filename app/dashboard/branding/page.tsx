import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/plan";
import BrandingForm from "./BrandingForm";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "Branding",
  description: "Customise how your brand appears on event passes and attendee pages.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function BrandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const plan = await getUserPlan(supabase, user.id);

  if (!plan.canRemoveBranding) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-2">Starter+ feature</h1>
          <p className="text-sm text-neutral-500 mb-6">
            Remove URPASS branding on Starter. Add your own logo and brand colour on Pro.
          </p>
          <Link
            href="/billing"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "#6D28D9" }}
          >
            Upgrade plan
          </Link>
          <div className="mt-4">
            <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-900 transition-colors">
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_name, brand_color, org_logo_url, hide_urpass_branding")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-1">Branding</p>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">Branding</h1>
          <p className="text-sm text-neutral-500">
            Control whether URPASS branding appears on passes and attendee pages, and set your own organisation identity.
          </p>
        </div>

        <BrandingForm
          initial={{
            org_name: profile?.org_name ?? "",
            brand_color: profile?.brand_color ?? "#6D28D9",
            org_logo_url: profile?.org_logo_url ?? "",
            hide_urpass_branding: profile?.hide_urpass_branding ?? false,
          }}
          isPro={plan.slug === "pro"}
          canHideBranding={plan.canRemoveBranding}
        />
      </div>
    </div>
  );
}
