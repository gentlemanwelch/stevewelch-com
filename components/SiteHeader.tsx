"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { site } from "@/content/site";

/**
 * The header carries one job beyond navigation: the booking CTA is visible on
 * every page, at every scroll position on mobile, because the site has exactly
 * one conversion and burying it behind a menu costs inquiries.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[var(--color-canvas)]/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4 sm:px-8">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-ink)]"
        >
          {site.name}
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-7 md:flex">
          {site.nav.map((item) => {
            /*
              Contact is styled as the primary action rather than a plain link.
              The WordPress nav treats it as an ordinary item; this is the one
              navigation change, and it is here because the site has exactly one
              conversion and a booker should never have to hunt for it.
            */
            const isCta = item.href === "/contact/";
            if (isCta) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full bg-[var(--color-accent)] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-ink)]"
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`text-sm font-medium transition-colors hover:text-[var(--color-ink)] ${
                  isActive(item.href)
                    ? "text-[var(--color-ink)]"
                    : "text-[var(--color-ink-faint)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="md:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
            {open ? (
              <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
            ) : (
              <path d="M3 12h18M3 6h18M3 18h18" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="border-t border-[var(--color-line)] bg-[var(--color-canvas)] md:hidden"
        >
          <ul className="mx-auto max-w-5xl px-6 py-3 sm:px-8">
            {site.nav.map((item) => (
              <li key={item.href} className="border-b border-[var(--color-line)] last:border-0">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className="block py-3 text-[0.95rem] font-medium text-[var(--color-ink)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
