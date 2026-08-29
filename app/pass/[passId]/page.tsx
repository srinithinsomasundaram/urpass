import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CalendarDays, MapPin, CheckCircle, Ticket } from "lucide-react";
import PassQR from "@/components/pass/PassQR";
import { getUserPlan } from "@/lib/plan";
import DownloadPassButton from "@/components/pass/DownloadPassButton";
import AutoDownload from "@/components/pass/AutoDownload";
import { Suspense } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ passId: string }>;
}): Promise<Metadata> {
  const { passId: passToken } = await params;
  const supabase = await createClient();
  const { data: pass } = await supabase
    .from("passes")
    .select("event_id")
    .eq("pass_token", passToken)
    .single();
  if (!pass) return { title: "Event Pass" };
  const { data: event } = await supabase
    .from("events")
    .select("name")
    .eq("id", pass.event_id)
    .single();
  return {
    title: event ? `${event.name} — Your Pass` : "Event Pass",
    description: event ? `Your digital entry pass for ${event.name}. Show this QR code at the entrance.` : "Your digital event pass.",
    robots: { index: false, follow: false },
  };
}

const PASS_TYPE_LABEL: Record<string, string> = {
  participant: "Participant",
  vip: "VIP",
  speaker: "Speaker",
  organizer: "Organizer",
};

const passTypeCls: Record<string, string> = {
  participant: "bg-purple-500/10 text-purple-100 border-purple-400/25",
  vip: "bg-amber-400/10 text-amber-200 border-amber-300/25",
  speaker: "bg-blue-400/10 text-blue-200 border-blue-300/25",
  organizer: "bg-emerald-400/10 text-emerald-200 border-emerald-300/25",
};

export default async function PassPage({
  params,
}: {
  params: Promise<{ passId: string }>;
}) {
  const { passId: passToken } = await params;
  const supabase = await createClient();

  const { data: pass } = await supabase
    .from("passes")
    .select("pass_token, pass_type, status, attendee_id, event_id")
    .eq("pass_token", passToken)
    .single();

  if (!pass) notFound();

  const [{ data: attendee }, { data: event }] = await Promise.all([
    supabase
      .from("attendees")
      .select("name, email")
      .eq("id", pass.attendee_id)
      .single(),
    supabase
      .from("events")
      .select("name, event_date, start_time, end_time, venue")
      .eq("id", pass.event_id)
      .single(),
  ]);

  if (!attendee || !event) notFound();

  // Fetch organizer plan to determine branding visibility
  const { data: eventOrg } = await supabase
    .from("events")
    .select("organizer_id")
    .eq("id", pass.event_id)
    .single();

  const showBranding = eventOrg
    ? !(await getUserPlan(supabase, eventOrg.organizer_id)).canRemoveBranding
    : true;

  const isCheckedIn = pass.status === "checked_in";
  const formattedDate = new Date(event.event_date).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const shortCode =
    pass.pass_token
      .slice(0, 8)
      .match(/.{1,4}/g)
      ?.join("-") ?? pass.pass_token.slice(0, 8);

  const typeCls = passTypeCls[pass.pass_type] ?? passTypeCls.participant;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-5 pb-16"
      style={{
        background:
          "radial-gradient(ellipse 100% 60% at 50% 0%, #ede9fe 0%, #f5f3ff 40%, #ffffff 70%)",
      }}
    >
      {/* Wordmark — shown only on Free plan */}
      {showBranding && (
        <div className="flex items-center gap-1.5 mb-10 apply-in-1">
          <Ticket className="w-4 h-4 text-brand" />
          <span className="text-sm font-bold tracking-widest uppercase text-neutral-900">
            URPASS
          </span>
        </div>
      )}

      {/* Three-layer card */}
      <div className="relative w-full max-w-sm pass-scale-in select-none">
        <div className="absolute inset-0 translate-x-5 translate-y-5 bg-brand-100 rounded-3xl" />
        <div className="absolute inset-0 translate-x-2.5 translate-y-2.5 bg-brand-200 rounded-3xl" />

        <div className="relative bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden animate-float">
          {/* Brand purple header */}
          <div
            className="px-6 pt-6 pb-8 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #6D28D9 0%, #4c1d95 100%)" }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 85% 40%, #fff 0%, transparent 55%)",
              }}
            />

            <div className="relative flex items-start justify-between mb-5">
              <div className="min-w-0 pr-3">
                <p className="text-[10px] font-bold tracking-widest uppercase text-purple-300 mb-1.5">
                  Event Pass
                </p>
                <h1 className="text-xl font-bold text-white leading-snug">
                  {event.name}
                </h1>
              </div>
              <span
                className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full capitalize border mt-1 ${typeCls}`}
              >
                {PASS_TYPE_LABEL[pass.pass_type] ?? pass.pass_type}
              </span>
            </div>

            <div className="relative flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs text-purple-200">
                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {formattedDate} &middot; {event.start_time}–{event.end_time}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-200">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                <span>{event.venue}</span>
              </div>
            </div>
          </div>

          {/* Tear line */}
          <div className="relative h-0">
            <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-[#f5f3ff]" />
            <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-[#f5f3ff]" />
            <div className="absolute left-3 right-3 border-t border-dashed border-neutral-200" />
          </div>

          {/* Body */}
          <div className="px-6 pt-8 pb-6 flex flex-col items-center gap-4">
            {/* Attendee */}
            <div className="w-full text-center">
              <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-1">
                Attendee
              </p>
              <p className="text-lg font-bold text-neutral-900">{attendee.name}</p>
              <p className="text-xs text-neutral-400 mt-0.5">{attendee.email}</p>
            </div>

            {/* QR code */}
            <PassQR value={pass.pass_token} size={164} />

            <p className="text-[10px] text-neutral-300 font-mono tracking-widest">
              {shortCode.toUpperCase()}
            </p>

            {/* Status */}
            {isCheckedIn ? (
              <div className="w-full flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-3 py-2.5 justify-center">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <span className="text-xs font-semibold text-green-700">Checked in</span>
              </div>
            ) : (
              <div className="w-full flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-xl px-3 py-2.5 justify-center">
                <span className="w-2 h-2 rounded-full bg-brand animate-pulse shrink-0" />
                <span className="text-xs font-semibold text-brand">
                  Valid &middot; Show at entrance
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {showBranding && (
        <p className="text-xs text-neutral-300 mt-12 pass-in-2">Powered by URPASS</p>
      )}

      <div className="mt-6 pass-in-3">
        <DownloadPassButton
          passToken={pass.pass_token}
          fileName={`${event.name.replace(/\s+/g, "-").toLowerCase()}-pass.png`}
        />
      </div>

      <Suspense>
        <AutoDownload
          passToken={pass.pass_token}
          fileName={`${event.name.replace(/\s+/g, "-").toLowerCase()}-pass.png`}
        />
      </Suspense>
    </div>
  );
}
