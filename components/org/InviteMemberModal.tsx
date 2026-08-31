"use client";

import { useState, useEffect, useRef } from "react";
import { X, Loader2, Mail } from "lucide-react";
import { inviteMember } from "@/app/actions/org-members";

const ROLES = [
  { value: "admin",         label: "Admin",          desc: "Manage org + all events" },
  { value: "event_manager", label: "Event Manager",  desc: "Manage assigned events" },
  { value: "checkin_staff", label: "Check-in Staff", desc: "Scan QR codes only" },
  { value: "viewer",        label: "Viewer",         desc: "View dashboard" },
] as const;

const inputCls =
  "border border-neutral-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neutral-900 transition-colors w-full bg-white placeholder:text-neutral-300";

interface Props {
  orgId: string;
  orgSlug: string;
  orgName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteMemberModal({ orgId, orgSlug, orgName, onClose, onSuccess }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailRef.current?.focus();
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const result = await inviteMember(orgId, orgSlug, orgName, fd);
    setLoading(false);
    if (result?.error) { setError(result.error); return; }
    onSuccess();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center">
              <Mail className="w-4 h-4 text-brand" />
            </div>
            <h2 className="text-sm font-bold text-neutral-900">Invite team member</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-neutral-600 block mb-1.5">Email address</label>
            <input
              ref={emailRef}
              name="email"
              type="email"
              placeholder="colleague@example.com"
              className={inputCls}
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-600 block mb-1.5">Role</label>
            <div className="space-y-2">
              {ROLES.map(({ value, label, desc }) => (
                <label key={value} className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="role"
                    value={value}
                    defaultChecked={value === "event_manager"}
                    className="mt-0.5 accent-brand"
                  />
                  <div>
                    <p className="text-sm font-semibold text-neutral-800 group-hover:text-brand transition-colors">{label}</p>
                    <p className="text-xs text-neutral-400">{desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #6D28D9 0%, #4c1d95 100%)" }}
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Send invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
