import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import QRCode from "qrcode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PASS_TYPE_LABEL: Record<string, string> = {
  participant: "PARTICIPANT",
  vip: "VIP",
  speaker: "SPEAKER",
  organizer: "ORGANIZER",
};

const PASS_TYPE_COLOR: Record<string, string> = {
  participant: "#a78bfa",
  vip:         "#fbbf24",
  speaker:     "#60a5fa",
  organizer:   "#34d399",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ passToken: string }> }
) {
  const { passToken } = await params;

  // Service-role client bypasses RLS (server only, key never sent to client)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: pass } = await supabase
    .from("passes")
    .select("pass_token, pass_type, status, attendee_id, event_id")
    .eq("pass_token", passToken)
    .single();

  if (!pass) return new Response("Not found", { status: 404 });

  const [{ data: attendee }, { data: event }] = await Promise.all([
    supabase.from("attendees").select("name, email").eq("id", pass.attendee_id).single(),
    supabase.from("events").select("name, event_date, start_time, venue").eq("id", pass.event_id).single(),
  ]);

  if (!attendee || !event) return new Response("Not found", { status: 404 });

  // Fetch organizer plan + branding
  const { data: eventOrg } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", pass.event_id)
    .single();

  const organizerId = eventOrg?.organizer_id ?? null;
  let showBranding = true;
  let brandColor = "#6D28D9";
  let orgName: string | null = null;
  if (organizerId) {
    const [{ data: sub }, { data: orgProfile }] = await Promise.all([
      supabase
        .from("subscriptions")
        .select("plan:plans(slug)")
        .eq("user_id", organizerId)
        .eq("status", "active")
        .single(),
      supabase
        .from("profiles")
        .select("org_name, brand_color")
        .eq("user_id", organizerId)
        .single(),
    ]);

    const planSlug = (sub?.plan as unknown as { slug: string } | null)?.slug ?? "free";
    showBranding = planSlug === "free";
    const isPro = planSlug === "pro";
    if (orgProfile?.brand_color && isPro) brandColor = orgProfile.brand_color;
    if (orgProfile?.org_name && isPro) orgName = orgProfile.org_name;
  }

  function darkenHex(hex: string, amount = 40): string {
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return hex;
    const r = Math.max(0, parseInt(clean.slice(0, 2), 16) - amount);
    const g = Math.max(0, parseInt(clean.slice(2, 4), 16) - amount);
    const b = Math.max(0, parseInt(clean.slice(4, 6), 16) - amount);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
  const brandColorDark = darkenHex(brandColor);
  const headerLabel = orgName ? `${orgName} · EVENT PASS` : showBranding ? "URPASS · EVENT PASS" : "EVENT PASS";

  // QR code as base64 PNG — works in ImageResponse <img src>
  const qrDataUrl = await QRCode.toDataURL(passToken, {
    width: 160,
    margin: 1,
    color: { dark: "#0a0a0a", light: "#ffffff" },
  });

  // Load Inter font safely
  let fontData: ArrayBuffer | undefined;
  try {
    const fontRes = await fetch(
      "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.ttf"
    );
    if (fontRes.ok) {
      const buffer = await fontRes.arrayBuffer();
      const header = new Uint8Array(buffer.slice(0, 4));
      // Ensure response is not an HTML error page (starts with '<' / 0x3C)
      if (header[0] !== 0x3c) {
        fontData = buffer;
      }
    }
  } catch {
    // proceed without custom font — Satori renders latin text fine
  }

  const formattedDate = new Date(event.event_date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const typeLabel = PASS_TYPE_LABEL[pass.pass_type] ?? "PARTICIPANT";
  const typeColor = PASS_TYPE_COLOR[pass.pass_type] ?? "#a78bfa";
  const shortCode = (passToken.slice(0, 8).match(/.{1,4}/g) ?? []).join("-").toUpperCase();
  const isCheckedIn = pass.status === "checked_in";

  const img = new ImageResponse(
    (
      <div
        style={{
          width: 400,
          height: showBranding ? 640 : 608,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          borderRadius: 28,
          overflow: "hidden",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* ── Brand header ──────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "28px 28px 32px",
            background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColorDark} 100%)`,
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 3,
              color: "rgba(255,255,255,0.55)",
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            {headerLabel}
          </span>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#ffffff",
                lineHeight: 1.25,
                flex: 1,
                marginRight: 12,
              }}
            >
              {event.name}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: typeColor,
                border: `1px solid ${typeColor}55`,
                borderRadius: 99,
                padding: "4px 10px",
                backgroundColor: `${typeColor}20`,
                letterSpacing: 1,
                whiteSpace: "nowrap",
              }}
            >
              {typeLabel}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <span style={{ fontSize: 12, color: "#c4b5fd" }}>
              {formattedDate} · {event.start_time}
            </span>
            <span style={{ fontSize: 12, color: "#c4b5fd" }}>
              {event.venue}
            </span>
          </div>
        </div>

        {/* ── Tear line ─────────────────────────────────────────── */}
        <div
          style={{
            height: 1,
            backgroundColor: "#e5e7eb",
            display: "flex",
          }}
        />

        {/* ── Body ──────────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "28px 28px 24px",
            flex: 1,
            gap: 0,
          }}
        >
          {/* Attendee */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 2.5,
                color: "#9ca3af",
                textTransform: "uppercase",
              }}
            >
              ATTENDEE
            </span>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
              {attendee.name}
            </span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>
              {attendee.email}
            </span>
          </div>

          {/* QR code */}
          <div
            style={{
              display: "flex",
              padding: 14,
              backgroundColor: "#ffffff",
              borderRadius: 18,
              border: "1px solid #e5e7eb",
              marginBottom: 14,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} width={148} height={148} alt="QR" />
          </div>

          {/* Short code */}
          <span
            style={{
              fontSize: 11,
              color: "#d1d5db",
              letterSpacing: 3,
              marginBottom: 20,
            }}
          >
            {shortCode}
          </span>

          {/* Status badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: isCheckedIn ? "#f0fdf4" : "#f5f3ff",
              border: `1px solid ${isCheckedIn ? "#bbf7d0" : "#ddd6fe"}`,
              borderRadius: 14,
              padding: "10px 24px",
              width: "100%",
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: isCheckedIn ? "#15803d" : "#6D28D9",
              }}
            >
              {isCheckedIn ? "Checked in" : "Valid · Show at entrance"}
            </span>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────────── */}
        {showBranding && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              padding: "12px 28px",
              borderTop: "1px solid #f3f4f6",
            }}
          >
            <span
              style={{
                fontSize: 9,
                color: "#d1d5db",
                letterSpacing: 2.5,
                textTransform: "uppercase",
              }}
            >
              Powered by URPASS
            </span>
          </div>
        )}
      </div>
    ),
    {
      width: 400,
      height: showBranding ? 640 : 608,
      headers: {
        "Content-Disposition": `attachment; filename="urpass-${shortCode}.png"`,
      },
      fonts: fontData
        ? [{ name: "Inter", data: fontData, style: "normal", weight: 600 }]
        : [],
    }
  );

  return img;
}
