import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { img } from "@/content/media-manifest";

/**
 * Site footer — rebuilt for Built for Change (01_HOMEPAGE_COPY §13).
 *
 * Deliberately quiet. The packet's final section, "What do you need your
 * audience to leave with?", sits directly above this on the homepage and
 * carries the booking ask; a second ask in the footer would compete with it.
 * So this is navigation, the active social accounts, the legal links, and the
 * brand line — nothing else.
 *
 * SOCIAL: "LinkedIn · YouTube (and other currently active social accounts
 * only)". LinkedIn and Substack are the active accounts on record in
 * content/site.ts. There is NO YouTube channel URL on record — the speaking
 * reel lives on YouTube, but a video is not a channel — so none is linked.
 * Add it to `site.social` when there is one; it will appear here, in the
 * Person schema's `sameAs`, and in llms.txt automatically.
 *
 * The wordmark is the header SVG inverted with a filter rather than the
 * theme's white variant, which sets its text as an SVG <text> element in a
 * font it does not embed and so renders in whatever fallback the browser picks.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  /* py-2 is target size, not spacing: WCAG 2.2's 24px minimum. */
  const link = "inline-block py-2 text-[0.9375rem] text-white/75 transition-colors hover:text-white";

  const social = [
    { href: site.social.linkedin, label: "LinkedIn" },
    { href: site.social.substack, label: "Substack" },
  ];

  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto w-full max-w-[var(--container-wide)] px-5 pb-10 pt-16 sm:px-8 lg:px-12 lg:pt-24">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <Link href="/" aria-label={`${site.name} — home`} className="inline-block">
              <Image
                src={img.logo}
                alt={site.name}
                width={2938}
                height={401}
                className="h-6 w-auto brightness-0 invert sm:h-7"
              />
            </Link>
            {/* The brand line. Not a heading — it names nothing below it. */}
            <p className="display-lg mt-8 text-white">{site.brand.line}</p>
          </div>

          <nav aria-label="Footer">
            <ul className="grid grid-cols-2 gap-x-8 sm:grid-cols-3">
              {site.footerNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={link}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap gap-x-6">
            {social.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className={link}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-6 text-[0.8125rem] text-white/60">
            <Link href="/privacy-policy/" className="inline-block py-2 hover:text-white">Privacy</Link>
            <Link href="/terms-and-conditions/" className="inline-block py-2 hover:text-white">Terms</Link>
            <span className="py-2">© {year} {site.name}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
