import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://urpass.space";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ passToken: string }> }
) {
  const { passToken } = await params;

  // Verify the pass exists
  const supabase = await createClient();
  const { data: pass } = await supabase
    .from("passes")
    .select("pass_token, pass_type, event_id, attendee_id")
    .eq("pass_token", passToken)
    .single();

  if (!pass) {
    return NextResponse.redirect(`${APP_URL}/login`, { status: 302 });
  }

  // Apple Wallet .pkpass requires Apple Developer certificates
  // (APPLE_PASS_CERT_BASE64, APPLE_PASS_KEY_BASE64, APPLE_PASS_WWDR_BASE64,
  //  APPLE_PASS_TEAM_ID, APPLE_PASS_TYPE_ID env vars).
  // Until those are configured, redirect to the web pass view.
  return NextResponse.redirect(`${APP_URL}/pass/${passToken}`, { status: 302 });
}
