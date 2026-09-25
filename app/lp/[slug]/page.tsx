import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { landingPages, getLandingPage, landingLabels } from "@/content/landing-pages";
import { site } from "@/content/site";
import { speakingEngagementLogos, workedWithLogos } from "@/content/media-manifest";
import { Button, Container, Section } from "@/components/primitives";
import { Wordmark } from "@/components/Wordmark";
import { LandingInquiryForm } from "@/components/LandingInquiryForm";
import { PageHero } from "@/components/kit/PageHero";
import { SquareList } from "@/components/kit/SquareList";
import { StatRow } from "@/components/kit/StatRow";
import { LogoStrip } from "@/components/kit/LogoStrip";
import { Testimonials } from "@/components/kit/Testimonials";
import { CtaBand } from "@/components/kit/CtaBand";

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
  const location = `lp_${page.slug}`;

  return (
    <>
      {/* Minimal header: the wordmark, and nothing to click away with. It is
          deliberately NOT a link — even "home" is an exit here. */}
      <header className="border-b border-line bg-white">
        <Container className="flex min-h-[4.5rem] items-center">
          <p className="text-navy"><Wordmark /></p>
        </Container>
      </header>

      {/*
        The single h1 echoes the ad headline near-verbatim — message match is
        what keeps bounce down and Quality Score up. The form sits beside it,
        on the first screen, on every one of these pages. On a phone it
        follows the bullets directly; the quote that used to sit between them
        moved down the page so it no longer pushes the form away.
      */}
      <PageHero
        title={page.headline}
        lede={page.subhead}
        aside={
          <div id="inquire" className="scroll-mt-6 rounded-[var(--radius-base)] bg-white p-6 text-ink-soft sm:p-8">
            <h2 className="!text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-extrabold">{page.ctaLabel}</h2>
            <p className="mt-2 text-[0.9375rem]">{landingLabels.formNote}</p>
            <div className="mt-6">
              <LandingInquiryForm campaign={page.slug} ctaLabel={page.ctaLabel} />
            </div>
          </div>
        }
      >
        {/* Phones only: the form follows the subhead and bullets, most of a
            screen down, so the action is offered where the reading stops.
            From lg the form itself is beside the headline. */}
        <Button
          href="#inquire"
          glyph="arrow"
          track="check_availability_click"
          trackLocation={`${location}_hero`}
          className="mb-8 w-full min-[420px]:w-auto lg:hidden"
        >
          {page.ctaLabel}
        </Button>
        <SquareList items={page.bullets} tone="dark" className="text-white/90" />
      </PageHero>

      <Section>
        <Container>
          <StatRow stats={page.proof} />
        </Container>
      </Section>

      {logos && page.logos && page.logos !== "none" && (
        <Section tone="alt">
          <Container>
            <h2 className="eyebrow mb-12 text-center !text-[0.8125rem] !font-semibold !tracking-[0.18em] text-ink-faint lg:mb-14">
              {landingLabels.logoHeadings[page.logos]}
            </h2>
            <LogoStrip logos={logos} layout={logos.length > 6 ? "grid" : "row"} />
          </Container>
        </Section>
      )}

      <Section>
        <Container>
          <Testimonials />
        </Container>
      </Section>

      {/* Back up to the form, rather than on to another page. */}
      <CtaBand
        heading={landingLabels.closing.heading}
        body={landingLabels.closing.body}
        primary={{ label: page.ctaLabel, href: "#inquire", track: "check_availability_click" }}
        location={location}
      />

      {/* Legal links only. Still no route back into the site. */}
      <footer className="bg-white py-8">
        <Container className="text-center text-[0.875rem] text-ink-faint">
          © {new Date().getFullYear()} {site.name} ·{" "}
          <a href="/privacy-policy/" className="inline-block py-2 underline underline-offset-2">
            {landingLabels.privacy}
          </a>
        </Container>
      </footer>
    </>
  );
}
