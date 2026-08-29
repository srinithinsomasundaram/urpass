import { describe, it, expect } from "vitest";
import { eventSchema } from "@/lib/validations/event";
import { attendeeSchema, PASS_TYPES } from "@/lib/validations/attendee";

// ── eventSchema ──────────────────────────────────────────────────────────────

describe("eventSchema", () => {
  const valid = {
    name: "Dev Summit 2025",
    event_date: "2025-12-01",
    start_time: "09:00",
    end_time: "18:00",
    venue: "IIT Madras",
    attendee_limit: 200,
    status: "draft" as const,
    application_enabled: true,
    auto_approve: false,
  };

  it("accepts a fully valid event", () => {
    expect(eventSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts an event without optional description", () => {
    const { description, ...rest } = { ...valid, description: undefined };
    void description;
    expect(eventSchema.safeParse(rest).success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = eventSchema.safeParse({ ...valid, name: "X" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].path).toContain("name");
  });

  it("rejects missing event_date", () => {
    const result = eventSchema.safeParse({ ...valid, event_date: "" });
    expect(result.success).toBe(false);
  });

  it("rejects attendee_limit of 0", () => {
    const result = eventSchema.safeParse({ ...valid, attendee_limit: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects attendee_limit above 100 000", () => {
    const result = eventSchema.safeParse({ ...valid, attendee_limit: 100_001 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer attendee_limit", () => {
    const result = eventSchema.safeParse({ ...valid, attendee_limit: 50.5 });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid status value", () => {
    const result = eventSchema.safeParse({ ...valid, status: "unknown" });
    expect(result.success).toBe(false);
  });

  it("accepts status active", () => {
    const result = eventSchema.safeParse({ ...valid, status: "active" });
    expect(result.success).toBe(true);
  });
});

// ── attendeeSchema ────────────────────────────────────────────────────────────

describe("attendeeSchema", () => {
  const valid = {
    name: "Srinithin S",
    email: "sri@urpass.space",
    pass_type: "participant" as const,
  };

  it("accepts a valid attendee", () => {
    expect(attendeeSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts an attendee with optional phone", () => {
    expect(attendeeSchema.safeParse({ ...valid, phone: "+91 98765 43210" }).success).toBe(true);
  });

  it("rejects name shorter than 2 characters", () => {
    const result = attendeeSchema.safeParse({ ...valid, name: "A" });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0].path).toContain("name");
  });

  it("rejects malformed email", () => {
    const result = attendeeSchema.safeParse({ ...valid, email: "notanemail" });
    expect(result.success).toBe(false);
  });

  it("rejects email missing domain", () => {
    const result = attendeeSchema.safeParse({ ...valid, email: "user@" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid pass_type", () => {
    const result = attendeeSchema.safeParse({ ...valid, pass_type: "guest" });
    expect(result.success).toBe(false);
  });

  it.each(PASS_TYPES)("accepts pass_type '%s'", (pt) => {
    expect(attendeeSchema.safeParse({ ...valid, pass_type: pt }).success).toBe(true);
  });
});
