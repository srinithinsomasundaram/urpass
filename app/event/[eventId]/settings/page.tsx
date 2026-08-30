"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2, Trash2, AlertTriangle, IndianRupee,
  FileText, CalendarDays, Users, CreditCard,
  Radio, CheckCircle2, AlertCircle,
} from "lucide-react";
import { eventSchema, type EventInput } from "@/lib/validations/event";
import { updateEvent, updateEventStatus, deleteEvent } from "@/app/actions/events";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all bg-white placeholder:text-neutral-300 w-full";

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden"
      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-50">
        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 leading-none">{title}</h2>
          {subtitle && <p className="text-xs text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="px-6 py-5 flex flex-col gap-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-neutral-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 transition-colors duration-200 disabled:opacity-50 ${
        checked ? "bg-brand" : "bg-neutral-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  indent,
  disabled,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  indent?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-start justify-between gap-4 ${indent ? "pl-5 border-l-2 border-neutral-100" : ""}`}>
      <div className="min-w-0">
        <p className="text-sm font-medium text-neutral-800">{label}</p>
        <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

const STATUS_CONFIG = {
  draft:     { label: "Draft",     dot: "bg-neutral-400", bg: "bg-neutral-50",  text: "text-neutral-600",  border: "border-neutral-200" },
  active:    { label: "Active",    dot: "bg-green-500",   bg: "bg-green-50",    text: "text-green-700",    border: "border-green-200" },
  completed: { label: "Completed", dot: "bg-blue-400",    bg: "bg-blue-50",     text: "text-blue-700",     border: "border-blue-200" },
  cancelled: { label: "Cancelled", dot: "bg-red-400",     bg: "bg-red-50",      text: "text-red-700",      border: "border-red-200" },
} as const;

type EventRow = {
  id: string; name: string; description: string | null;
  event_date: string; start_time: string; end_time: string;
  venue: string; attendee_limit: number; status: string;
  application_enabled: boolean; auto_approve: boolean;
  is_paid_event: boolean; ticket_price: number;
};

export default function EventSettingsPage() {
  const params  = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const router  = useRouter();

  const [event, setEvent]                       = useState<EventRow | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [saveError, setSaveError]               = useState("");
  const [saveSuccess, setSaveSuccess]           = useState(false);
  const [statusLoading, setStatusLoading]       = useState(false);
  const [deleteConfirm, setDeleteConfirm]       = useState(false);
  const [deleteLoading, setDeleteLoading]       = useState(false);
  const [hasPaymentGateway, setHasPaymentGateway] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EventInput>({ resolver: zodResolver(eventSchema) });

  const applicationEnabled = watch("application_enabled");
  const autoApprove        = watch("auto_approve");
  const isPaidEvent        = watch("is_paid_event");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [{ data }, { data: { user } }] = await Promise.all([
        supabase.from("events")
          .select("id,name,description,event_date,start_time,end_time,venue,attendee_limit,status,application_enabled,auto_approve,is_paid_event,ticket_price")
          .eq("id", eventId).single(),
        supabase.auth.getUser(),
      ]);
      if (data) {
        setEvent(data as EventRow);
        reset({
          name: data.name, description: data.description ?? "",
          event_date: data.event_date, start_time: data.start_time, end_time: data.end_time,
          venue: data.venue, attendee_limit: data.attendee_limit,
          status: data.status as "draft" | "active",
          application_enabled: data.application_enabled, auto_approve: data.auto_approve,
          is_paid_event: data.is_paid_event, ticket_price: data.ticket_price,
        });
      }
      if (user) {
        const { data: ps } = await supabase.from("payment_settings")
          .select("razorpay_key_id").eq("user_id", user.id).single();
        setHasPaymentGateway(!!(ps?.razorpay_key_id));
      }
      setLoading(false);
    }
    load();
  }, [eventId, reset]);

  async function onSubmit(data: EventInput) {
    setSaveError(""); setSaveSuccess(false);
    const result = await updateEvent(eventId, data);
    if (result?.error) { setSaveError(result.error); }
    else { setSaveSuccess(true); setTimeout(() => setSaveSuccess(false), 3000); }
  }

  async function handleStatusChange(newStatus: "draft" | "active" | "completed" | "cancelled") {
    setStatusLoading(true);
    const result = await updateEventStatus(eventId, newStatus);
    if (result?.error) { setSaveError(result.error); }
    else {
      router.refresh();
      setEvent((e) => (e ? { ...e, status: newStatus } : e));
    }
    setStatusLoading(false);
  }

  async function handleDelete() {
    setDeleteLoading(true);
    const result = await deleteEvent(eventId);
    if (result?.error) { setSaveError(result.error); setDeleteLoading(false); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-300" />
      </div>
    );
  }
  if (!event) {
    return (
      <div className="py-24 text-center">
        <p className="text-sm text-neutral-400">Event not found</p>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[event.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.draft;

  return (
    <div className="max-w-2xl mx-auto px-4 lg:px-0 py-6 pb-28">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

        {/* ── Event details ── */}
        <SectionCard icon={FileText} title="Event details" subtitle="Basic information about your event">
          <Field label="Event name" error={errors.name?.message}>
            <input type="text" className={inputCls} placeholder="My Awesome Event" {...register("name")} />
          </Field>
          <Field label="Description" error={errors.description?.message}>
            <textarea rows={3} className={`${inputCls} resize-none`} placeholder="What's this event about?" {...register("description")} />
          </Field>
          <Field label="Venue" error={errors.venue?.message}>
            <input type="text" className={inputCls} placeholder="Venue name or address" {...register("venue")} />
          </Field>
        </SectionCard>

        {/* ── Date & time ── */}
        <SectionCard icon={CalendarDays} title="Date & time">
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
        </SectionCard>

        {/* ── Capacity & settings ── */}
        <SectionCard icon={Users} title="Capacity & registrations" subtitle="Control who can attend and how">
          <Field label="Attendee limit" error={errors.attendee_limit?.message} hint="Maximum number of approved attendees">
            <input type="number" min={1} className={inputCls} {...register("attendee_limit", { valueAsNumber: true })} />
          </Field>
          <div className="h-px bg-neutral-50" />
          <ToggleRow
            label="Public application form"
            description="Let anyone apply via a public link"
            checked={!!applicationEnabled}
            onChange={() => setValue("application_enabled", !applicationEnabled, { shouldDirty: true })}
          />
          {applicationEnabled && (
            <ToggleRow
              label="Auto-approve"
              description="Instantly approve and generate passes on submission"
              checked={!!autoApprove}
              onChange={() => setValue("auto_approve", !autoApprove, { shouldDirty: true })}
              indent
            />
          )}
        </SectionCard>

        {/* ── Ticket payment ── */}
        <SectionCard icon={CreditCard} title="Ticket payment" subtitle="Charge attendees via Razorpay">
          {isPaidEvent && hasPaymentGateway === false && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800">Payment gateway not connected</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Attendees can&apos;t pay until you connect Razorpay.{" "}
                  <a href="/dashboard/settings" className="font-bold underline">Connect now →</a>
                </p>
              </div>
            </div>
          )}
          <ToggleRow
            label="Paid event"
            description="Require attendees to pay before registering"
            checked={!!isPaidEvent}
            onChange={() => setValue("is_paid_event", !isPaidEvent, { shouldDirty: true })}
          />
          {isPaidEvent && (
            <Field label="Ticket price (₹)" error={errors.ticket_price?.message} hint="Amount in rupees">
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="number" min={1} max={100000}
                  className={`${inputCls} pl-9`}
                  {...register("ticket_price", { valueAsNumber: true })}
                />
              </div>
            </Field>
          )}
        </SectionCard>

        {/* Alerts */}
        {saveError && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}
        {saveSuccess && (
          <div className="flex items-center gap-2.5 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            <p className="text-sm text-green-700 font-medium">Changes saved successfully.</p>
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#6D28D9" }}
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      {/* ── Event status ── */}
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden mt-5"
        style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-50">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
            <Radio className="w-4 h-4 text-violet-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-neutral-900 leading-none">Event status</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Control whether your event is public</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
            {statusCfg.label}
          </span>
        </div>
        <div className="px-6 py-5 flex flex-wrap gap-2">
          {event.status === "draft" && (
            <button onClick={() => handleStatusChange("active")} disabled={statusLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "#6D28D9" }}>
              {statusLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Publish event
            </button>
          )}
          {event.status === "active" && (
            <>
              <button onClick={() => handleStatusChange("completed")} disabled={statusLoading}
                className="flex items-center gap-2 border border-neutral-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50">
                Mark as completed
              </button>
              <button onClick={() => handleStatusChange("cancelled")} disabled={statusLoading}
                className="flex items-center gap-2 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50">
                Cancel event
              </button>
            </>
          )}
          {(event.status === "completed" || event.status === "cancelled") && (
            <button onClick={() => handleStatusChange("draft")} disabled={statusLoading}
              className="flex items-center gap-2 border border-neutral-200 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50">
              Revert to draft
            </button>
          )}
        </div>
      </div>

      {/* ── Danger zone ── */}
      <div className="mt-5 rounded-2xl border border-red-100 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-red-50 bg-red-50/40">
          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-red-700 leading-none">Danger zone</h2>
            <p className="text-xs text-red-400 mt-0.5">Irreversible actions</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <p className="text-xs text-neutral-500 mb-4">
            Deleting this event is permanent — all attendees, passes, and check-in records will be removed.
          </p>
          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 border border-red-200 text-red-600 bg-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
              <Trash2 className="w-4 h-4" />
              Delete event
            </button>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <div className="flex items-start gap-2.5 mb-4">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-red-700">Are you absolutely sure? This cannot be undone.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleDelete} disabled={deleteLoading}
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
                  {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Yes, delete permanently
                </button>
                <button onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium border border-neutral-200 hover:bg-neutral-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
