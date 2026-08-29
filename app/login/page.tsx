"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Mail, Lock, Ticket, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const inputCls =
  "bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand focus:bg-white transition-all w-full placeholder:text-neutral-400 pl-10";

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setServerError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-5"
      style={{
        background:
          "radial-gradient(ellipse 100% 50% at 50% -10%, #ede9fe 0%, #f5f3ff 40%, #ffffff 70%)",
      }}
    >
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
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-neutral-500">Sign in to your organizer account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
                autoComplete="current-password"
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
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-neutral-500 text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-neutral-900 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      <p className="text-xs text-neutral-300 mt-6 apply-in-3">
        Free to start · No credit card required
      </p>
    </div>
  );
}
