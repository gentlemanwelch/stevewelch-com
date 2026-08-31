import Link from "next/link";
import Image from "next/image";
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

      {/*
        The hero, rebuilt from its block. Three things were wrong before:

        1. THE PICTURE. The block names `hero_image: 1932` — speaking_hero-1.png,
           Steve on stage under blue light with the audience in silhouette. The
           first build used speakingBg, a different photograph that belongs to
           the home page's speaking panel.
        2. THE ALIGNMENT. `hero_text_width_position: "full-width-txt"`, so the
           label, the heading and the button are centred, not ranged left.
        3. THE WASH. It was at 0.80, which buried the stage lighting.

        On the wash: the block does say `hero_overlay_tint: rgba(0,0,0,0)`, and
        on the HOME hero that is the literal truth — measured, the photograph
        carries white type on its own. Here it cannot. This picture is a
        brightly lit curtain, and centred white type over the middle of it
        measures 1.94:1. The original must darken it by some route the export
        does not carry, so rather than strip the wash and ship unreadable type,
        this is set to the measured minimum: 0.46 is the floor at 1440 (the
        worst of the breakpoints), 0.52 leaves a margin at 5.3:1. Ninety percent
        of the picture the 0.80 was hiding comes back.

        The crop moves on mobile. This is a 2560x853 banner, so a 390-wide
        window shows 31% of it, and centred that is curtain with Steve nowhere
        in the frame — his own speaking hero without him in it, on the widths
        most of the traffic arrives at. 75% puts him in the middle of the window
        and measures 5.12:1 under the wash. One image, one download: shifting
        object-position beats serving a second file on the LCP path.

        Wants a screenshot of the live page to settle exactly.
      */}
      <section className="relative isolate bg-[var(--color-navy)] text-white">
        <Image
          src={img.speakingHero}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[75%_50%] md:object-center"
        />
        <div className="absolute inset-0 bg-[var(--color-navy)]/52" />

        <Container className="relative py-24 text-center sm:py-32">
          <Eyebrow tone="onDark">{speakingHero.eyebrow}</Eyebrow>
          <h1 className="mx-auto max-w-3xl text-white">{speakingHero.heading}</h1>
          <div className="mt-8">
            <Button href="/contact/">{speakingHero.cta}</Button>
          </div>
        </Container>
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

      {/*
        The anvil line with its masthead. It is a Philadelphia Inquirer quote,
        and the original sets the masthead beneath it — which is what turns the
        sentence from a slogan into a citation. The publication is also named in
        text for anything that cannot read the image.
      */}
      <Section>
        <Container size="measure">
          <figure className="text-center">
            <blockquote className="text-2xl font-semibold leading-snug text-[var(--color-ink)] sm:text-3xl">
              “{anvilQuote}”
            </blockquote>
            <figcaption className="mt-7 flex flex-col items-center gap-2">
              <Image
                src={img.inquirerLogo}
                alt=""
                aria-hidden="true"
                width={320}
                height={44}
                className="h-7 w-auto opacity-80 sm:h-8"
              />
              <span className="sr-only">The Philadelphia Inquirer</span>
            </figcaption>
          </figure>
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
