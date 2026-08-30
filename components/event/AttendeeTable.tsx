"use client";

import { useState, useEffect, useRef } from "react";
import {
  UserPlus, Upload, Check, X, Clock, Loader2, Users,
  Search, Ticket, ExternalLink, Download, Lock, Wifi,
} from "lucide-react";
import { approveAttendee, rejectAttendee, exportAttendeesCSV } from "@/app/actions/attendees";
import { generatePass } from "@/app/actions/passes";
import AddAttendeeModal from "./AddAttendeeModal";
import CSVUploadModal from "./CSVUploadModal";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Status    = "pending" | "approved" | "rejected";
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
  attendeeLimit: number;
  applySlug?: string | null;
  applicationEnabled?: boolean;
  initialPassTokens?: Record<string, string>;
  canCSV?: boolean;
  canExport?: boolean;
}

const statusConfig: Record<Status, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending:  { label: "Pending",  cls: "bg-amber-50 text-amber-700 border-amber-100",  icon: Clock },
  approved: { label: "Approved", cls: "bg-green-50 text-green-700 border-green-100",  icon: Check },
  rejected: { label: "Rejected", cls: "bg-red-50 text-red-600 border-red-100",        icon: X },
};

function StatusBadge({ status }: { status: Status }) {
  const { label, cls, icon: Icon } = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
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

type BtnVariant = "primary" | "outline" | "danger";
function Btn({ onClick, pending, variant, children }: {
  onClick: () => void; pending: boolean; variant: BtnVariant; children: React.ReactNode;
}) {
  const cls: Record<BtnVariant, string> = {
    primary: "text-white hover:opacity-90",
    outline: "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50",
    danger:  "bg-white border border-red-100 text-red-500 hover:bg-red-50",
  };
  const style: Record<BtnVariant, React.CSSProperties | undefined> = {
    primary: { background: "#6D28D9" }, outline: undefined, danger: undefined,
  };
  return (
    <button onClick={onClick} disabled={pending}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl transition-all disabled:opacity-40 ${cls[variant]}`}
      style={style[variant]}>
      {pending && <Loader2 className="w-3 h-3 animate-spin" />}
      {children}
    </button>
  );
}

export default function AttendeeTable({
  attendees: initial,
  eventId,
  attendeeLimit,
  applySlug,
  applicationEnabled,
  initialPassTokens,
  canCSV = false,
  canExport = false,
}: Props) {
  const [attendees, setAttendees]   = useState<Attendee[]>(initial);
  const [passTokens, setPassTokens] = useState<Record<string, string>>(initialPassTokens ?? {});
  const [activeTab, setActiveTab]   = useState<FilterTab>("all");
  const [search, setSearch]         = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [actionErrors, setActionErrors] = useState<Record<string, string>>({});
  const [loadingId, setLoadingId]   = useState<string | null>(null);
  const [exporting, setExporting]   = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const initialRef = useRef(initial);

  // Sync when server re-renders with fresh props
  useEffect(() => {
    if (initial !== initialRef.current) {
      initialRef.current = initial;
      setAttendees(initial);
    }
  }, [initial]);

  // Supabase realtime — new applications appear instantly
  useEffect(() => {
    const supabase = createClient();
    const channel  = supabase
      .channel(`attendees-${eventId}`)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "attendees",
        filter: `event_id=eq.${eventId}`,
      }, (payload) => {
        if (payload.eventType === "INSERT") {
          setAttendees((prev) => {
            if (prev.some((a) => a.id === (payload.new as Attendee).id)) return prev;
            return [payload.new as Attendee, ...prev];
          });
        } else if (payload.eventType === "UPDATE") {
          setAttendees((prev) =>
            prev.map((a) => a.id === payload.new.id ? { ...a, ...(payload.new as Attendee) } : a)
          );
        } else if (payload.eventType === "DELETE") {
          setAttendees((prev) => prev.filter((a) => a.id !== payload.old.id));
        }
      })
      .subscribe((status) => setLiveConnected(status === "SUBSCRIBED"));

    return () => { supabase.removeChannel(channel); };
  }, [eventId]);

  // ── Derived stats (all from live attendees state) ───────────
  const approvedCount = attendees.filter((a) => a.application_status === "approved").length;
  const capacityPct   = attendeeLimit > 0 ? Math.min(100, Math.round((approvedCount / attendeeLimit) * 100)) : 0;
  const atCapacity    = approvedCount >= attendeeLimit;

  const counts = {
    all:      attendees.length,
    pending:  attendees.filter((a) => a.application_status === "pending").length,
    approved: approvedCount,
    rejected: attendees.filter((a) => a.application_status === "rejected").length,
  };

  const filtered = attendees
    .filter((a) => activeTab === "all" || a.application_status === activeTab)
    .filter((a) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    });

  // ── Actions — optimistic, no spinner for approve/reject ─────
  function setErr(id: string, msg: string) {
    setActionErrors((prev) => ({ ...prev, [id]: msg }));
  }

  function handleApprove(id: string, prev_status: Status) {
    // Instant optimistic flip — no await, no spinner
    setAttendees((prev) => prev.map((a) => a.id === id ? { ...a, application_status: "approved" } : a));
    setErr(id, "");
    approveAttendee(id, eventId).then((result) => {
      if (result?.error) {
        setAttendees((prev) => prev.map((a) => a.id === id ? { ...a, application_status: prev_status } : a));
        setErr(id, result.error);
      }
    });
  }

  function handleReject(id: string, prev_status: Status) {
    setAttendees((prev) => prev.map((a) => a.id === id ? { ...a, application_status: "rejected" } : a));
    setErr(id, "");
    rejectAttendee(id, eventId).then((result) => {
      if (result?.error) {
        setAttendees((prev) => prev.map((a) => a.id === id ? { ...a, application_status: prev_status } : a));
        setErr(id, result.error);
      }
    });
  }

  async function handleGeneratePass(id: string) {
    setLoadingId(id); setErr(id, "");
    const result = await generatePass(id, eventId);
    setLoadingId(null);
    if (result?.error) {
      setErr(id, result.error ?? "");
    } else if (result?.passToken) {
      const token = result.passToken as string;
      setPassTokens((prev) => ({ ...prev, [id]: token }));
      setAttendees((prev) => prev.map((a) => a.id === id ? { ...a, pass_status: "generated" } : a));
    }
  }

  async function handleViewPass(id: string) {
    if (passTokens[id]) { window.open(`/pass/${passTokens[id]}`, "_blank"); return; }
    setLoadingId(id); setErr(id, "");
    const result = await generatePass(id, eventId);
    setLoadingId(null);
    if (result?.error) {
      setErr(id, result.error ?? "");
    } else if (result?.passToken) {
      const token = result.passToken as string;
      setPassTokens((prev) => ({ ...prev, [id]: token }));
      window.open(`/pass/${token}`, "_blank");
    }
  }

  async function handleExport() {
    setExporting(true);
    const result = await exportAttendeesCSV(eventId);
    setExporting(false);
    if (result.error || !result.csv) return;
    const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `attendees-${eventId.slice(0, 8)}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const tabs: FilterTab[] = ["all", "pending", "approved", "rejected"];

  return (
    <>
      {/* ── Capacity bar ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-5 mb-4"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-neutral-900">Capacity</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tabular-nums">
                  {approvedCount}
                  <span className="text-neutral-400 font-normal"> / {attendeeLimit}</span>
                  <span className="text-xs text-neutral-400 font-normal ml-1.5">({capacityPct}%)</span>
                </span>
                {/* Live indicator */}
                <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                  liveConnected ? "bg-green-50 text-green-600" : "bg-neutral-100 text-neutral-400"
                }`}>
                  <Wifi className="w-2.5 h-2.5" />
                  {liveConnected ? "Live" : "Connecting"}
                </span>
              </div>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${capacityPct}%`,
                  background: atCapacity
                    ? "linear-gradient(90deg,#dc2626,#ef4444)"
                    : "linear-gradient(90deg,#6D28D9,#8B5CF6)",
                }} />
            </div>
            {atCapacity && (
              <p className="text-xs text-amber-600 font-medium mt-1.5">Event is at full capacity</p>
            )}
          </div>

          {applicationEnabled && applySlug && (
            <Link href={`/apply/${applySlug}`} target="_blank" rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 text-xs text-neutral-500 border border-neutral-200 rounded-xl px-3 py-2 hover:bg-neutral-50 hover:border-neutral-300 transition-colors">
              <span className="font-mono font-semibold text-neutral-700">{applySlug}</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      {/* ── Table card ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-neutral-100 p-5"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>

        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold text-neutral-900">Attendees</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {canCSV ? (
              <button onClick={() => setShowCSVModal(true)}
                className="flex items-center gap-1.5 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium hover:bg-neutral-50 transition-colors">
                <Upload className="w-3.5 h-3.5" />
                Upload CSV
              </button>
            ) : (
              <Link href="/billing"
                className="flex items-center gap-1.5 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-400 hover:bg-neutral-50 transition-colors">
                <Lock className="w-3 h-3" />
                Upload CSV
                <span className="text-[9px] font-bold uppercase bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Starter+</span>
              </Link>
            )}

            {canExport ? (
              <button onClick={handleExport} disabled={exporting}
                className="flex items-center gap-1.5 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50">
                {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                Export CSV
              </button>
            ) : (
              <Link href="/billing"
                className="flex items-center gap-1.5 border border-neutral-200 rounded-xl px-3 py-2 text-xs font-medium text-neutral-400 hover:bg-neutral-50 transition-colors">
                <Lock className="w-3 h-3" />
                Export CSV
                <span className="text-[9px] font-bold uppercase bg-violet-100 text-brand px-1.5 py-0.5 rounded-full">Pro</span>
              </Link>
            )}

            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 text-white rounded-xl px-3 py-2 text-xs font-medium hover:opacity-90 transition-opacity"
              style={{ background: "#6D28D9" }}>
              <UserPlus className="w-3.5 h-3.5" />
              Add attendee
            </button>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex items-center gap-1 bg-neutral-100 rounded-xl p-1 shrink-0">
            {tabs.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                  activeTab === tab ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                }`}>
                {tab === "all" ? "All" : tab}
                <span className={`ml-1.5 text-xs ${activeTab === tab ? "text-neutral-500" : "text-neutral-400"}`}>
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300 pointer-events-none" />
            <input type="text" placeholder="Search name or email…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs border border-neutral-200 rounded-xl outline-none focus:border-neutral-400 transition-colors placeholder:text-neutral-300" />
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-neutral-50 flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-neutral-200" />
            </div>
            <p className="text-sm font-medium text-neutral-500">
              {attendees.length === 0 ? "No attendees yet" : "No attendees match this filter"}
            </p>
            {attendees.length === 0 && (
              <p className="text-xs text-neutral-400 mt-1">Add attendees manually or upload a CSV</p>
            )}
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-neutral-100">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100">
                    <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Name</th>
                    <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3 hidden sm:table-cell">Email</th>
                    <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3 hidden md:table-cell">Type</th>
                    <th className="text-left text-xs font-medium text-neutral-400 px-4 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-neutral-400 px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {filtered.map((a) => {
                    const isLoading  = loadingId === a.id;
                    const hasToken   = !!passTokens[a.id];
                    const passExists = a.pass_status === "generated" || a.pass_status === "checked_in";

                    return (
                      <tr key={a.id} className="hover:bg-neutral-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-sm">{a.name}</p>
                          <p className="text-xs text-neutral-400 sm:hidden">{a.email}</p>
                          {actionErrors[a.id] && (
                            <p className="text-xs text-red-500 mt-0.5">{actionErrors[a.id]}</p>
                          )}
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
                                <Btn onClick={() => handleApprove(a.id, a.application_status)} pending={false} variant="primary">
                                  <Check className="w-3 h-3" /> Approve
                                </Btn>
                                <Btn onClick={() => handleReject(a.id, a.application_status)} pending={false} variant="outline">
                                  Reject
                                </Btn>
                              </>
                            )}

                            {a.application_status === "approved" && (
                              <>
                                {!passExists && !hasToken ? (
                                  <Btn onClick={() => handleGeneratePass(a.id)} pending={isLoading} variant="primary">
                                    <Ticket className="w-3 h-3" /> Generate pass
                                  </Btn>
                                ) : hasToken ? (
                                  <a href={`/pass/${passTokens[a.id]}`} target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl text-white hover:opacity-90 transition-all"
                                    style={{ background: "#6D28D9" }}>
                                    <ExternalLink className="w-3 h-3" /> View pass
                                  </a>
                                ) : (
                                  <Btn onClick={() => handleViewPass(a.id)} pending={isLoading} variant="primary">
                                    <ExternalLink className="w-3 h-3" />
                                    {isLoading ? "Loading…" : "View pass"}
                                  </Btn>
                                )}
                                {passTokens[a.id] && (
                                  <button title="Download pass as PNG"
                                    onClick={async () => {
                                      const token = passTokens[a.id];
                                      const res = await fetch(`/api/pass/image/${token}`);
                                      if (!res.ok) return;
                                      const blob = await res.blob();
                                      const url  = URL.createObjectURL(blob);
                                      const dl   = document.createElement("a");
                                      dl.href = url; dl.download = `pass-${a.name.replace(/\s+/g, "-").toLowerCase()}.png`; dl.click();
                                      URL.revokeObjectURL(url);
                                    }}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 transition-all">
                                    <Download className="w-3 h-3" />
                                  </button>
                                )}
                                <Btn onClick={() => handleReject(a.id, a.application_status)} pending={false} variant="danger">
                                  Revoke
                                </Btn>
                              </>
                            )}

                            {a.application_status === "rejected" && (
                              <Btn onClick={() => handleApprove(a.id, a.application_status)} pending={false} variant="primary">
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
            <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50">
              <p className="text-xs text-neutral-400">
                Showing {filtered.length} of {attendees.length} attendee{attendees.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <AddAttendeeModal eventId={eventId} onClose={() => setShowAddModal(false)}
          onSuccess={() => setShowAddModal(false)} />
      )}
      {showCSVModal && (
        <CSVUploadModal eventId={eventId} onClose={() => setShowCSVModal(false)}
          onSuccess={() => setShowCSVModal(false)} />
      )}
    </>
  );
}
