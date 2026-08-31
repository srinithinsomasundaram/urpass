"use client";

import { useState } from "react";
import { UserCircle2, MoreHorizontal, Trash2, RefreshCw, Clock } from "lucide-react";
import { updateMemberRole, removeMember } from "@/app/actions/org-members";
import type { OrgRole } from "@/types";

const ROLE_BADGE: Record<OrgRole, { label: string; cls: string }> = {
  owner:         { label: "Owner",          cls: "bg-brand-50 text-brand border-brand-100" },
  admin:         { label: "Admin",          cls: "bg-blue-50 text-blue-700 border-blue-100" },
  event_manager: { label: "Event Manager",  cls: "bg-amber-50 text-amber-700 border-amber-100" },
  checkin_staff: { label: "Check-in Staff", cls: "bg-green-50 text-green-700 border-green-100" },
  viewer:        { label: "Viewer",         cls: "bg-neutral-100 text-neutral-500 border-neutral-200" },
};

const ASSIGNABLE_ROLES: { value: OrgRole; label: string }[] = [
  { value: "admin",         label: "Admin" },
  { value: "event_manager", label: "Event Manager" },
  { value: "checkin_staff", label: "Check-in Staff" },
  { value: "viewer",        label: "Viewer" },
];

interface MemberRow {
  id: string;
  user_id: string | null;
  invited_email: string;
  role: OrgRole;
  status: string;
  joined_at: string | null;
  profile?: { full_name: string; avatar_url: string | null } | null;
}

interface Props {
  members: MemberRow[];
  orgSlug: string;
  userRole: OrgRole;
  currentUserId: string;
}

function ActionMenu({
  member,
  orgSlug,
  userRole,
  currentUserId,
}: {
  member: MemberRow;
  orgSlug: string;
  userRole: OrgRole;
  currentUserId: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const canManage =
    (userRole === "owner" || userRole === "admin") &&
    member.role !== "owner" &&
    member.user_id !== currentUserId;

  if (!canManage) return null;

  async function handleRoleChange(newRole: OrgRole) {
    setLoading(true);
    setOpen(false);
    await updateMemberRole(member.id, orgSlug, newRole);
    setLoading(false);
  }

  async function handleRemove() {
    setLoading(true);
    setOpen(false);
    await removeMember(member.id, orgSlug);
    setLoading(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-40"
      >
        <MoreHorizontal className="w-4 h-4 text-neutral-400" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 bg-white border border-neutral-200 rounded-2xl shadow-xl py-1.5 w-48 overflow-hidden">
            <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 px-3 py-1.5">Change role</p>
            {ASSIGNABLE_ROLES.filter((r) => r.value !== member.role).map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleRoleChange(value)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
                {label}
              </button>
            ))}
            <div className="border-t border-neutral-100 my-1" />
            <button
              onClick={handleRemove}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Remove member
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function MemberTable({ members, orgSlug, userRole, currentUserId }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {members.length === 0 ? (
        <div className="text-center py-12 text-neutral-400 text-sm">No members yet.</div>
      ) : (
        <div className="divide-y divide-neutral-100">
          {members.map((m) => {
            const badge = ROLE_BADGE[m.role];
            const name = m.profile?.full_name ?? m.invited_email;
            const isPending = m.status === "pending";

            return (
              <div key={m.id} className="flex items-center gap-4 px-5 py-4">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center shrink-0 overflow-hidden">
                  {m.profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.profile.avatar_url} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle2 className="w-5 h-5 text-brand/60" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 truncate">{name}</p>
                  <p className="text-xs text-neutral-400 truncate">{m.invited_email}</p>
                </div>

                {/* Pending badge */}
                {isPending && (
                  <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full font-semibold shrink-0">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                )}

                {/* Role badge */}
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border shrink-0 ${badge.cls}`}>
                  {badge.label}
                </span>

                {/* Actions */}
                <ActionMenu
                  member={m}
                  orgSlug={orgSlug}
                  userRole={userRole}
                  currentUserId={currentUserId}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
