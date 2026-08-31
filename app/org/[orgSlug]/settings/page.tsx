import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganization } from "@/app/actions/organizations";
import OrgSettingsClient from "./OrgSettingsClient";

export default async function OrgSettingsPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await getOrganization(orgSlug);
  if (!result) notFound();
  const { org, userRole } = result;

  if (userRole !== "owner" && userRole !== "admin") {
    redirect(`/org/${orgSlug}`);
  }

  return <OrgSettingsClient org={org} orgSlug={orgSlug} userRole={userRole as import("@/types").OrgRole} />;
}
