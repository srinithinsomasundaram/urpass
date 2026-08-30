import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Mock Next.js navigation ───────────────────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), back: vi.fn(), push: vi.fn() }),
  usePathname: () => "/event/evt-1/attendees",
  useParams: () => ({ eventId: "evt-1" }),
}));

// ── Mock server actions ───────────────────────────────────────────────────────
vi.mock("@/app/actions/attendees", () => ({
  approveAttendee: vi.fn().mockResolvedValue(undefined),
  rejectAttendee: vi.fn().mockResolvedValue(undefined),
  addAttendee: vi.fn().mockResolvedValue(undefined),
  bulkAddAttendees: vi.fn().mockResolvedValue({ added: 2, skipped: 0 }),
}));

vi.mock("@/app/actions/passes", () => ({
  generatePass: vi.fn().mockResolvedValue({ passToken: "tok-abc123" }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    channel: () => ({
      on: () => ({
        subscribe: () => ({}),
      }),
    }),
    removeChannel: () => ({}),
  }),
}));

import AttendeeTable from "@/components/event/AttendeeTable";
import AddAttendeeModal from "@/components/event/AddAttendeeModal";
import PassQR from "@/components/pass/PassQR";
import { Skeleton } from "@/components/ui/Skeleton";

// ── Skeleton ──────────────────────────────────────────────────────────────────

