"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function EventSubNav({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const base = `/event/${eventId}`;

  const tabs = [
    { label: "Overview", href: base, exact: true },
    { label: "Attendees", href: `${base}/attendees`, exact: false },
    { label: "Settings", href: `${base}/settings`, exact: false },
  ];

  return (
    <nav className="flex gap-0 -mb-px">
      {tabs.map(({ label, href, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "px-4 py-2.5 text-sm border-b-2 transition-colors",
              active
                ? "border-brand text-brand font-semibold"
                : "border-transparent text-neutral-400 hover:text-neutral-700"
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
