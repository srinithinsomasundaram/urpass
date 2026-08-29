"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "Do attendees need an account?",
    a: "No. Attendees apply through a public link and receive their pass without creating an account.",
  },
  {
    q: "Do attendees need an app?",
    a: "No. Their digital pass works directly in any mobile browser. No app download required.",
  },
  {
    q: "Can I use URPASS for college events?",
    a: "Yes — it's designed exactly for this. Workshops, hackathons, seminars, fests, community meetups.",
  },
  {
    q: "How does check-in work?",
    a: "Each approved attendee gets a unique QR pass. Staff opens the scanner on any device, scans the QR, and URPASS instantly validates and records the check-in.",
  },
  {
    q: "Can one pass be scanned twice?",
    a: "No. Each pass can only be checked in once. If a second scan is attempted, URPASS shows an 'Already Checked In' result with the original time.",
  },
  {
    q: "Can I start for free?",
    a: "Yes. The free plan lets you run one event with up to 50 attendees — no credit card required.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="py-28 px-5 sm:px-8 bg-white">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-center mb-14">
          Questions
        </h2>

        <div className="flex flex-col divide-y divide-neutral-100">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left gap-4"
              >
                <span className="text-sm font-medium text-neutral-900">
                  {faq.q}
                </span>
                <span className="shrink-0 text-neutral-400">
                  {open === i ? (
                    <Minus className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                </span>
              </button>
              {open === i && (
                <p className="pb-5 text-sm text-neutral-500 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
