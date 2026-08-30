import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { authenticateApiKey } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const auth = await authenticateApiKey(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized. Provide a valid Bearer API key." }, { status: 401 });
  }

  const { eventId } = await params;
  const supabase = adminClient();

  const { data: event, error } = await supabase
    .from("events")
    .select("id, name, description, event_date, start_time, end_time, venue, status, is_paid_event, ticket_price, attendee_limit, application_enabled, apply_slug, created_at")
    .eq("id", eventId)
    .eq("organizer_id", auth.userId)
    .single();

  if (error || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({ data: event });
}
