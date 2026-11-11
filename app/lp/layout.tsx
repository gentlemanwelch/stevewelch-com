import type { ReactNode } from "react";
import { SiteScripts } from "@/components/SiteScripts";

/**
 * Landing pages get their own layout with NO site header or footer.
 *
 * That is the point of them. Every navigation link on a paid landing page is an
 * exit that the click was paid for; a visitor who wanders off to read the
 * foundation page is a visitor whose click cost money and produced nothing.
 * These pages carry one action.
 *
 * The root layout still wraps this (fonts, skip link), and SiteScripts adds
 * the entity markup and the analytics that every public page carries — the
 * attribution capture in it is the reason these pages exist. Only the chrome
 * is removed.
 */
export default function LandingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <main id="main" className="min-h-screen">{children}</main>
      <SiteScripts />
    </>
  );
}
