"use client";

import { useState } from "react";
import { Loader2, CheckCircle, Pencil, X } from "lucide-react";
import { updateProfileName } from "@/app/actions/auth";

export default function ProfileForm({
  fullName,
  email,
  initials,
}: {
  fullName: string;
  email: string;
  initials: string;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(fullName);
  const [draft, setDraft] = useState(fullName);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (draft.trim() === name) { setEditing(false); return; }
    setLoading(true);
    setError("");
    const result = await updateProfileName(draft);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setName(draft);
      setEditing(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  const currentInitials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase() || initials;

  return (
    <div className="bg-white border border-neutral-100 rounded-2xl p-6 mb-4">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-neutral-800">Profile</h2>
        {success && (
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <CheckCircle className="w-3.5 h-3.5" />
            Saved
          </div>
        )}
      </div>

      {/* Avatar row */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white shrink-0"
          style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
        >
          {currentInitials}
        </div>
        <div>
          <p className="text-base font-semibold text-neutral-900">{name}</p>
          <p className="text-sm text-neutral-400">{email}</p>
        </div>
      </div>

      {/* Name field */}
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-2 block">
            Full name
          </label>
          {editing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") { setEditing(false); setDraft(name); } }}
                autoFocus
                className="flex-1 border border-neutral-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-neutral-900 transition-colors"
              />
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-3 py-2 rounded-xl text-sm font-medium text-white disabled:opacity-50"
                style={{ background: "#6D28D9" }}
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); setDraft(name); }}
                className="p-2 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-900">{name}</p>
              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
            </div>
          )}
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-2 block">
            Email address
          </label>
          <p className="text-sm text-neutral-500">{email}</p>
          <p className="text-xs text-neutral-300 mt-0.5">
            Email cannot be changed. Contact support if needed.
          </p>
        </div>
      </div>
    </div>
  );
}
