import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Read the URPASS Terms and Conditions governing use of our digital event pass and QR check-in platform.",
  alternates: { canonical: "https://urpass.space/terms" },
};

const EFFECTIVE_DATE = "1 August 2025";
const CONTACT_EMAIL = "support@urpass.space";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-base font-semibold text-neutral-900 mb-3">{title}</h2>
      <div className="text-sm text-neutral-600 leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-5 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-900 transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>

        <p className="text-xs font-semibold tracking-widest uppercase text-brand mb-2">Legal</p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 mb-2">
          Terms and Conditions
        </h1>
        <p className="text-sm text-neutral-400 mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using URPASS (&quot;Service&quot;), you agree to be bound by these Terms and
            Conditions (&quot;Terms&quot;). If you do not agree, do not use the Service. These Terms apply
            to all visitors, users, and others who access or use the Service.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>
            URPASS is a digital event pass management platform that allows event organizers to create
            events, manage attendees, generate QR-coded digital passes, and check in attendees at
            entry. The Service is operated by URPASS and is available at urpass.space.
          </p>
          <p>
            We offer Free, Starter, and Pro subscription plans. Features and limits vary by plan as
            described on our Pricing page.
          </p>
        </Section>

        <Section title="3. Accounts and Registration">
          <p>
            You must provide accurate and complete information when creating an account. You are
            responsible for maintaining the security of your account credentials. URPASS is not
            liable for any loss or damage arising from your failure to safeguard your account.
          </p>
          <p>
            You must be at least 18 years of age to create an account. By registering, you represent
            that you meet this requirement.
          </p>
        </Section>

        <Section title="4. Permitted Use">
          <p>You agree to use the Service only for lawful purposes. You must not:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Upload or transmit any content that is fraudulent, misleading, or illegal.</li>
            <li>Use the Service to conduct or facilitate any unlawful activity.</li>
            <li>Attempt to gain unauthorised access to any part of the Service.</li>
            <li>Reverse-engineer, decompile, or disassemble any part of the Service.</li>
            <li>Interfere with or disrupt the integrity or performance of the Service.</li>
            <li>Use automated means (bots, scrapers) to access the Service without permission.</li>
          </ul>
        </Section>

        <Section title="5. Payments and Subscriptions">
          <p>
            Paid plans (Starter, Pro) are billed monthly. Prices are listed in Indian Rupees (INR)
            and are inclusive of 18% GST as required under Indian tax law. Payments are processed
            securely via Razorpay.
          </p>
          <p>
            Subscriptions automatically renew at the end of each billing period unless cancelled
            before the renewal date. You may cancel at any time from your Billing page; access to
            paid features continues until the end of the current billing period.
          </p>
          <p>
            Paid event ticket payments made by attendees are collected by the event organiser via
            Razorpay. URPASS acts solely as the technology platform and is not responsible for
            disputes between organisers and attendees regarding event tickets.
          </p>
          <p>
            Refunds for subscription payments are at our discretion. Ticket refunds for paid events
            are the sole responsibility of the event organiser.
          </p>
        </Section>

        <Section title="6. API Access">
          <p>
            API access is available exclusively to Pro plan subscribers. API keys must be kept
            confidential. You are responsible for all activity conducted via your API keys. URPASS
            reserves the right to revoke API keys that violate these Terms or our Fair Use Policy.
          </p>
          <p>
            API rate limits apply. Excessive usage that degrades service for other users may result
            in temporary or permanent suspension of API access.
          </p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>
            The Service and its original content, features, and functionality are owned by URPASS
            and are protected by applicable intellectual property laws. You retain ownership of any
            event data, attendee information, and content you submit through the Service.
          </p>
          <p>
            By submitting content, you grant URPASS a limited, non-exclusive, royalty-free licence to
            use, store, and display your content solely to provide the Service.
          </p>
        </Section>

        <Section title="8. Privacy">
          <p>
            Your use of the Service is also governed by our Privacy Policy. By using the Service,
            you consent to the collection and use of information as described therein.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable law, URPASS and its affiliates, officers,
            employees, agents, and licensors shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages, including loss of profits, data, or goodwill,
            arising out of or in connection with your use of the Service.
          </p>
          <p>
            Our total aggregate liability to you for any claims arising from or related to these Terms
            or the Service shall not exceed the amount you paid us (if any) in the twelve months
            preceding the claim.
          </p>
        </Section>

        <Section title="10. Disclaimer of Warranties">
          <p>
            The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of
            any kind, either express or implied, including, but not limited to, implied warranties of
            merchantability, fitness for a particular purpose, or non-infringement.
          </p>
        </Section>

        <Section title="11. Termination">
          <p>
            We reserve the right to suspend or terminate your account at our sole discretion, with or
            without notice, if we believe you have violated these Terms. Upon termination, your right
            to use the Service will immediately cease.
          </p>
          <p>
            You may delete your account at any time by contacting us. Deletion removes your profile
            but may not immediately remove event and attendee records generated under your account.
          </p>
        </Section>

        <Section title="12. Governing Law">
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India.
            Any disputes shall be subject to the exclusive jurisdiction of the courts located in
            Tamil Nadu, India.
          </p>
        </Section>

        <Section title="13. Changes to Terms">
          <p>
            We reserve the right to modify these Terms at any time. If we make material changes, we
            will notify you by email or by posting a notice on the Service. Your continued use of the
            Service after changes become effective constitutes acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="14. Contact">
          <p>
            If you have questions about these Terms, please contact us at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-brand underline underline-offset-2">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>

        <div className="pt-8 border-t border-neutral-100">
          <Link
            href="/"
            className="text-sm text-brand hover:underline underline-offset-2"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
