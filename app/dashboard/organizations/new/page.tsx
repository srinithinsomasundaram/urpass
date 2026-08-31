import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/plan";
import CreateOrgForm from "./CreateOrgForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Organization",
  robots: { index: false, follow: false },
};

export default async function NewOrgPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const plan = await getUserPlan(supabase, user.id);
  if (!plan.canCreateOrganizations) redirect("/billing");

  return <CreateOrgForm />;
}