describe("Skeleton", () => {
  it("renders with animate-pulse class", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("merges additional className", () => {
    const { container } = render(<Skeleton className="h-4 w-32" />);
    expect(container.firstChild).toHaveClass("h-4", "w-32");
  });
});

// ── PassQR ────────────────────────────────────────────────────────────────────

describe("PassQR", () => {
  it("renders an SVG element", () => {
    const { container } = render(<PassQR value="test-pass-token-abc" />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("wraps QR in a white padded container", () => {
    const { container } = render(<PassQR value="tok" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("bg-white");
  });
});

// ── AttendeeTable ─────────────────────────────────────────────────────────────

const sampleAttendees = [
  {
    id: "att-1",
    name: "Alice Kumar",
    email: "alice@test.com",
    phone: null,
    pass_type: "participant",
    application_status: "pending" as const,
    pass_status: "not_generated" as const,
    created_at: new Date().toISOString(),
  },
  {
    id: "att-2",
    name: "Bob Singh",
    email: "bob@test.com",
    phone: "+91 99999 00000",
    pass_type: "vip",
    application_status: "approved" as const,
    pass_status: "not_generated" as const,
    created_at: new Date().toISOString(),
  },
  {
    id: "att-3",
    name: "Carol Iyer",
    email: "carol@test.com",
    phone: null,
    pass_type: "speaker",
    application_status: "rejected" as const,
    pass_status: "not_generated" as const,
    created_at: new Date().toISOString(),
  },
];

describe("AttendeeTable", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders all attendees by default", () => {
    render(<AttendeeTable attendees={sampleAttendees} eventId="evt-1" attendeeLimit={100} />);
    expect(screen.getByText("Alice Kumar")).toBeInTheDocument();
    expect(screen.getByText("Bob Singh")).toBeInTheDocument();
    expect(screen.getByText("Carol Iyer")).toBeInTheDocument();
  });

  it("shows empty state when no attendees", () => {
    render(<AttendeeTable attendees={[]} eventId="evt-1" attendeeLimit={100} />);
    expect(screen.getByText(/no attendees yet/i)).toBeInTheDocument();
  });

  it("filters to pending tab correctly", async () => {
    render(<AttendeeTable attendees={sampleAttendees} eventId="evt-1" attendeeLimit={100} />);
    const pendingTab = screen.getByRole("button", { name: /pending/i });
    await userEvent.click(pendingTab);
    expect(screen.getByText("Alice Kumar")).toBeInTheDocument();
    expect(screen.queryByText("Bob Singh")).not.toBeInTheDocument();
    expect(screen.queryByText("Carol Iyer")).not.toBeInTheDocument();
  });

  it("filters to approved tab correctly", async () => {
    render(<AttendeeTable attendees={sampleAttendees} eventId="evt-1" attendeeLimit={100} />);
    const approvedTab = screen.getByRole("button", { name: /approved/i });
    await userEvent.click(approvedTab);
    expect(screen.getByText("Bob Singh")).toBeInTheDocument();
    expect(screen.queryByText("Alice Kumar")).not.toBeInTheDocument();
  });

  it("filters by search query (name)", async () => {
    render(<AttendeeTable attendees={sampleAttendees} eventId="evt-1" attendeeLimit={100} />);
    const searchInput = screen.getByPlaceholderText(/search name or email/i);
    await userEvent.type(searchInput, "alice");
    expect(screen.getByText("Alice Kumar")).toBeInTheDocument();
    expect(screen.queryByText("Bob Singh")).not.toBeInTheDocument();
  });

  it("filters by search query (email)", async () => {
    render(<AttendeeTable attendees={sampleAttendees} eventId="evt-1" attendeeLimit={100} />);
    const searchInput = screen.getByPlaceholderText(/search name or email/i);
    await userEvent.type(searchInput, "carol@");
    expect(screen.getByText("Carol Iyer")).toBeInTheDocument();
    expect(screen.queryByText("Alice Kumar")).not.toBeInTheDocument();
  });

  it("shows Approve and Reject buttons for pending attendees", () => {
    render(<AttendeeTable attendees={sampleAttendees} eventId="evt-1" attendeeLimit={100} />);
    // Use exact name "Approve" to avoid matching the "approved 1" tab button
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("shows Pass and Revoke buttons for approved attendees", async () => {
    render(<AttendeeTable attendees={sampleAttendees} eventId="evt-1" attendeeLimit={100} />);
    // Switch to approved tab
    await userEvent.click(screen.getByRole("button", { name: /approved/i }));
    expect(screen.getByRole("button", { name: /pass/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /revoke/i })).toBeInTheDocument();
  });

  it("calls approveAttendee with correct ids", async () => {
    const { approveAttendee } = await import("@/app/actions/attendees");
    render(<AttendeeTable attendees={sampleAttendees} eventId="evt-1" attendeeLimit={100} />);
    // "Approve" is the exact action button label; "approved 1" is the tab
    const approveBtn = screen.getByRole("button", { name: "Approve" });
    await userEvent.click(approveBtn);
    await waitFor(() => expect(approveAttendee).toHaveBeenCalledWith("att-1", "evt-1"));
  });

  it("shows 'Add attendee' button", () => {
    render(<AttendeeTable attendees={sampleAttendees} eventId="evt-1" attendeeLimit={100} />);
    expect(screen.getByRole("button", { name: /add attendee/i })).toBeInTheDocument();
  });

  it("opens AddAttendeeModal when 'Add attendee' is clicked", async () => {
    render(<AttendeeTable attendees={sampleAttendees} eventId="evt-1" attendeeLimit={100} />);
    await userEvent.click(screen.getByRole("button", { name: /add attendee/i }));
    expect(screen.getByText(/full name/i)).toBeInTheDocument();
  });

  it("shows tab counts correctly", () => {
    render(<AttendeeTable attendees={sampleAttendees} eventId="evt-1" attendeeLimit={100} />);
    // All tab shows 3
    expect(screen.getByRole("button", { name: /all.*3/i })).toBeInTheDocument();
  });

  it("shows no-match empty state when search has no results", async () => {
    render(<AttendeeTable attendees={sampleAttendees} eventId="evt-1" attendeeLimit={100} />);
    const searchInput = screen.getByPlaceholderText(/search name or email/i);
    await userEvent.type(searchInput, "zzznomatch");
    expect(screen.getByText(/no attendees match this filter/i)).toBeInTheDocument();
  });
});

// ── AddAttendeeModal ──────────────────────────────────────────────────────────

describe("AddAttendeeModal", () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it("renders all form fields", () => {
    render(<AddAttendeeModal eventId="evt-1" onClose={onClose} onSuccess={onSuccess} />);
    expect(screen.getByPlaceholderText(/srinithin/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/attendee@example/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/\+91/i)).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onClose when Cancel is clicked", async () => {
    render(<AddAttendeeModal eventId="evt-1" onClose={onClose} onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape key is pressed", async () => {
    render(<AddAttendeeModal eventId="evt-1" onClose={onClose} onSuccess={onSuccess} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("shows validation errors on empty submit", async () => {
    render(<AddAttendeeModal eventId="evt-1" onClose={onClose} onSuccess={onSuccess} />);
    await userEvent.click(screen.getByRole("button", { name: /add attendee/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it("calls addAttendee and closes on valid submit", async () => {
    const { addAttendee } = await import("@/app/actions/attendees");
    render(<AddAttendeeModal eventId="evt-1" onClose={onClose} onSuccess={onSuccess} />);

    await userEvent.type(screen.getByPlaceholderText(/srinithin/i), "Alice Kumar");
    await userEvent.type(screen.getByPlaceholderText(/attendee@example/i), "alice@test.com");
    await userEvent.click(screen.getByRole("button", { name: /add attendee/i }));

    await waitFor(() => expect(addAttendee).toHaveBeenCalledWith(
      "evt-1",
      expect.objectContaining({ name: "Alice Kumar", email: "alice@test.com" })
    ));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("shows server error message when action returns an error", async () => {
    const { addAttendee } = await import("@/app/actions/attendees");
    vi.mocked(addAttendee).mockResolvedValueOnce({ error: "An attendee with this email already exists for this event." });

    render(<AddAttendeeModal eventId="evt-1" onClose={onClose} onSuccess={onSuccess} />);
    await userEvent.type(screen.getByPlaceholderText(/srinithin/i), "Alice Kumar");
    await userEvent.type(screen.getByPlaceholderText(/attendee@example/i), "alice@test.com");
    await userEvent.click(screen.getByRole("button", { name: /add attendee/i }));

    await waitFor(() =>
      expect(screen.getByText(/already exists/i)).toBeInTheDocument()
    );
  });
});
