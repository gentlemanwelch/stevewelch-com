import type { ReactNode } from "react";

/**
 * Landing pages get their own layout with NO site header or footer.
 *
 * That is the point of them. Every navigation link on a paid landing page is an
 * exit that the click was paid for; a visitor who wanders off to read the
 * foundation page is a visitor whose click cost money and produced nothing.
 * These pages carry one action.
 *
 * The root layout still wraps this (fonts, JSON-LD, skip link), so the entity
 * markup and typography stay consistent — only the chrome is removed.
 */
export default function LandingLayout({ children }: { children: ReactNode }) {
  return <main id="main" className="min-h-screen">{children}</main>;
}
