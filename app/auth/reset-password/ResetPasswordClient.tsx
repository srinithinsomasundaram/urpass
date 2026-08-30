"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Ticket, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const inputCls =
  "bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white transition-all w-full placeholder:text-neutral-400 pl-10";

const BG = {
  background:
    "radial-gradient(ellipse 100% 50% at 50% -10%, #ede9fe 0%, #f5f3ff 40%, #ffffff 70%)",
};

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [sessionReady, setSessionReady] = useState(() => !searchParams.get("code"));
  const [initError, setInitError]       = useState("");
  const [password, setPassword]         = useState("");
  const [confirm, setConfirm]           = useState("");
  const [showPw, setShowPw]             = useState(false);
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);
  const [error, setError]               = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) return;

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
      if (err) {
        setInitError("This reset link has expired or is invalid. Please request a new one.");
      } else {
        setSessionReady(true);
      }
    });
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2500);
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

      {/* Invalid / expired link */}
      {initError && (
        <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-100 p-8 text-center" style={{ boxShadow: "0 4px 32px 0 rgba(109,40,217,0.08)" }}>
          <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight mb-2">Link expired</h2>
          <p className="text-sm text-neutral-500 leading-relaxed">{initError}</p>
          <Link
            href="/forgot-password"
            className="inline-block mt-6 text-sm font-semibold text-brand hover:underline"
          >
            Request a new link →
          </Link>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-100 p-8 text-center" style={{ boxShadow: "0 4px 32px 0 rgba(109,40,217,0.08)" }}>
          <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight mb-2">Password updated</h2>
          <p className="text-sm text-neutral-500">Taking you to your dashboard…</p>
        </div>
      )}

      {/* Loading code exchange */}
      {!initError && !success && !sessionReady && (
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-brand" />
          <p className="text-sm text-neutral-500">Verifying your reset link…</p>
        </div>
      )}

      {/* New password form */}
      {!initError && !success && sessionReady && (
        <div className="w-full max-w-md bg-white rounded-3xl border border-neutral-100 p-8" style={{ boxShadow: "0 4px 32px 0 rgba(109,40,217,0.08)" }}>
          <div className="mb-7">
            <h1 className="text-2xl font-semibold tracking-tight">Set new password</h1>
            <p className="mt-1 text-sm text-neutral-500">
              Choose a strong password for your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={inputCls + " pr-10"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-500 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={inputCls}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
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
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
