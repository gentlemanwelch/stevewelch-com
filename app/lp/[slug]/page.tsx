import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { landingPages, getLandingPage } from "@/content/landing-pages";
import { site } from "@/content/site";
import { anvilQuote } from "@/content/speaking";
import { speakingEngagementLogos, workedWithLogos } from "@/content/media-manifest";
import { Container, LogoWall, StatGrid } from "@/components/primitives";
import { LandingInquiryForm } from "@/components/LandingInquiryForm";

/**
 * Google Ads landing pages at /lp/<slug>/.
 *
 * Statically generated like everything else, so they are as fast as the organic
 * pages — which matters here in cash terms rather than in ranking terms. Google
 * scores Landing Page Experience as a Quality Score input, and Quality Score
 * moves cost-per-click, so a fast page buys the same ad position for less.
 */

export function generateStaticParams() {
  return landingPages.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) return {};

  return {
    title: page.title,
    description: page.subhead,
    /*
     * noindex, follow unless a page is explicitly marked indexable.
     *
     * These pages duplicate the organic ones by design. Letting Google index
     * them sets them competing against the pages that are meant to rank, and
     * Google — not you — picks the winner. `follow` keeps link equity flowing
     * to the real pages. Paid traffic is entirely unaffected: ads do not
     * require a page to be indexed.
     */
    robots: page.indexable
      ? { index: true, follow: true }
      : { index: false, follow: true },
    alternates: { canonical: `${site.url}/lp/${page.slug}/` },
  };
}

export default async function LandingPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getLandingPage(slug);
  if (!page) notFound();

  const logos =
    page.logos === "speaking"
      ? speakingEngagementLogos
      : page.logos === "worked-with"
        ? workedWithLogos
        : null;

  return (
    <>
      {/* Minimal header: the name, and nothing to click away with. */}
      <header className="border-b border-[var(--color-line)] bg-white">
        <Container className="py-4">
          <span className="text-lg font-bold text-[var(--color-ink)]">{site.name}</span>
        </Container>
      </header>

      <section className="bg-[var(--color-navy)] text-white">
        <Container className="py-16 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div>
              {/* The single h1. Should echo the ad headline near-verbatim —
                  message match is what keeps bounce down and Quality Score up. */}
              <h1 className="text-white">{page.headline}</h1>
              <p className="mt-6 text-lg leading-relaxed text-white/80">{page.subhead}</p>

              <ul className="mt-8 space-y-3">
                {page.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-white/90">
                    <span aria-hidden="true" className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-blue)]" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <blockquote className="mt-10 border-l-2 border-[var(--color-blue)] pl-5 text-lg italic text-white/75">
                “{anvilQuote}”
              </blockquote>
            </div>

            {/* The form sits in the hero, above the fold, on every one of these. */}
            <div id="inquire" className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
              <h2 className="text-2xl">{page.ctaLabel}</h2>
              <p className="mt-2 text-sm text-[var(--color-ink-faint)]">
                Goes straight to Steve’s team. Reply within two business days.
              </p>
              <div className="mt-6">
                <LandingInquiryForm campaign={page.slug} ctaLabel={page.ctaLabel} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-14">
        <Container>
          <StatGrid stats={page.proof} />
        </Container>
      </section>

      {logos && (
        <section className="bg-[var(--color-tint)] py-16">
          <Container>
            <LogoWall
              heading={page.logos === "speaking" ? "Speaking Engagements" : "Companies Steve has worked with"}
              logos={logos}
            />
          </Container>
        </section>
      )}

      <section className="bg-[var(--color-blue)] py-14">
        <Container className="text-center">
          <h2 className="text-white">Tell Steve about your event.</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/85">
            Date, audience, and what the session needs to accomplish.
          </p>
          <a
            href="#inquire"
            className="mt-7 inline-flex rounded-[var(--radius-pill)] bg-white px-8 py-3 font-semibold text-[var(--color-navy)]"
          >
            {page.ctaLabel}
          </a>
        </Container>
      </section>

      {/* Legal links only. Still no route back into the site. */}
      <footer className="bg-white py-8">
        <Container className="text-center text-xs text-[var(--color-ink-faint)]">
          © {new Date().getFullYear()} {site.name} ·{" "}
          <a href="/privacy-policy/" className="underline underline-offset-2">Privacy Policy</a>
        </Container>
      </footer>
    </>
  );
}
