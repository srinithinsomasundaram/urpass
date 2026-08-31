import Link from "next/link";
import { Building2, Users } from "lucide-react";
import type { Organization, OrgRole } from "@/types";

const ROLE_BADGE: Record<OrgRole, { label: string; cls: string }> = {
  owner:         { label: "Owner",         cls: "bg-brand-50 text-brand border-brand-100" },
  admin:         { label: "Admin",         cls: "bg-blue-50 text-blue-700 border-blue-100" },
  event_manager: { label: "Event Manager", cls: "bg-amber-50 text-amber-700 border-amber-100" },
  checkin_staff: { label: "Check-in Staff", cls: "bg-green-50 text-green-700 border-green-100" },
  viewer:        { label: "Viewer",        cls: "bg-neutral-100 text-neutral-500 border-neutral-200" },
};

export default function OrgCard({
  org,
  role,
  memberCount,
}: {
  org: Organization;
  role: OrgRole;
  memberCount?: number;
}) {
  const badge = ROLE_BADGE[role];

  return (
    <Link
      href={`/org/${org.slug}`}
      className="flex items-center gap-4 bg-white rounded-2xl px-5 py-4 shadow-sm hover:shadow-md transition-all group"
    >
      {/* Logo / Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden border border-neutral-100"
        style={{ background: org.brand_color + "18" }}
      >
        {org.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
        ) : (
          <Building2 className="w-5 h-5" style={{ color: org.brand_color }} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-neutral-900 truncate group-hover:text-brand transition-colors">
          {org.name}
        </p>
        {memberCount !== undefined && (
          <div className="flex items-center gap-1 mt-0.5">
            <Users className="w-3 h-3 text-neutral-400" />
            <span className="text-xs text-neutral-400">{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      {/* Role */}
      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border shrink-0 ${badge.cls}`}>
        {badge.label}
      </span>
    </Link>
  );
}
