import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Building2, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/plan";
import { getUserOrganizations } from "@/app/actions/organizations";
import OrgCard from "@/components/org/OrgCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organizations",
  robots: { index: false, follow: false },
};

export default async function OrganizationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [orgs, plan] = await Promise.all([
    getUserOrganizations(),
    getUserPlan(supabase, user.id),
  ]);

  return (
    <div className="max-w-4xl mx-auto page-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Organizations</h1>
          <p className="text-sm text-neutral-400 mt-1">Manage teams and collaborate on events</p>
        </div>

        {plan.canCreateOrganizations ? (
          <Link
            href="/dashboard/organizations/new"
            className="flex items-center gap-2 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shrink-0 shadow-sm"
            style={{ background: "#6D28D9" }}
          >
            <Plus className="w-4 h-4" />
            New org
          </Link>
        ) : (
          <Link
            href="/billing"
            className="flex items-center gap-2 text-brand px-4 py-2.5 rounded-xl text-sm font-semibold border border-brand/20 bg-brand-50 hover:bg-brand-100 transition-colors shrink-0"
          >
            <Lock className="w-4 h-4" />
            Upgrade to create
          </Link>
        )}
      </div>

      {!plan.canCreateOrganizations && (
        <div
          className="relative overflow-hidden rounded-2xl px-6 py-5 flex items-center justify-between gap-4"
          style={{ background: "linear-gradient(135deg, #6D28D9 0%, #4c1d95 100%)" }}
        >
          <div className="absolute right-0 top-0 w-48 h-48 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle, #fff 0%, transparent 70%)", transform: "translate(20%, -30%)" }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-yellow-300" />
              <p className="text-sm font-bold text-white">Organizations require Starter or Pro</p>
            </div>
            <p className="text-xs text-white/60 leading-relaxed">
              Create teams, invite members, and manage events collaboratively
            </p>
          </div>
          <Link
            href="/billing"
            className="flex items-center gap-1.5 bg-white text-brand px-4 py-2 rounded-xl text-xs font-bold shrink-0 hover:bg-white/90 transition-colors"
          >
            Upgrade
          </Link>
        </div>
      )}

      {orgs.length === 0 ? (
        <div className="bg-white rounded-2xl p-14 text-center shadow-sm border border-dashed border-neutral-200">
          <div className="w-12 h-12 bg-brand-50 border border-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-5 h-5 text-brand" />
          </div>
          <p className="text-sm font-semibold text-neutral-800 mb-1">No organizations yet</p>
          <p className="text-xs text-neutral-400 mb-5 max-w-xs mx-auto">
            Create an organization to collaborate with your team on events
          </p>
          {plan.canCreateOrganizations && (
            <Link
              href="/dashboard/organizations/new"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
              style={{ background: "#6D28D9" }}
            >
              <Plus className="w-3.5 h-3.5" />
              Create organization
            </Link>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {orgs.map(({ org, role }) => (
            <OrgCard key={org.id} org={org} role={role} />
          ))}
        </div>
      )}
    </div>
  );
}
