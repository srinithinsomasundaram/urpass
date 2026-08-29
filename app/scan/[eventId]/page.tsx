"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  RotateCcw,
  Loader2,
  ScanLine,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";

const QRScanner = dynamic(() => import("@/components/scan/QRScanner"), { ssr: false });

type ScanState = "idle" | "scanning" | "verifying" | "success" | "duplicate" | "error";

interface ScanResult {
  attendee: { name: string; email: string; pass_type: string };
  passType: string;
}

interface FeedEntry {
  id: string;
  name: string;
  pass_type: string;
  ts: string;
}

const PASS_TYPE_LABEL: Record<string, string> = {
  participant: "Participant",
  vip: "VIP",
  speaker: "Speaker",
  organizer: "Organizer",
};

const AUTO_RESET_MS = 5000;

export default function ScanEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [eventName, setEventName] = useState<string>("");
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [scanCount, setScanCount] = useState(0);
  const [resetProgress, setResetProgress] = useState(0);
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const lastTokenRef = useRef<string | null>(null);
  const cooldownRef = useRef(false);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isScannerActive = scanState === "idle" || scanState === "scanning";

  useEffect(() => {
    async function fetchEventName() {
      const supabase = createClient();
      const { data } = await supabase
        .from("events")
        .select("name")
        .eq("id", eventId)
        .single();
      if (data) setEventName(data.name);
    }
    fetchEventName();
  }, [eventId]);

  // Live check-in feed via Realtime
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`scanner-feed-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "check_ins",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          const attendeeId = payload.new.attendee_id as string;
          const { data: att } = await supabase
            .from("attendees")
            .select("name, pass_type")
            .eq("id", attendeeId)
            .single();

          if (!att) return;
          const entry: FeedEntry = {
            id: payload.new.id as string,
            name: att.name,
            pass_type: att.pass_type,
            ts: payload.new.checked_in_at as string,
          };
          setScanCount((c) => c + 1);
          setFeed((prev) => [entry, ...prev].slice(0, 20));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [eventId]);

  const verify = useCallback(
    async (rawToken: string) => {
      if (cooldownRef.current || rawToken === lastTokenRef.current) return;
      cooldownRef.current = true;
      lastTokenRef.current = rawToken;
      setTimeout(() => { cooldownRef.current = false; }, 3000);

      setScanState("verifying");

      try {
        const res = await fetch("/api/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passToken: rawToken, eventId }),
        });
        const data = await res.json();

        if (!res.ok) {
          setErrorMsg(data.error ?? "Verification failed");
          setScanState("error");
          return;
        }

        if (data.alreadyCheckedIn) {
          setResult(data);
          setScanState("duplicate");
          return;
        }

        setResult(data);
        setScanState("success");
      } catch {
        setErrorMsg("Network error. Check your connection.");
        setScanState("error");
      }
    },
    [eventId]
  );

  const reset = useCallback(() => {
    lastTokenRef.current = null;
    cooldownRef.current = false;
    setResult(null);
    setErrorMsg("");
    setResetProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    setScanState("idle");
  }, []);

  useEffect(() => {
    if (scanState === "success" || scanState === "duplicate" || scanState === "error") {
      const step = 100 / (AUTO_RESET_MS / 50);
      const timer = setTimeout(() => {
        setResetProgress(0);
      }, 0);
      progressRef.current = setInterval(() => {
        setResetProgress((p) => {
          if (p >= 100) { clearInterval(progressRef.current!); return 100; }
          return p + step;
        });
      }, 50);
      const t = setTimeout(reset, AUTO_RESET_MS);
      return () => {
        clearTimeout(timer);
        clearTimeout(t);
        if (progressRef.current) clearInterval(progressRef.current);
      };
    }
  }, [scanState, reset]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col page-in">

      {/* ── Top bar ────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-5 h-14 border-b border-white/[0.06]">
        <button
          onClick={() => router.push("/scan")}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Events</span>
        </button>

        {/* Event name / wordmark */}
        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-xs font-semibold text-white/70 max-w-[180px] truncate text-center">
            {eventName || "URPASS Scanner"}
          </span>
          {eventName && (
            <span className="text-[10px] text-white/25 mt-0.5 tracking-wide">QR Check-in</span>
          )}
        </div>

        {/* Scan counter */}
        <div className="flex items-center gap-1.5 bg-white/[0.06] border border-white/[0.08] rounded-full px-3 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
          <span className="text-xs font-semibold text-white/60 tabular-nums">
            {scanCount}
          </span>
        </div>
      </div>

      {/* ── Main content — grows to fill screen ────────────────────── */}
      <div className="flex-1 flex flex-col">

        {/* Center zone */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-8">

          {/* Scanner */}
          {isScannerActive && (
            <div className="w-full max-w-xs sm:max-w-sm">
              <QRScanner onScan={verify} active={isScannerActive} />
            </div>
          )}

          {/* Verifying */}
          {scanState === "verifying" && (
            <div className="flex flex-col items-center gap-6">
              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full border-2 border-brand/20 animate-ping" />
                <div className="relative w-full h-full rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-brand animate-spin" />
                </div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-white">Verifying pass…</p>
                <p className="text-xs text-white/35">Checking against attendee list</p>
              </div>
            </div>
          )}

          {/* Success */}
          {scanState === "success" && result && (
            <ResultCard
              variant="success"
              attendee={result.attendee}
              passType={result.passType}
              onReset={reset}
              progress={resetProgress}
            />
          )}

          {/* Duplicate */}
          {scanState === "duplicate" && result && (
            <ResultCard
              variant="duplicate"
              attendee={result.attendee}
              passType={result.passType}
              onReset={reset}
              progress={resetProgress}
            />
          )}

          {/* Error */}
          {scanState === "error" && (
            <ErrorCard message={errorMsg} onReset={reset} progress={resetProgress} />
          )}
        </div>

        {/* Bottom hint */}
        {isScannerActive && (
          <div className="shrink-0 flex items-center justify-center gap-2 px-5 pt-2">
            <ScanLine className="w-3.5 h-3.5 text-white/15" />
            <p className="text-xs text-white/20">
              Scanning · Approved passes only · Duplicate check-ins blocked
            </p>
          </div>
        )}

        {/* Live check-in feed */}
        {feed.length > 0 && (
          <div className="shrink-0 px-5 pb-8 pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-3.5 h-3.5 text-white/25" />
              <p className="text-[10px] font-bold tracking-widest uppercase text-white/25">
                Recent check-ins
              </p>
              <span className="ml-auto text-[10px] text-white/20">{scanCount} total</span>
            </div>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {feed.map((entry, i) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between bg-white/[0.04] border border-white/[0.06] rounded-xl px-3 py-2.5"
                  style={{ opacity: Math.max(0.4, 1 - i * 0.08) }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-xs font-medium text-white/80 truncate">{entry.name}</span>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand/10 text-brand-300 border border-brand/20 shrink-0 ml-2 capitalize">
                    {PASS_TYPE_LABEL[entry.pass_type] ?? entry.pass_type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Result card ──────────────────────────────────────────────────────────────

function ResultCard({
  variant,
  attendee,
  passType,
  onReset,
  progress,
}: {
  variant: "success" | "duplicate";
  attendee: { name: string; email: string; pass_type: string };
  passType: string;
  onReset: () => void;
  progress: number;
}) {
  const ok = variant === "success";
  const color = ok ? "#10b981" : "#f59e0b";
  const borderCls = ok
    ? "bg-emerald-500/10 border-emerald-500/20"
    : "bg-amber-500/10 border-amber-500/20";

  return (
    <div className="w-full max-w-xs sm:max-w-sm flex flex-col gap-3">

      {/* Status card */}
      <div className={`rounded-2xl border overflow-hidden ${borderCls} relative`}>
        {/* Glow */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ backgroundImage: `radial-gradient(ellipse 80% 50% at 50% 0%, ${color}, transparent)` }}
        />

        <div className="relative flex flex-col items-center text-center gap-4 px-6 py-7">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: `${color}20` }}
          >
            {ok ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-amber-400" />
            )}
          </div>

          <div className="space-y-1">
            <p
              className="text-[10px] font-bold tracking-widest uppercase"
              style={{ color }}
            >
              {ok ? "Entry granted" : "Already used"}
            </p>
            <p className="text-lg font-bold text-white leading-tight">
              {ok ? "Check-in successful" : "Already checked in"}
            </p>
            <p className="text-xs" style={{ color: `${color}99` }}>
              {ok ? "Attendee verified and admitted" : "This pass was already scanned"}
            </p>
          </div>
        </div>
      </div>

      {/* Attendee row */}
      <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl overflow-hidden">
        <div className="px-4 py-4 border-b border-white/[0.06]">
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/25 mb-1.5">
            Attendee
          </p>
          <p className="text-base font-bold text-white leading-tight">{attendee.name}</p>
          <p className="text-xs text-white/35 mt-0.5">{attendee.email}</p>
        </div>
        <div className="px-4 py-3 flex items-center justify-between">
          <p className="text-[10px] font-bold tracking-widest uppercase text-white/25">
            Pass type
          </p>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand/10 text-brand-200 border border-brand/20">
            {PASS_TYPE_LABEL[passType] ?? passType}
          </span>
        </div>
      </div>

      {/* Progress + reset */}
      <div className="flex flex-col gap-2.5 pt-1">
        <div className="h-0.5 bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-none"
            style={{ width: `${progress}%`, background: color }}
          />
        </div>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 text-xs text-white/30 hover:text-white/70 transition-colors py-1"
        >
          <RotateCcw className="w-3 h-3" />
          Scan next pass now
        </button>
      </div>
    </div>
  );
}

// ── Error card ───────────────────────────────────────────────────────────────

function ErrorCard({
  message,
  onReset,
  progress,
}: {
  message: string;
  onReset: () => void;
  progress: number;
}) {
  return (
    <div className="w-full max-w-xs sm:max-w-sm flex flex-col gap-3">
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl overflow-hidden relative">
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(ellipse 80% 50% at 50% 0%, #ef4444, transparent)" }}
        />
        <div className="relative flex flex-col items-center text-center gap-4 px-6 py-7">
          <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <XCircle className="w-7 h-7 text-red-400" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold tracking-widest uppercase text-red-400">
              Invalid pass
            </p>
            <p className="text-lg font-bold text-white leading-tight">Not admitted</p>
            <p className="text-xs text-red-400/60">{message}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 pt-1">
        <div className="h-0.5 bg-white/[0.08] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-red-500 transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 text-xs text-white/30 hover:text-white/70 transition-colors py-1"
        >
          <RotateCcw className="w-3 h-3" />
          Try again
        </button>
      </div>
    </div>
  );
}
