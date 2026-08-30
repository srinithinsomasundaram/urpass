"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Ticket, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white transition-all w-full placeholder:text-neutral-400 pl-10";

const BG = {
  background:
    "radial-gradient(ellipse 100% 50% at 50% -10%, #ede9fe 0%, #f5f3ff 40%, #ffffff 70%)",
};

export default function ForgotPasswordPage() {
  const [email, setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [error, setError]   = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/reset-password`;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5" style={BG}>

      {/* Top row */}
      <div className="flex items-center justify-between w-full max-w-md mb-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to login
        </Link>
        <div className="flex items-center gap-1.5">
          <Ticket className="w-4 h-4 text-brand" />
          <span className="text-sm font-bold tracking-widest uppercase text-neutral-900">URPASS</span>
        </div>
        <div className="w-20" />
      </div>

      {sent ? (
        <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-100 p-8 text-center" style={{ boxShadow: "0 4px 32px 0 rgba(109,40,217,0.08)" }}>
          <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight mb-2">Check your email</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">
            We sent a password reset link to <span className="font-semibold text-neutral-800">{email}</span>.
            Check your inbox and follow the link to reset your password.
          </p>
          <p className="text-xs text-neutral-400 mt-5">
            Didn&apos;t receive it?{" "}
            <button
              onClick={() => setSent(false)}
              className="text-brand font-semibold hover:underline"
            >
              Try again
            </button>
          </p>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-100 p-8" style={{ boxShadow: "0 4px 32px 0 rgba(109,40,217,0.08)" }}>
          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight">Reset password</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className={inputCls}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-400" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60 mt-1"
              style={{ background: "#6D28D9" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Sending…" : "Send reset link"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
