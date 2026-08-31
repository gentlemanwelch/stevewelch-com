"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { img } from "@/content/media-manifest";

/**
 * Site header — the wordmark, a full navigation bar from lg up, a hamburger
 * below it.
 *
 * The bar is not a preference, it is what the original has: About, Books,
 * Speaking, Writings + Media, Family Foundation, Contact, ranged right in navy.
 * An earlier version of this file claimed the original used a hamburger at
 * every width and kept one here on desktop too. That was simply wrong — the
 * live site shows the full bar — and it cost a booker the ability to see the
 * Speaking page exists without clicking anything first.
 *
 * lg, not md. Six labels including "Writings + Media" and "Family Foundation"
 * need about 630px of bar; with the wordmark and the gutters that is roughly
 * 830px of header, so md (768) would crowd or wrap them. Measured at 1024 the
 * row has room to spare.
 *
 * No call-to-action button in the bar. The original's ends at Contact, and the
 * booking ask is already carried by the hero, the speaking page and the footer.
 *
 * CRAWLABILITY: both navigations are always in the DOM and hidden with CSS,
 * never conditionally rendered. Rendering the panel only when open would remove
 * every internal link from the HTML that crawlers and AI bots actually read —
 * and on a site whose whole strategy is internal linking between the pillar
 * pages, that would quietly undo the SEO work. `inert` keeps the closed panel
 * out of the tab order and the accessibility tree without removing it from the
 * markup; the two navs never claim the same landmark because whichever one is
 * display:none is not in the accessibility tree at all.
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

        {/* The bar. Hidden below lg, but present in the HTML at every width. */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`text-[1.02rem] font-semibold transition-colors hover:text-[var(--color-coral)] ${
                    isActive(item.href) ? "text-[var(--color-coral)]" : "text-[var(--color-navy)]"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="-mr-2 p-2 text-[var(--color-navy)] lg:hidden"
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
        The small-screen panel. Always rendered; `grid-template-rows` animates
        from 0fr to 1fr, which is the one way to transition to an unknown
        content height in CSS without measuring it in JavaScript.
      */}
      <nav
        id="site-menu"
        aria-label="Main"
        inert={!open || undefined}
        className={`grid overflow-hidden border-t border-[var(--color-line)] bg-white transition-[grid-template-rows] duration-300 ease-out lg:hidden ${
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
