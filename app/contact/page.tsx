"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Mail,
  User,
  MessageSquare,
  MapPin,
  Clock,
} from "lucide-react";
import AnimateIn from "@/components/ui/AnimateIn";

const inputCls =
  "border border-neutral-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neutral-900 transition-colors bg-white placeholder:text-neutral-300 w-full";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to send message");
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <AnimateIn from="scale" className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-50 border border-green-100 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-neutral-900 mb-2">Message sent!</h1>
          <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
            Thanks, {name}. We&apos;ll get back to you at{" "}
            <span className="font-medium text-neutral-700">{email}</span> within 24 hours.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center py-2.5 px-6 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ background: "#6D28D9" }}
          >
            Back to home
          </Link>
        </AnimateIn>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-5 py-12">

        <AnimateIn from="up" delay={0}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-900 transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>

          <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-2">
            Support
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-2">
            Get in touch
          </h1>
          <p className="text-sm text-neutral-500 mb-10">
            Have a question, bug, or partnership inquiry? We reply within 24 hours.
          </p>
        </AnimateIn>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left info panel */}
          <AnimateIn from="left" delay={80} className="lg:col-span-2 flex flex-col gap-4">
            <div className="bg-white border border-neutral-100 rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800 mb-0.5">Email</p>
                  <a
                    href="mailto:support@urpass.space"
                    className="text-sm text-brand hover:underline underline-offset-2"
                  >
                    support@urpass.space
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800 mb-0.5">Response time</p>
                  <p className="text-sm text-neutral-500">Usually within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-neutral-800 mb-0.5">Based in</p>
                  <p className="text-sm text-neutral-500">Tamil Nadu, India 🇮🇳</p>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl p-6 text-white"
              style={{ background: "linear-gradient(135deg, #6D28D9 0%, #4c1d95 100%)" }}
            >
              <p className="text-sm font-semibold mb-1">Looking for docs?</p>
              <p className="text-xs text-white/60 mb-4 leading-relaxed">
                Most questions are answered in our documentation — setup guides, API reference, and FAQ.
              </p>
              <Link
                href="/docs"
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-white/15 hover:bg-white/25 transition-colors px-3 py-2 rounded-lg"
              >
                View docs →
              </Link>
            </div>
          </AnimateIn>

          {/* Right form */}
          <AnimateIn from="right" delay={160} className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-neutral-100 rounded-2xl p-6 flex flex-col gap-5"
            >
              <h2 className="text-base font-semibold text-neutral-900">Send a message</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700">Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Your name"
                      className={`${inputCls} pl-9`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      minLength={2}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-neutral-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className={`${inputCls} pl-9`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">Message</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-neutral-300 pointer-events-none" />
                  <textarea
                    rows={6}
                    placeholder="Describe your question or issue…"
                    className={`${inputCls} pl-9 resize-none`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    minLength={10}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: "#6D28D9" }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Sending…" : "Send message"}
              </button>
            </form>
          </AnimateIn>

        </div>
      </div>
    </div>
  );
}
