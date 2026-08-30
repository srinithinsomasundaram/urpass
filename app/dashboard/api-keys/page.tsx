import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserPlan } from "@/lib/plan";
import ApiKeyManager from "@/components/api-keys/ApiKeyManager";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "API Keys",
  description: "Manage your URPASS API keys for external integrations.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface ApiKeyRow {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export default async function ApiKeysPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const plan = await getUserPlan(supabase, user.id);

  if (plan.slug !== "pro") {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Lock className="w-7 h-7 text-amber-500" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-2">Pro feature</h1>
          <p className="text-sm text-neutral-500 mb-6">
            API access is available on the Pro plan. Upgrade to generate API keys and connect your
            tools to URPASS.
          </p>
          <Link
            href="/billing"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "#6D28D9" }}
          >
            Upgrade to Pro
          </Link>
          <div className="mt-4">
            <Link
              href="/dashboard"
              className="text-sm text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { data: keys } = await supabase
    .from("api_keys")
    .select("id, name, key_prefix, permissions, is_active, last_used_at, expires_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>

        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-1">Pro</p>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">API Keys</h1>
          <p className="text-sm text-neutral-500">
            Use these keys to access the URPASS API from your apps and integrations.
          </p>
        </div>

        {/* Docs callout */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-800 mb-0.5">Base URL</p>
            <code className="text-xs bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 py-1 font-mono text-neutral-700">
              https://urpass.space/api/v1
            </code>
          </div>
          <Link
            href="/docs"
            className="text-xs text-brand hover:underline underline-offset-2 shrink-0 mt-1"
          >
            View docs →
          </Link>
        </div>

        <ApiKeyManager keys={(keys ?? []) as ApiKeyRow[]} />
      </div>
    </div>
  );
}
