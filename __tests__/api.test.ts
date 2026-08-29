import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import crypto from "crypto";

// ── Supabase server mock ──────────────────────────────────────────────────────
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// ── /api/verify ───────────────────────────────────────────────────────────────

function makeVerifySupabase({
  user = { id: "user-1" },
  event = { id: "evt-1", name: "Test Event" } as Record<string, unknown> | null,
  pass = null as null | Record<string, unknown>,
  attendee = null as null | Record<string, unknown>,
  insertError = null as null | Record<string, unknown>,
} = {}) {
  // auth.getUser is separate from single() — only these three DB calls use single():
  //   [0] event ownership check
  //   [1] pass lookup
  //   [2] attendee lookup (on success path)
  const singles: Array<{ data: unknown; error: null }> = [
    { data: event, error: null },
    { data: pass, error: null },
    { data: attendee, error: null },
  ];
  let idx = 0;

  const supabase = {
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ error: insertError }),
    single: vi.fn().mockImplementation(async () => singles[idx++] ?? { data: null, error: null }),
  };
  return supabase;
}

describe("POST /api/verify", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when user is not authenticated", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) },
    } as never);

    const { POST } = await import("@/app/api/verify/route");
    const req = new NextRequest("http://localhost/api/verify", {
      method: "POST",
      body: JSON.stringify({ passToken: "abc", eventId: "evt-1" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is missing passToken", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } } }) },
    } as never);

    const { POST } = await import("@/app/api/verify/route");
    const req = new NextRequest("http://localhost/api/verify", {
      method: "POST",
      body: JSON.stringify({ eventId: "evt-1" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 404 when pass token does not exist for event", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = makeVerifySupabase({
      event: { id: "evt-1", name: "Test" },
      pass: null,
    });
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const { POST } = await import("@/app/api/verify/route");
    const req = new NextRequest("http://localhost/api/verify", {
      method: "POST",
      body: JSON.stringify({ passToken: "bad-token", eventId: "evt-1" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns alreadyCheckedIn true for a checked_in pass", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = makeVerifySupabase({
      event: { id: "evt-1", name: "Test" },
      pass: { id: "p1", pass_token: "tok", pass_type: "participant", status: "checked_in", attendee_id: "att-1", event_id: "evt-1" },
      attendee: { name: "Alice", email: "alice@test.com", pass_type: "participant" },
    });
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const { POST } = await import("@/app/api/verify/route");
    const req = new NextRequest("http://localhost/api/verify", {
      method: "POST",
      body: JSON.stringify({ passToken: "tok", eventId: "evt-1" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.alreadyCheckedIn).toBe(true);
  });

  it("returns 422 when attendee is not approved", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = makeVerifySupabase({
      event: { id: "evt-1", name: "Test" },
      pass: { id: "p1", pass_token: "tok", pass_type: "participant", status: "generated", attendee_id: "att-1", event_id: "evt-1" },
      attendee: { id: "att-1", name: "Bob", email: "bob@test.com", pass_type: "participant", application_status: "pending" },
    });
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const { POST } = await import("@/app/api/verify/route");
    const req = new NextRequest("http://localhost/api/verify", {
      method: "POST",
      body: JSON.stringify({ passToken: "tok", eventId: "evt-1" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it("returns success: true on successful first check-in", async () => {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = makeVerifySupabase({
      event: { id: "evt-1", name: "Test" },
      pass: { id: "p1", pass_token: "tok", pass_type: "participant", status: "generated", attendee_id: "att-1", event_id: "evt-1" },
      attendee: { id: "att-1", name: "Alice", email: "alice@test.com", pass_type: "participant", application_status: "approved" },
      insertError: null,
    });
    // update chains
    supabase.update = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) });
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const { POST } = await import("@/app/api/verify/route");
    const req = new NextRequest("http://localhost/api/verify", {
      method: "POST",
      body: JSON.stringify({ passToken: "tok", eventId: "evt-1" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.attendee.name).toBe("Alice");
  });
});

// ── /api/webhook/razorpay ─────────────────────────────────────────────────────

describe("POST /api/webhook/razorpay", () => {
  const SECRET = "test-webhook-secret";

  function sign(body: string) {
    return crypto.createHmac("sha256", SECRET).update(body).digest("hex");
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("RAZORPAY_WEBHOOK_SECRET", SECRET);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service-key");
  });

  it("returns 400 on invalid signature", async () => {
    const { POST } = await import("@/app/api/webhook/razorpay/route");
    const body = JSON.stringify({ event: "payment.captured" });
    const req = new NextRequest("http://localhost/api/webhook/razorpay", {
      method: "POST",
      body,
      headers: { "x-razorpay-signature": "badsig", "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 and skips processing for non-captured events", async () => {
    const { POST } = await import("@/app/api/webhook/razorpay/route");
    const body = JSON.stringify({ event: "payment.failed" });
    const sig = sign(body);
    const req = new NextRequest("http://localhost/api/webhook/razorpay", {
      method: "POST",
      body,
      headers: { "x-razorpay-signature": sig, "Content-Type": "application/json" },
    });
    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.received).toBe(true);
  });

  it("returns 400 when payment notes are missing user_id", async () => {
    const { POST } = await import("@/app/api/webhook/razorpay/route");
    const body = JSON.stringify({
      event: "payment.captured",
      payload: { payment: { entity: { id: "pay_1", notes: {} } } },
    });
    const sig = sign(body);
    const req = new NextRequest("http://localhost/api/webhook/razorpay", {
      method: "POST",
      body,
      headers: { "x-razorpay-signature": sig, "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
