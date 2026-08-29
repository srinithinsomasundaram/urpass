import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@/lib/supabase/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? "",
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
});

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { planSlug } = body ?? {};
  if (!planSlug) return NextResponse.json({ error: "Missing planSlug" }, { status: 400 });

  const { data: plan } = await supabase
    .from("plans")
    .select("id, name, slug, price_monthly")
    .eq("slug", planSlug)
    .eq("is_active", true)
    .single();

  if (!plan || plan.price_monthly === 0) {
    return NextResponse.json({ error: "Plan not found or is free" }, { status: 400 });
  }

  // Add 18% GST (18% of base price in paise)
  const baseAmount = plan.price_monthly;
  const gstAmount = Math.round(baseAmount * 0.18);
  const totalAmountWithGst = baseAmount + gstAmount;

  const order = await razorpay.orders.create({
    amount: totalAmountWithGst,
    currency: "INR",
    receipt: `urpass_${user.id.slice(0, 8)}_${Date.now()}`,
    notes: {
      user_id: user.id,
      plan_id: plan.id,
      plan_slug: planSlug,
      base_amount: baseAmount,
      gst_amount: gstAmount,
    },
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
    planName: plan.name,
  });
}
