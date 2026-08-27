import Link from "next/link";
import Image from "next/image";
import { site } from "@/content/site";
import { img } from "@/content/media-manifest";

/**
 * Site footer — dark navy, matching the original.
 *
 * The first build made this a light grey four-column link farm. The original is
 * a navy block that ends the page on the booking ask, which is the right way
 * round: someone who has scrolled the whole homepage is the most qualified
 * visitor on the site, and handing them a list of links is a worse use of that
 * moment than handing them a button.
 *
 * The wordmark is the same SVG as the header, inverted to white with a filter
 * rather than swapped for the theme's white variant — that file sets its text
 * as an SVG <text> element in a font it does not embed, so it renders in
 * whatever fallback the browser picks and stops matching the header.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  const linkClass =
    "text-[0.95rem] text-white/75 transition-colors hover:text-white";

  return (
    <footer className="bg-[var(--color-navy)] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
          {/* Navigation, in two columns as on the original. */}
          <div>
            <Link href="/" aria-label={`${site.name} — home`} className="inline-block">
              <Image
                src={img.logo}
                alt={site.name}
                width={2938}
                height={401}
                className="h-7 w-auto brightness-0 invert"
              />
            </Link>
            <nav aria-label="Footer" className="mt-8">
              <ul className="grid grid-cols-2 gap-x-8 gap-y-3">
                {site.nav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={linkClass}>
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/press-kit/" className={linkClass}>Press Kit</Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* The closing ask. */}
          <div className="lg:text-right">
            <h2 className="text-2xl text-white sm:text-3xl">Book Steve to Speak</h2>
            <p className="mt-3 text-[0.95rem] leading-relaxed text-white/70">
              Inquiries come directly to Steve — there is no agency in between.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 lg:justify-end">
              <Link
                href="/contact/"
                className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-coral)] px-7 py-3 font-bold text-white transition-colors hover:bg-[var(--color-coral-dark)]"
              >
                Check availability
              </Link>
              <a
                href={site.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Steve Welch on LinkedIn"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/30 text-white transition-colors hover:border-white hover:bg-white hover:text-[var(--color-navy)]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.65h.05c.53-.95 1.83-1.95 3.76-1.95 4.02 0 4.76 2.5 4.76 5.76V21h-4v-5.6c0-1.34-.02-3.06-1.9-3.06-1.9 0-2.19 1.45-2.19 2.96V21h-4z" />
                </svg>
              </a>
            </div>
            <a
              href={site.social.substack}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block text-[0.95rem] text-white/75 underline underline-offset-4 hover:text-white"
            >
              Get the newsletter
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} {site.name}. All rights reserved.</p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/privacy-policy/" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms-and-conditions/" className="hover:text-white">Terms &amp; Conditions</Link>
            <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
