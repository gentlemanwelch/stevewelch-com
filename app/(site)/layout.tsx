import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

/**
 * Chrome for the public site: header, main landmark, footer.
 *
 * This lives in a route group rather than in the root layout so that /lp/
 * pages can opt out of it. A layout cannot remove chrome its parent rendered,
 * so putting the header in the root layout would have forced every paid
 * landing page to carry a full navigation bar — every link of which is an exit
 * the click was paid for.
 *
 * The route group `(site)` does not appear in URLs. /about/ is still /about/.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
