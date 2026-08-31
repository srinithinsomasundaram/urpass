"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, QrCode, CreditCard, Settings } from "lucide-react";

const leftTabs = [
  { label: "Home",   href: "/dashboard",        icon: Home,     exact: true },
  { label: "Events", href: "/dashboard/events", icon: Calendar, exact: false },
];

const rightTabs = [
  { label: "Billing",  href: "/billing",            icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

function Tab({ href, icon: Icon, label, active }: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center justify-center gap-1 py-2 min-w-0 relative"
    >
      <span
        className={`flex items-center justify-center w-12 h-9 rounded-2xl transition-all duration-200 ${
          active ? "bg-brand/10" : ""
        }`}
      >
        <Icon
          className={`w-[22px] h-[22px] transition-colors duration-200 ${
            active ? "text-brand" : "text-neutral-400"
          }`}
        />
      </span>
      <span
        className={`text-[10px] font-semibold leading-none transition-colors duration-200 ${
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

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const scanActive = pathname.startsWith("/scan");

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50">
      <div
        className="relative border-t border-neutral-100/80 backdrop-blur-2xl"
        style={{
          background: "rgba(255,255,255,0.97)",
          boxShadow: "0 -1px 0 rgba(0,0,0,0.04), 0 -8px 32px rgba(0,0,0,0.06)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-end max-w-sm mx-auto px-2">
          {/* Left tabs */}
          {leftTabs.map(({ href, icon, label, exact }) => (
            <Tab key={href} href={href} icon={icon} label={label} active={isActive(href, exact)} />
          ))}

          {/* Centre scanner FAB — elevated above bar */}
          <div className="flex-none flex flex-col items-center pb-2 px-3">
            <Link
              href="/scan"
              className="flex items-center justify-center w-[58px] h-[58px] rounded-[22px] transition-all duration-200 active:scale-90 hover:scale-[1.04] -translate-y-4"
              style={{
                background: "linear-gradient(145deg, #7c3aed 0%, #4c1d95 100%)",
                boxShadow: scanActive
                  ? "0 0 0 4px rgba(109,40,217,0.2), 0 8px 24px rgba(109,40,217,0.45)"
                  : "0 4px 20px rgba(109,40,217,0.35), 0 1px 3px rgba(0,0,0,0.15)",
              }}
            >
              <QrCode className="w-[26px] h-[26px] text-white" />
            </Link>
            <span
              className={`text-[10px] font-semibold leading-none -mt-2 transition-colors duration-200 ${
                scanActive ? "text-brand" : "text-neutral-400"
              }`}
            >
              Scan
            </span>
          </div>

          {/* Right tabs */}
          {rightTabs.map(({ href, icon, label }) => (
            <Tab key={href} href={href} icon={icon} label={label} active={isActive(href)} />
          ))}
        </div>
      </div>
    </nav>
  );
}
