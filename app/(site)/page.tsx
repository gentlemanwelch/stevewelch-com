import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { site } from "@/content/site";
import {
  heroHeading, newsletterBar, intro, roles, rolesFooter,
  speakingPanel, pillars, optIn, restorePanel,
} from "@/content/home";
import { credentials } from "@/content/bio";
import { books } from "@/content/books";
import { img, speakingEngagementLogos } from "@/content/media-manifest";
import { Container, Section, Eyebrow, Button, JsonLd, LogoWall } from "@/components/primitives";
import { speakingServiceSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

/**
 * The homepage, rebuilt section-for-section against the WordPress original.
 *
 * Order is the original's: hero → newsletter bar → intro → the three roles →
 * speaking panel → "Speaking Engagements" logo wall → Purpose/People/Process →
 * books → free-chapter opt-in → Restore.
 *
 * That order was kept rather than "improved" because it already does the right
 * work in the right sequence: the three roles establish range before anything
 * is asked for, the logo wall proves the speaking claim immediately after it is
 * made, and Purpose/People/Process gives a booker the actual framework instead
 * of a list of topics.
 */
export const metadata: Metadata = buildMetadata({
  title: "Driving Change Through Purpose, People, Process",
  description: site.description,
  path: "/",
  keywords: [
    "Steve Welch",
    "keynote speaker",
    "entrepreneurship keynote speaker",
    "organizational change keynote speaker",
    "wellness keynote speaker",
    "Restore Hyper Wellness",
  ],
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={speakingServiceSchema()} />

      {/* ------------------------------------------------------------- Hero */}
      {/*
        The hero art is a 1920x1023 photograph with Steve seated in the LEFT
        third against the Restore wall; the right two-thirds is room. Two things
        follow from that and both were wrong in the first cut:

          - object-position must be LEFT. Cropping toward centre-right pushes
            him out of frame entirely on narrow viewports.
          - the scrim must darken the RIGHT, where the type sits. A gradient
            running the other way dims the subject and leaves the text fighting
            a busy background.

        next/image rather than a CSS background: this is the LCP element, the
        source is a 1 MB PNG, and Next will serve a far smaller AVIF/WebP at the
        right size. LCP is a Core Web Vital, which feeds both organic ranking
        and the Landing Page Experience half of Google Ads Quality Score, so the
        saving is worth the explicit element. `priority` opts it out of lazy
        loading — it is above the fold on every visit.
      */}
      <section className="relative isolate bg-[var(--color-navy)] text-white">
        <Image
          src={img.homeHero}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-left"
        />
        <div className="absolute inset-0 bg-[var(--color-navy)]/75 md:bg-transparent md:bg-gradient-to-l md:from-[var(--color-navy)] md:via-[var(--color-navy)]/80 md:to-transparent" />

        <Container className="relative py-24 sm:py-32 lg:py-40">
          <div className="max-w-xl md:ml-auto md:text-right">
            <h1 className="text-white">{heroHeading}</h1>
            <div className="mt-8 flex flex-wrap gap-3 md:justify-end">
              <Button href="/speaking/">Book Steve to Speak</Button>
              <Button href="/about/" variant="secondary">
                More About Steve
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- Newsletter strip */}
      <section className="bg-[var(--color-blue)]">
        <Container className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-lg font-semibold text-white">{newsletterBar.heading}</p>
          <Button href={site.social.substack} variant="secondary">
            {newsletterBar.cta}
          </Button>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Intro */}
      <Section>
        <Container size="measure">
          <div className="space-y-5 text-lg leading-relaxed">
            {intro.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Container>
      </Section>

      {/* ------------------------------------- Investor / Executive / Speaker */}
      <Section tone="alt">
        <Container>
          <h2 className="sr-only">What Steve does</h2>
          {/*
            Role tiles: photograph at full strength with the title over it, and
            the description revealed on hover.

            The first build showed everything all the time behind a flat 45%
            wash, which dimmed three good photographs to make room for copy
            nobody had asked for yet. The original lets the images do the
            opening work and holds the words back until someone shows interest.

            Two things this has to get right that a hover effect usually gets
            wrong:

              - TOUCH. There is no hover on a phone, and most of this traffic is
                phones. Below `md` the description is simply always visible, so
                nothing is unreachable.
              - KEYBOARD. `focus-within` mirrors every hover rule, so tabbing to
                the tile reveals the same content a mouse would.
          */}
          <ul className="grid gap-6 md:grid-cols-3 md:items-stretch">
            {roles.map((role, i) => {
              const image = [img.investor, img.executive, img.speaker][i];
              return (
                <li key={role.title} className="flex">
                  <Link
                    href={role.href}
                    className="group relative flex w-full min-h-[20rem] flex-col items-center justify-center overflow-hidden rounded-lg bg-[var(--color-navy)] p-7 text-center text-white"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                    {/* A light veil at rest so white type stays legible over a
                        busy photograph; the full navy wash only on reveal. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 bg-[var(--color-navy)]/25 transition-colors duration-300 md:group-hover:bg-[var(--color-navy)]/85 md:group-focus-within:bg-[var(--color-navy)]/85 max-md:bg-[var(--color-navy)]/80"
                    />

                    <span className="relative">
                      <span className="block text-3xl font-bold drop-shadow-sm">
                        {role.title}
                      </span>
                      {/* The cyan rule under the title. */}
                      <span
                        aria-hidden="true"
                        className="mx-auto mt-2 block h-[3px] w-full bg-[var(--color-cyan)]"
                      />
                      <span className="mt-4 block text-[0.95rem] leading-relaxed text-white/90 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                        {role.content}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 text-center">
            <Button href="/about/">{rolesFooter.cta}</Button>
            <p className="mt-4 text-sm text-[var(--color-ink-faint)]">
              <a
                href={site.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-[var(--color-accent)]"
              >
                {rolesFooter.note}
              </a>
            </p>
          </div>
        </Container>
      </Section>

      {/* -------------------------------------------------- Speaking panel */}
      <section className="relative isolate bg-[var(--color-navy)] text-white">
        <Image
          src={img.speakingBg}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover object-left"
        />
        <div className="absolute inset-0 bg-[var(--color-navy)]/80 md:bg-transparent md:bg-gradient-to-l md:from-[var(--color-navy)] md:via-[var(--color-navy)]/85 md:to-transparent" />
        <div className="relative">
          <Container className="py-20 sm:py-24">
            <div className="max-w-xl md:ml-auto">
              <Eyebrow>{speakingPanel.eyebrow}</Eyebrow>
              <h2 className="text-white">{speakingPanel.heading}</h2>
              <ul className="mt-6 space-y-3">
                {speakingPanel.points.map((point) => (
                  <li key={point} className="flex items-center gap-3 text-lg text-white/90">
                    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-blue)]" />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/contact/">{speakingPanel.cta}</Button>
              </div>
            </div>
          </Container>
        </div>
      </section>

      {/* ---------------------------------------- Speaking engagements logos */}
      <Section tone="alt">
        <Container>
          <LogoWall heading="Speaking Engagements" logos={speakingEngagementLogos} />
        </Container>
      </Section>

      {/* --------------------------------------- Purpose · People · Process */}
      <Section>
        <Container>
          <h2 className="text-center">Purpose, People, Process</h2>
          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {pillars.map((pillar) => (
              <li key={pillar.slug}>
                <h3 className="text-[var(--color-blue)]">{pillar.name}</h3>
                <p className="mt-3 leading-relaxed">{pillar.home}</p>
                <Link
                  href={`/speaking/${pillar.slug}/`}
                  className="mt-4 inline-block text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-ink)]"
                >
                  More on {pillar.name} →
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ------------------------------------------------------------ Books */}
      <Section tone="alt">
        <Container>
          <h2 className="text-center">Books</h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {books.map((book) => (
              <li key={book.slug}>
                <Link
                  href={`/books/${book.slug}/`}
                  className="group flex h-full flex-col rounded-[var(--radius-card)] bg-white p-7 shadow-[var(--shadow-card)]"
                >
                  <h3>{book.title}</h3>
                  {book.subtitle && (
                    <p className="mt-1 text-sm text-[var(--color-ink-faint)]">{book.subtitle}</p>
                  )}
                  <p className="mt-3 flex-1 leading-relaxed">{book.blurb}</p>
                  <span className="mt-5 text-sm font-semibold text-[var(--color-accent)]">
                    About this book →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ------------------------------------------------- Free chapter CTA */}
      <section className="bg-[var(--color-blue)]">
        <Container className="py-14 text-center">
          <h2 className="mx-auto max-w-2xl text-white">{optIn.heading}</h2>
          <div className="mt-7 flex justify-center">
            <Button href="/contact/" variant="secondary">
              {optIn.cta}
            </Button>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- Restore */}
      <Section>
        <Container>
          <div className="rounded-[var(--radius-card)] bg-[var(--color-tint)] p-8 sm:p-12">
            <h2>{restorePanel.heading}</h2>
            <p className="mt-4 max-w-3xl leading-relaxed">{restorePanel.body}</p>
            <a
              href={restorePanel.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-block font-semibold text-[var(--color-accent)] underline underline-offset-4"
            >
              {restorePanel.linkLabel}
            </a>
          </div>
        </Container>
      </Section>

      {/* ------------------------------------------------------ Credentials */}
      <Section tone="alt">
        <Container>
          <h2 className="sr-only">Background</h2>
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {credentials.map((item) => (
              <div key={item.label}>
                <dt className="text-lg font-bold text-[var(--color-ink)]">{item.label}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-[var(--color-ink-faint)]">
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>
    </>
  );
}
