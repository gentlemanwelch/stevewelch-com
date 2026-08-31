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
              Inquiries come directly to Steve’s team — there is no agency in between.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 lg:justify-end">
              <Link
                href="/contact/"
                className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-coral)] px-7 py-3 font-bold text-white transition-colors hover:bg-[var(--color-coral-dark)]"
              >
                Check availability
              </Link>
              {/*
                A labelled button, not an icon. The original footer carries a
                blue pill reading "Follow on LinkedIn" beside the booking ask;
                the first build shrank it to a bare glyph in a circle, which
                loses both the word and the weight. LinkedIn is where Steve is
                actually active, so it earns a button.

                Blue rather than coral: "Check availability" beside it is the
                primary action and has to stay the loudest thing in the footer.
              */}
              <a
                href={site.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-blue)] px-7 py-3 font-bold text-white transition-colors hover:bg-[var(--color-blue-deep)]"
              >
                Follow on LinkedIn
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
