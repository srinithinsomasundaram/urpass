"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Pencil, X, User, Mail } from "lucide-react";
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
    .split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase() || initials;

  return (
    <div className="px-6 py-5">
      {/* Avatar + name row */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-black text-white shrink-0 shadow-md"
          style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
        >
          {currentInitials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-bold text-neutral-900 leading-tight">{name}</p>
          <p className="text-sm text-neutral-400 mt-0.5 truncate">{email}</p>
          {success && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Profile saved
            </div>
          )}
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">

        {/* Full name */}
        <div className="rounded-xl border border-neutral-100 overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-2 bg-neutral-50 border-b border-neutral-100">
            <User className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Full name</p>
          </div>
          <div className="px-4 py-3">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") { setEditing(false); setDraft(name); }
                  }}
                  autoFocus
                  className="flex-1 text-sm text-neutral-900 outline-none bg-transparent placeholder:text-neutral-300"
                  placeholder="Your full name"
                />
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
                  style={{ background: "#6D28D9" }}
                >
                  {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                </button>
                <button
                  onClick={() => { setEditing(false); setDraft(name); }}
                  className="p-1.5 rounded-lg text-neutral-300 hover:text-neutral-500 hover:bg-neutral-100 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-900">{name}</p>
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-brand transition-colors font-medium"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </button>
              </div>
            )}
            {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
          </div>
        </div>

        {/* Email (read-only) */}
        <div className="rounded-xl border border-neutral-100 overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-2 bg-neutral-50 border-b border-neutral-100">
            <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Email address</p>
          </div>
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-neutral-500 truncate">{email}</p>
            <span className="text-[10px] font-semibold text-neutral-300 bg-neutral-50 border border-neutral-100 px-2 py-0.5 rounded-full shrink-0">
              Read only
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
