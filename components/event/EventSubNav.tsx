"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function EventSubNav({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const base = `/event/${eventId}`;

  const tabs = [
    { label: "Overview",  href: base,                exact: true  },
    { label: "Attendees", href: `${base}/attendees`, exact: false },
    { label: "Check-ins", href: `${base}/checkins`,  exact: false },
    { label: "Settings",  href: `${base}/settings`,  exact: false },
  ];

  return (
    <nav className="flex gap-1 -mb-px">
      {tabs.map(({ label, href, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative px-3 py-2.5 text-sm transition-colors",
              active
                ? "text-neutral-900 font-semibold"
                : "text-neutral-400 hover:text-neutral-600 font-medium"
            )}
          >
            {label}
            {active && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-neutral-900" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
