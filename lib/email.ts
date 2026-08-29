import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "URPASS <noreply@urpass.space>";

export async function sendPassEmail({
  to,
  attendeeName,
  eventName,
  eventDate,
  venue,
  passToken,
}: {
  to: string;
  attendeeName: string;
  eventName: string;
  eventDate: string;
  venue: string;
  passToken: string;
}) {
  const passUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://urpass.space"}/pass/${passToken}`;
  const formattedDate = new Date(eventDate).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your pass for ${eventName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5;">
    <div style="background:#0a0a0a;padding:32px 32px 40px;">
      <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;color:#666;text-transform:uppercase;">Event Pass</p>
      <h1 style="margin:0;font-size:22px;font-weight:700;color:#fff;line-height:1.3;">${eventName}</h1>
      <p style="margin:12px 0 0;font-size:13px;color:#999;">${formattedDate} &middot; ${venue}</p>
    </div>
    <div style="padding:32px;">
      <p style="margin:0 0 8px;font-size:14px;color:#737373;">Hi ${attendeeName},</p>
      <p style="margin:0 0 24px;font-size:14px;color:#525252;line-height:1.6;">
        Your pass for <strong>${eventName}</strong> is ready. Show the QR code at the venue for entry.
      </p>
      <a href="${passUrl}" style="display:block;background:#0a0a0a;color:#fff;text-align:center;padding:14px 24px;border-radius:12px;font-size:14px;font-weight:600;text-decoration:none;">
        View My Pass &rarr;
      </a>
      <p style="margin:24px 0 0;font-size:12px;color:#a3a3a3;text-align:center;">
        Keep this link safe — it's unique to you.
      </p>
    </div>
    <div style="border-top:1px solid #f0f0f0;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#d4d4d4;">Powered by URPASS</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
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
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  await resend.emails.send({
    from: FROM,
    to,
    subject: `Application received — ${eventName}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e5e5e5;">
    <div style="padding:32px 32px 24px;">
      <h1 style="margin:0 0 4px;font-size:20px;font-weight:700;color:#0a0a0a;">Application received</h1>
      <p style="margin:0;font-size:14px;color:#737373;">${eventName}</p>
    </div>
    <div style="padding:0 32px 32px;">
      <p style="margin:0 0 16px;font-size:14px;color:#525252;line-height:1.6;">
        Hi ${attendeeName}, thanks for applying to <strong>${eventName}</strong>.
        The organiser will review your application and you&apos;ll receive your pass link by email once approved.
      </p>
      <div style="background:#f9f9f9;border-radius:12px;padding:16px 20px;">
        <p style="margin:0 0 6px;font-size:12px;color:#a3a3a3;">Event details</p>
        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#0a0a0a;">${eventName}</p>
        <p style="margin:0;font-size:12px;color:#737373;">${formattedDate} &middot; ${venue}</p>
      </div>
    </div>
    <div style="border-top:1px solid #f0f0f0;padding:16px 32px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#d4d4d4;">Powered by URPASS</p>
    </div>
  </div>
</body>
</html>
    `.trim(),
  });
}
