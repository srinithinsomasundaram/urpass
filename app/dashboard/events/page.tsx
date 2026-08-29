import type { Metadata } from "next";
import EventsContent from "./EventsContent";

export const metadata: Metadata = {
  title: "My Events",
  description: "Manage all your events — create, edit, and track attendee activity.",
  robots: { index: false, follow: false },
};

export default function EventsPage() {
  return <EventsContent />;
}
