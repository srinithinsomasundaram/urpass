import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

interface GoogleTokenInfo {
  sub: string;
  email: string;
  email_verified: string;
  name: string;
  picture: string;
  aud: string;
}

function adminClient() {
  return createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // Use the actual request origin so redirect_uri matches what the browser sent
  const origin = new URL(req.url).origin;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? origin;

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_auth_failed`);
  }

  // Exchange authorization code for Google tokens
  // redirect_uri must exactly match what was sent in the initial auth request
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${origin}/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();
  if (!tokenRes.ok || !tokens.id_token) {
    console.error("[google-callback] token exchange error:", tokens);
    return NextResponse.redirect(`${appUrl}/login?error=google_auth_failed`);
  }

  // Verify the ID token
  const infoRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${tokens.id_token}`
  );
  if (!infoRes.ok) {
    return NextResponse.redirect(`${appUrl}/login?error=google_auth_failed`);
  }

  const info: GoogleTokenInfo = await infoRes.json();

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (clientId && info.aud !== clientId) {
    return NextResponse.redirect(`${appUrl}/login?error=google_auth_failed`);
  }

  if (info.email_verified !== "true") {
    return NextResponse.redirect(`${appUrl}/login?error=google_email_unverified`);
  }

  const admin = adminClient();

  // Find or create user
  const { data: profileRow } = await admin
    .from("profiles")
    .select("user_id")
    .eq("email", info.email)
    .maybeSingle();

  if (profileRow?.user_id) {
    await admin.auth.admin.updateUserById(profileRow.user_id, {
      user_metadata: {
        full_name: info.name,
        avatar_url: info.picture,
        google_id: info.sub,
      },
    });
  } else {
    const { error: createErr } = await admin.auth.admin.createUser({
      email: info.email,
      email_confirm: true,
      user_metadata: {
        full_name: info.name,
        avatar_url: info.picture,
        google_id: info.sub,
      },
    });
    if (createErr) {
      console.error("[google-callback] createUser error:", createErr);
      return NextResponse.redirect(`${appUrl}/login?error=google_auth_failed`);
    }
  }

  // Generate a one-time token and verify it via the server client (sets session cookies)
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: info.email,
  });

  if (linkErr || !linkData?.properties?.hashed_token) {
    console.error("[google-callback] generateLink error:", linkErr);
    return NextResponse.redirect(`${appUrl}/login?error=google_auth_failed`);
  }

  const supabase = await createClient();
  const { error: verifyErr } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "email",
  });

  if (verifyErr) {
    console.error("[google-callback] verifyOtp error:", verifyErr);
    return NextResponse.redirect(`${appUrl}/login?error=google_auth_failed`);
  }

  return NextResponse.redirect(`${appUrl}/dashboard`);
}
