import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganization } from "@/app/actions/organizations";
import { getOrgMembers } from "@/app/actions/org-members";
import MembersClient from "./MembersClient";

export default async function OrgMembersPage({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await getOrganization(orgSlug);
  if (!result) notFound();
  const { org, userRole } = result;
  if (!userRole) redirect("/dashboard/organizations");

  const members = await getOrgMembers(org.id);

  return (
    <MembersClient
      org={org}
      orgSlug={orgSlug}
      userRole={userRole as import("@/types").OrgRole}
      members={members as import("@/types").OrganizationMember[]}
      currentUserId={user.id}
    />
  );
}
