import type { Metadata } from "next";
import type { ReactNode } from "react";
import { adminCopy } from "@/content/admin";

/**
 * The private CRM at /admin.
 *
 * It sits outside both public layouts — app/(site)/ and app/lp/ — on purpose,
 * so it inherits none of what they add: no site header or footer, and none of
 * components/SiteScripts.tsx. That last one matters. Analytics on these pages
 * would send Google the address and the TITLE of every page opened, and a
 * lead's page is titled with the lead's name.
 *
 * Never indexed, never followed, and disallowed in robots.txt as well (see
 * app/robots.ts and the headers in next.config.ts). There is nothing here for
 * a search engine, and a sign-in page in search results is an invitation.
 *
 * THIS LAYOUT IS NOT THE GUARD. Every page under it calls `requireAdmin()`
 * itself — see the note in lib/crm/session.ts on why a layout cannot be one.
 *
 * These pages are rendered on demand, not prebuilt. They are the one
 * exception, with /api/, to the rule that everything on this site is static:
 * what they show depends on who is asking.
 */
export const metadata: Metadata = {
  title: { default: adminCopy.product, template: `%s | ${adminCopy.product}` },
  description: "Private.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
