import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppShell from "@/components/layouts/AppShell";
import { getUserPlan } from "@/lib/plan";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [{ data: profile }, plan] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("user_id", user.id).single(),
    getUserPlan(supabase, user.id),
  ]);

  const fullName = profile?.full_name ?? user.email?.split("@")[0] ?? "Organizer";
  const email = profile?.email ?? user.email ?? "";

  return (
    <AppShell fullName={fullName} email={email} planSlug={plan.slug}>
      <div className="px-4 lg:px-8 py-6">{children}</div>
    </AppShell>
  );
}
