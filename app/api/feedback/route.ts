import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  bug: "🐛 Bug report",
  feature: "💡 Feature request",
  compliment: "👍 Compliment",
  other: "💬 Other",
};

const RATING_LABELS = ["", "Poor ⭐", "Fair ⭐⭐", "Good ⭐⭐⭐", "Great ⭐⭐⭐⭐", "Excellent ⭐⭐⭐⭐⭐"];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { name, email, category, rating, message } = body ?? {};

  if (!message || typeof message !== "string" || message.trim().length < 10) {
    return NextResponse.json({ error: "Message must be at least 10 characters" }, { status: 400 });
  }
  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating is required (1–5)" }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const categoryLabel = CATEGORY_LABELS[category] ?? "💬 Other";
  const ratingLabel = RATING_LABELS[rating] ?? rating;
  const senderName = name?.trim() || "Anonymous";
  const replyToHeader = email ? [email] : undefined;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.startsWith("re_your")) {
    console.warn("[email] RESEND_API_KEY not configured — feedback email skipped");
    return NextResponse.json({ ok: true });
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: "URPASS Feedback <noreply@urpass.space>",
    to: ["srinithinoffl@gmail.com"],
    ...(replyToHeader ? { replyTo: replyToHeader } : {}),
    subject: `[Feedback] ${categoryLabel} — ${ratingLabel}`,
    html: `
      <table style="font-family:sans-serif;font-size:14px;color:#333;max-width:560px">
        <tr><td style="padding-bottom:16px">
          <strong>Category:</strong> ${escapeHtml(categoryLabel)}<br/>
          <strong>Rating:</strong> ${escapeHtml(String(ratingLabel))}<br/>
          <strong>Name:</strong> ${escapeHtml(senderName)}<br/>
          <strong>Email:</strong> ${email ? escapeHtml(email) : "not provided"}
        </td></tr>
        <tr><td style="padding-bottom:8px"><strong>Message:</strong></td></tr>
        <tr><td style="background:#f9f9f9;border-radius:8px;padding:12px;white-space:pre-wrap">${escapeHtml(message.trim())}</td></tr>
      </table>
    `,
  });

  if (error) {
    console.error("feedback email error:", error);
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
