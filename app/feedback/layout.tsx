import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Share Feedback",
  description:
    "Tell us what you love, what's broken, or what you'd like to see next. Your feedback shapes URPASS.",
  alternates: { canonical: "https://urpass.space/feedback" },
  openGraph: {
    title: "Share Feedback — URPASS",
    description:
      "Tell us what you love, what's broken, or what you'd like to see next. Your feedback shapes URPASS.",
    url: "https://urpass.space/feedback",
  },
};

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
