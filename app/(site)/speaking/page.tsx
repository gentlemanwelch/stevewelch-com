import Link from "next/link";
import type { Metadata } from "next";
import {
  speakingHero, speakingIntro, exploreHeading, speakingPillars,
  hyperWellness, anvilQuote, speakingReel, podcastNote,
} from "@/content/speaking";
import { faqs } from "@/content/faq";
import { img, speakingEngagementLogos } from "@/content/media-manifest";
import {
  Container, Section, Eyebrow, Button, JsonLd, LogoWall, VideoEmbed,
} from "@/components/primitives";
import { speakingServiceSchema, faqSchema, breadcrumbSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

/**
 * /speaking/ — rebuilt against the WordPress original.
 *
 * Order is the original's: hero → intro → logo wall → "Explore the mindset
 * needed to drive change" → Purpose → People → Process → hyper wellness →
 * book CTA → the anvil quote → speaking reel → podcast note.
 *
 * The booking FAQ is the one addition. It carries FAQPage structured data, so
 * the questions an organizer types ("how much does it cost to book a keynote
 * speaker") can be answered directly in search results — which is how a
 * direct-booking page competes with a bureau listing.
 */
export const metadata: Metadata = buildMetadata({
  title: "Speaking",
  description:
    "Steve Welch has a track record of engaging audiences and empowering them with the tools and mindset to drive change in their organizations and their personal lives.",
  path: "/speaking/",
  keywords: [
    "book a keynote speaker",
    "hire a keynote speaker",
    "organizational change keynote speaker",
    "entrepreneurship keynote speaker",
    "wellness keynote speaker",
  ],
});

export default function SpeakingPage() {
  return (
    <>
      <JsonLd data={speakingServiceSchema()} />
      <JsonLd data={faqSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Speaking", path: "/speaking/" },
        ])}
      />

      <section
        className="relative bg-[var(--color-navy)] text-white"
        style={{
          backgroundImage: `url(${img.speakingBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-[var(--color-navy)]/80">
          <Container className="py-24 sm:py-32">
            <Eyebrow>{speakingHero.eyebrow}</Eyebrow>
            <h1 className="max-w-3xl text-white">{speakingHero.heading}</h1>
            <div className="mt-8">
              <Button href="/contact/">{speakingHero.cta}</Button>
            </div>
          </Container>
        </div>
      </section>

      <Section>
        <Container size="measure">
          <p className="text-lg leading-relaxed">{speakingIntro}</p>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <LogoWall heading="Speaking Engagements" logos={speakingEngagementLogos} />
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="text-center">{exploreHeading}</h2>

          <div className="mt-14 space-y-14">
            {speakingPillars.map((pillar) => (
              <article
                key={pillar.slug}
                className="grid gap-6 border-b border-[var(--color-line)] pb-14 last:border-0 last:pb-0 md:grid-cols-[minmax(0,14rem)_1fr] md:gap-12"
              >
                <h3 className="text-3xl text-[var(--color-blue)] sm:text-4xl">{pillar.name}</h3>
                <div>
                  <p className="text-lg leading-relaxed">{pillar.statement}</p>
                  <ul className="mt-5 space-y-2.5">
                    {pillar.points.map((point) => (
                      <li key={point} className="flex gap-3 leading-relaxed">
                        <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-blue)]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/speaking/${pillar.slug}/`}
                    className="mt-5 inline-block text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-ink)]"
                  >
                    More on {pillar.name} →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* The foundation the three pillars rest on. */}
      <Section tone="alt">
        <Container>
          <div className="rounded-[var(--radius-card)] bg-white p-8 shadow-[var(--shadow-card)] sm:p-12">
            <h2>{hyperWellness.heading}</h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed">{hyperWellness.statement}</p>
            <Link
              href={`/speaking/${hyperWellness.slug}/`}
              className="mt-5 inline-block text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-ink)]"
            >
              More on Hyper Wellness →
            </Link>
          </div>
        </Container>
      </Section>

      <section className="bg-[var(--color-blue)]">
        <Container className="py-14 text-center">
          <h2 className="text-white">Book Steve to Speak</h2>
          <div className="mt-7 flex justify-center">
            <Button href="/contact/" variant="secondary">
              Check availability
            </Button>
          </div>
        </Container>
      </section>

      <Section>
        <Container size="measure">
          <blockquote className="text-center text-2xl leading-snug font-semibold text-[var(--color-ink)] sm:text-3xl">
            “{anvilQuote}”
          </blockquote>
        </Container>
      </Section>

      <Section tone="alt">
        <Container size="measure">
          <h2 className="text-center">{speakingReel.heading}</h2>
          <div className="mt-8">
            <VideoEmbed
              youtubeId={speakingReel.youtubeId}
              title={speakingReel.heading}
              poster={img.speakingReelPoster}
            />
          </div>
        </Container>
      </Section>

      <Section id="faq">
        <Container size="measure">
          <Eyebrow>Booking</Eyebrow>
          <h2>Questions organizers ask.</h2>
          <dl className="mt-10 divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
            {faqs.map((faq) => (
              <div key={faq.question} className="py-6">
                <dt className="text-lg font-bold text-[var(--color-ink)]">{faq.question}</dt>
                <dd className="mt-2 leading-relaxed text-[var(--color-ink-soft)]">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section tone="ink">
        <Container className="text-center">
          <h2 className="text-white">{podcastNote.heading}</h2>
          <p className="mt-4 text-white/70">{podcastNote.body}</p>
          <div className="mt-8 flex justify-center">
            <Button href="/contact/">Get in touch</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
