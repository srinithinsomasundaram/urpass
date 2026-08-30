import { createHash } from "crypto";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface ApiAuthResult {
  userId: string;
  keyId: string;
}

export async function authenticateApiKey(
  req: NextRequest
): Promise<ApiAuthResult | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;

  const rawKey = auth.slice(7).trim();
  if (!rawKey.startsWith("urp_live_")) return null;

  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const supabase = adminClient();

  const { data: apiKey } = await supabase
    .from("api_keys")
    .select("id, user_id, is_active, expires_at")
    .eq("key_hash", keyHash)
    .single();

  if (!apiKey || !apiKey.is_active) return null;
  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) return null;

  // Update last_used_at without blocking the request
  supabase
    .from("api_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", apiKey.id)
    .then(() => {});

  return { userId: apiKey.user_id, keyId: apiKey.id };
}
