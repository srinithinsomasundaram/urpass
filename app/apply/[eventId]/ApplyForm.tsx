"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  MapPin,
  Loader2,
  CheckCircle,
  Mail,
  ExternalLink,
  Ticket,
  User,
  Phone,
  AlertCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { attendeeSchema, type AttendeeInput } from "@/lib/validations/attendee";
import { submitApplication } from "@/app/actions/attendees";

interface EventInfo {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  start_time: string;
  venue: string;
  auto_approve: boolean;
}

type SuccessState =
  | { type: "pass"; passToken: string; attendeeName: string; attendeeEmail: string }
  | { type: "pending"; attendeeName: string };

const BG = "radial-gradient(ellipse 100% 50% at 50% -10%, #ede9fe 0%, #f5f3ff 40%, #ffffff 70%)";

const inputCls =
  "bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white transition-all w-full placeholder:text-neutral-400";

function Wordmark() {
  return (
    <div className="flex items-center gap-1.5 mb-8 apply-in-1">
      <Ticket className="w-4 h-4 text-brand" />
      <span className="text-sm font-bold tracking-widest uppercase text-neutral-900">URPASS</span>
    </div>
  );
}

export default function ApplyForm({ event }: { event: EventInfo }) {
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AttendeeInput>({
    resolver: zodResolver(attendeeSchema),
    defaultValues: { pass_type: "participant" },
  });

  const formattedDate = new Date(event.event_date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function onSubmit(data: AttendeeInput) {
    setServerError("");
    const result = await submitApplication(event.id, data);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    if (result?.passToken) {
      setSuccess({
        type: "pass",
        passToken: result.passToken,
        attendeeName: data.name,
        attendeeEmail: data.email,
      });
    } else {
      setSuccess({ type: "pending", attendeeName: data.name });
    }
  }

  // ── Pass ready ────────────────────────────────────────────────────────────
  if (success?.type === "pass") {
    const passUrl = `${typeof window !== "undefined" ? window.location.origin : "https://urpass.space"}/pass/${success.passToken}`;
    const shortCode =
      success.passToken.slice(0, 8).match(/.{1,4}/g)?.join("-") ??
      success.passToken.slice(0, 8);

    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-5"
        style={{ background: BG }}
      >
        <Wordmark />

        <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-4 pass-scale-in">
          Your pass is ready
        </p>

        {/* Dark ticket card */}
        <div className="pass-scale-in w-full max-w-sm">
          <div
            className="rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: "linear-gradient(160deg, #1c1c2e 0%, #0d0d14 100%)" }}
          >
            {/* Purple header strip */}
            <div
              className="px-6 pt-6 pb-8 relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, #6D28D9 0%, #4c1d95 100%)" }}
            >
              <div
                className="absolute inset-0 opacity-25"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 85% 40%, #fff 0%, transparent 55%)",
                }}
              />
              <p className="relative text-xs font-bold tracking-widest uppercase text-purple-200 mb-1.5">
                Event Pass
              </p>
              <h2 className="relative text-xl font-bold text-white leading-tight">
                {event.name}
              </h2>
              <p className="relative text-xs text-purple-200 mt-1.5">
                {formattedDate} &middot; {event.venue}
              </p>
            </div>

            {/* Tear divider */}
            <div className="relative h-0 mx-1">
              <div className="absolute -left-4 -top-3 w-6 h-6 rounded-full bg-[#f5f3ff]" />
              <div className="absolute -right-4 -top-3 w-6 h-6 rounded-full bg-[#f5f3ff]" />
              <div className="absolute left-3 right-3 border-t border-dashed border-neutral-700" />
            </div>

            {/* Body */}
            <div className="px-6 py-7 flex flex-col items-center">
              <p className="text-sm font-semibold text-neutral-200 mb-1">
                {success.attendeeName}
              </p>
              <span className="text-xs font-medium px-3 py-0.5 rounded-full mb-6 border border-purple-500/30 bg-purple-500/10 text-purple-300">
                Participant
              </span>

              {/* QR */}
              <div className="bg-white rounded-2xl p-4 shadow-inner">
                <QRCodeSVG
                  value={passUrl}
                  size={164}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#0a0a0a"
                />
              </div>

              <p className="text-xs text-neutral-500 mt-4 font-mono tracking-widest">
                {shortCode}
              </p>
            </div>

            {/* View pass */}
            <div className="px-6 pb-6">
              <a
                href={passUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ background: "#6D28D9" }}
              >
                View full pass
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Email note */}
        <div className="flex items-center gap-2 mt-5 pass-in-2">
          <Mail className="w-3.5 h-3.5 text-neutral-400" />
          <p className="text-xs text-neutral-500">
            Sent to{" "}
            <span className="font-medium text-neutral-700">{success.attendeeEmail}</span>
          </p>
        </div>

        <p className="text-xs text-neutral-300 mt-6 pass-in-3">Powered by URPASS</p>
      </div>
    );
  }

  // ── Pending ───────────────────────────────────────────────────────────────
  if (success?.type === "pending") {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-5"
        style={{ background: BG }}
      >
        <Wordmark />

        <div className="pass-scale-in w-full max-w-sm">
          <div
            className="bg-white rounded-3xl border border-neutral-100 p-8 text-center"
            style={{ boxShadow: "0 8px 40px 0 rgba(109,40,217,0.10)" }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
              style={{ background: "#f5f3ff", border: "1.5px solid #ddd6fe" }}
            >
              <CheckCircle className="w-7 h-7 text-brand" />
            </div>

            <h1 className="text-xl font-bold text-neutral-900 mb-2">
              You&apos;re on the list
            </h1>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              Hi {success.attendeeName}, your application for{" "}
              <span className="font-medium text-neutral-700">{event.name}</span> has been
              received. We&apos;ll email you once it&apos;s reviewed.
            </p>

            <div className="bg-neutral-50 rounded-2xl p-4 text-left border border-neutral-100">
              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-2">
                <CalendarDays className="w-3.5 h-3.5 shrink-0 text-brand" />
                <span>
                  {formattedDate} &middot; {event.start_time}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-brand" />
                <span>{event.venue}</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-neutral-300 mt-8 pass-in-2">Powered by URPASS</p>
      </div>
    );
  }

  // ── Application form ──────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center p-5 pt-10 pb-16"
      style={{ background: BG }}
    >
      <div className="w-full max-w-[480px]">
        <Wordmark />

        {/* Event info */}
        <div className="mb-5 apply-in-2">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2 leading-tight">
            {event.name}
          </h1>
          {event.description && (
            <p className="text-sm text-neutral-500 leading-relaxed mb-4">
              {event.description}
            </p>
          )}
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <CalendarDays className="w-3.5 h-3.5 text-brand shrink-0" />
              <span>
                {formattedDate} &middot; {event.start_time}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-neutral-500">
              <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Status chips */}
        <div className="flex items-center gap-2 mb-6 apply-in-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Open
          </span>
          {event.auto_approve && (
            <span className="text-xs font-medium text-brand bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-full">
              Instant pass
            </span>
          )}
        </div>

        {/* Form card */}
        <div
          className="bg-white rounded-3xl border border-neutral-100 p-6 apply-in-4"
          style={{ boxShadow: "0 4px 32px 0 rgba(109,40,217,0.08)" }}
        >
          <h2 className="text-base font-semibold text-neutral-900 mb-5">Your details</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Your full name"
                  className={`${inputCls} pl-10`}
                  autoComplete="name"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`${inputCls} pl-10`}
                  autoComplete="email"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Phone{" "}
                <span className="normal-case font-normal text-neutral-400">
                  (optional)
                </span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className={`${inputCls} pl-10`}
                  autoComplete="tel"
                  {...register("phone")}
                />
              </div>
            </div>

            <input type="hidden" value="participant" {...register("pass_type")} />

            {serverError && (
              <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-1"
              style={{ background: "#6D28D9" }}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting
                ? event.auto_approve
                  ? "Generating your pass…"
                  : "Submitting…"
                : "Apply to attend"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-300 mt-6">Powered by URPASS</p>
      </div>
    </div>
  );
}
