"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Lock, IndianRupee, Building2 } from "lucide-react";
import { eventSchema, type EventInput } from "@/lib/validations/event";
import { createEvent } from "@/app/actions/events";

interface Props {
  maxAttendees: number;
  activeEventCount: number;
  maxEvents: number;
  unlimited: boolean;
  canCreatePaidEvents: boolean;
  organizationId?: string;
  organizationName?: string;
}

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-neutral-800">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls =
  "border border-neutral-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neutral-900 transition-colors bg-white placeholder:text-neutral-300";

export default function CreateEventForm({ maxAttendees, activeEventCount, maxEvents, unlimited, canCreatePaidEvents, organizationId, organizationName }: Props) {
  const [serverError, setServerError] = useState("");

  const atLimit = !unlimited && activeEventCount >= maxEvents;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EventInput>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      status: "draft",
      application_enabled: true,
      auto_approve: false,
      attendee_limit: Math.min(100, maxAttendees),
      is_paid_event: false,
      ticket_price: 0,
    },
  });

  const applicationEnabled = watch("application_enabled");
  const autoApprove = watch("auto_approve");
  const isPaidEvent = watch("is_paid_event");

  async function onSubmit(data: EventInput) {
    setServerError("");
    const result = await createEvent(data, organizationId);
    if (result?.error) setServerError(result.error);
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back */}
        <Link
          href="/dashboard/events"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Events
        </Link>

        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Create event</h1>
            <p className="text-sm text-neutral-500 mt-1">
              Fill in the details. You can edit these later.
            </p>
          </div>
          {/* Event usage pill */}
          <div className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border border-neutral-200 text-neutral-500 bg-white">
            {activeEventCount} / {unlimited ? "∞" : maxEvents} events
          </div>
        </div>

        {/* Org context banner */}
        {organizationName && (
          <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 mb-2">
            <Building2 className="w-4 h-4 text-brand shrink-0" />
            <p className="text-sm text-brand font-medium">
              Creating under <strong>{organizationName}</strong>
            </p>
          </div>
        )}

        {/* Limit banner */}
        {atLimit && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 mb-6">
            <Lock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Event limit reached</p>
              <p className="text-xs text-amber-600 mt-0.5">
                You&apos;ve used all {maxEvents} event slots on your current plan.{" "}
                <Link href="/billing" className="underline font-medium">
                  Upgrade to create more.
                </Link>
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
          {/* Event details */}
          <fieldset disabled={atLimit} className="contents">
            <div className="bg-white border border-neutral-100 rounded-2xl p-6 flex flex-col gap-5">
              <h2 className="text-sm font-semibold text-neutral-800">Event details</h2>

              <Field label="Event name" error={errors.name?.message}>
                <input
                  type="text"
                  placeholder="AI Workshop 2026"
                  className={inputCls}
                  {...register("name")}
                />
              </Field>

              <Field label="Description" error={errors.description?.message}>
                <textarea
                  rows={3}
                  placeholder="What's this event about? (optional)"
                  className={`${inputCls} resize-none`}
                  {...register("description")}
                />
              </Field>

              <Field label="Venue" error={errors.venue?.message}>
                <input
                  type="text"
                  placeholder="SRM Institute, Chennai"
                  className={inputCls}
                  {...register("venue")}
                />
              </Field>
            </div>

            {/* Date & time */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-6 flex flex-col gap-5">
              <h2 className="text-sm font-semibold text-neutral-800">Date &amp; time</h2>

              <Field label="Event date" error={errors.event_date?.message}>
                <input type="date" className={inputCls} {...register("event_date")} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Start time" error={errors.start_time?.message}>
                  <input type="time" className={inputCls} {...register("start_time")} />
                </Field>
                <Field label="End time" error={errors.end_time?.message}>
                  <input type="time" className={inputCls} {...register("end_time")} />
                </Field>
              </div>
            </div>

            {/* Capacity & settings */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-6 flex flex-col gap-5">
              <h2 className="text-sm font-semibold text-neutral-800">Capacity &amp; settings</h2>

              <Field
                label="Attendee limit"
                error={errors.attendee_limit?.message}
                hint={`Maximum approved attendees · your plan allows up to ${maxAttendees}`}
              >
                <input
                  type="number"
                  min={1}
                  max={maxAttendees}
                  className={inputCls}
                  {...register("attendee_limit", { valueAsNumber: true })}
                />
              </Field>

              <Field label="Initial status" error={errors.status?.message}>
                <select className={inputCls} {...register("status")}>
                  <option value="draft">Draft — not visible to applicants yet</option>
                  <option value="active">Active — open for applications</option>
                </select>
              </Field>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-neutral-800">Public application form</p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Let anyone apply via a public link
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={applicationEnabled}
                  onClick={() => setValue("application_enabled", !applicationEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-colors ${
                    applicationEnabled ? "bg-neutral-900" : "bg-neutral-200"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      applicationEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {applicationEnabled && (
                <div className="flex items-start justify-between gap-4 pl-5 border-l-2 border-neutral-100">
                  <div>
                    <p className="text-sm font-medium text-neutral-800">Auto-approve</p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Instantly approve and generate passes on submission
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={autoApprove}
                    onClick={() => setValue("auto_approve", !autoApprove)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-colors ${
                      autoApprove ? "bg-brand" : "bg-neutral-200"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                        autoApprove ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
            {/* Paid event */}
            <div className="bg-white border border-neutral-100 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-neutral-800">Ticket payment</h2>
                  <p className="text-xs text-neutral-400 mt-0.5">Charge attendees via Razorpay</p>
                </div>
                {!canCreatePaidEvents && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full">
                    <Lock className="w-3 h-3" />
                    Starter+
                  </span>
                )}
              </div>

              {canCreatePaidEvents ? (
                <>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-neutral-800">Paid event</p>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        Require attendees to pay before registering
                      </p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isPaidEvent}
                      onClick={() => setValue("is_paid_event", !isPaidEvent)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-colors ${
                        isPaidEvent ? "bg-neutral-900" : "bg-neutral-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          isPaidEvent ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {isPaidEvent && (
                    <Field
                      label="Ticket price (₹)"
                      error={errors.ticket_price?.message}
                      hint="Amount in rupees. Attendees pay this before their application is submitted."
                    >
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                        <input
                          type="number"
                          min={1}
                          max={100000}
                          placeholder="499"
                          className={`${inputCls} pl-9`}
                          {...register("ticket_price", {
                            valueAsNumber: true,
                            setValueAs: (v) => Math.round(Number(v) * 100),
                          })}
                        />
                      </div>
                    </Field>
                  )}
                </>
              ) : (
                <p className="text-sm text-neutral-400">
                  Upgrade to Starter or Pro to charge for tickets.{" "}
                  <Link href="/billing" className="text-brand underline">
                    Upgrade
                  </Link>
                </p>
              )}
            </div>
          </fieldset>

          {serverError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}

          <div className="flex items-center gap-3 justify-end pb-8">
            <Link
              href="/dashboard/events"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors px-4 py-2.5"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting || atLimit}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "#6D28D9" }}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Creating…" : "Create event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
