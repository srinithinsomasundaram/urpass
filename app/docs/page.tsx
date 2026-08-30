import type { Metadata } from "next";
import Link from "next/link";
import {
  Ticket,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Zap,
  Users,
  QrCode,
  Upload,
  Download,
  CreditCard,
  Shield,
  HelpCircle,
  ChevronRight,
  Star,
  Globe,
  Code2,
  Webhook,
  Lock,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation — Complete Guide to URPASS",
  description:
    "Complete URPASS documentation. Learn how to create events, manage attendees, issue digital passes, and scan QR codes at check-in. Guides for Free, Starter, and Pro plans.",
  keywords: [
    "URPASS documentation",
    "event pass guide",
    "QR check-in tutorial",
    "digital pass how to",
    "event management guide India",
    "URPASS how to use",
    "event pass generator tutorial",
  ],
  alternates: { canonical: "https://urpass.space/docs" },
  openGraph: {
    title: "URPASS Documentation — Complete Event Pass Guide",
    description:
      "Learn how to create digital event passes, manage attendees, and run QR check-in with URPASS. Full documentation and tutorials.",
    url: "https://urpass.space/docs",
    type: "article",
  },
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
    "geo.position": "20.5937;78.9629",
    "ICBM": "20.5937, 78.9629",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://urpass.space" },
    { "@type": "ListItem", position: 2, name: "Documentation", item: "https://urpass.space/docs" },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is URPASS?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "URPASS is a digital event pass platform that lets organizers create QR-code passes, manage attendees, and scan entries at the door — all from a web dashboard.",
      },
    },
    {
      "@type": "Question",
      name: "Is URPASS free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The Free plan lets you run 1 active event with up to 50 attendees, digital passes, and QR check-in at no cost. Paid plans start at ₹1/month.",
      },
    },
    {
      "@type": "Question",
      name: "How do attendees get their passes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Attendees receive a unique QR code pass by email immediately after being approved. They can also access their pass via a direct link anytime.",
      },
    },
    {
      "@type": "Question",
      name: "Can I upload attendees in bulk?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Starter and Pro plan users can upload a CSV file with columns: name, email, phone, pass_type to bulk-import attendees in seconds.",
      },
    },
    {
      "@type": "Question",
      name: "How does QR check-in work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Open the URPASS scanner on any phone browser, select your event, and scan attendee QR codes. The system verifies the pass in real time and prevents duplicate entries.",
      },
    },
    {
      "@type": "Question",
      name: "Can I remove the URPASS branding from passes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Starter and Pro plan subscribers can remove the URPASS watermark from all attendee passes.",
      },
    },
    {
      "@type": "Question",
      name: "How do I export attendee data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Pro plan users can export all attendee data as a CSV file from the Attendees tab of any event. The export includes name, email, pass type, application status, and check-in status.",
      },
    },
    {
      "@type": "Question",
      name: "Is URPASS available in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. URPASS is built for Indian event organizers. Payments are processed in Indian Rupees (₹) via Razorpay, and all plans include 18% GST.",
      },
    },
  ],
};

const docSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: "URPASS Complete Documentation",
  description:
    "Full guide to creating digital event passes, managing attendees, and running QR check-in with URPASS.",
  author: { "@type": "Organization", name: "URPASS", url: "https://urpass.space" },
  publisher: { "@type": "Organization", name: "URPASS", url: "https://urpass.space" },
  inLanguage: "en-IN",
  about: { "@type": "SoftwareApplication", name: "URPASS" },
};

const SECTIONS = [
  { id: "getting-started", label: "Getting started" },
  { id: "events", label: "Events" },
  { id: "attendees", label: "Attendees" },
  { id: "passes", label: "Passes & check-in" },
  { id: "plans", label: "Plans & billing" },
  { id: "api", label: "API reference" },
  { id: "webhooks", label: "Webhooks" },
  { id: "faq", label: "FAQ" },
];

