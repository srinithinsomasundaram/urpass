import { redirect } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { acceptInvite } from "@/app/actions/org-members";

interface Props {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function JoinPage({ params, searchParams }: Props) {
  const { orgSlug } = await params;
  const { token } = await searchParams;

  if (!token) {
    return <ErrorCard message="Invalid invite link — no token found." orgSlug={orgSlug} />;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/org/${orgSlug}/join?token=${token}`);
  }

  const result = await acceptInvite(token);

  if ("error" in result) {
    if (result.error === "not_authenticated") {
      redirect(`/login?next=/org/${orgSlug}/join?token=${token}`);
    }
    return <ErrorCard message={result.error} orgSlug={orgSlug} />;
  }

  redirect(`/org/${result.orgSlug}`);
}

function ErrorCard({ message, orgSlug }: { message: string; orgSlug: string }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-7 h-7 text-red-500" />
        </div>
        <h1 className="text-lg font-bold text-neutral-900 mb-2">Invite error</h1>
        <p className="text-sm text-neutral-500 mb-6">{message}</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
          style={{ background: "#6D28D9" }}
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

