import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { site } from "@/content/site";
import {
  hero, newsletterBar, intro, roles, rolesFooter,
  speakingPanel, pillars, optIn, restorePanel,
} from "@/content/home";
import { featuredBook, getBook, freeChapter } from "@/content/books";
import { img, speakingEngagementLogos } from "@/content/media-manifest";
import { BookFeature } from "@/components/BookFeature";
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
        third against the Restore wall, so object-position is left.

        NO OVERLAY ON DESKTOP. The WordPress block sets
        `"hero_overlay_tint":"rgba(0,0,0,0)"` — fully transparent — on this hero
        and on the speaking and contact heroes too. The first build invented a
        navy gradient over the right half "so the type would read"; it was never
        needed and it flattened the whole photograph. Measured on the source
        file: across the band the headline occupies, the WORST text-sized block
        is 9.97:1 against white and not one block falls under 4.5:1. The picture
        is already dark enough. Do not add a scrim back here.

        The mobile wash below is a different case and is measured separately.

        next/image rather than a CSS background: this is the LCP element and the
        source is a 1 MB PNG, so Next serves a far smaller AVIF/WebP at the right
        size. LCP feeds organic ranking and the Landing Page Experience half of
        Ads Quality Score alike.
      */}
      <section className="hero-viewport relative isolate flex items-center bg-[var(--color-navy)] text-white">
        <Image
          src={img.homeHero}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-left"
        />
        {/*
          Mobile only, and it is load-bearing here in a way it never was on
          desktop. At 390x772 the cover crop puts the headline squarely over
          Steve's white shirt: measured on the render, the worst text-sized block
          is 1.18:1 against white type — unreadable. Sweeping the alpha, 0.55
          still fails at 3.94:1 and 0.62 is the first step that clears 4.5:1
          (4.78:1). Hence this value, rather than the 0.75 the first build used
          at every width.

          Re-measure if the crop changes. In particular the export sets
          `alternative_mobile_image: "1"` with `hero_mobile_image: 1908`
          (steve_hero-mobile-1.png), which this does not yet serve — wiring that
          in changes what sits behind the type and invalidates the number above.
        */}
        <div className="absolute inset-0 bg-[var(--color-navy)]/62 md:hidden" />

        <Container className="relative w-full py-20">
          {/*
            The block sits on the right half but its text is LEFT aligned inside
            it — both lines and the rule start on the same vertical edge. The
            first build right-aligned the whole thing, which reads as a different
            layout even though the words are identical.
          */}
          <div className="max-w-2xl md:ml-auto">
            {/*
              One <h1> containing both tiers, so the accessible name and the
              text a crawler reads are still the whole sentence.
            */}
            <h1 className="!text-[2.6rem] leading-[1.05] sm:!text-[3.75rem] lg:!text-[4.5rem]">
              <span className="block text-white">{hero.headingLead}</span>
              <span className="mt-2 block text-[0.722em] leading-[1.15] text-white">
                {hero.headingRest}
              </span>
            </h1>

            {/*
              The rule under the headline. The export's `hero_text` ends in a
              bare `<hr />`, and the live page renders it as a plain solid bar —
              so that is what this is. The first build drew a thin line ending in
              an open ring, which is on no version of the original.
            */}
            <hr
              aria-hidden="true"
              className="mt-7 h-[5px] w-full max-w-[25rem] border-0 bg-[var(--color-cyan)]"
            />

            {/*
              No buttons here. The original hero carries none — the headline and
              the photograph do the work, and the first action is the newsletter
              bar immediately below. Adding CTAs was an invention of the first
              build.
            */}
          </div>
        </Container>
      </section>

      {/* -------------------------------------------------- Newsletter strip */}
      {/* Centred and stacked, as on the original — not a left/right split. */}
      <section className="bg-[var(--color-blue)]">
        <Container className="py-10 text-center">
          <p className="text-2xl font-bold text-white sm:text-3xl">{newsletterBar.heading}</p>
          <div className="mt-6 flex justify-center">
            <Button href={site.social.substack}>{newsletterBar.cta}</Button>
          </div>
        </Container>
      </section>

      {/* ------------------------------------------------------------ Intro */}
      <Section>
        <Container className="text-center">
          <p className="mx-auto max-w-4xl text-[1.5rem] font-semibold leading-snug text-[var(--color-blue-deep)] sm:text-[2rem]">
            {intro.lead}
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-soft)]">
            {intro.body}
          </p>
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
                    className="group relative flex w-full min-h-[20rem] flex-col items-center justify-center overflow-hidden rounded-lg bg-[var(--color-navy)] p-7 text-center text-white md:grid md:min-h-[28rem] md:grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)]"
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

                    {/*
                      The three titles must sit at exactly the same height, and
                      centring the whole stack does not achieve that: the
                      descriptions are different lengths, they stay in flow even
                      at rest (opacity-0, not display:none), and a taller one
                      pushes its title up. Executive's copy is the longest, which
                      is why its title floated a line above the other two.

                      So at md the card is a three-row grid — flexible, title,
                      flexible — with BOTH flexible rows minmax(0,1fr). The li
                      elements are already the same height, and the title rows
                      are the same height, so the top spacers resolve equal and
                      the titles land on the same line whatever the copy does.
                      The description sits in row three and no longer moves it.

                      Below md there is one column, nothing to align, and the
                      description is always visible — so it stays a centred flex
                      column there.

                      md:min-h-[28rem] is not decoration. Row three is
                      minmax(0,1fr), so its minimum is zero — it will not grow to
                      fit its own content, it will let it overflow and the card's
                      overflow-hidden will cut it off. The height has to come from
                      somewhere, and that somewhere is this min-height. At 26rem
                      Executive's copy landed flush on the content edge with zero
                      to spare; 28rem gives it room. Re-measure if the copy grows.
                    */}
                    <span className="relative mx-auto w-fit md:row-start-2">
                      <span className="block text-[1.9rem] font-bold leading-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.55)] md:text-[2.4rem]">
                        {role.title}
                      </span>
                      {/* The cyan rule under the title. w-fit on the wrapper
                          above makes this the width of the WORD — the first
                          build stretched it to the description's width, which
                          reads as a different component. */}
                      <span
                        aria-hidden="true"
                        className="mt-2 block h-[3px] w-full bg-[var(--color-cyan)]"
                      />
                    </span>

                    <span className="relative mt-4 block text-[0.95rem] leading-relaxed text-white/90 transition-opacity duration-300 md:row-start-3 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                      {role.content}
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
            <div className="max-w-2xl md:ml-auto">
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
      {/*
        The original runs a featured-book block here, not a pair of text cards:
        cover art, the argument for the book, and two actions. Replacing the
        cards with it is the single biggest visual correction on this page.
      */}
      <BookFeature
        eyebrow={featuredBook.eyebrow}
        title={featuredBook.title}
        subtitle={featuredBook.subtitle}
        body={featuredBook.body}
        learnMoreHref={featuredBook.learnMoreHref}
        buyUrl={getBook(featuredBook.slug)?.buyUrl}
        desktopArt={img.restoreBookBg}
        mobileArt={img.restoreBookBgMobile}
      />

      {/* ------------------------------------------------- Free chapter CTA */}
      <section className="bg-[var(--color-blue)]">
        <Container className="py-14 text-center">
          <h2 className="mx-auto max-w-2xl text-white">{optIn.heading}</h2>
          <div className="mt-7 flex justify-center">
            <Button href={freeChapter.pdfHref} variant="secondary">
              {optIn.cta}
            </Button>
          </div>
        </Container>
      </section>

      {/* ---------------------------------------------------------- Restore */}
      {/*
        The original heads this with the Restore wordmark rather than setting
        the company name in Poppins, and pairs it with two therapy photographs.
        Those two images arrive already composited into a single transparent
        PNG, so the offset overlap needs no CSS to rebuild.
      */}
      <section className="bg-[var(--color-tint)]">
        <Container className="py-16 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="sr-only">{restorePanel.heading}</h2>
              <Image
                src={img.restoreLogo}
                alt={restorePanel.heading}
                width={320}
                height={110}
                className="h-auto w-[15rem] sm:w-[18rem]"
              />
              <p className="mt-6 text-lg leading-relaxed text-[var(--color-ink-soft)]">
                {restorePanel.body}
              </p>
              <a
                href={restorePanel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-block font-semibold text-[var(--color-blue)] underline underline-offset-4 hover:text-[var(--color-blue-deep)]"
              >
                {restorePanel.linkLabel}
              </a>
            </div>
            <Image
              src={img.restoreComposite}
              alt="Infrared sauna and red light therapy at Restore Hyper Wellness"
              width={1074}
              height={826}
              className="h-auto w-full"
            />
          </div>
        </Container>
      </section>

    </>
  );
}
