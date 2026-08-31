"use server";

import { createClient } from "@/lib/supabase/server";
import { inviteMemberSchema } from "@/lib/validations/organization";
import { sendOrgInviteEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { OrgRole } from "@/types";

type ActionResult = { error: string } | undefined;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://urpass.space";

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function inviteMember(
  orgId: string,
  orgSlug: string,
  orgName: string,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const raw = {
    email: formData.get("email") as string,
    role: formData.get("role") as string,
  };

  const parsed = inviteMemberSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { email, role } = parsed.data;

  // Check if already a member
  const { count: existing } = await supabase
    .from("organization_members")
    .select("*", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .eq("invited_email", email)
    .neq("status", "rejected");

  if ((existing ?? 0) > 0) {
    return { error: "This email has already been invited to this organization." };
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Check if the invited email belongs to an existing user
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("email", email)
    .single();

  const { error: insertError } = await supabase
    .from("organization_members")
    .insert({
      organization_id: orgId,
      user_id: profile?.user_id ?? null,
      invited_email: email,
      role,
      status: "pending",
      invite_token: token,
      invited_by: user.id,
    });

  if (insertError) return { error: insertError.message };

  const inviteUrl = `${APP_URL}/org/${orgSlug}/join?token=${token}`;

  const { data: inviterProfile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("user_id", user.id)
    .single();

  await sendOrgInviteEmail({
    to: email,
    inviterName: inviterProfile?.full_name ?? "Someone",
    orgName,
    role,
    inviteUrl,
  });

  revalidatePath(`/org/${orgSlug}/members`);
}

export async function acceptInvite(token: string): Promise<{ orgSlug: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const { data: member } = await supabase
    .from("organization_members")
    .select("id, organization_id, status, organization:organizations(slug)")
    .eq("invite_token", token)
    .single();

  if (!member) return { error: "Invalid or expired invite link." };
  if (member.status === "active") {
    const org = member.organization as unknown as { slug: string };
    return { orgSlug: org.slug };
  }

  const { error } = await supabase
    .from("organization_members")
    .update({
      user_id: user.id,
      status: "active",
      invite_token: null,
      joined_at: new Date().toISOString(),
    })
    .eq("id", member.id);

  if (error) return { error: error.message };

  const org = member.organization as unknown as { slug: string };
  revalidatePath(`/org/${org.slug}`);
  return { orgSlug: org.slug };
}

export async function updateMemberRole(
  memberId: string,
  orgSlug: string,
  newRole: OrgRole
): Promise<ActionResult> {
  if (newRole === "owner") return { error: "Cannot promote a member to owner." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: target } = await supabase
    .from("organization_members")
    .select("role")
    .eq("id", memberId)
    .single();

  if (target?.role === "owner") return { error: "Cannot change the owner's role." };

  const { error } = await supabase
    .from("organization_members")
    .update({ role: newRole })
    .eq("id", memberId);

  if (error) return { error: error.message };

  revalidatePath(`/org/${orgSlug}/members`);
}

export async function removeMember(memberId: string, orgSlug: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: target } = await supabase
    .from("organization_members")
    .select("role, user_id")
    .eq("id", memberId)
    .single();

  if (target?.role === "owner") return { error: "Cannot remove the organization owner." };

  const { error } = await supabase
    .from("organization_members")
    .delete()
    .eq("id", memberId);

  if (error) return { error: error.message };

  revalidatePath(`/org/${orgSlug}/members`);
}

export async function getOrgMembers(orgId: string) {
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("organization_members")
    .select("*")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: true });

  if (!members || members.length === 0) return [];

  // Fetch profiles for members who have accepted (user_id is set)
  const userIds = members.map((m) => m.user_id).filter(Boolean) as string[];
  const { data: profiles } = userIds.length > 0
    ? await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds)
    : { data: [] };

  const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));

  return members.map((m) => ({
    ...m,
    profile: m.user_id ? profileMap.get(m.user_id) ?? null : null,
  }));
}

export async function assignEventToMember(
  eventId: string,
  memberId: string,
  orgSlug: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("event_assignments")
    .insert({ event_id: eventId, member_id: memberId });

  if (error && error.code !== "23505") return { error: error.message };

  revalidatePath(`/org/${orgSlug}/members`);
}

export async function unassignEventFromMember(
  eventId: string,
  memberId: string,
  orgSlug: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("event_assignments")
    .delete()
    .eq("event_id", eventId)
    .eq("member_id", memberId);

  if (error) return { error: error.message };

  revalidatePath(`/org/${orgSlug}/members`);
}
