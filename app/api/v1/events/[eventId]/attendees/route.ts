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
  const { searchParams } = new URL(req.url);
  const applicationStatus = searchParams.get("application_status");
  const passStatus = searchParams.get("pass_status");
  const limit = Math.min(Number(searchParams.get("limit") ?? "100"), 500);
  const offset = Number(searchParams.get("offset") ?? "0");

  const supabase = adminClient();

  // Verify event belongs to this API user
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("id", eventId)
    .eq("organizer_id", auth.userId)
    .single();

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  let query = supabase
    .from("attendees")
    .select("id, name, email, phone, pass_type, application_status, pass_status, created_at", { count: "exact" })
    .eq("event_id", eventId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (applicationStatus) query = query.eq("application_status", applicationStatus);
  if (passStatus) query = query.eq("pass_status", passStatus);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    data,
    meta: { total: count ?? 0, limit, offset },
  });
}
