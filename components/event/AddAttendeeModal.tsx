"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Loader2 } from "lucide-react";
import { attendeeSchema, type AttendeeInput, PASS_TYPES } from "@/lib/validations/attendee";
import { addAttendee } from "@/app/actions/attendees";

const inputCls =
  "border border-neutral-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neutral-900 transition-colors w-full bg-white placeholder:text-neutral-300";

interface Props {
  eventId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAttendeeModal({ eventId, onClose, onSuccess }: Props) {
  const [serverError, setServerError] = useState("");
  const firstInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AttendeeInput>({
    resolver: zodResolver(attendeeSchema),
    defaultValues: { pass_type: "participant" },
  });

  useEffect(() => {
    firstInputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onSubmit(data: AttendeeInput) {
    setServerError("");
    const result = await addAttendee(eventId, data);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    reset();
    onSuccess();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-neutral-100">
          <h2 className="text-sm font-semibold">Add attendee</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-700">Full name</label>
            <input
              type="text"
              placeholder="Srinithin S"
              className={inputCls}
              {...register("name")}
              ref={(el) => {
                register("name").ref(el);
                (firstInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
              }}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-700">Email</label>
            <input
              type="email"
              placeholder="attendee@example.com"
              className={inputCls}
              {...register("email")}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-700">Phone <span className="text-neutral-400">(optional)</span></label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              className={inputCls}
              {...register("phone")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-neutral-700">Pass type</label>
            <select className={inputCls} {...register("pass_type")}>
              {PASS_TYPES.map((t) => (
                <option key={t} value={t} className="capitalize">
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            {errors.pass_type && <p className="text-xs text-red-500">{errors.pass_type.message}</p>}
          </div>

          {serverError && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {serverError}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-neutral-200 rounded-xl py-2.5 text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 bg-neutral-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSubmitting ? "Adding…" : "Add attendee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
