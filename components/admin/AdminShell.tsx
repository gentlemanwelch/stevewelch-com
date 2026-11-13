import type { ReactNode } from "react";
import Link from "next/link";
import { site } from "@/content/site";
import { adminCopy } from "@/content/admin";

/**
 * The frame around every signed-in CRM screen: the menu, and the page.
 *
 * Drawn to the CRM mockups Steve signed off (11 November 2026). On a wide
 * screen the menu is a navy column on the left. On a phone it is a navy bar
 * with a Menu button, as the phone mockups draw it.
 *
 * NO CLIENT JAVASCRIPT. The phone menu is a <details> element, which opens
 * and closes on its own, and Sign out is a form that posts. A screen that
 * shows a prospect's name should not depend on a script having loaded to let
 * its owner leave it.
 *
 * `current` is the section the page belongs to, passed in by the page. A
 * lead's own page is still "Leads".
 *
 * `needsYou` is the number beside "Leads": how many prospects need the owner
 * (see `countNeedsYou` in lib/crm/leads.ts). The page works it out and hands
 * it in, because this component reads nothing. No number is drawn for zero,
 * and none when the page could not find out.
 *
 * THIS IS NOT THE GUARD. It draws the frame; it does not check who is
 * looking. Each page calls `requireAdmin()` itself — see lib/crm/session.ts.
 */
export function AdminShell({
  current,
  needsYou,
  children,
}: {
  current: string;
  needsYou?: number | null;
  children: ReactNode;
}) {
  const { shell, sections, product } = adminCopy;

  const links = (onDark: string) =>
    sections.map((section) => {
      const active = section.href === current;
      return (
        <Link
          key={section.href}
          href={section.href}
          aria-current={active ? "page" : undefined}
          className={`flex min-h-11 items-center gap-2 rounded-[var(--radius-base)] px-3 py-2 text-[15px] text-white ${
            active ? "bg-white/[0.14] font-bold" : `font-medium ${onDark}`
          }`}
        >
          {section.label}
          {section.href === "/admin/" && needsYou ? (
            <span className="ml-auto min-w-[22px] rounded-[11px] bg-warn px-1.5 py-px text-center text-[12px] font-bold text-navy">
              {needsYou}
              <span className="sr-only">{` ${needsYou === 1 ? shell.needsYouOne : shell.needsYouMany}`}</span>
            </span>
          ) : null}
        </Link>
      );
    });

  const signOut = (
    <form method="post" action="/api/admin/auth/sign-out/">
      <button type="submit" className="cursor-pointer text-cyan underline underline-offset-2">
        {shell.signOut}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-tint-warm text-[14px] leading-[1.55] text-ink-soft md:flex">
      {/* Phone: a bar with a menu. */}
      <header className="flex items-center justify-between bg-navy px-4 py-3.5 text-white md:hidden">
        <p className="text-[15px] font-extrabold uppercase leading-normal tracking-[0.08em]">{product}</p>
        <details className="relative">
          <summary
            aria-label={shell.menu}
            className="flex h-11 w-11 cursor-pointer list-none items-center justify-center [&::-webkit-details-marker]:hidden"
          >
            <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </summary>
          <nav
            aria-label={shell.sectionsLabel}
            className="absolute right-0 top-full z-10 mt-2 flex w-56 flex-col gap-1 rounded-[var(--radius-base)] bg-navy-deep p-2"
          >
            {links("hover:bg-white/10")}
            <div className="mx-3 mt-2 border-t border-white/20 pb-2 pt-3 text-[13px] leading-[1.6] text-white/80">
              {shell.signedInAs}
              {signOut}
            </div>
          </nav>
        </details>
      </header>

      {/* Wide screens: a column. */}
      <nav
        aria-label={shell.sectionsLabel}
        className="hidden w-[216px] shrink-0 flex-col gap-1 bg-navy px-3.5 py-6 text-white md:flex"
      >
        <p className="mx-3 text-[16px] font-extrabold uppercase leading-normal tracking-[0.08em]">{site.name}</p>
        <p className="mx-3 mb-5 text-[13px] text-cyan">{product}</p>
        {links("hover:bg-white/10")}
        <div className="mx-3 mt-8 border-t border-white/20 pt-4 text-[13px] leading-[1.6] text-white/80">
          {shell.signedInAs}
          {signOut}
        </div>
      </nav>

      <main id="main" className="min-w-0 flex-1 px-4 pb-7 pt-5 md:px-10 md:pb-12 md:pt-8">
        {children}
      </main>
    </div>
  );
}

/** The heading block at the top of a CRM screen. */
export function AdminHeading({ heading, summary }: { heading: string; summary?: string }) {
  return (
    <div className="mb-6">
      <h1 className="text-[24px] font-extrabold leading-[1.15] tracking-[-0.02em] text-navy md:text-[28px]">
        {heading}
      </h1>
      {summary ? <p className="mt-1.5 text-[15px] leading-[1.5] text-ink-faint">{summary}</p> : null}
    </div>
  );
}

/** A white panel with a hairline, the CRM's one container. */
export function AdminPanel({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="max-w-[620px] rounded-[var(--radius-base)] border border-line bg-white px-6 py-7">
      <h2 className="text-[18px] font-bold leading-[1.3] tracking-normal text-navy">{heading}</h2>
      <div className="mt-2 text-[15px] leading-[1.6]">{children}</div>
    </div>
  );
}
