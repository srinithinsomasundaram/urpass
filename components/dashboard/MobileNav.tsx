"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, QrCode, CreditCard, Settings } from "lucide-react";

const leftTabs = [
  { label: "Home", href: "/dashboard", icon: Home, exact: true },
  { label: "Events", href: "/dashboard/events", icon: Calendar, exact: false },
];

const rightTabs = [
  { label: "Billing", href: "/billing", icon: CreditCard, exact: false },
  { label: "Settings", href: "/dashboard/settings", icon: Settings, exact: false },
];

function Tab({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center gap-1 py-1 transition-all"
    >
      <span
        className={`flex items-center justify-center w-10 h-8 rounded-xl transition-all ${
          active ? "bg-brand-50" : ""
        }`}
      >
        <Icon
          className={`w-5 h-5 transition-colors ${
            active ? "text-brand" : "text-neutral-400"
          }`}
        />
      </span>
      <span
        className={`text-[10px] font-semibold leading-none transition-colors ${
          active ? "text-brand" : "text-neutral-400"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export default function MobileNav() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const scanActive = pathname.startsWith("/scan");

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50">
      {/* Frosted glass bar */}
      <div className="relative bg-white/95 backdrop-blur-2xl border-t border-neutral-100 shadow-[0_-8px_32px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around px-3 pt-3 pb-8 max-w-lg mx-auto">
          {/* Left tabs */}
          {leftTabs.map(({ href, icon, label, exact }) => (
            <Tab
              key={href}
              href={href}
              icon={icon}
              label={label}
              active={isActive(href, exact)}
            />
          ))}

          {/* Center Scan button */}
          <div className="flex flex-col items-center gap-1 px-2">
            <Link
              href="/scan"
              className="flex items-center justify-center w-14 h-14 rounded-2xl transition-all hover:scale-95 active:scale-90"
              style={{
                background: "linear-gradient(135deg, #6D28D9 0%, #4c1d95 100%)",
                boxShadow: scanActive
                  ? "0 8px 24px rgba(109,40,217,0.45)"
                  : "0 4px 16px rgba(109,40,217,0.30)",
              }}
            >
              <QrCode className="w-6 h-6 text-white" />
            </Link>
            <span
              className={`text-[10px] font-semibold leading-none ${
                scanActive ? "text-brand" : "text-neutral-400"
              }`}
            >
              Scan
            </span>
          </div>

          {/* Right tabs */}
          {rightTabs.map(({ href, icon, label, exact }) => (
            <Tab
              key={href}
              href={href}
              icon={icon}
              label={label}
              active={isActive(href, exact)}
            />
          ))}
        </div>
      </div>
    </nav>
  );
}