function SectionAnchor({ id }: { id: string }) {
  return <span id={id} className="-mt-24 pt-24 block" aria-hidden />;
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
        style={{ background: "#6D28D9" }}
      >
        {n}
      </div>
      <div className="flex-1 pb-6 border-b border-neutral-100 last:border-0 last:pb-0">
        <p className="text-sm font-semibold text-neutral-900 mb-1">{title}</p>
        <div className="text-sm text-neutral-500 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function FeatureRow({ icon: Icon, title, description, badge }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="flex gap-4 py-4 border-b border-neutral-100 last:border-0">
      <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-brand" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-neutral-900">{title}</p>
          {badge && (
            <span className="text-[9px] font-bold tracking-wide uppercase bg-brand-50 text-brand px-1.5 py-0.5 rounded-full border border-brand-100">
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm text-neutral-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(docSchema) }}
      />

      <div className="min-h-screen bg-neutral-50">
        {/* Top nav */}
        <header className="sticky top-0 z-30 bg-white border-b border-neutral-100">
          <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
              >
                <Ticket className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold tracking-widest uppercase text-neutral-900">URPASS</span>
              <span className="text-xs text-neutral-300 font-normal ml-1 hidden sm:inline">/ Docs</span>
            </Link>
            <div className="flex items-center gap-3">
              <Link href="/pricing" className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors">
                Pricing
              </Link>
              <Link
                href="/signup"
                className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                style={{ background: "#6D28D9" }}
              >
                Get started
              </Link>
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-5 py-10 flex gap-10">
          {/* Sidebar TOC */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-24">
              <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-3">
                On this page
              </p>
              <nav className="flex flex-col gap-0.5">
                {SECTIONS.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2 text-sm text-neutral-500 hover:text-brand transition-colors px-3 py-1.5 rounded-lg hover:bg-brand-50"
                  >
                    <ChevronRight className="w-3 h-3 shrink-0" />
                    {s.label}
                  </a>
                ))}
              </nav>
              <div className="mt-8 pt-6 border-t border-neutral-100">
                <p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-3">
                  Quick links
                </p>
                <div className="flex flex-col gap-1">
                  <Link href="/signup" className="text-xs text-brand hover:underline">Create free account</Link>
                  <Link href="/pricing" className="text-xs text-brand hover:underline">View pricing</Link>
                  <a href="mailto:support@urpass.space" className="text-xs text-brand hover:underline">Contact support</a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <article className="flex-1 min-w-0">
            {/* Hero */}
            <div className="mb-10">
              <div className="flex items-center gap-2 text-xs text-neutral-400 mb-4">
                <Globe className="w-3.5 h-3.5" />
                <span>Available in India · ₹ pricing · Razorpay payments</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900 mb-3">
                URPASS Documentation
              </h1>
              <p className="text-base text-neutral-500 leading-relaxed max-w-2xl">
                Everything you need to create digital event passes, manage attendees, and run
                QR-code check-in at your events — all from a web browser, no app required.
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white px-4 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                  style={{ background: "#6D28D9" }}
                >
                  Start for free
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
                >
                  See pricing
                </Link>
              </div>
            </div>

            {/* ── Getting Started ────────────────────────────────── */}
            <SectionAnchor id="getting-started" />
            <section className="mb-12">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-brand" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Getting started</h2>
              </div>

              <div className="bg-white border border-neutral-100 rounded-2xl p-6 mb-6">
                <h3 className="text-sm font-semibold text-neutral-800 mb-1">What is URPASS?</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">
                  URPASS is a digital event pass platform for Indian event organizers — colleges,
                  startups, conferences, and community events. You create an event, add attendees
                  (manually or via CSV), generate QR-code passes, and scan them at the entrance.
                  No app, no hardware — just a phone browser.
                </p>
              </div>

              <div className="bg-white border border-neutral-100 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-neutral-800 mb-6">Quick start guide</h3>
                <div className="flex flex-col gap-0">
                  <Step n={1} title="Create your account">
                    Go to <Link href="/signup" className="text-brand underline">urpass.space/signup</Link> and
                    sign up with your email. No credit card required for the Free plan.
                  </Step>
                  <Step n={2} title="Create your first event">
                    Click <strong>New event</strong> from your dashboard. Fill in the event name,
                    date, venue, and attendee limit. You can set the event to <em>Draft</em> first
                    or publish it immediately as <em>Active</em>.
                  </Step>
                  <Step n={3} title="Add attendees">
                    Go to the <strong>Attendees</strong> tab of your event. Add attendees one by
                    one or — on Starter/Pro — upload a CSV file. Approve each attendee to
                    generate their digital pass.
                  </Step>
                  <Step n={4} title="Generate digital passes">
                    Once an attendee is approved, click <strong>Generate pass</strong>. They
                    receive a unique QR code pass by email. You can also share the pass link
                    directly.
                  </Step>
                  <Step n={5} title="Scan at the entrance">
                    Open <Link href="/scan" className="text-brand underline">urpass.space/scan</Link> on
                    any phone. Select your event, point the camera at an attendee&apos;s QR code,
                    and the system instantly marks them as checked in.
                  </Step>
                </div>
              </div>
            </section>

            {/* ── Events ──────────────────────────────────────────── */}
            <SectionAnchor id="events" />
            <section className="mb-12">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Events</h2>
              </div>

              <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden mb-4">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-sm font-semibold text-neutral-800">Creating an event</h3>
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm text-neutral-500 mb-4">
                    From your dashboard, click <strong>New event</strong>. Fill in the required
                    fields:
                  </p>
                  <ul className="flex flex-col gap-2 text-sm text-neutral-500">
                    {[
                      ["Event name", "The display name shown on passes and the application form."],
                      ["Venue", "Physical location of your event."],
                      ["Date & time", "Start and end times for the event."],
                      ["Attendee limit", "Maximum number of approved attendees. Capped by your plan."],
                      ["Public application form", "Toggle on to generate a public URL where anyone can apply."],
                      ["Auto-approve", "Instantly approve and issue passes on submission (skips manual review)."],
                    ].map(([field, desc]) => (
                      <li key={field} className="flex gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        <span><strong className="text-neutral-800">{field}</strong> — {desc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-sm font-semibold text-neutral-800">Event statuses</h3>
                </div>
                <div className="divide-y divide-neutral-50 px-6">
                  {[
                    ["Draft", "Event is private. Application form is disabled."],
                    ["Active", "Event is live. Application form accepts registrations."],
                    ["Completed", "Event has ended. No new applications accepted."],
                    ["Cancelled", "Event is cancelled. Application form closed."],
                  ].map(([status, desc]) => (
                    <div key={status} className="flex items-start gap-3 py-3.5">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${
                        status === "Active" ? "bg-green-50 text-green-700 border border-green-100" :
                        status === "Draft" ? "bg-neutral-100 text-neutral-500 border border-neutral-200" :
                        status === "Completed" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                        "bg-red-50 text-red-600 border border-red-100"
                      }`}>{status}</span>
                      <p className="text-sm text-neutral-500">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Attendees ───────────────────────────────────────── */}
            <SectionAnchor id="attendees" />
            <section className="mb-12">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-emerald-600" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Attendees</h2>
              </div>

              <div className="bg-white border border-neutral-100 rounded-2xl px-6 py-2 mb-4">
                <FeatureRow
                  icon={Users}
                  title="Add attendees manually"
                  description="Go to the Attendees tab → click Add attendee. Enter name, email, phone (optional), and pass type. The attendee is immediately approved and their pass can be generated."
                />
                <FeatureRow
                  icon={Upload}
                  title="CSV bulk import"
                  description='Upload a CSV file with headers: name, email, phone, pass_type. Valid pass types are: participant, vip, speaker, organizer. Duplicate emails are automatically skipped.'
                  badge="Starter+"
                />
                <FeatureRow
                  icon={Download}
                  title="Export attendee data"
                  description="Download all attendee records as a CSV file including name, email, pass type, application status, check-in status, and registration date."
                  badge="Pro"
                />
                <FeatureRow
                  icon={CheckCircle}
                  title="Approve & reject applications"
                  description="When an attendee applies via the public form, they appear as Pending. Approve to issue a pass, or reject to decline. Revoked approvals invalidate the pass."
                />
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 text-sm text-amber-800">
                <strong>CSV format:</strong> The first row must be a header row.
                Columns (in any order): <code className="bg-amber-100 px-1 rounded font-mono text-xs">name</code>,{" "}
                <code className="bg-amber-100 px-1 rounded font-mono text-xs">email</code>,{" "}
                <code className="bg-amber-100 px-1 rounded font-mono text-xs">phone</code>,{" "}
                <code className="bg-amber-100 px-1 rounded font-mono text-xs">pass_type</code>.
                Rows with missing name or invalid email are skipped.
              </div>
            </section>

            {/* ── Passes & Check-in ───────────────────────────────── */}
            <SectionAnchor id="passes" />
            <section className="mb-12">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                  <QrCode className="w-4 h-4 text-brand" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Passes &amp; check-in</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  {
                    title: "participant",
                    desc: "Standard attendee pass. Default for most registrations.",
                    color: "bg-purple-500/10 text-purple-700",
                  },
                  {
                    title: "vip",
                    desc: "VIP access. Displayed with a gold badge on the pass.",
                    color: "bg-amber-400/10 text-amber-700",
                  },
                  {
                    title: "speaker",
                    desc: "Speaker or presenter pass with blue badge.",
                    color: "bg-blue-400/10 text-blue-700",
                  },
                  {
                    title: "organizer",
                    desc: "Organizer access. Green badge, full permissions.",
                    color: "bg-emerald-400/10 text-emerald-700",
                  },
                ].map((p) => (
                  <div key={p.title} className="bg-white border border-neutral-100 rounded-2xl p-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${p.color} mb-2 inline-block`}>
                      {p.title}
                    </span>
                    <p className="text-sm text-neutral-500">{p.desc}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-neutral-100 rounded-2xl p-6 mb-4">
                <h3 className="text-sm font-semibold text-neutral-800 mb-4">How QR check-in works</h3>
                <ol className="flex flex-col gap-3 text-sm text-neutral-500">
                  {[
                    "Open urpass.space/scan on any smartphone — no app install needed.",
                    "Select the event you want to scan for.",
                    "Allow camera access when prompted.",
                    "Point the camera at an attendee's QR code.",
                    "The system verifies the pass in under 1 second and marks the attendee as checked in.",
                    "Duplicate scans are rejected with a clear 'Already checked in' message.",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                        style={{ background: "#6D28D9" }}
                      >
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-neutral-900 rounded-2xl p-5 text-white">
                <p className="text-xs font-bold tracking-widest uppercase text-white/40 mb-2">
                  Branding on passes
                </p>
                <p className="text-sm text-white/70 leading-relaxed">
                  Free plan passes show the URPASS wordmark and &ldquo;Powered by URPASS&rdquo; footer.
                  Starter and Pro plan passes show only your event name and attendee details — no URPASS branding.
                </p>
              </div>
            </section>

            {/* ── Plans ───────────────────────────────────────────── */}
            <SectionAnchor id="plans" />
            <section className="mb-12">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Plans &amp; billing</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[
                  {
                    name: "Free",
                    price: "₹0",
                    period: "forever",
                    features: [
                      "1 active event",
                      "50 attendees/event",
                      "Digital passes",
                      "QR check-in",
                      "Basic dashboard",
                      "URPASS branding",
                    ],
                    highlight: false,
                  },
                  {
                    name: "Starter",
                    price: "₹299",
                    period: "/month (+18% GST)",
                    features: [
                      "5 active events",
                      "500 attendees/event",
                      "CSV bulk import",
                      "QR check-in",
                      "Remove branding",
                    ],
                    highlight: true,
                  },
                  {
                    name: "Pro",
                    price: "₹799",
                    period: "/month (+18% GST)",
                    features: [
                      "Unlimited events",
                      "2 000 attendees/event",
                      "CSV bulk import",
                      "Custom branding",
                      "Export attendee data",
                    ],
                    highlight: false,
                  },
                ].map((plan) => (
                  <div
                    key={plan.name}
                    className={`rounded-2xl p-5 flex flex-col gap-4 ${
                      plan.highlight
                        ? "bg-neutral-900 text-white"
                        : "bg-white border border-neutral-100"
                    }`}
                  >
                    <div>
                      <p className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${plan.highlight ? "text-white/40" : "text-neutral-400"}`}>
                        {plan.name}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className={`text-2xl font-bold ${plan.highlight ? "text-white" : "text-neutral-900"}`}>
                          {plan.price}
                        </span>
                        <span className={`text-xs ${plan.highlight ? "text-white/40" : "text-neutral-400"}`}>
                          {plan.period}
                        </span>
                      </div>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-xs">
                          <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${plan.highlight ? "text-white/60" : "text-brand"}`} />
                          <span className={plan.highlight ? "text-white/70" : "text-neutral-600"}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={plan.highlight ? "/billing" : "/signup"}
                      className={`text-center text-xs font-semibold py-2.5 rounded-xl transition-all ${
                        plan.highlight
                          ? "bg-white text-neutral-900 hover:bg-neutral-100"
                          : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                      }`}
                    >
                      {plan.price === "₹0" ? "Get started free" : `Choose ${plan.name}`}
                    </Link>
                  </div>
                ))}
              </div>

              <div className="bg-white border border-neutral-100 rounded-2xl p-5 text-sm text-neutral-500">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-brand shrink-0" />
                  <p className="font-medium text-neutral-800">Billing notes</p>
                </div>
                <ul className="flex flex-col gap-1.5 ml-6">
                  <li>Payments are processed in Indian Rupees (₹) via Razorpay.</li>
                  <li>All prices are inclusive of 18% GST.</li>
                  <li>Subscriptions renew monthly. Cancel anytime from your billing page.</li>
                  <li>On cancellation, access continues until the end of the billing period.</li>
                </ul>
              </div>
            </section>

            {/* ── API Reference ───────────────────────────────────── */}
            <SectionAnchor id="api" />
            <section className="mb-12">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">API reference</h2>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Pro
                </span>
              </div>

              {/* Overview */}
              <div className="bg-white border border-neutral-100 rounded-2xl p-6 mb-4">
                <p className="text-sm text-neutral-500 leading-relaxed mb-4">
                  The URPASS REST API lets you read your events and attendees from any external
                  application. API access is available exclusively on the{" "}
                  <strong className="text-neutral-800">Pro plan</strong>. Generate keys from{" "}
                  <strong className="text-neutral-800">Dashboard → API Keys</strong>.
                </p>
                <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-neutral-500 shrink-0">Base URL</p>
                  <code className="text-xs font-mono text-neutral-800 flex-1">
                    https://urpass.space/api/v1
                  </code>
                </div>
              </div>

              {/* Auth */}
              <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden mb-4">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-neutral-100">
                  <Lock className="w-4 h-4 text-neutral-400" />
                  <h3 className="text-sm font-semibold text-neutral-800">Authentication</h3>
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm text-neutral-500 mb-4">
                    Pass your API key in the <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono text-neutral-700">Authorization</code> header
                    as a Bearer token on every request. Keys start with{" "}
                    <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono text-neutral-700">urp_live_</code>.
                  </p>
                  <div className="bg-neutral-950 rounded-xl p-4 font-mono text-xs text-green-400 overflow-x-auto">
                    <span className="text-neutral-500">curl </span>
                    <span className="text-blue-400">https://urpass.space/api/v1/events </span>
                    <span className="text-neutral-500">\{"\n"}  </span>
                    <span className="text-yellow-400">-H </span>
                    <span className="text-green-400">&quot;Authorization: Bearer urp_live_...&quot;</span>
                  </div>
                  <div className="mt-4 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <Shield className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    Never expose API keys in client-side code or public repositories.
                  </div>
                </div>
              </div>

              {/* Endpoints */}
              <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden mb-4">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-sm font-semibold text-neutral-800">Endpoints</h3>
                </div>

                {/* GET /events */}
                <div className="px-6 py-5 border-b border-neutral-50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">GET</span>
                    <code className="text-sm font-mono text-neutral-800">/events</code>
                  </div>
                  <p className="text-sm text-neutral-500 mb-3">List all events you own.</p>
                  <p className="text-xs font-semibold text-neutral-600 mb-2">Query parameters</p>
                  <div className="flex flex-col gap-1.5 mb-4">
                    {[
                      ["status", "string", "Filter by status: draft · active · completed · cancelled"],
                      ["limit", "number", "Max results per page (default 50, max 100)"],
                      ["offset", "number", "Pagination offset (default 0)"],
                    ].map(([param, type, desc]) => (
                      <div key={param as string} className="grid grid-cols-[120px_60px_1fr] gap-2 text-xs">
                        <code className="font-mono text-brand">{param}</code>
                        <span className="text-neutral-400 italic">{type}</span>
                        <span className="text-neutral-500">{desc}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-neutral-950 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <pre className="text-neutral-300 whitespace-pre">{`{
  "data": [
    {
      "id": "uuid",
      "name": "AI Workshop 2026",
      "event_date": "2026-09-15",
      "venue": "SRM Institute, Chennai",
      "status": "active",
      "is_paid_event": false,
      "ticket_price": 0,
      "attendee_limit": 200
    }
  ],
  "meta": { "total": 4, "limit": 50, "offset": 0 }
}`}</pre>
                  </div>
                </div>

                {/* GET /events/:id */}
                <div className="px-6 py-5 border-b border-neutral-50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">GET</span>
                    <code className="text-sm font-mono text-neutral-800">/events/:id</code>
                  </div>
                  <p className="text-sm text-neutral-500">Retrieve a single event by its UUID.</p>
                </div>

                {/* GET /events/:id/attendees */}
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-mono">GET</span>
                    <code className="text-sm font-mono text-neutral-800">/events/:id/attendees</code>
                  </div>
                  <p className="text-sm text-neutral-500 mb-3">List attendees for an event.</p>
                  <p className="text-xs font-semibold text-neutral-600 mb-2">Query parameters</p>
                  <div className="flex flex-col gap-1.5 mb-4">
                    {[
                      ["application_status", "string", "pending · approved · rejected"],
                      ["pass_status", "string", "not_generated · generated · checked_in"],
                      ["limit", "number", "Max results (default 100, max 500)"],
                      ["offset", "number", "Pagination offset"],
                    ].map(([param, type, desc]) => (
                      <div key={param as string} className="grid grid-cols-[140px_60px_1fr] gap-2 text-xs">
                        <code className="font-mono text-brand">{param}</code>
                        <span className="text-neutral-400 italic">{type}</span>
                        <span className="text-neutral-500">{desc}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-neutral-950 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <pre className="text-neutral-300 whitespace-pre">{`{
  "data": [
    {
      "id": "uuid",
      "name": "Arun Kumar",
      "email": "arun@example.com",
      "pass_type": "participant",
      "application_status": "approved",
      "pass_status": "checked_in"
    }
  ],
  "meta": { "total": 87, "limit": 100, "offset": 0 }
}`}</pre>
                  </div>
                </div>
              </div>

              {/* Error codes */}
              <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-sm font-semibold text-neutral-800">Error responses</h3>
                </div>
                <div className="divide-y divide-neutral-50">
                  {[
                    ["401", "Unauthorized", "Missing or invalid API key"],
                    ["403", "Forbidden", "Key is revoked or plan downgraded from Pro"],
                    ["404", "Not Found", "Resource does not exist or belongs to another user"],
                    ["429", "Too Many Requests", "Rate limit exceeded — back off and retry"],
                    ["500", "Server Error", "Internal error — contact support if persistent"],
                  ].map(([code, name, desc]) => (
                    <div key={code as string} className="flex items-start gap-4 px-6 py-3.5">
                      <code className={`text-xs font-mono font-bold shrink-0 mt-0.5 ${
                        code === "401" || code === "403" ? "text-red-600" :
                        code === "404" ? "text-amber-600" :
                        code === "429" ? "text-orange-600" : "text-neutral-500"
                      }`}>{code}</code>
                      <p className="text-xs font-semibold text-neutral-700 w-32 shrink-0 mt-0.5">{name}</p>
                      <p className="text-xs text-neutral-500">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── Webhooks ─────────────────────────────────────────── */}
            <SectionAnchor id="webhooks" />
            <section className="mb-12">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                  <Webhook className="w-4 h-4 text-violet-600" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Webhooks</h2>
              </div>

              <div className="bg-white border border-neutral-100 rounded-2xl p-6 mb-4">
                <p className="text-sm text-neutral-500 leading-relaxed">
                  URPASS sends webhook events to your server when important actions occur — such as
                  a subscription payment or a paid event ticket purchase. Configure your webhook
                  endpoint in the{" "}
                  <strong className="text-neutral-800">Razorpay Dashboard → Webhooks</strong> and
                  point it to:
                </p>
                <div className="mt-4 flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3">
                  <code className="text-xs font-mono text-neutral-800 flex-1 break-all">
                    https://urpass.space/api/webhook/razorpay
                  </code>
                </div>
              </div>

              {/* Signature verification */}
              <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden mb-4">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-neutral-100">
                  <Shield className="w-4 h-4 text-neutral-400" />
                  <h3 className="text-sm font-semibold text-neutral-800">Signature verification</h3>
                </div>
                <div className="px-6 py-5">
                  <p className="text-sm text-neutral-500 mb-4">
                    Every webhook request includes an{" "}
                    <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono">x-razorpay-signature</code>{" "}
                    header. URPASS verifies this using HMAC-SHA256 with your{" "}
                    <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono">RAZORPAY_WEBHOOK_SECRET</code>.
                    Requests with an invalid signature are rejected with <code className="bg-neutral-100 px-1.5 py-0.5 rounded text-xs font-mono">400</code>.
                  </p>
                  <div className="bg-neutral-950 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <pre className="text-neutral-300 whitespace-pre">{`import crypto from "crypto";

const expected = crypto
  .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
  .update(rawBody)
  .digest("hex");

const valid = crypto.timingSafeEqual(
  Buffer.from(expected, "hex"),
  Buffer.from(signature, "hex")
);`}</pre>
                  </div>
                </div>
              </div>

              {/* Event types */}
              <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden mb-4">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <h3 className="text-sm font-semibold text-neutral-800">Event types</h3>
                </div>

                {/* payment.captured — subscription */}
                <div className="px-6 py-5 border-b border-neutral-50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold text-neutral-900">payment.captured</span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded-full font-semibold">Subscription</span>
                  </div>
                  <p className="text-sm text-neutral-500 mb-4">
                    Fired when a user successfully pays for a Starter or Pro subscription.
                    URPASS activates the subscription automatically.
                  </p>
                  <div className="bg-neutral-950 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <pre className="text-neutral-300 whitespace-pre">{`{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_XXXXXXXX",
        "amount": 35282,
        "currency": "INR",
        "notes": {
          "user_id": "uuid",
          "plan_id": "uuid",
          "plan_slug": "pro"
        }
      }
    }
  }
}`}</pre>
                  </div>
                </div>

                {/* payment.captured — ticket */}
                <div className="px-6 py-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-semibold text-neutral-900">payment.captured</span>
                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-1.5 py-0.5 rounded-full font-semibold">Ticket</span>
                  </div>
                  <p className="text-sm text-neutral-500 mb-4">
                    Fired when an attendee pays for a ticket on a paid event.
                    URPASS marks the <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-xs">ticket_orders</code> record
                    as <code className="bg-neutral-100 px-1.5 py-0.5 rounded font-mono text-xs">paid</code> and the attendee application is recorded.
                  </p>
                  <div className="bg-neutral-950 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                    <pre className="text-neutral-300 whitespace-pre">{`{
  "event": "payment.captured",
  "payload": {
    "payment": {
      "entity": {
        "id": "pay_XXXXXXXX",
        "order_id": "order_XXXXXXXX",
        "amount": 49900,
        "currency": "INR",
        "notes": {
          "type": "ticket",
          "event_id": "uuid",
          "buyer_name": "Arun Kumar",
          "buyer_email": "arun@example.com"
        }
      }
    }
  }
}`}</pre>
                  </div>
                </div>
              </div>

              {/* Setup steps */}
              <div className="bg-white border border-neutral-100 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-neutral-800 mb-5">Setup checklist</h3>
                <div className="flex flex-col gap-0">
                  {[
                    ["Add the URPASS webhook URL in Razorpay Dashboard → Webhooks", "https://urpass.space/api/webhook/razorpay"],
                    ["Select the event type: payment.captured", null],
                    ["Copy the Webhook Secret from Razorpay and add it to your Railway/Vercel environment as RAZORPAY_WEBHOOK_SECRET", null],
                    ["Test with a real payment — the Razorpay dashboard shows delivery status and lets you retry", null],
                  ].map(([step, code], i) => (
                    <div key={i} className="flex gap-4 pb-5 border-b border-neutral-100 last:border-0 last:pb-0 mb-5 last:mb-0">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-0.5"
                        style={{ background: "#6D28D9" }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-neutral-600">{step as string}</p>
                        {code && (
                          <code className="mt-1.5 block text-xs font-mono text-brand bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-lg">
                            {code as string}
                          </code>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ── FAQ ─────────────────────────────────────────────── */}
            <SectionAnchor id="faq" />
            <section className="mb-12">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                </div>
                <h2 className="text-xl font-bold text-neutral-900">Frequently asked questions</h2>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  {
                    q: "Do attendees need to install an app?",
                    a: "No. Attendees receive a link to their digital pass. The pass opens in any browser on any device — no app download needed.",
                  },
                  {
                    q: "Can I use URPASS for offline events?",
                    a: "Yes. The scanner works on any smartphone with a camera and a mobile data connection. Passes are verified in real time, so an internet connection is required at the venue.",
                  },
                  {
                    q: "What happens if I exceed my attendee limit?",
                    a: "When an event reaches its attendee limit, new approvals are blocked automatically. You'll see a warning on the dashboard. Upgrade your plan or increase the event's attendee limit in Settings.",
                  },
                  {
                    q: "Can multiple people scan at the same entrance?",
                    a: "Yes. Open urpass.space/scan on multiple phones simultaneously. Each scan is validated server-side, so duplicates are rejected regardless of which device first scanned the QR.",
                  },
                  {
                    q: "Can I send passes to attendees by email?",
                    a: "Yes. When you generate a pass or approve an auto-approve application, the attendee automatically receives an email with their pass link.",
                  },
                  {
                    q: "What is the public application form?",
                    a: "When you enable the 'Public application form' toggle on an event, URPASS generates a unique URL (e.g. urpass.space/apply/your-slug). Share this link and anyone can register. Applications appear as Pending until you approve them (or use auto-approve).",
                  },
                  {
                    q: "Is my data stored securely?",
                    a: "Yes. URPASS is built on Supabase (PostgreSQL) with row-level security. Attendee data is only accessible by the event organizer. Payments are processed by Razorpay — we never store card details.",
                  },
                ].map(({ q, a }) => (
                  <div key={q} className="bg-white border border-neutral-100 rounded-2xl p-5">
                    <p className="text-sm font-semibold text-neutral-900 mb-2">{q}</p>
                    <p className="text-sm text-neutral-500 leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Support CTA */}
            <div className="bg-neutral-900 rounded-2xl p-7 text-center">
              <div
                className="w-10 h-10 rounded-xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #6D28D9, #4c1d95)" }}
              >
                <Star className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Still have questions?</h3>
              <p className="text-sm text-white/50 mb-5">
                Our support team is available via email — usually within 24 hours.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <a
                  href="mailto:support@urpass.space"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 transition-colors"
                >
                  support@urpass.space
                </a>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-900 bg-white px-5 py-2.5 rounded-xl hover:bg-neutral-50 transition-colors"
                >
                  Start for free
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </>
  );
}
