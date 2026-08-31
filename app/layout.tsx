import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const BASE_URL = "https://urpass.space";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "URPASS — Digital Event Passes & QR Check-in",
    template: "%s | URPASS",
  },
  description:
    "Create digital event passes, manage attendees, and scan QR codes at entry — all in one platform. Built for colleges, startups, and event organizers across India.",
  keywords: [
    "digital event pass",
    "QR check-in",
    "event pass generator",
    "event management India",
    "college event management",
    "digital ticket India",
    "attendee management",
    "QR code event entry",
    "URPASS",
  ],
  authors: [{ name: "URPASS", url: BASE_URL }],
  creator: "URPASS",
  publisher: "URPASS",
  applicationName: "URPASS",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    siteName: "URPASS",
    title: "URPASS — Digital Event Passes & QR Check-in",
    description:
      "Create digital event passes, manage attendees, and scan QR codes at entry — all in one platform.",
    url: BASE_URL,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    site: "@urpass",
    creator: "@urpass",
    title: "URPASS — Digital Event Passes & QR Check-in",
    description:
      "Create digital event passes, manage attendees, and scan QR codes at entry — all in one platform.",
  },
  icons: {
    icon: [
      { url: "/favicon.gif", type: "image/gif" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  alternates: { canonical: BASE_URL },
  other: {
    "geo.region": "IN",
    "geo.placename": "India",
    "geo.position": "20.5937;78.9629",
    "ICBM": "20.5937, 78.9629",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "URPASS",
  url: BASE_URL,
  logo: `${BASE_URL}/icon.png`,
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@urpass.space",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi"],
  },
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "URPASS",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: BASE_URL,
  description:
    "Digital event pass platform with QR check-in, attendee management, and CSV import for event organizers in India.",
  offers: [
    { "@type": "Offer", name: "Free", price: "0", priceCurrency: "INR" },
    { "@type": "Offer", name: "Starter", price: "299", priceCurrency: "INR", billingIncrement: "P1M" },
    { "@type": "Offer", name: "Pro", price: "799", priceCurrency: "INR", billingIncrement: "P1M" },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "124",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <head>
        <link rel="icon" type="image/gif" href="/favicon.gif" />
        <link rel="shortcut icon" type="image/gif" href="/favicon.gif" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      </head>
      <body className="h-full font-[family-name:var(--font-geist)] antialiased bg-white text-neutral-900">
        {children}
      </body>
    </html>
  );
}
