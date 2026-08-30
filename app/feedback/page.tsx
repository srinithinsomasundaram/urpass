"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Star,
  Mail,
  User,
  MessageSquare,
  Bug,
  Lightbulb,
  ThumbsUp,
  HelpCircle,
} from "lucide-react";
import AnimateIn from "@/components/ui/AnimateIn";

const inputCls =
  "border border-neutral-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-neutral-900 transition-colors bg-white placeholder:text-neutral-300 w-full";

const CATEGORIES = [
  { value: "bug",        label: "Bug report",      icon: Bug,        color: "text-red-500",    bg: "bg-red-50 border-red-200"        },
  { value: "feature",   label: "Feature request",  icon: Lightbulb,  color: "text-amber-500",  bg: "bg-amber-50 border-amber-200"    },
  { value: "compliment",label: "Compliment",        icon: ThumbsUp,   color: "text-green-500",  bg: "bg-green-50 border-green-200"    },
  { value: "other",     label: "Other",             icon: HelpCircle, color: "text-neutral-400",bg: "bg-neutral-50 border-neutral-200"},
];

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95"
          aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
        >
          <Star
            className={`w-8 h-8 transition-colors duration-150 ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "fill-none text-neutral-200"
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span
          key={value}
          className="ml-2 text-sm font-medium text-neutral-600"
          style={{
            animation: "fadeSlideIn 200ms cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {RATING_LABELS[value]}
        </span>
      )}
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("compliment");
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (rating === 0) {
      setError("Please select a star rating before submitting.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, rating, message }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to submit feedback");
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
          <h1 className="text-xl font-bold text-neutral-900 mb-2">
            Thanks for the feedback!
          </h1>
          <p className="text-sm text-neutral-500 mb-8 leading-relaxed">
            We read every submission. Your input directly shapes how URPASS evolves.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center py-2.5 px-6 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: "#6D28D9" }}
            >
              Back to home
            </Link>
            <button
              onClick={() => {
                setDone(false);
                setName(""); setEmail(""); setCategory("compliment");
                setRating(0); setMessage("");
              }}
              className="text-sm text-neutral-400 hover:text-neutral-700 transition-colors py-2"
            >
              Submit another
            </button>
          </div>
        </AnimateIn>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-lg mx-auto px-5 py-12">

        <AnimateIn from="up" delay={0}>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-900 transition-colors mb-10"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>

          <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-2">
            Feedback
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-1">
            Share your thoughts
          </h1>
          <p className="text-sm text-neutral-500 mb-8">
            Bug, idea, or just want to say hi? We read everything.
          </p>
        </AnimateIn>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Category */}
          <AnimateIn from="up" delay={80}>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-neutral-700">Category</p>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map(({ value, label, icon: Icon, color, bg }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(value)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      category === value
                        ? `${bg} ${color} border-current scale-[0.98]`
                        : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300 hover:bg-neutral-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${category === value ? color : "text-neutral-300"}`} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </AnimateIn>

          {/* Star rating */}
          <AnimateIn from="up" delay={140}>
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-neutral-700">Overall rating</p>
              <StarRating value={rating} onChange={setRating} />
            </div>
          </AnimateIn>

          {/* Name + email */}
          <AnimateIn from="up" delay={200}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  Name <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Your name"
                    className={`${inputCls} pl-9`}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-neutral-700">
                  Email <span className="text-neutral-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className={`${inputCls} pl-9`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </AnimateIn>

          {/* Message */}
          <AnimateIn from="up" delay={260}>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-neutral-700">
                Message <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-neutral-300 pointer-events-none" />
                <textarea
                  rows={5}
                  placeholder={
                    category === "bug"
                      ? "Describe what happened and how to reproduce it…"
                      : category === "feature"
                      ? "What would you like us to build? Who would it help?"
                      : category === "compliment"
                      ? "Tell us what you love…"
                      : "What's on your mind?"
                  }
                  className={`${inputCls} pl-9 resize-none`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  minLength={10}
                />
              </div>
            </div>
          </AnimateIn>

          {/* Error + submit */}
          <AnimateIn from="up" delay={320}>
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-1">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || message.trim().length < 10}
              className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ background: "#6D28D9" }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Submitting…" : "Submit feedback"}
            </button>

            <p className="text-xs text-center text-neutral-400 mt-3">
              Anonymous feedback is welcome. We won&apos;t share your details.
            </p>
          </AnimateIn>

        </form>
      </div>
    </div>
  );
}
