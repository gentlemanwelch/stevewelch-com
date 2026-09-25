import Image from "next/image";
import type { Metadata } from "next";
import { site } from "@/content/site";
import {
  hero, proof, career, thesis, framework, customization, reel,
  builtForTheRoom, ideas, organizations,
} from "@/content/home";
import { bfc, selectedOrganizationLogos } from "@/content/media-manifest";
import { Container, Section, Button, JsonLd, VideoEmbed, Prose } from "@/components/primitives";
import { StatRow } from "@/components/kit/StatRow";
import { SectionHeading } from "@/components/kit/SectionHeading";
import { Chapter } from "@/components/kit/Chapter";
import { Framework } from "@/components/kit/Framework";
import { LogoStrip } from "@/components/kit/LogoStrip";
import { Testimonials } from "@/components/kit/Testimonials";
import { ClosingCta } from "@/components/kit/CtaBand";
import { PostList } from "@/components/kit/PostList";
import { getSubstackPosts } from "@/lib/substack";
import { speakingServiceSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

/**
 * THE HOMEPAGE — "Built for Change".
 *
 * Rebuilt from scratch on 2026-09-23 against the Built for Change handoff
 * packet. Section order is the packet's (01_HOMEPAGE_COPY §2–§12); all copy is
 * in content/home.ts, as written there.
 *
 * The positioning hierarchy the page has to deliver, in the packet's order:
 * Steve's stature → the thesis → Purpose/People/Process × AI → built for the room
 * → proof → conversion. The single rule underneath it: AI is the AMPLIFIER,
 * never the foundation.
 *
 * STATIC HTML, ALWAYS. Every section is a server component. The only client
 * JavaScript on this page is the framework's reveal (which only ever adds
 * motion to content already in the HTML) and the one delegated analytics
 * listener in the root layout. GPTBot, ClaudeBot and PerplexityBot execute no
 * JavaScript; everything on this page is visible to them.
 *
 * Revalidated hourly for the Ideas section's Substack feed — the same cadence
 * /writings-media/ already uses. The page is still prerendered.
 */
export const revalidate = 3600;

/*
 * TITLE: the spec's, verbatim — "Steve Welch | Built for Change | AI &
 * Leadership Keynote Speaker". It leads with the name, so it is set `absolute`
 * to stop the layout's "| Steve Welch" template appending the name a second
 * time. It carries the AI and keynote terms the H1 deliberately does not:
 * the spec says "H1 remains Built for Change", so the title tag and the first
 * H2 are where the search terms live.
 */
export const metadata: Metadata = {
  ...buildMetadata({
    title: "Built for Change | AI & Leadership Keynote Speaker",
    description: site.description,
    path: "/",
    keywords: [
      "AI keynote speaker",
      "AI and leadership keynote speaker",
      "keynote speaker on AI and organizational change",
      "AI transformation keynote speaker",
      "leadership keynote speaker",
      "organizational change keynote speaker",
      "Steve Welch",
    ],
  }),
  title: { absolute: "Steve Welch | Built for Change | AI & Leadership Keynote Speaker" },
};

const chapterImage = {
  mitos: { src: bfc.mitos, alt: bfc.mitosAlt, focus: "50% 45%" },
  dreamit: { src: bfc.dreamit, alt: bfc.dreamitAlt, focus: "22% 55%" },
  restore: { src: bfc.restore, alt: bfc.restoreAlt, focus: "30% 45%" },
  portrait: { src: bfc.portrait, alt: bfc.portraitAlt, focus: "22% 35%" },
} as const;

export default async function HomePage() {
  const posts = await getSubstackPosts(3);

  return (
    <>
      <JsonLd data={speakingServiceSchema()} />

      {/* ======================================================== §2 HERO */}
      {/*
        STEVE'S MOCKUP — 2026-09-25. He sent a hero concept made in ChatGPT
        and the stage photograph it was built from: a LIGHT hero, "BUILT FOR"
        in ink navy over "CHANGE." in royal blue, the photograph to the right
        with its blue curtains glowing out of the white. This replaces the
        navy side-by-side version, and brings the 25-year paragraph back into
        the hero, where the mockup has it.

        HOW IT FITS. From lg the copy column has a fixed width; the photograph
        fills everything to its right at full section height (object-cover),
        starting 2.5rem UNDER the copy's right edge. A wash of the hero's own
        pale colour covers that overlap solid and fades out across the
        curtains, before Steve — which is what turns the royal-blue curtains
        into the mockup's glow. Text only ever sits on the solid pale colour.

        WHERE STEVE STANDS. The photograph is 4:3 and the box beside the copy
        is squarer, so it is cropped left-right. The crop is a FIXED OFFSET,
        `max(-5.75rem, 100%)`, not a percentage: a percentage moves Steve
        relative to the box, and the box changes width with the screen, so no
        one percentage keeps him clear of the fade at every laptop width.
        -5.75rem puts his arm just past the fade at any section height the
        copy produces (1280–1920 measured: 42–46px past the copy's edge).
        `100%` takes over once the box is wide enough to show the whole
        photograph, so there is never a gap at the right.

        WHAT SHOWS, measured: from 1366 wide the whole slide, "AI · Amplifies
        Everything" included (at 1366 with 5px to spare); 1280–1365 trims
        the AI circle; 1024–1279 shows Steve and the slide's headline,
        trimmed at the right edge. The slide cannot fit whole any narrower —
        Steve and the AI circle are 1127px apart in the original, and the
        section is as tall as the copy, which sets the photograph's scale.
        Taller copy means a bigger photograph and less of the slide.

        Below lg the copy comes first and the photograph follows, whole
        across a tablet and cropped square on a phone on Steve and the slide
        headline. No fade there: over the dark stage rigging at the top of
        the frame a pale fade only turns grey.
      */}
      <section className="relative isolate overflow-hidden bg-tint-warm">
        <Container className="relative z-10">
          <div className="pb-10 pt-10 sm:pb-12 sm:pt-14 lg:flex lg:min-h-[min(calc(80svh-4.75rem),48rem)] lg:max-w-[27rem] lg:flex-col lg:justify-center lg:py-9 xl:max-w-[32rem]">
            <p className="mb-3 text-[0.9375rem] font-semibold uppercase leading-none tracking-[0.3em] text-navy lg:mb-4 lg:text-base">
              {hero.eyebrow}
            </p>
            <h1 className="display-xl text-navy lg:!text-[clamp(4rem,1.6rem+4vw,6rem)]">
              <span className="block">{hero.headingLines[0]}</span>{" "}
              <span className="block text-blue">{hero.headingLines[1]}</span>
            </h1>
            <h2 className="mt-4 !text-[clamp(1.25rem,1.05rem+0.6vw,1.625rem)] font-semibold leading-[1.25] !tracking-[-0.01em] text-navy">
              {hero.subhead}
            </h2>
            <p className="mt-4 text-ink-soft lg:text-[1.0625rem] lg:leading-[1.6] xl:text-[1.125rem]">
              {hero.body.split(hero.bodyTitle)[0]}
              <em>{hero.bodyTitle}</em>
              {hero.body.split(hero.bodyTitle)[1]}
            </p>
            <p className="mt-4 font-bold leading-normal text-navy lg:text-[1.0625rem] xl:text-[1.125rem]">{hero.thesis}</p>
            <div className="mt-7 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
              <Button href={site.cta.href} glyph="arrow" track="build_your_keynote_click" trackLocation="hero">
                {hero.primaryCta}
              </Button>
              <Button href="#reel" variant="outline" glyph="playDisc" track="watch_speaking_reel" trackLocation="hero_cta">
                {hero.secondaryCta}
              </Button>
            </div>
            {/* Each separator trails its item rather than leading the next,
                so when the line wraps on a phone the dot ends line one
                instead of opening line two. */}
            <p className="eyebrow mt-6 flex flex-wrap gap-x-3 gap-y-1 !tracking-[0.2em] text-ink-faint">
              {hero.credibility.map((item, i) => (
                <span key={item} className="flex gap-x-3">
                  <span>{item}</span>
                  {i < hero.credibility.length - 1 && <span aria-hidden="true">•</span>}
                </span>
              ))}
            </p>
          </div>
        </Container>

        {/*
          ONE image element for both layouts, so the hero preloads once.
          --copy-edge is where the copy column ends: the container's left
          gutter plus the column's max width, per breakpoint.

          The 1440 crop is written `min-[90rem]`, NOT `min-[1440px]`: Tailwind
          can only order breakpoints that share a unit with the theme's (rem),
          and a px one is emitted before lg and xl — which then override it,
          silently.
        */}
        <div
          className="relative aspect-square w-full overflow-hidden sm:aspect-[3/2] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[calc(var(--copy-edge)-2.5rem)] lg:aspect-auto lg:w-auto lg:[--copy-edge:calc(3rem+27rem)] xl:[--copy-edge:calc(max(0px,(100%-82.5rem)/2)+3rem+32rem)]"
        >
          <Image
            src={bfc.hero}
            alt={bfc.heroAlt}
            fill
            priority
            sizes="(min-width: 1024px) 1100px, (min-width: 640px) 100vw, 135vw"
            className="object-cover object-[30%_50%] sm:object-[50%_25%] lg:object-[max(-5.75rem,100%)_50%]"
          />
          {/* From lg: solid pale under the copy's last 2.5rem, then an eased
              fade across the curtains that is gone before Steve. */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 hidden w-[6.5rem] lg:block"
            style={{
              background:
                "linear-gradient(to right, var(--color-tint-warm) 0, var(--color-tint-warm) 2.5rem, color-mix(in srgb, var(--color-tint-warm) 80%, transparent) 3.25rem, color-mix(in srgb, var(--color-tint-warm) 35%, transparent) 4.75rem, transparent 100%)",
            }}
          />
        </div>
      </section>

      {/* ================================================== PROOF STRIP */}
      {/* The brief's §3: fast, objective proof before the career narrative. */}
      <section className="border-y border-line bg-white py-12 md:py-16">
        <Container>
          <StatRow stats={proof} />
        </Container>
      </section>

      {/* =============================================== §3 CAREER AUTHORITY */}
      <Section>
        <Container>
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-end lg:gap-16">
            <SectionHeading eyebrow={career.eyebrow} lines={career.heading} />
            <p className="lede max-w-xl">{career.intro}</p>
          </div>
          <div className="mt-14 grid gap-x-12 gap-y-16 sm:grid-cols-2 lg:mt-20 lg:gap-x-16 lg:gap-y-20">
            {career.chapters.map((c) => (
              <Chapter
                key={c.name}
                name={c.name}
                headline={c.headline}
                body={c.body}
                image={chapterImage[c.image].src}
                alt={chapterImage[c.image].alt}
                focus={chapterImage[c.image].focus}
              />
            ))}
          </div>
        </Container>
      </Section>

      {/* ================================================ §4 CHANGE THESIS */}
      {/* A slide: one idea, the heading at display size, one line under it.
          The brief keeps this "primarily visual" and the full explanation
          for the framework below. */}
      <section className="bg-navy py-20 text-white md:py-28 lg:py-36">
        <Container>
          <h2 className="display-lg text-white">
            <span className="block">{thesis.headingLines[0]}</span>{" "}
            <span className="block text-cyan">{thesis.headingLines[1]}</span>
          </h2>
          <p className="lede mt-10 max-w-3xl text-white/80 lg:mt-14">{thesis.body}</p>
        </Container>
      </section>

      {/* ==================================================== §5 FRAMEWORK */}
      <Section tone="alt">
        <Container>
          <SectionHeading eyebrow={framework.eyebrow} lines={framework.headingLines} className="max-w-5xl [&_h2]:!text-[clamp(1.75rem,1rem+2.6vw,3.125rem)]" />
          <div className="mt-12 lg:mt-16">
            <Framework steps={framework.steps} amplifier={framework.amplifier} />
          </div>
          <p className="mt-10 max-w-3xl text-[clamp(1.25rem,1rem+1vw,1.75rem)] font-semibold leading-snug text-navy lg:mt-14">
            {framework.supporting}
          </p>
        </Container>
      </Section>

      {/* ============================================ §6 BUILT FOR THE ROOM */}
      <Section>
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <SectionHeading eyebrow={customization.eyebrow} lines={customization.headingLines} accentLast />
            <p className="lede lg:pt-12">{customization.body}</p>
          </div>
          <ul className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8 lg:mt-20">
            {customization.inputs.map((input) => (
              <li key={input.name} className="border-t-2 border-navy pt-6">
                <p className="eyebrow !text-[0.875rem] font-bold text-navy">{input.name}</p>
                <p className="mt-3 text-lg leading-snug text-navy">{input.line}</p>
              </li>
            ))}
          </ul>
          <div className="mt-12">
            <Button href={site.cta.href} glyph="arrow" track="build_your_keynote_click" trackLocation="customization">
              {site.cta.label}
            </Button>
          </div>
        </Container>
      </Section>

      {/* ================================================= §7 SPEAKING REEL */}
      <section id="reel" className="bg-navy py-14 md:py-20 lg:py-28">
        <Container>
          <SectionHeading eyebrow={reel.eyebrow} lines={reel.heading} tone="dark" />
          <div className="mt-10 lg:mt-14">
            <VideoEmbed youtubeId={reel.youtubeId} title={reel.overlay} poster={bfc.reelPoster} trackLocation="reel" />
          </div>
        </Container>
      </section>

      {/* ==================================================== §8 IN PRACTICE */}
      {/* Not a case study — see the note on builtForTheRoom in
          content/home.ts. The framework, applied to one room. */}
      <Section>
        <Container>
          <SectionHeading eyebrow={builtForTheRoom.eyebrow} lines={builtForTheRoom.heading} className="max-w-4xl" />
          <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div>
              <h3 className="text-action">{builtForTheRoom.subhead}</h3>
              <Prose paragraphs={builtForTheRoom.body} className="mt-5" />
              <ul className="mt-8 divide-y divide-line-strong border-y border-line-strong">
                {builtForTheRoom.principles.map((p) => (
                  <li key={p.name} className="py-4 leading-snug text-navy">
                    <span className="font-extrabold uppercase tracking-tight">{p.name}</span> {p.line}
                  </li>
                ))}
              </ul>
            </div>
            {/* Typographic archetypes — never photographs of people. */}
            <div className="flex flex-col">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                {builtForTheRoom.panels.map((panel, i) => (
                  <div
                    key={panel.name}
                    className={`flex flex-col justify-between rounded-[var(--radius-base)] p-6 sm:min-h-[18rem] lg:p-8 ${
                      i === 0 ? "bg-navy text-white" : "bg-tint text-navy"
                    }`}
                  >
                    <p className={`eyebrow !text-[0.875rem] font-bold ${i === 0 ? "text-cyan" : "text-action"}`}>
                      {panel.name}
                    </p>
                    <ul className="mt-8 space-y-1.5 text-lg font-semibold leading-snug">
                      {panel.traits.map((t) => <li key={t}>{t}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="mt-6 border-t-2 border-navy pt-5 text-[clamp(1.25rem,1rem+0.9vw,1.625rem)] font-extrabold leading-snug tracking-tight text-navy">
                {builtForTheRoom.payoff}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* ========================================================= §9 IDEAS */}
      {/* Deliberately quieter than the speaking path above it. */}
      <Section tone="alt">
        <Container>
          {/* Two columns only when there are essays to fill the second;
              otherwise an empty 60% column reads as a rendering fault. */}
          <div className={`grid gap-10 ${posts.length > 0 ? "lg:grid-cols-[1fr_1.6fr] lg:gap-16" : ""}`}>
            <div>
              <SectionHeading eyebrow={ideas.eyebrow} lines={ideas.heading} className="[&_h2]:!text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)]" />
              <p className="mt-5 max-w-md">{ideas.body}</p>
              <div className="mt-6">
                <Button href="/writings-media/" variant="ghost" glyph="arrow">{ideas.cta}</Button>
              </div>
            </div>
            {/*
              Real essays only. If the feed is unreachable at build time the
              list is simply absent — the packet: "Use real article titles and
              dates. Do not hard-code fake article names."
            */}
            {posts.length > 0 && <PostList posts={posts} location="home_ideas" />}
          </div>
        </Container>
      </Section>

      {/* ======================================= §10 SELECTED ORGANIZATIONS */}
      <Section>
        <Container>
          <p className="eyebrow mb-12 text-center text-ink-faint lg:mb-14">{organizations.eyebrow}</p>
          <LogoStrip logos={selectedOrganizationLogos} />
        </Container>
      </Section>

      {/* ================================================== §11 TESTIMONIALS */}
      {/* An organizer first, the press second — see components/kit/Testimonials.tsx. */}
      <section className="border-t border-line bg-white py-16 md:py-24">
        <Container>
          <Testimonials />
        </Container>
      </section>

      {/* ===================================================== §12 FINAL CTA */}
      {/* The band every page closes on — see components/kit/CtaBand.tsx for
          the wash and its measurements. */}
      <ClosingCta location="final_cta" />
    </>
  );
}
