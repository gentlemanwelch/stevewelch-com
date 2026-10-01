import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/content/site";
import {
  speakingHero, speakingIntro, speakingLabels, exploreHeading, speakingPillars,
  aiChange, speakingReel,
} from "@/content/speaking";
import { hero as homeHero } from "@/content/home";
import { faqs } from "@/content/faq";
import { img, bfc, speakingEngagementLogos } from "@/content/media-manifest";
import { Container, Section, Button, JsonLd, VideoEmbed } from "@/components/primitives";
import { PageHero } from "@/components/kit/PageHero";
import { SectionHeading } from "@/components/kit/SectionHeading";
import { SquareList } from "@/components/kit/SquareList";
import { LogoStrip } from "@/components/kit/LogoStrip";
import { Testimonials } from "@/components/kit/Testimonials";
import { FaqList } from "@/components/kit/FaqList";
import { ClosingCta } from "@/components/kit/CtaBand";
import { speakingServiceSchema, closingRemarksVideoSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

/**
 * /speaking/ — the page organizers are sent to. Rebuilt for Built for Change.
 *
 * Order: who he is (hero, with the opening statement as its lede) → who has
 * booked him → the framework → the AI keynote → what an organizer and the
 * press said → the reel → the booking questions → the close.
 *
 * WHAT WENT, and why:
 *   - The photo hero with its measured washes (1.94:1 bare, a graded 60%→12%
 *     wash, a second brightened copy of the photo masked over Steve). The
 *     photograph now sits beside the copy, so nothing needs measuring.
 *   - The blue "Book Steve to Speak" band between the sections — a second
 *     booking CTA a scroll away from the first, under a synonym for it.
 *   - The podcast band at the foot. The last booking question below answers
 *     the same thing ("Is Steve available for podcasts and interviews?"), and
 *     /writings-media/ keeps its own podcast note.
 *   - Steve's cuts, 2026-09-28: the Hyper Wellness section (its topic page
 *     stays, at /speaking/hyper-wellness/), and the "Engagements start at
 *     $20,000" line under the hero buttons — the fee is still answered in
 *     the FAQ below.
 *
 * Every section is a server component; the page is static HTML.
 */
export const metadata: Metadata = buildMetadata({
  title: "Keynote Speaker — Topics, Fees and Booking",
  description:
    "Book Steve Welch to speak on driving change through purpose, people, and process — including driving change in the age of AI. Engagements start at $20,000.",
  path: "/speaking/",
  keywords: [
    "book a keynote speaker",
    "hire a keynote speaker",
    "organizational change keynote speaker",
    "ai change management speaker",
    "entrepreneurship keynote speaker",
    "wellness keynote speaker",
  ],
});

export default function SpeakingPage() {
  return (
    <>
      <JsonLd data={speakingServiceSchema()} />
      <JsonLd data={closingRemarksVideoSchema()} />

      {/*
        Steve in a fireside conversation on stage at an Oura × Restore event —
        his pick for this page (2026-09-28), "a cleaner picture" than the old
        WordPress banner. Framed on Steve, clear of the navy fade; the
        "restore" logo runs to the photograph's right edge, so laptop widths
        trim it (see `ouraStage` in content/media-manifest.ts).
      */}
      <PageHero
        eyebrow={speakingHero.eyebrow}
        title={speakingHero.heading}
        lede={speakingIntro}
        image={{ src: bfc.ouraStage, alt: bfc.ouraStageAlt, focus: "30% 70%" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Speaking", path: "/speaking/" },
        ]}
      >
        <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
          <Button href={site.cta.href} glyph="arrow" track="build_your_keynote_click" trackLocation="speaking_hero">
            {site.cta.label}
          </Button>
          <Button href="#reel" variant="outlineLight" glyph="play" track="watch_speaking_reel" trackLocation="speaking_hero">
            {homeHero.secondaryCta}
          </Button>
        </div>
      </PageHero>

      <Section>
        <Container>
          <h2 className="eyebrow mb-12 text-center !text-[0.8125rem] !font-semibold !tracking-[0.18em] text-ink-faint lg:mb-14">
            {speakingLabels.engagements}
          </h2>
          <LogoStrip logos={speakingEngagementLogos} size="large" />
        </Container>
      </Section>

      {/* The framework, pillar by pillar. Each links to its own page. */}
      <Section tone="alt">
        <Container>
          <SectionHeading lines={exploreHeading} className="max-w-4xl" />
          <div className="mt-12 grid gap-12 md:grid-cols-3 md:gap-8 lg:mt-16 lg:gap-12">
            {speakingPillars.map((pillar, i) => (
              <article key={pillar.slug} className="flex flex-col border-t-2 border-navy pt-6">
                <p aria-hidden="true" className="eyebrow text-action">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 !text-[clamp(1.75rem,1.2rem+1.6vw,2.5rem)] font-extrabold uppercase tracking-tight">
                  {pillar.name}
                </h3>
                <p className="mt-3 text-lg font-semibold leading-snug text-navy">{pillar.statement}</p>
                <SquareList items={pillar.points} className="mt-5" />
                <Link
                  href={`/speaking/${pillar.slug}/`}
                  className="mt-auto inline-flex min-h-6 items-center pt-6 text-[0.9375rem] font-bold text-action hover:text-action-dark"
                >
                  {speakingLabels.more} {pillar.name} <span aria-hidden="true" className="ml-1.5">→</span>
                </Link>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/*
        The AI keynote.

        PLACED AFTER THE FRAMEWORK, NOT BEFORE IT, and that is a decision rather
        than an accident of the order things were written. Steve was explicit
        that he does not want the site to become an AI site — Purpose, People,
        Process is the core and stays the core. So the page argues the framework
        first and then shows what it is being applied to right now. The paid
        traffic lands on /lp/ai-change-speaker/ rather than here in any case.

        On navy because it needs to read as a distinct offer and not as a fourth
        pillar. Same reason it is not in `speakingPillars`.
      */}
      <section className="bg-navy py-14 text-white md:py-20 lg:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <SectionHeading eyebrow={speakingLabels.aiEyebrow} lines={aiChange.heading} tone="dark">
              <p className="lede mt-6 text-white/80">{aiChange.statement}</p>
            </SectionHeading>
            <div className="lg:pt-10">
              <SquareList items={aiChange.points} tone="dark" className="text-white/90" />
              <div className="mt-10 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap min-[420px]:items-center min-[420px]:gap-x-8">
                <Button href={site.cta.href} glyph="arrow" track="build_your_keynote_click" trackLocation="speaking_ai">
                  {site.cta.label}
                </Button>
                <Link
                  href={`/speaking/${aiChange.slug}/`}
                  className="inline-flex min-h-12 items-center font-bold text-white underline underline-offset-4 hover:text-cyan"
                >
                  {speakingLabels.aiMore} <span aria-hidden="true" className="ml-1.5">→</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Section tone="alt">
        <Container>
          <Testimonials />
        </Container>
      </Section>

      <section id="reel" className="bg-navy py-14 md:py-20 lg:py-28">
        <Container>
          <SectionHeading lines={speakingReel.heading} tone="dark" />
          <div className="mt-10 lg:mt-14">
            <VideoEmbed
              film={speakingReel.film}
              title={speakingReel.heading}
              poster={img.speakingReelPoster}
              trackLocation="speaking_reel"
            />
          </div>
        </Container>
      </section>

      {/* All eight questions, marked up — FaqList emits the FAQPage schema for
          exactly what it shows. `#faq` is linked to from elsewhere; keep it. */}
      <Section id="faq">
        <Container>
          <SectionHeading eyebrow={speakingLabels.faqEyebrow} lines={speakingLabels.faqHeading} />
          <div className="mt-10 lg:mt-14">
            <FaqList faqs={faqs} />
          </div>
        </Container>
      </Section>

      {/* The standard close, photograph included. It ran without one while
          this page's hero was the same stage picture; the hero is now the
          Oura × Restore photograph, so the two no longer repeat. */}
      <ClosingCta location="speaking_final_cta" />
    </>
  );
}
