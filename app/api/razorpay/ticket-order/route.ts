import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function adminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { eventId, buyerName, buyerEmail } = body ?? {};

  if (!eventId || !buyerName || !buyerEmail) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = adminClient();

  // Fetch event + organizer_id
  const { data: event } = await admin
    .from("events")
    .select("id, name, is_paid_event, ticket_price, status, application_enabled, organizer_id")
    .eq("id", eventId)
    .single();

  if (!event || !event.is_paid_event || event.ticket_price <= 0) {
    return NextResponse.json({ error: "Event not found or not a paid event" }, { status: 400 });
  }
  if (event.status !== "active" || !event.application_enabled) {
    return NextResponse.json({ error: "Event is not accepting applications" }, { status: 400 });
  }

  // Fetch organizer's Razorpay credentials
  const { data: paymentSettings } = await admin
    .from("payment_settings")
    .select("razorpay_key_id, razorpay_key_secret")
    .eq("user_id", event.organizer_id)
    .single();

  if (!paymentSettings?.razorpay_key_id || !paymentSettings?.razorpay_key_secret) {
    return NextResponse.json(
      { error: "The event organizer has not connected a payment gateway yet." },
      { status: 400 }
    );
  }

  const razorpay = new Razorpay({
    key_id: paymentSettings.razorpay_key_id,
    key_secret: paymentSettings.razorpay_key_secret,
  });

  const order = await razorpay.orders.create({
    amount: event.ticket_price * 100,
    currency: "INR",
    receipt: `ticket_${eventId.slice(0, 8)}_${Date.now()}`,
    notes: {
      event_id: eventId,
      buyer_name: buyerName,
      buyer_email: buyerEmail,
      type: "ticket",
    },
  });

  await admin.from("ticket_orders").insert({
    event_id: eventId,
    razorpay_order_id: order.id,
    amount: event.ticket_price,
    currency: "INR",
    buyer_name: buyerName,
    buyer_email: buyerEmail,
    status: "created",
  });

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: paymentSettings.razorpay_key_id,
    eventName: event.name,
  });
}
