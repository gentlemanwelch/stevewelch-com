import Image from "next/image";
import type { Metadata } from "next";
import {
  aboutHero, byTheNumbers, lifeBoxesEyebrow, lifeBoxesHeading, lifeBoxes,
  investmentVehicles,
} from "@/content/bio";
import { img } from "@/content/media-manifest";
import {
  Container, Section, Button, JsonLd,
} from "@/components/primitives";
import { CountUp } from "@/components/CountUp";
import { Timeline } from "@/components/Timeline";
import { breadcrumbSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

/**
 * /about/ — rebuilt against the WordPress original.
 *
 * Order is the original's: hero → "By the numbers" → the three buckets →
 * Restore origin + today → Dreamit origin → Selected Investments →
 * Companies I have worked with → Investment Vehicles.
 *
 * The full prose bio is appended at the end. It is not on the original page,
 * but this is the page a search engine weighs for E-E-A-T and it is the one an
 * organizer reads before deciding — so the long-form version belongs somewhere,
 * and it belongs here.
 */
export const metadata: Metadata = buildMetadata({
  title: "About Steve Welch",
  description:
    "Steve Welch is a successful entrepreneur and investor who lives the hyper wellness lifestyle every day.",
  path: "/about/",
  keywords: [
    "Steve Welch",
    "Steve Welch entrepreneur",
    "Steve Welch Restore Hyper Wellness",
    "Steve Welch Dreamit Ventures",
  ],
  type: "profile",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about/" },
        ])}
      />

      {/*
        The hero. It was under a flat 70% navy wash, which turned a turquoise
        sea into a grey-green field and put Steve in the background of his own
        photograph — the same mistake as the homepage hero, and the reason this
        one is being redone.

        The homepage answer does not transfer, though: there the picture was
        already dark enough to carry white type unaided, and here it is the
        opposite. This frame is bright water and white spray, and the copy lands
        on the brightest part of it. The export says rgba(0,0,0,0.23), and at
        that value the worst text-sized block behind the copy measures 2.17:1 —
        the original's own body copy is hard to read for the same reason.

        So the darkening is horizontal instead of flat: 58% black over the left,
        easing to 10% by the time it reaches Steve. Measured, that clears the
        copy at 5.1:1 while leaving an average of 14% over him — LESS than the
        original's own flat 23%. He comes out brighter than on the live site and
        the words are still readable, which a single flat value cannot do.

        object-bottom, per `background_position: "bottom-center"`.
      */}
      <section className="relative isolate bg-[var(--color-navy)] text-white">
        <Image
          src={img.aboutHero}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-bottom"
        />
        {/* Mobile: the crop is narrow and the copy crosses the spray, so a flat
            52% is the measured floor (5.2:1). The ramp takes over from md. */}
        <div className="absolute inset-0 bg-black/52 md:hidden" />
        <div className="absolute inset-0 hidden md:block bg-[linear-gradient(to_right,rgba(0,0,0,0.58)_0%,rgba(0,0,0,0.58)_44%,rgba(0,0,0,0.10)_64%,rgba(0,0,0,0.10)_100%)]" />

        <Container className="relative py-24 sm:py-28">
          <div className="md:max-w-[54%]">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-white">
              {aboutHero.eyebrow}
            </p>
            <h1 className="text-white">{aboutHero.heading}</h1>
            <p className="mt-6 text-lg leading-relaxed text-white/90">{aboutHero.body}</p>
          </div>
        </Container>
      </section>

      {/*
        "By the numbers". Its block is a counter-block on #edf5f9 — the tint,
        not white — and each figure counts up when it scrolls into view. The
        first build rendered four small centred numbers on white with no motion,
        which is a table where the original has an achievement.

        Each figure carries a cyan rule down its left edge, as the original
        does. The number animates; the label does not.
      */}
      <section className="bg-[var(--color-tint)]">
        <Container className="py-20 sm:py-24">
          <h2 className="text-center text-[var(--color-blue-deep)]">By the numbers</h2>
          <dl className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {byTheNumbers.map((s) => (
              <div key={s.label} className="border-l-[3px] border-[var(--color-cyan)] pl-5">
                {/* aria-hidden on the halves so assistive tech reads the whole
                    sentence once rather than the fragments twice. */}
                <dt
                  className="text-[2.6rem] font-bold leading-none text-[var(--color-blue-deep)]"
                  aria-hidden="true"
                >
                  {s.to ? <CountUp to={s.to} display={s.value} /> : s.value}
                </dt>
                {/* The label is the LIGHTER blue. Setting it in blue-deep like
                    the figure above it flattened the pair into one block of the
                    same colour and the number stopped carrying the row.

                    blue-muted rather than the brand blue: at 12px on the tint
                    #348cbb measures 3.39:1, under what small text needs. See
                    the token's note in globals.css. */}
                <dd
                  className="mt-3 text-[0.78rem] font-semibold uppercase leading-snug tracking-[0.08em] text-[var(--color-blue-muted)]"
                  aria-hidden="true"
                >
                  {s.label}
                </dd>
                <dd className="sr-only">{s.sentence ?? `${s.value} ${s.label}`}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      {/*
        The "3 buckets" — Family, Himself, Work. Its block is literally called
        acf/hover-content-boxes: the title sits alone on the photograph and the
        copy appears on hover. The first build showed every word from the start
        under a heavy bottom-up gradient, which buried three good photographs
        and gave the section nothing to do.

        Same construction as the homepage's Investor / Executive / Speaker
        tiles, for the same reason: the copy is different lengths, it stays in
        flow even when transparent, and centring the whole stack lands each
        title somewhere else — which is exactly what "the bars don't line up"
        was. Three rows at md, minmax(0,1fr) either side of the title, so the
        titles and their rules resolve onto the same line whatever the copy does.

        The rest wash is 20% — `bg_overlay: "rgba(0,0,0,0.2)"` in the block —
        deepening on reveal so the copy can be read over the picture.

        tabIndex on the card because, unlike the homepage tiles, these are not
        links and so have nothing focusable to hang focus-within on. The copy is
        in the DOM at all times regardless, so a screen reader always reaches it.
      */}
      {/* White, not the tint. The counter band above it is #edf5f9 and the two
          together read as one long coloured field with a seam in the middle;
          the original changes back to white here. */}
      <Section>
        <Container>
          <p className="text-center text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-blue-deep)]">
            {lifeBoxesEyebrow}
          </p>
          <h2 className="mt-3 text-center text-[var(--color-blue-deep)]">{lifeBoxesHeading}</h2>
          <ul className="mt-12 grid gap-6 md:grid-cols-3 md:items-stretch">
            {lifeBoxes.map((box, i) => {
              const image = [img.aboutFamily, img.aboutHimself, img.aboutWork][i];
              return (
                <li
                  key={box.title}
                  tabIndex={0}
                  className="group relative flex min-h-[19rem] flex-col items-center justify-center overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-navy)] p-7 text-center text-white shadow-[var(--shadow-card)] md:grid md:min-h-[24rem] md:grid-rows-[minmax(0,1fr)_auto_minmax(0,1fr)]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${image})` }}
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-black/20 transition-colors duration-300 max-md:bg-[var(--color-navy)]/75 md:group-hover:bg-[var(--color-navy)]/80 md:group-focus:bg-[var(--color-navy)]/80"
                  />

                  <span className="relative mx-auto w-fit md:row-start-2">
                    <span className="block text-[1.7rem] font-bold leading-tight [text-shadow:0_2px_12px_rgba(0,0,0,0.55)] md:text-[2rem]">
                      {box.title}
                    </span>
                    <span
                      aria-hidden="true"
                      className="mt-2 block h-[3px] w-full bg-[var(--color-cyan)]"
                    />
                  </span>

                  <span className="relative mt-4 block text-[0.95rem] leading-relaxed text-white/90 transition-opacity duration-300 md:row-start-3 md:opacity-0 md:group-hover:opacity-100 md:group-focus:opacity-100">
                    {box.content}
                  </span>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/*
        The timeline. Its block sits exactly here in the export, directly after
        the hover boxes, and the first build dropped all eleven entries.
      */}
      <Timeline />

      {/*
        Steve's Investment Vehicles — and the last thing on the page, as it is
        the last block on the original.

        Two panels per card, the way the original draws them: the fund's mark on
        white above, and the copy on navy below with the stage, the name under a
        cyan rule, and the link. The white panel is a fixed height so both navy
        panels begin on the same line whatever the logos' proportions are.

        The name still ships as an <h3> in text beneath the mark rather than
        living only inside the image. A logo is not a heading, and a crawler
        reading this page should find "Dreamit Ventures" as words.
      */}
      <Section>
        <Container>
          <h2 className="text-center text-[1.6rem] uppercase tracking-[0.08em] text-[var(--color-blue-deep)]">
            {investmentVehicles.heading}
          </h2>
          <ul className="mt-10 grid gap-8 md:grid-cols-2 md:items-stretch">
            {investmentVehicles.vehicles.map((v) => (
              <li
                key={v.name}
                className="flex flex-col overflow-hidden border border-[var(--color-navy)]"
              >
                <div className="flex h-56 items-center justify-center bg-white p-10">
                  {v.logo && (
                    <Image
                      src={v.logo}
                      alt=""
                      aria-hidden="true"
                      width={480}
                      height={200}
                      className="h-auto max-h-full w-auto max-w-[17rem]"
                    />
                  )}
                </div>

                <div className="flex-1 bg-[var(--color-navy)] px-8 py-9 text-center text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.14em]">{v.stage}</p>
                  <h3 className="mt-3 text-white">
                    <span className="mx-auto block w-fit">
                      {v.name}
                      <span
                        aria-hidden="true"
                        className="mt-1 block h-[3px] w-full bg-[var(--color-cyan)]"
                      />
                    </span>
                  </h3>
                  <p className="mt-5 leading-relaxed text-white/90">{v.body}</p>
                  {v.href && (
                    <a
                      href={v.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block underline underline-offset-4 hover:text-[var(--color-cyan)]"
                    >
                      {v.linkLabel}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/*
        The booking ask. Not on the original — /about/ there simply stops after
        the vehicles — and it was taken out when the page was trimmed to end on
        them. Steve put it back, and it earns its place: this is the second most
        visited page on the site and it had no way to a booking on it at all.
        Everything above is the case for him; this is the only thing that lets
        someone act on it.
      */}
      <Section tone="ink">
        <Container className="text-center">
          <h2 className="text-white">Looking for a speaker?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Purpose, People, Process — delivered on multiple continents.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/speaking/">See the speaking page</Button>
            <Button href="/contact/" variant="secondary">Check availability</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
