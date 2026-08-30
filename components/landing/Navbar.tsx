"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-neutral-100 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-semibold tracking-tight text-base text-neutral-900">
          URPASS
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#how-it-works"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            How it works
          </a>
          <Link
            href="/pricing"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Contact
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-neutral-900 text-white px-4 py-2 rounded-xl font-medium hover:bg-neutral-700 transition-colors"
          >
            Create event
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-b border-neutral-100 px-5 py-5 flex flex-col gap-4">
          <a
            href="#how-it-works"
            onClick={() => setOpen(false)}
            className="text-sm text-neutral-600 py-1"
          >
            How it works
          </a>
          <Link
            href="/pricing"
            onClick={() => setOpen(false)}
            className="text-sm text-neutral-600 py-1"
          >
            Pricing
          </Link>
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="text-sm text-neutral-600 py-1"
          >
            Contact
          </Link>
          <div className="pt-2 border-t border-neutral-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="text-sm text-center border border-neutral-200 rounded-xl py-2.5 font-medium hover:bg-neutral-50 transition-colors"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="text-sm text-center bg-neutral-900 text-white rounded-xl py-2.5 font-medium hover:bg-neutral-700 transition-colors"
            >
              Create event
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
