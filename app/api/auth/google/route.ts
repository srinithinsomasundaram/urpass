import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function POST(req: NextRequest) {
  const { credential } = await req.json().catch(() => ({}));

  if (!credential || typeof credential !== "string") {
    return NextResponse.json({ error: "Missing Google credential" }, { status: 400 });
  }

  // Verify the Google ID token using Google's public endpoint
  const tokenRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
  );
  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Invalid Google token" }, { status: 401 });
  }

  const info: GoogleTokenInfo = await tokenRes.json();

  // Validate audience matches our app's client ID
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (clientId && clientId !== "your_google_client_id" && info.aud !== clientId) {
    return NextResponse.json({ error: "Token audience mismatch" }, { status: 401 });
  }

  if (info.email_verified !== "true") {
    return NextResponse.json({ error: "Google email not verified" }, { status: 401 });
  }

  const admin = adminClient();

  // Look up user by email via profiles table (faster than listUsers)
  const { data: profileRow } = await admin
    .from("profiles")
    .select("user_id")
    .eq("email", info.email)
    .maybeSingle();

  let userId: string;

  if (profileRow?.user_id) {
    userId = profileRow.user_id;
    // Sync latest name/avatar from Google
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: {
        full_name: info.name,
        avatar_url: info.picture,
        google_id: info.sub,
      },
    });
  } else {
    // New user — createUser fires the handle_new_user trigger
    // which auto-creates their profile row + free subscription
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: info.email,
      email_confirm: true,
      user_metadata: {
        full_name: info.name,
        avatar_url: info.picture,
        google_id: info.sub,
      },
    });
    if (createErr || !created?.user) {
      console.error("[google-auth] createUser error:", createErr);
      return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
    }
    userId = created.user.id;
  }

  // Generate a one-time magic-link token the client can exchange for a real session
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: info.email,
  });

  if (linkErr || !linkData?.properties?.hashed_token) {
    console.error("[google-auth] generateLink error:", linkErr);
    return NextResponse.json({ error: "Failed to generate session" }, { status: 500 });
  }

  return NextResponse.json({
    token_hash: linkData.properties.hashed_token,
    userId,
  });
}
