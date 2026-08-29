"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, User, Ticket, AlertCircle, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const inputCls =
  "bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white transition-all w-full placeholder:text-neutral-400 pl-10";

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.full_name } },
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 1500);
  }

  const BG = {
    background:
      "radial-gradient(ellipse 100% 50% at 50% -10%, #ede9fe 0%, #f5f3ff 40%, #ffffff 70%)",
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5" style={BG}>
        <div className="pass-scale-in text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "#f5f3ff", border: "1.5px solid #ddd6fe" }}
          >
            <CheckCircle className="w-8 h-8 text-brand" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight">Account created</h2>
          <p className="mt-2 text-sm text-neutral-500">Taking you to your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5" style={BG}>
      {/* Wordmark */}
      <div className="flex items-center gap-1.5 mb-8 apply-in-1">
        <Ticket className="w-4 h-4 text-brand" />
        <Link href="/" className="text-sm font-bold tracking-widest uppercase text-neutral-900">
          URPASS
        </Link>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm bg-white rounded-3xl border border-neutral-100 p-8 apply-in-2"
        style={{ boxShadow: "0 4px 32px 0 rgba(109,40,217,0.08)" }}
      >
        <div className="mb-7">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Start on the free plan — no credit card required
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Full name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
              <input
                type="text"
                autoComplete="name"
                placeholder="Srinithin S"
                className={inputCls}
                {...register("full_name")}
              />
            </div>
            {errors.full_name && (
              <p className="text-xs text-red-500">{errors.full_name.message}</p>
            )}
          </div>

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
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
              <input
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className={inputCls}
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

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
            {isSubmitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-500 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-neutral-900 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <p className="text-xs text-neutral-300 mt-6 apply-in-3">
        Free to start · No credit card required
      </p>
    </div>
  );
}
