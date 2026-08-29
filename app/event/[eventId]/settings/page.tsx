"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { eventSchema, type EventInput } from "@/lib/validations/event";
import { updateEvent, updateEventStatus, deleteEvent } from "@/app/actions/events";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "border border-neutral-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neutral-900 transition-colors bg-white placeholder:text-neutral-300 w-full";

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

type EventRow = {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  venue: string;
  attendee_limit: number;
  status: string;
  application_enabled: boolean;
  auto_approve: boolean;
};

export default function EventSettingsPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;
  const router = useRouter();

  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EventInput>({ resolver: zodResolver(eventSchema) });

  const applicationEnabled = watch("application_enabled");
  const autoApprove = watch("auto_approve");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("events")
        .select(
          "id, name, description, event_date, start_time, end_time, venue, attendee_limit, status, application_enabled, auto_approve"
        )
        .eq("id", eventId)
        .single();

      if (data) {
        setEvent(data as EventRow);
        reset({
          name: data.name,
          description: data.description ?? "",
          event_date: data.event_date,
          start_time: data.start_time,
          end_time: data.end_time,
          venue: data.venue,
          attendee_limit: data.attendee_limit,
          status: data.status as "draft" | "active",
          application_enabled: data.application_enabled,
          auto_approve: data.auto_approve,
        });
      }
      setLoading(false);
    }
    load();
  }, [eventId, reset]);

  async function onSubmit(data: EventInput) {
    setSaveError("");
    setSaveSuccess(false);
    const result = await updateEvent(eventId, data);
    if (result?.error) {
      setSaveError(result.error);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  }

  async function handleStatusChange(
    newStatus: "draft" | "active" | "completed" | "cancelled"
  ) {
    setStatusLoading(true);
    const result = await updateEventStatus(eventId, newStatus);
    if (result?.error) {
      setSaveError(result.error);
    } else {
      router.refresh();
      setEvent((e) => (e ? { ...e, status: newStatus } : e));
    }
    setStatusLoading(false);
  }

  async function handleDelete() {
    setDeleteLoading(true);
    const result = await deleteEvent(eventId);
    if (result?.error) {
      setSaveError(result.error);
      setDeleteLoading(false);
    }
    // redirect happens inside deleteEvent
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-neutral-300" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <p className="text-sm text-neutral-400">Event not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        {/* Event details */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-neutral-800">Event details</h2>

          <Field label="Event name" error={errors.name?.message}>
            <input type="text" className={inputCls} {...register("name")} />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <textarea
              rows={3}
              className={`${inputCls} resize-none`}
              {...register("description")}
            />
          </Field>

          <Field label="Venue" error={errors.venue?.message}>
            <input type="text" className={inputCls} {...register("venue")} />
          </Field>
        </div>

        {/* Date & time */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-neutral-800">Date & time</h2>

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

        {/* Capacity */}
        <div className="bg-white border border-neutral-100 rounded-2xl p-6 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-neutral-800">Capacity & settings</h2>

          <Field
            label="Attendee limit"
            error={errors.attendee_limit?.message}
            hint="Maximum number of approved attendees"
          >
            <input
              type="number"
              min={1}
              className={inputCls}
              {...register("attendee_limit", { valueAsNumber: true })}
            />
          </Field>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-neutral-800">
                Public application form
              </p>
              <p className="text-xs text-neutral-400 mt-0.5">
                Let anyone apply via a public link
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={applicationEnabled}
              onClick={() => setValue("application_enabled", !applicationEnabled, { shouldDirty: true })}
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
                onClick={() => setValue("auto_approve", !autoApprove, { shouldDirty: true })}
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

        {saveError && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <p className="text-sm text-green-700">Changes saved.</p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      {/* Status management */}
      <div className="bg-white border border-neutral-100 rounded-2xl p-6 mt-6">
        <h2 className="text-sm font-semibold text-neutral-800 mb-4">
          Event status
        </h2>
        <div className="flex flex-wrap gap-2">
          {event.status === "draft" && (
            <button
              onClick={() => handleStatusChange("active")}
              disabled={statusLoading}
              className="flex items-center gap-2 bg-neutral-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              {statusLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Publish event
            </button>
          )}
          {event.status === "active" && (
            <>
              <button
                onClick={() => handleStatusChange("completed")}
                disabled={statusLoading}
                className="flex items-center gap-2 border border-neutral-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                Mark as completed
              </button>
              <button
                onClick={() => handleStatusChange("cancelled")}
                disabled={statusLoading}
                className="flex items-center gap-2 border border-red-100 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                Cancel event
              </button>
            </>
          )}
          {(event.status === "completed" || event.status === "cancelled") && (
            <button
              onClick={() => handleStatusChange("draft")}
              disabled={statusLoading}
              className="flex items-center gap-2 border border-neutral-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              Revert to draft
            </button>
          )}
        </div>
        <p className="text-xs text-neutral-400 mt-3">
          Current status:{" "}
          <span className="font-medium text-neutral-600">{event.status}</span>
        </p>
      </div>

      {/* Danger zone */}
      <div className="border border-red-100 rounded-2xl p-6 mt-6">
        <h2 className="text-sm font-semibold text-red-600 mb-1">Danger zone</h2>
        <p className="text-xs text-neutral-500 mb-4">
          Deleting an event is permanent and will remove all attendees, passes, and check-in records.
        </p>
        {!deleteConfirm ? (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="flex items-center gap-2 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete event
          </button>
        ) : (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">
                Are you sure? This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Yes, delete
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
