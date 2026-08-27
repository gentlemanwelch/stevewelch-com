"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { img } from "@/content/media-manifest";

/**
 * Site header — the wordmark and a hamburger menu at every width.
 *
 * TWO DELIBERATE CHOICES, both matching the original:
 *
 * 1. The logo is the actual wordmark SVG, not the name set in Poppins. It was
 *    sitting unused in public/media the whole time.
 *
 * 2. The menu is a hamburger on DESKTOP as well as mobile. That is unusual, and
 *    it is what the original does — it keeps the hero uncluttered, and since
 *    most traffic here is mobile it means one navigation behaviour to get right
 *    instead of two.
 *
 * CRAWLABILITY: the menu panel is always in the DOM and hidden with CSS, never
 * conditionally rendered. Rendering it only when open would remove every
 * internal link from the HTML that crawlers and AI bots actually read — and on
 * a site whose whole strategy is internal linking between the pillar pages,
 * that would quietly undo the SEO work. `inert` keeps the hidden panel out of
 * the tab order and the accessibility tree without removing it from the markup.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on Escape — expected of anything that overlays the page.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <Link href="/" aria-label={`${site.name} — home`} className="block">
          <Image
            src={img.logo}
            alt={site.name}
            width={2938}
            height={401}
            priority
            className="h-7 w-auto sm:h-8"
          />
        </Link>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 p-2 text-[var(--color-navy)]"
        >
          <svg width="30" height="24" viewBox="0 0 30 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            {open ? (
              <path d="M4 4l22 16M26 4L4 20" strokeLinecap="round" />
            ) : (
              <>
                <path d="M2 4h26" strokeLinecap="round" />
                <path d="M2 12h26" strokeLinecap="round" />
                <path d="M2 20h26" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/*
        Always rendered. `grid-template-rows` animates from 0fr to 1fr, which is
        the one way to transition to an unknown content height in CSS without
        measuring it in JavaScript.
      */}
      <nav
        id="site-menu"
        aria-label="Main"
        inert={!open || undefined}
        className={`grid overflow-hidden border-t border-[var(--color-line)] bg-white transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr] border-t-0"
        }`}
      >
        <div className="min-h-0">
          <ul className="mx-auto w-full max-w-6xl px-6 py-2 sm:px-8">
            {site.nav.map((item) => (
              <li key={item.href} className="border-b border-[var(--color-line)] last:border-0">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block py-4 text-lg font-semibold transition-colors hover:text-[var(--color-coral)] ${
                    isActive(item.href) ? "text-[var(--color-coral)]" : "text-[var(--color-navy)]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mx-auto w-full max-w-6xl px-6 pb-6 pt-2 sm:px-8">
            <Link
              href="/contact/"
              onClick={() => setOpen(false)}
              className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-coral)] px-7 py-3 font-bold text-white transition-colors hover:bg-[var(--color-coral-dark)]"
            >
              Book Steve to Speak
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
