import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { site } from "@/content/site";
import {
  hero, newsletterBar, intro, roles, rolesFooter,
  speakingPanel, pillars, restorePanel,
} from "@/content/home";
import { featuredBook, getBook } from "@/content/books";
import { img, speakingEngagementLogos } from "@/content/media-manifest";
import { BookFeature } from "@/components/BookFeature";
import { OptInBar } from "@/components/OptInBar";
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
/*
 * The title names the category, which it did not before.
 *
 * It read "Driving Change Through Purpose, People, Process" — the h1, which is
 * a good headline and a poor title tag, because a title tag competes in a list
 * of ten and has to say what the page is. "Keynote Speaker on Driving Change |
 * Steve Welch" is 46 characters, inside the ~60 Google renders, and carries the
 * term an organizer actually types.
 *
 * The description is page-specific for the same reason: site.description
 * describes an entrepreneur and investor and never mentions that he is
 * bookable, which is the one thing this snippet has to do. The fee floor is
 * deliberately in it — a snippet that qualifies is a click not paid for.
 */
export const metadata: Metadata = buildMetadata({
  title: "Keynote Speaker on Driving Change",
  description:
    "Keynote speaker on driving change through purpose, people, and process — including driving change in the age of AI. Booked directly. Engagements start at $20,000.",
  path: "/",
  keywords: [
    "Steve Welch",
    "keynote speaker",
    "entrepreneurship keynote speaker",
    "organizational change keynote speaker",
    "ai change management speaker",
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
      {/* overflow-hidden is load-bearing, not tidiness: the scrim on the
          positioning line below extends 96px past the container on each side,
          and on a phone that is 96px past the VIEWPORT. Without this the page
          scrolled sideways 72px at 390 wide — measured at 320, 390, 414 and
          768 before it was clipped. The fill image is already exactly this
          section, so clipping costs nothing. */}
      <section className="hero-viewport relative isolate flex items-center overflow-hidden bg-[var(--color-navy)] text-white">
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

          RE-MEASURED 2026-09-01, after the mobile hero was trimmed from 100svh
          to 82svh so the newsletter bar reaches the fold. A shorter band is a
          different object-cover crop, so this number had to be earned again.

          Sampling the background with the headline hidden — the only way to
          measure what is actually behind the type rather than its own
          antialiasing, which contaminated the first attempt and produced a
          scary 2.44:1 that was not real:

            alpha   median   p95     worst pixel
            0.62    11.55    4.72    4.30   clears 3:1, thin margin
            0.66    11.90    5.31    4.88   clears 4.5:1
            0.70    12.24    6.02    5.58

          The h1 is 41.6px, so 3:1 is the bar that applies and 0.62 still
          passed. It passed by 1.3 though, where before the crop change it had
          room to spare, so this is 0.66 — enough to clear even the small-text
          bar, at a difference nobody looking at the page can see.

          Re-measure if the crop changes again. In particular the export sets
          `alternative_mobile_image: "1"` with `hero_mobile_image: 1908`
          (steve_hero-mobile-1.png), which this does not yet serve — wiring that
          in changes what sits behind the type and invalidates the numbers above.
        */}
        <div className="absolute inset-0 bg-[var(--color-navy)]/66 md:hidden" />
        {/*
          AND A LIGHT ONE FROM md UP, WHICH THIS HERO DID NOT USED TO HAVE.

          The note above is emphatic that the desktop hero needs no scrim, and
          for what was on it that was true and measured: the worst text-sized
          block behind the HEADLINE is 9.97:1 on the bare photograph. What
          changed on 2026-09-21 is that the hero gained a positioning line and a
          button below the rule, and below the rule is Steve’s white shirt.

          This is 0.38 — the lightest wash anywhere on the site (/speaking/ runs
          0.52, /contact/ 0.70) and, on its own, nowhere near enough: a flat wash
          cannot beat a white shirt without killing the picture. Swept alone it
          still failed at three widths even at 0.62. It works here only in
          combination with the ellipse on the type itself, where 0.38 buys the
          margin that turns a thin pass into a comfortable one. See the table on
          that element.

          Do not read this as licence to reach for a wash next time. It was
          reached for fifth, after four shaped alternatives were measured and
          rejected.
        */}
        <div className="absolute inset-0 hidden bg-[var(--color-navy)]/38 md:block" />

        <Container className="relative w-full py-20">
          {/*
            The block sits on the right half but its text is LEFT aligned inside
            it — both lines and the rule start on the same vertical edge. The
            first build right-aligned the whole thing, which reads as a different
            layout even though the words are identical.
          */}
          <div className="max-w-2xl md:ml-auto">
            {/*
              A SOFT DARK ELLIPSE BEHIND THE LOWER HALF OF THIS BLOCK, md AND UP.

              This is not the full-hero scrim the note above forbids, and the
              distinction is the whole point. That one was a navy gradient over
              the right half of the picture, added on a hunch, and it flattened a
              photograph that measured 9.97:1 on its own. This one is the size of
              two lines of type, it is sized by measurement, and it exists
              because the type it sits under is new.

              The headline was measured in September and passed on the bare
              photograph. The positioning line added on 2026-09-21 sits one line
              lower, and one line lower is Steve’s white shirt. Measured with all
              hero type hidden — the only way to sample the picture rather than
              the glyphs’ own antialiasing — the band behind this paragraph read:

                width   worst   p01    p05    median
                768     1.04    1.12   1.33   7.34    white on a white shirt
                1440    2.22    2.52   4.89   15.74
                390     4.30    4.57   5.21   10.64   (mobile wash, untouched)

              18px at weight 400 needs 4.5:1. At 768 the middle of the sentence
              was invisible, not merely marginal — and it would have shipped,
              because the headline a few pixels above it was fine.

              The ellipse is attached to THIS GROUP — the line and the button —
              not to the whole hero block, and that is the second thing this note
              is for. The first attempt anchored it at 74% of the block, which
              works only while the headline wraps to the number of lines it
              happens to wrap to; at 1024 the headline wrapped differently, the
              ellipse landed high, and the worst pixel behind the sentence was
              still 1.96:1. Anchored to the type, it tracks the type at every
              width.

              The headline keeps its clean photograph either way — the ellipse
              starts below the rule and fades to nothing inside its own bounds,
              so there is no edge to see.

              1024 IS THE CASE THAT DECIDES THIS, and it is not obvious from
              looking at the page. There the sentence’s left edge falls exactly
              on Steve’s shirt collar, which is the brightest thing in the frame
              and the furthest point from the centre of any ellipse centred on
              the type. Eleven shapes were swept; worst pixel behind the
              sentence, at five widths:

                                            1440   1280   1024    900    768
                ellipse, short fade          5.81   7.27   2.86   5.64   8.62
                ellipse, long fade           9.10  10.04   6.74   9.01   9.15
                ellipse, seamless inset      4.94   6.81   2.19   5.91   9.42
                full-width bottom gradient   6.25   6.25   3.91   2.92   2.63
                flat wash 0.50, no ellipse   4.95   4.95   2.97   2.80   2.88
                flat wash 0.62, no ellipse   6.13   6.13   4.03   3.83   3.93
                flat 0.28 + this ellipse     7.49   8.71   4.62   7.58   9.29
                flat 0.38 + this ellipse     8.07   9.23   5.32   8.06   9.69  ←

              The two lessons worth keeping. A FULL-WIDTH GRADIENT IS THE WRONG
              TOOL: the type sits at a different fraction of the hero’s height
              at every width, so any band tuned for one width misses at another.
              A FLAT WASH ALONE CANNOT BEAT A WHITE SHIRT: 0.62 — heavy enough
              to visibly kill the photograph — still failed at three widths.

              What works is the pair: a light wash that lifts the whole frame a
              little, and a soft ellipse that does the real work exactly where
              the type is. 0.38 + this shape clears 4.5:1 everywhere with margin
              to spare. Re-measure if this copy moves or the crop changes.

              MOBILE GETS THE SAME SHAPE AT 35%. It was excluded at first, on the
              grounds that the flat 0.66 wash measured in September was already
              there — but measured, the sentence came back at 4.30 worst, which
              is under the 4.5 an 18px paragraph needs. (That the headline was
              accepted at the same 4.30 is not a precedent: a 41.6px headline
              only has to clear 3.)

              At full strength the ellipse compounds with the 0.66 wash and
              visibly buries the photograph. At 35% it is invisible on the page
              and still moves the worst pixel a long way:

                        320    390    414    600
                off     —      4.30   —      —
                35%     5.53   5.81   5.64   5.91   ←
                45%     5.89   6.32   6.11   6.52
                60%     6.50   7.17   6.94   7.45
                100%    8.29   9.93   9.55  10.22   too dark to look at
            */}
            <div className="relative">
            {/*
              One <h1> containing both tiers, so the accessible name and the
              text a crawler reads are still the whole sentence.
            */}
            {/* The one sanctioned off-scale size on the site: the homepage
                hero headline is deliberately larger than the h1 clamp, because
                it is the only headline that has a full screen to itself.
                Everything else uses the scale in globals.css. */}
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
              THE POSITIONING LINE AND THE ONE ACTION.

              This previously said: "No buttons here. The original hero carries
              none — the headline and the photograph do the work, and the first
              action is the newsletter bar immediately below." That was the right
              rule while the job was rebuilding a WordPress page faithfully. It
              is the wrong rule now that the page has a job the original never
              had, which is converting event organizers into paid bookings, some
              of whom will arrive on a click that cost money.

              Two specific problems it left:

                - The h1, "Driving Change Through Purpose, People, Process", is a
                  strong line that does not say what is for sale. A visitor who
                  reads only the first screen — and roughly 80% of them read only
                  the first screen of a service page — leaves without learning
                  that Steve is bookable. Hence the line below, which names the
                  category and the audience in one sentence.

                - The first action above the fold was "Get The Newsletter". That
                  is a fine second action and a poor first one on a site whose
                  single commercial purpose is bookings. The newsletter bar is
                  still immediately below; it has just stopped being the only
                  thing on offer.

              ONE button, not two. A second CTA here would compete with this one
              rather than add to it, and every additional choice above the fold
              costs some of the visitors who would have taken the first.

              The hero is a fixed 82svh on mobile with its content vertically
              centred, so these two elements eat into that band rather than
              extending it. Measured after adding them — see the note in
              globals.css on .hero-viewport — the block still clears the newsletter
              bar into view at 390x772. Re-measure if this copy grows.
            */}
            <div className="relative mt-7">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-x-24 -inset-y-14 opacity-[0.35] md:opacity-100 bg-[radial-gradient(ellipse_at_center,rgba(4,46,67,0.92)_0%,rgba(4,46,67,0.90)_30%,rgba(4,46,67,0.86)_46%,rgba(4,46,67,0.74)_57%,rgba(4,46,67,0.52)_67%,rgba(4,46,67,0.28)_77%,rgba(4,46,67,0.10)_87%,rgba(4,46,67,0)_97%)]"
              />
              <div className="relative">
                <p className="max-w-xl text-lg leading-relaxed text-white/90">
                  Keynote speaker on driving organizational change — for leadership
                  teams, conferences, and associations worldwide.
                </p>
                <div className="mt-7">
                  <Button href="/contact/">Book Steve to Speak</Button>
                </div>
              </div>
            </div>
            </div>
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
          <p className="mx-auto max-w-4xl text-left text-2xl font-semibold leading-snug text-[var(--color-blue-deep)] sm:text-center sm:text-3xl">
            {intro.lead}
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-left text-lg leading-relaxed text-[var(--color-ink-soft)] sm:text-center">
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
                    {/* next/image rather than a CSS background: a background
                        cannot go through the image optimiser, so the browser
                        pulls the full-size file however small the tile is.
                        Same fix as the life boxes on /about/. */}
                    <Image
                      src={image}
                      alt=""
                      aria-hidden="true"
                      fill
                      sizes="(min-width: 768px) 32vw, 92vw"
                      className="object-cover object-center"
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
                      <span className="block text-3xl font-bold leading-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.55)] md:text-4xl">
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

                    <span className="relative mt-4 block text-ui leading-relaxed text-white/90 transition-opacity duration-300 md:row-start-3 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
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
                /* inline-block + py-2 to clear the 24px minimum target size:
                   the bare inline link measured 389x20 at tablet and desktop,
                   which the mobile audit missed because it only sampled the
                   widths where this sits inside a wrapping paragraph. */
                className="inline-block py-2 underline underline-offset-4 hover:text-[var(--color-accent)]"
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
                  className="mt-4 inline-block py-2 text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-ink)]"
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
      <OptInBar />

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
                className="mt-5 inline-block py-2 font-semibold text-[var(--color-blue)] underline underline-offset-4 hover:text-[var(--color-blue-deep)]"
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
