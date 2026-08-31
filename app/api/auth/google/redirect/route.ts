import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? new URL(req.url).origin;
    return NextResponse.redirect(`${base}/login?error=google_not_configured`);
  }

  // Derive the app origin from Railway headers (x-forwarded-host) or env var
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "";
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? `${proto}://${host}`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    prompt: "select_account",
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );
}
