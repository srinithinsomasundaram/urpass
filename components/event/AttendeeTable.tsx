"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Upload,
  Check,
  X,
  Clock,
  Loader2,
  Users,
  Search,
  Ticket,
  ExternalLink,
  Download,
  Lock,
  Wifi,
} from "lucide-react";
import { approveAttendee, rejectAttendee, exportAttendeesCSV } from "@/app/actions/attendees";
import { generatePass } from "@/app/actions/passes";
import AddAttendeeModal from "./AddAttendeeModal";
import CSVUploadModal from "./CSVUploadModal";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Status = "pending" | "approved" | "rejected";
type FilterTab = "all" | Status;

interface Attendee {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  pass_type: string;
  application_status: Status;
  pass_status: "not_generated" | "generated" | "checked_in";
  created_at: string;
}

interface Props {
  attendees: Attendee[];
  eventId: string;
  initialPassTokens?: Record<string, string>;
  canCSV?: boolean;
  canExport?: boolean;
}

const statusConfig: Record<
  Status,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 border border-amber-100",
    icon: Clock,
  },
  approved: {
    label: "Approved",
    className: "bg-green-50 text-green-700 border border-green-100",
    icon: Check,
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-600 border border-red-100",
    icon: X,
  },
};

function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.className}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function PassTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 capitalize">
      {type}
    </span>
  );
}

type ButtonVariant = "primary" | "outline" | "danger";

function Btn({
  onClick,
  pending,
  variant,
  children,
  style,
}: {
  onClick: () => void;
  pending: boolean;
  variant: ButtonVariant;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const base =
    "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl transition-all disabled:opacity-40";
  const cls: Record<ButtonVariant, string> = {
    primary: "text-white hover:opacity-90",
    outline: "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50",
    danger: "bg-white border border-red-100 text-red-500 hover:bg-red-50",
  };
  const defaultStyle: Record<ButtonVariant, React.CSSProperties | undefined> = {
    primary: { background: "#6D28D9" },
    outline: undefined,
    danger: undefined,
  };
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={`${base} ${cls[variant]}`}
      style={style ?? defaultStyle[variant]}
    >
      {pending && <Loader2 className="w-3 h-3 animate-spin" />}
      {children}
    </button>
  );
}

