import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganization } from "@/app/actions/organizations";
import OrgSubNav from "@/components/org/OrgSubNav";
import type { OrgRole } from "@/types";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: Promise<any>;
}) {
  const { orgSlug } = await params as { orgSlug: string };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await getOrganization(orgSlug);
  if (!result) notFound();

  const { org, userRole } = result;
  if (!userRole) {
    redirect("/dashboard/organizations");
  }

  return (
    <div className="max-w-4xl mx-auto page-in">
      {/* Org header */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-bold text-lg"
          style={{ background: org.brand_color }}
        >
          {org.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover rounded-2xl" />
          ) : (
            org.name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{org.name}</h1>
          {org.website && (
            <a
              href={org.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-neutral-400 hover:text-brand transition-colors"
            >
              {org.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>
      </div>

      <OrgSubNav orgSlug={orgSlug} userRole={userRole as OrgRole} />

      {children}
    </div>
  );
}
