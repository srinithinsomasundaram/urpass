import type { Metadata } from "next";
import DashboardContent from "./DashboardContent";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View your event overview, pass stats, and recent activity on URPASS.",
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardContent />;
}
