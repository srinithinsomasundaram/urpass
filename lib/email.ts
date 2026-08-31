import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const isDev = process.env.NODE_ENV === "development";

// In dev without a real key, log emails to console instead of failing silently
function getResend() {
  if (!RESEND_API_KEY || RESEND_API_KEY.startsWith("re_your")) {
    return null;
  }
  return new Resend(RESEND_API_KEY);
}

// Resend requires a verified domain in production.
// In dev you can use delivered@resend.dev to bypass domain verification.
const FROM    = isDev
  ? "URPASS <delivered@resend.dev>"
  : "URPASS <noreply@urpass.space>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://urpass.space";

async function sendEmail(payload: Parameters<Resend["emails"]["send"]>[0]) {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY not set — email skipped.\n",
      "  To:", payload.to,
      "\n  Subject:", payload.subject
    );
    return;
  }
  const { error } = await resend.emails.send(payload);
  if (error) {
    console.error("[email] Resend error:", error);
    throw error;
  }
}

const PASS_TYPE_LABEL: Record<string, string> = {
  participant: "Participant",
  vip:         "VIP",
  speaker:     "Speaker",
  organizer:   "Organizer",
};

const PASS_TYPE_COLOR: Record<string, { bg: string; color: string; border: string }> = {
  participant: { bg: "#f5f3ff", color: "#6D28D9", border: "#ddd6fe" },
  vip:         { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
  speaker:     { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  organizer:   { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
};

// Use hosted QR service — data:URI images are blocked by Gmail/Outlook
function qrUrl(data: string, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=0a0a0a&margin=10&format=png`;
}

export async function sendPassEmail({
  to,
  attendeeName,
  eventName,
  eventDate,
  venue,
  passToken,
  passType = "participant",
}: {
  to: string;
  attendeeName: string;
  eventName: string;
  eventDate: string;
  venue: string;
  passToken: string;
  passType?: string;
}) {
  const passUrl = `${APP_URL}/pass/${passToken}`;

  const formattedDate = new Date(eventDate).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const shortCode = passToken.slice(0, 8).match(/.{1,4}/g)?.join("-").toUpperCase()
    ?? passToken.slice(0, 8).toUpperCase();

  const typeLabel = PASS_TYPE_LABEL[passType] ?? "Attendee";
  const typeColor = PASS_TYPE_COLOR[passType] ?? PASS_TYPE_COLOR.participant;
  const qrSrc     = qrUrl(passUrl, 200);

  await sendEmail({
    from: FROM,
    to,
    subject: `Your pass for ${eventName} is ready`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Your Pass — ${eventName}</title>
</head>
<body style="margin:0;padding:0;background:#f0effe;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0effe;padding:40px 16px;">
  <tr><td align="center">

    <!-- Wordmark -->
    <p style="margin:0 0 20px;font-size:11px;font-weight:700;letter-spacing:4px;color:#9333ea;text-transform:uppercase;">URPASS</p>

    <!-- Pass card -->
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(109,40,217,0.14);">

      <!-- Purple header -->
      <tr>
        <td style="background:linear-gradient(135deg,#6D28D9 0%,#4c1d95 100%);padding:30px 32px 34px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,0.5);text-transform:uppercase;">Event Pass</p>
                <p style="margin:0 0 18px;font-size:21px;font-weight:800;color:#ffffff;line-height:1.3;">${eventName}</p>
                <p style="margin:0 0 5px;font-size:12px;color:rgba(255,255,255,0.7);">&#128197; ${formattedDate}</p>
                <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.7);">&#128205; ${venue}</p>
              </td>
              <td width="90" valign="top" align="right">
                <span style="display:inline-block;background:${typeColor.bg};color:${typeColor.color};border:1px solid ${typeColor.border};font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;white-space:nowrap;">${typeLabel}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Perforated divider -->
      <tr>
        <td style="padding:0 28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td width="18" style="background:#f0effe;height:18px;border-radius:0 0 10px 10px;"></td>
              <td style="border-top:2px dashed #e5e7eb;"></td>
              <td width="18" style="background:#f0effe;height:18px;border-radius:0 0 10px 10px;"></td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Attendee + QR -->
      <tr>
        <td style="padding:28px 32px;text-align:center;">
          <p style="margin:0 0 2px;font-size:10px;font-weight:700;letter-spacing:3px;color:#9ca3af;text-transform:uppercase;">Attendee</p>
          <p style="margin:0 0 4px;font-size:19px;font-weight:800;color:#0a0a0a;">${attendeeName}</p>
          <p style="margin:0 0 24px;font-size:12px;color:#9ca3af;">${to}</p>

          <!-- QR code via external service (works in all email clients) -->
          <table cellpadding="0" cellspacing="0" style="margin:0 auto;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
            <tr>
              <td style="padding:14px;background:#fff;">
                <img src="${qrSrc}" width="180" height="180" alt="Entry QR Code" style="display:block;" />
              </td>
            </tr>
          </table>

          <p style="margin:14px 0 6px;font-size:11px;color:#d1d5db;font-family:'Courier New',monospace;letter-spacing:4px;">${shortCode}</p>
          <p style="margin:0;font-size:12px;color:#9ca3af;">Show this QR code at the entrance</p>
        </td>
      </tr>

      <!-- CTA -->
      <tr>
        <td style="padding:0 32px 32px;">
          <a href="${passUrl}" style="display:block;background:#6D28D9;color:#ffffff;text-align:center;padding:15px 24px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.2px;">
            View Full Pass &rarr;
          </a>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="border-top:1px solid #f3f4f6;padding:18px 32px;background:#fafafa;border-radius:0 0 24px 24px;">
          <p style="margin:0;font-size:11px;color:#d1d5db;text-align:center;">
            This pass is personal &amp; non-transferable. Keep this email safe &mdash; the QR code is your entry ticket.
          </p>
        </td>
      </tr>

    </table>

    <p style="margin:20px 0 0;font-size:11px;color:#a78bfa;">Powered by URPASS &middot; <a href="${APP_URL}" style="color:#a78bfa;text-decoration:none;">urpass.space</a></p>

  </td></tr>
</table>

</body>
</html>`.trim(),
  });
}

export async function sendApplicationConfirmationEmail({
  to,
  attendeeName,
  eventName,
  eventDate,
  venue,
}: {
  to: string;
  attendeeName: string;
  eventName: string;
  eventDate: string;
  venue: string;
}) {
  const formattedDate = new Date(eventDate).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  await sendEmail({
    from: FROM,
    to,
    subject: `Application received — ${eventName}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f0effe;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0effe;padding:40px 16px;">
  <tr><td align="center">
    <p style="margin:0 0 20px;font-size:11px;font-weight:700;letter-spacing:4px;color:#9333ea;text-transform:uppercase;">URPASS</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(109,40,217,0.1);">
      <tr>
        <td style="background:linear-gradient(135deg,#6D28D9 0%,#4c1d95 100%);padding:30px 32px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,0.5);text-transform:uppercase;">URPASS</p>
          <p style="margin:0;font-size:21px;font-weight:800;color:#ffffff;">Application received</p>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px;">
          <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;">
            Hi <strong>${attendeeName}</strong>, thanks for applying to <strong>${eventName}</strong>.
            The organiser will review your application shortly.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;border-radius:14px;border:1px solid #ede9fe;">
            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;">Event details</p>
                <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#0a0a0a;">${eventName}</p>
                <p style="margin:0;font-size:13px;color:#6b7280;">&#128197; ${formattedDate}</p>
                <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">&#128205; ${venue}</p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;font-size:12px;color:#9ca3af;">
            You&apos;ll receive your pass by email once approved. No action needed from your side.
          </p>
        </td>
      </tr>
      <tr>
        <td style="border-top:1px solid #f3f4f6;padding:16px 32px;background:#fafafa;border-radius:0 0 24px 24px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#d1d5db;">Powered by URPASS &middot; <a href="${APP_URL}" style="color:#a78bfa;text-decoration:none;">urpass.space</a></p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`.trim(),
  });
}

const ROLE_LABEL: Record<string, string> = {
  admin:         "Admin",
  event_manager: "Event Manager",
  checkin_staff: "Check-in Staff",
  viewer:        "Viewer",
};

export async function sendOrgInviteEmail({
  to,
  inviterName,
  orgName,
  role,
  inviteUrl,
}: {
  to: string;
  inviterName: string;
  orgName: string;
  role: string;
  inviteUrl: string;
}) {
  const roleLabel = ROLE_LABEL[role] ?? role;
  await sendEmail({
    from: FROM,
    to,
    subject: `You've been invited to join ${orgName} on URPASS`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f0effe;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0effe;padding:40px 16px;">
  <tr><td align="center">
    <p style="margin:0 0 20px;font-size:11px;font-weight:700;letter-spacing:4px;color:#9333ea;text-transform:uppercase;">URPASS</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(109,40,217,0.12);">
      <tr>
        <td style="background:linear-gradient(135deg,#6D28D9 0%,#4c1d95 100%);padding:30px 32px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,0.5);text-transform:uppercase;">Team Invitation</p>
          <p style="margin:0;font-size:21px;font-weight:800;color:#ffffff;">You&apos;re invited!</p>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px;">
          <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;">
            <strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on URPASS as <strong>${roleLabel}</strong>.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf5ff;border-radius:14px;border:1px solid #ede9fe;margin-bottom:20px;">
            <tr>
              <td style="padding:18px 24px;">
                <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;">Your role</p>
                <p style="margin:0;font-size:15px;font-weight:700;color:#6D28D9;">${roleLabel}</p>
              </td>
            </tr>
          </table>
          <a href="${inviteUrl}" style="display:block;background:#6D28D9;color:#ffffff;text-align:center;padding:15px 24px;border-radius:12px;font-size:14px;font-weight:700;text-decoration:none;">
            Accept Invitation &rarr;
          </a>
          <p style="margin:14px 0 0;font-size:11px;color:#9ca3af;text-align:center;">
            This invite expires in 7 days. If you didn&apos;t expect this, you can safely ignore it.
          </p>
        </td>
      </tr>
      <tr>
        <td style="border-top:1px solid #f3f4f6;padding:16px 32px;background:#fafafa;border-radius:0 0 24px 24px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#d1d5db;">Powered by URPASS &middot; <a href="${APP_URL}" style="color:#a78bfa;text-decoration:none;">urpass.space</a></p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`.trim(),
  });
}

export async function sendApprovalEmail({
  to,
  attendeeName,
  eventName,
  eventDate,
  venue,
}: {
  to: string;
  attendeeName: string;
  eventName: string;
  eventDate: string;
  venue: string;
}) {
  const formattedDate = new Date(eventDate).toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  await sendEmail({
    from: FROM,
    to,
    subject: `You're approved for ${eventName} — pass coming soon`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f0effe;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0effe;padding:40px 16px;">
  <tr><td align="center">
    <p style="margin:0 0 20px;font-size:11px;font-weight:700;letter-spacing:4px;color:#9333ea;text-transform:uppercase;">URPASS</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 8px 40px rgba(109,40,217,0.1);">
      <tr>
        <td style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);padding:30px 32px;">
          <p style="margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:3px;color:rgba(255,255,255,0.55);text-transform:uppercase;">URPASS</p>
          <p style="margin:0;font-size:21px;font-weight:800;color:#ffffff;">&#10003; You&apos;re approved!</p>
        </td>
      </tr>
      <tr>
        <td style="padding:28px 32px;">
          <p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;">
            Great news, <strong>${attendeeName}</strong>! Your application to <strong>${eventName}</strong> has been approved.
            Your entry pass will be sent to this email shortly.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf4;border-radius:14px;border:1px solid #bbf7d0;">
            <tr>
              <td style="padding:20px 24px;">
                <p style="margin:0 0 4px;font-size:10px;font-weight:600;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;">Event details</p>
                <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#0a0a0a;">${eventName}</p>
                <p style="margin:0;font-size:13px;color:#6b7280;">&#128197; ${formattedDate}</p>
                <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">&#128205; ${venue}</p>
              </td>
            </tr>
          </table>
          <p style="margin:18px 0 0;font-size:12px;color:#9ca3af;">
            Keep an eye on your inbox — your QR pass will arrive soon.
          </p>
        </td>
      </tr>
      <tr>
        <td style="border-top:1px solid #f3f4f6;padding:16px 32px;background:#fafafa;border-radius:0 0 24px 24px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#d1d5db;">Powered by URPASS &middot; <a href="${APP_URL}" style="color:#a78bfa;text-decoration:none;">urpass.space</a></p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`.trim(),
  });
}
