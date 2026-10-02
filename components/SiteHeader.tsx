"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/content/site";
import { Wordmark } from "@/components/Wordmark";
import { buttonClasses } from "@/lib/buttonStyles";

/**
 * Site header — rebuilt for Built for Change (01_HOMEPAGE_COPY §1).
 *
 *   Desktop  wordmark · Speaking About Ideas Books Event Planners · [Build Your Keynote →]
 *   Mobile   wordmark · [Build Your Keynote] · menu
 *
 * THE WORDMARK is STEVE WELCH in set type — the packet's "Left: STEVE
 * WELCH", drawn that way in Steve's mockup. See components/Wordmark.tsx.
 *
 * THE MOBILE CTA is the packet's "compact CTA". It drops the arrow and shrinks
 * to fit beside the wordmark and the menu button, and it hides below 380px —
 * measured, a 320px screen cannot hold all three without horizontal scroll.
 * Nothing is lost there: the same action is the first button in the hero,
 * directly below, and inside the menu.
 *
 * STICKY at every width. The spec asks for the nav to "become sticky after the
 * hero begins scrolling"; a header that is sticky from the start is that same
 * behaviour with no scroll listener and no layout shift when it engages.
 *
 * CRAWLABILITY: both navigations are always in the DOM and hidden with CSS,
 * never conditionally rendered. Rendering the menu only when open would remove
 * every internal link from the HTML the AI crawlers read. `inert` keeps the
 * closed panel out of the tab order and the accessibility tree without
 * removing it from the markup.
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
    <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-[4.25rem] w-full max-w-[var(--container-wide)] items-center justify-between gap-2 px-5 sm:px-8 lg:h-[4.75rem] lg:px-12">
        {/* min-h-11: the link is otherwise exactly as tall as the wordmark,
            which measured under WCAG 2.2's 24px target minimum on phones. */}
        <Link href="/" aria-label={`${site.name} — home`} className="flex min-h-11 shrink-0 items-center text-navy">
          <Wordmark />
        </Link>

        {/* The bar. Hidden below lg, but present in the HTML at every width. */}
        <nav aria-label="Main" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-9">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`inline-block py-2 text-[0.9375rem] font-semibold transition-colors hover:text-action ${
                    isActive(item.href) ? "text-action" : "text-navy"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 lg:ml-9">
          {/*
            Desktop CTA, arrow included, as written in the copy.

            Visibility is set with VARIANT utilities (max-lg:hidden) rather
            than `hidden lg:inline-flex`, on purpose. The button base already
            carries `inline-flex`, and two unprefixed display utilities on one
            element resolve by Tailwind's internal ordering, not by the order
            they are written — so `hidden` could silently lose and put the
            desktop button on phones. Variant utilities are always emitted
            after base ones, so these win deterministically.
          */}
          <Link
            href={site.cta.href}
            data-track="build_your_keynote_click"
            data-track-location="header"
            className={buttonClasses("primary", "max-lg:hidden !min-h-11 !px-5 !text-[0.9375rem]")}
          >
            <span>{site.cta.label}</span>
            <span aria-hidden="true">→</span>
          </Link>

          {/* The compact mobile CTA. */}
          <Link
            href={site.cta.href}
            data-track="build_your_keynote_click"
            data-track-location="header_mobile"
            className={buttonClasses("primary", "max-[379px]:hidden lg:hidden !min-h-10 !px-3 !text-[0.8125rem]")}
          >
            {site.cta.label}
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="-mr-2 flex h-11 w-11 items-center justify-center text-navy lg:hidden"
          >
            <svg width="24" height="20" viewBox="0 0 24 20" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
              {open ? (
                <path d="M3 2l18 16M21 2L3 18" strokeLinecap="round" />
              ) : (
                <>
                  <path d="M1 2h22" strokeLinecap="round" />
                  <path d="M1 10h22" strokeLinecap="round" />
                  <path d="M1 18h22" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/*
        The small-screen panel. Always rendered; `grid-template-rows` animates
        from 0fr to 1fr, the one way to transition to an unknown height in CSS
        without measuring it in JavaScript.
      */}
      <nav
        id="site-menu"
        aria-label="Main"
        inert={!open || undefined}
        className={`grid overflow-hidden bg-white transition-[grid-template-rows] duration-300 ease-out lg:hidden ${
          open ? "grid-rows-[1fr] border-t border-line" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          <ul className="mx-auto w-full max-w-[var(--container-wide)] px-5 py-2 sm:px-8">
            {site.nav.map((item) => (
              <li key={item.href} className="border-b border-line last:border-0">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`block py-4 text-xl font-bold tracking-tight transition-colors hover:text-action ${
                    isActive(item.href) ? "text-action" : "text-navy"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mx-auto w-full max-w-[var(--container-wide)] px-5 pb-7 pt-3 sm:px-8">
            <Link
              href={site.cta.href}
              onClick={() => setOpen(false)}
              data-track="build_your_keynote_click"
              data-track-location="mobile_menu"
              className={buttonClasses("primary", "w-full")}
            >
              <span>{site.cta.label}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
