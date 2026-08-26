import Link from "next/link";
import { site } from "@/content/site";
import { speakingPillars, hyperWellness } from "@/content/speaking";

/**
 * The footer is the site's internal-linking backbone. Every talk page is
 * reachable from every other page through it, which is how a crawler discovers
 * the deep pages and how authority earned by any one page is shared with the
 * rest. It is also where a booker who scrolled to the bottom without deciding
 * gets one last, plainly-worded route to making contact.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-surface-alt)]">
      <div className="mx-auto w-full max-w-5xl px-6 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
              {site.name}
            </p>
            <p className="mt-2 max-w-xs text-sm text-[var(--color-ink-faint)]">{site.tagline}</p>
          </div>

          <nav aria-labelledby="footer-talks">
            <h2 id="footer-talks" className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)]">
              Speaking
            </h2>
            <ul className="mt-3 space-y-2">
              {[...speakingPillars, hyperWellness].map((pillar) => (
                <li key={pillar.slug}>
                  <Link
                    href={`/speaking/${pillar.slug}/`}
                    className="text-sm text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-accent)]"
                  >
                    {pillar.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-site">
            <h2 id="footer-site" className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)]">
              Site
            </h2>
            <ul className="mt-3 space-y-2">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-accent)]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-elsewhere">
            <h2 id="footer-elsewhere" className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)]">
              Elsewhere
            </h2>
            <ul className="mt-3 space-y-2">
              <li>
                <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-accent)]">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={site.social.substack} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-accent)]">
                  Newsletter
                </a>
              </li>
              <li>
                <Link href="/press-kit/" className="text-sm text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-accent)]">
                  Press kit
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy/" className="text-sm text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-accent)]">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-and-conditions/" className="text-sm text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-accent)]">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="text-sm text-[var(--color-ink-faint)] transition-colors hover:text-[var(--color-accent)]">
                  {site.email}
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-12 border-t border-[var(--color-line)] pt-6 text-xs text-[var(--color-ink-faint)]">
          © {year} {site.name}. Booking inquiries come directly to Steve — there is no agency in between.
        </p>
      </div>
    </footer>
  );
}