export default function AttendeeTable({
  attendees: initial,
  eventId,
  initialPassTokens,
  canCSV = false,
  canExport = false,
}: Props) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [passTokens, setPassTokens] = useState<Record<string, string>>(initialPassTokens ?? {});
  const [exporting, setExporting] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>(initial);
  const [liveConnected, setLiveConnected] = useState(false);
  const initialRef = useRef(initial);

  // Keep local list in sync when server re-renders pass new initial props
  useEffect(() => {
    if (initial !== initialRef.current) {
      initialRef.current = initial;
      setAttendees(initial);
    }
  }, [initial]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`attendee-table-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendees",
          filter: `event_id=eq.${eventId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setAttendees((prev) => {
              if (prev.some((a) => a.id === (payload.new as Attendee).id)) return prev;
              return [payload.new as Attendee, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            setAttendees((prev) =>
              prev.map((a) =>
                a.id === payload.new.id ? { ...a, ...(payload.new as Attendee) } : a
              )
            );
          } else if (payload.eventType === "DELETE") {
            setAttendees((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        setLiveConnected(status === "SUBSCRIBED");
      });

    return () => { supabase.removeChannel(channel); };
  }, [eventId]);

  const counts = {
    all: attendees.length,
    pending: attendees.filter((a) => a.application_status === "pending").length,
    approved: attendees.filter((a) => a.application_status === "approved").length,
    rejected: attendees.filter((a) => a.application_status === "rejected").length,
  };

  const filtered = attendees
    .filter((a) => activeTab === "all" || a.application_status === activeTab)
    .filter((a) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    });

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function handleApprove(id: string) {
    setLoadingId(id);
    setActionErrors((prev) => ({ ...prev, [id]: "" }));
    const result = await approveAttendee(id, eventId);
    setLoadingId(null);
    if (result?.error) {
      setActionErrors((prev) => ({ ...prev, [id]: result.error }));
    } else {
      refresh();
    }
  }

  async function handleReject(id: string) {
    setLoadingId(id);
    setActionErrors((prev) => ({ ...prev, [id]: "" }));
    const result = await rejectAttendee(id, eventId);
    setLoadingId(null);
    if (result?.error) {
      setActionErrors((prev) => ({ ...prev, [id]: result.error }));
    } else {
      refresh();
    }
  }

  async function handleGeneratePass(id: string) {
    setLoadingId(id);
    setActionErrors((prev) => ({ ...prev, [id]: "" }));
    const result = await generatePass(id, eventId);
    setLoadingId(null);
    if (result?.error) {
      setActionErrors((prev) => ({ ...prev, [id]: result.error ?? "" }));
    } else if (result?.passToken) {
      setPassTokens((prev): Record<string, string> => ({
        ...prev,
        [id]: result.passToken as string,
      }));
      refresh();
    }
  }

  async function handleExport() {
    setExporting(true);
    const result = await exportAttendeesCSV(eventId);
    setExporting(false);
    if (result.error || !result.csv) return;
    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendees-${eventId.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleViewPass(id: string) {
    if (passTokens[id]) {
      window.open(`/pass/${passTokens[id]}`, "_blank");
      return;
    }
    setLoadingId(id);
    setActionErrors((prev) => ({ ...prev, [id]: "" }));
    const result = await generatePass(id, eventId);
    setLoadingId(null);
    if (result?.error) {
      setActionErrors((prev) => ({ ...prev, [id]: result.error ?? "" }));
    } else if (result?.passToken) {
      const token = result.passToken as string;
      setPassTokens((prev): Record<string, string> => ({ ...prev, [id]: token }));
      window.open(`/pass/${token}`, "_blank");
    }
  }

  const tabs: FilterTab[] = ["all", "pending", "approved", "rejected"];

  return (
    <>
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Attendees</h2>
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            {liveConnected ? (
              <>
                <Wifi className="w-3 h-3 text-green-500" />
                <span className="text-green-600 font-medium">Live</span>
              </>
            ) : (
              <>
                <Wifi className="w-3 h-3 text-neutral-300" />
                <span>Connecting…</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* CSV Upload */}
          {canCSV ? (
            <button
              onClick={() => setShowCSVModal(true)}
              className="flex items-center gap-1.5 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium hover:bg-neutral-50 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload CSV
            </button>
          ) : (
            <Link
              href="/billing"
              className="flex items-center gap-1.5 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-400 hover:bg-neutral-50 transition-colors"
              title="Available on Starter and Pro plans"
            >
              <Lock className="w-3 h-3" />
              Upload CSV
              <span className="text-[9px] font-bold tracking-wide uppercase bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">
                Starter+
              </span>
            </Link>
          )}

          {/* Export */}
          {canExport ? (
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-1.5 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {exporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Export CSV
            </button>
          ) : (
            <Link
              href="/billing"
              className="flex items-center gap-1.5 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-400 hover:bg-neutral-50 transition-colors"
              title="Available on the Pro plan"
            >
              <Lock className="w-3 h-3" />
              Export CSV
              <span className="text-[9px] font-bold tracking-wide uppercase bg-brand-50 text-brand px-1.5 py-0.5 rounded-full">
                Pro
              </span>
            </Link>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 text-white rounded-xl px-3 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
            style={{ background: "#6D28D9" }}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add attendee
          </button>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                activeTab === tab
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {tab === "all" ? "All" : tab}
              <span
                className={`ml-1.5 text-xs ${
                  activeTab === tab ? "text-neutral-500" : "text-neutral-400"
                }`}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300 pointer-events-none" />
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-neutral-400 transition-colors placeholder:text-neutral-300"
          />
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-8 h-8 text-neutral-200 mb-3" />
          <p className="text-sm font-medium text-neutral-400">
            {initial.length === 0 ? "No attendees yet" : "No attendees match this filter"}
          </p>
          {initial.length === 0 && (
            <p className="text-xs text-neutral-300 mt-1">
              Add attendees manually or upload a CSV
            </p>
          )}
        </div>
      ) : (
        <div className="border border-neutral-100 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3 hidden md:table-cell">Pass type</th>
                  <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-neutral-400 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {filtered.map((a) => {
                  const isLoading = loadingId === a.id;
                  const hasToken = !!passTokens[a.id];
                  const passExists =
                    a.pass_status === "generated" || a.pass_status === "checked_in";

                  return (
                    <tr key={a.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-sm">{a.name}</p>
                          <p className="text-xs text-neutral-400 sm:hidden">{a.email}</p>
                          {actionErrors[a.id] && (
                            <p className="text-xs text-red-500 mt-0.5">{actionErrors[a.id]}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="text-sm text-neutral-500">{a.email}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <PassTypeBadge type={a.pass_type} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={a.application_status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {a.application_status === "pending" && (
                            <>
                              <Btn
                                onClick={() => handleApprove(a.id)}
                                pending={isLoading}
                                variant="primary"
                              >
                                <Check className="w-3 h-3" />
                                Approve
                              </Btn>
                              <Btn
                                onClick={() => handleReject(a.id)}
                                pending={isLoading}
                                variant="outline"
                              >
                                Reject
                              </Btn>
                            </>
                          )}

                          {a.application_status === "approved" && (
                            <>
                              {!passExists && !hasToken ? (
                                /* Pass not generated yet */
                                <Btn
                                  onClick={() => handleGeneratePass(a.id)}
                                  pending={isLoading}
                                  variant="primary"
                                >
                                  <Ticket className="w-3 h-3" />
                                  Generate pass
                                </Btn>
                              ) : hasToken ? (
                                /* Token loaded locally — direct link */
                                <a
                                  href={`/pass/${passTokens[a.id]}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl text-white hover:opacity-90 transition-all"
                                  style={{ background: "#6D28D9" }}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  View pass
                                </a>
                              ) : (
                                /* Pass exists on server but token not loaded */
                                <Btn
                                  onClick={() => handleViewPass(a.id)}
                                  pending={isLoading}
                                  variant="primary"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {isLoading ? "Loading…" : "View pass"}
                                </Btn>
                              )}
                              {/* Download pass PNG via server-side image route */}
                              {passTokens[a.id] && (
                                <button
                                  title="Download pass as PNG"
                                  onClick={async () => {
                                    const token = passTokens[a.id];
                                    const res = await fetch(`/api/pass/image/${token}`);
                                    if (!res.ok) return;
                                    const blob = await res.blob();
                                    const url = URL.createObjectURL(blob);
                                    const dl = document.createElement("a");
                                    dl.href = url;
                                    dl.download = `pass-${a.name.replace(/\s+/g, "-").toLowerCase()}.png`;
                                    dl.click();
                                    URL.revokeObjectURL(url);
                                  }}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-all"
                                >
                                  <Download className="w-3 h-3" />
                                </button>
                              )}
                              <Btn
                                onClick={() => handleReject(a.id)}
                                pending={isLoading}
                                variant="danger"
                              >
                                Revoke
                              </Btn>
                            </>
                          )}

                          {a.application_status === "rejected" && (
                            <Btn
                              onClick={() => handleApprove(a.id)}
                              pending={isLoading}
                              variant="primary"
                            >
                              Re-approve
                            </Btn>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50">
              <p className="text-xs text-neutral-400">
                Showing {filtered.length} of {initial.length} attendee
                {initial.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <AddAttendeeModal
          eventId={eventId}
          onClose={() => setShowAddModal(false)}
          onSuccess={refresh}
        />
      )}
      {showCSVModal && (
        <CSVUploadModal
          eventId={eventId}
          onClose={() => setShowCSVModal(false)}
          onSuccess={refresh}
        />
      )}
    </>
  );
}
