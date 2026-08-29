import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CalendarDays, Ticket } from "lucide-react";
import ApplyForm from "./ApplyForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): Promise<Metadata> {
  const { eventId } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("name, venue, event_date")
    .eq("id", eventId)
    .eq("status", "active")
    .single();

  if (!event) return { title: "Apply for Event" };
  const date = new Date(event.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  return {
    title: `Apply — ${event.name}`,
    description: `Register for ${event.name} at ${event.venue} on ${date}. Get your digital pass instantly on approval.`,
    openGraph: {
      title: `Apply for ${event.name}`,
      description: `Register for ${event.name} at ${event.venue} on ${date}.`,
    },
  };
}

interface EventInfo {
  id: string;
  name: string;
  description: string | null;
  event_date: string;
  start_time: string;
  venue: string;
  auto_approve: boolean;
}

const gradientBg = "radial-gradient(ellipse 100% 50% at 50% -10%, #ede9fe 0%, #f5f3ff 40%, #ffffff 70%)";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId: slug } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, name, description, event_date, start_time, venue, auto_approve")
    .eq("apply_slug", slug)
    .eq("status", "active")
    .eq("application_enabled", true)
    .single();

  if (!event) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: gradientBg }}
      >
        <div className="flex items-center gap-1.5 mb-10 apply-in-1">
          <Ticket className="w-4 h-4 text-brand" />
          <span className="text-sm font-bold tracking-widest uppercase text-neutral-900">
            URPASS
          </span>
        </div>
        <div className="text-center max-w-sm apply-in-2">
          <div className="w-14 h-14 bg-brand-50 border border-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CalendarDays className="w-6 h-6 text-brand" />
          </div>
          <h1 className="text-xl font-bold mb-2">Applications closed</h1>
          <p className="text-sm text-neutral-500 leading-relaxed">
            This event is not currently accepting applications.
          </p>
          <p className="text-xs text-neutral-300 mt-8">Powered by URPASS</p>
        </div>
      </div>
    );
  }

  return <ApplyForm event={event as EventInfo} />;
}
