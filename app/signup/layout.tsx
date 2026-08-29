import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create account",
  description: "Sign up for URPASS and start creating digital event passes with QR check-in in minutes. Free plan available.",
  alternates: { canonical: "https://urpass.space/signup" },
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
