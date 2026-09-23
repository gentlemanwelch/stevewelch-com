import Image from "next/image";
import type { Metadata } from "next";
import { site } from "@/content/site";
import {
  hero, career, thesis, framework, customization, reel,
  caseStudy, ideas, organizations, testimonial, finalCta,
} from "@/content/home";
import { anvilQuote } from "@/content/speaking";
import { bfc, img, selectedOrganizationLogos } from "@/content/media-manifest";
import { Container, Section, Eyebrow, Button, JsonLd, VideoEmbed, Prose } from "@/components/primitives";
import { SectionHeading } from "@/components/kit/SectionHeading";
import { Chapter } from "@/components/kit/Chapter";
import { Framework } from "@/components/kit/Framework";
import { LogoStrip } from "@/components/kit/LogoStrip";
import { QuoteBlock } from "@/components/kit/QuoteBlock";
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
 * Steve's stature → the thesis → Purpose/People/Process × AI → customization
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
        Copy left on solid navy, photograph right — so the headline never sits
        on the picture and its contrast is guaranteed (white on #042e43 is
        14.2:1) rather than measured crop by crop. The spec: copy ~40–45%,
        image ~55–60%, Steve "visually dominant".

        ONE image element serves both layouts: in flow below the copy on a
        phone (the spec's "copy first… image immediately below, full width"),
        pinned to the right half from lg. Two <Image priority> elements would
        preload the hero twice at two sizes.
      */}
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <Container className="relative z-10">
          <div className="pb-12 pt-10 sm:pb-16 sm:pt-14 lg:flex lg:min-h-[min(calc(90svh-4.75rem),56rem)] lg:w-[46%] lg:flex-col lg:justify-center lg:py-20 lg:pr-6">
            <Eyebrow tone="onDark">{hero.eyebrow}</Eyebrow>
            <h1 className="display-xl text-white">{hero.heading}</h1>
            <h2 className="mt-5 !text-[clamp(1.375rem,1.05rem+1.3vw,2.125rem)] font-semibold leading-[1.2] !tracking-[-0.01em] text-white">
              {hero.subhead}
            </h2>
            <p className="mt-6 max-w-xl text-white/80">{hero.body}</p>
            <p className="mt-4 max-w-xl font-semibold text-white">{hero.thesis}</p>
            <div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:flex-wrap">
              <Button href={site.cta.href} glyph="arrow" track="build_your_keynote_click" trackLocation="hero">
                {hero.primaryCta}
              </Button>
              <Button href="#reel" variant="outlineLight" glyph="play" track="watch_speaking_reel" trackLocation="hero_cta">
                {hero.secondaryCta}
              </Button>
            </div>
            {/* Each separator trails its item rather than leading the next,
                so when the line wraps on a phone the dot ends line one
                instead of opening line two. */}
            <p className="eyebrow mt-9 flex flex-wrap gap-x-3 gap-y-1 text-white/75">
              {hero.credibility.map((item, i) => (
                <span key={item} className="flex gap-x-3">
                  <span>{item}</span>
                  {i < hero.credibility.length - 1 && <span aria-hidden="true" className="text-cyan">·</span>}
                </span>
              ))}
            </p>
          </div>
        </Container>

        <div className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/10] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[56%]">
          <Image
            src={bfc.hero}
            alt={bfc.heroAlt}
            fill
            priority
            sizes="(min-width: 1024px) 56vw, 100vw"
            /* Cropped low and slightly left so Steve carries the frame and
               the event's logo behind him recedes — the spec: Steve "should
               not be visually subordinate to the projected slide".

               Below lg the frame is full-width but short, and object-cover
               cannot zoom past "cover", so a portrait photograph shows him at
               about half height. The 1.3 scale, anchored on him, is what makes
               him the subject on a phone. Stand-in specific: re-check when the
               packet's own hero image replaces this one. */
            className="object-cover object-[46%_72%] max-lg:origin-[46%_62%] max-lg:scale-[1.3]"
          />
          {/* Blends the photograph into the navy: from the top on a phone,
              where the image follows the copy; from the left from lg, where
              it sits beside it. */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-navy to-transparent lg:hidden" />
          <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[30%] bg-gradient-to-r from-navy via-navy/60 to-transparent lg:block" />
        </div>
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
      {/* A slide. Navy, one idea, the largest type on the page after the H1. */}
      <section className="bg-navy py-20 text-white md:py-28 lg:py-36">
        <Container>
          <SectionHeading lines={thesis.headingLines} tone="dark" accentLast />
          <div className="mt-10 grid gap-6 lg:mt-14 lg:grid-cols-2 lg:gap-16">
            <p className="lede text-white/80">{thesis.body}</p>
            <p className="lede font-semibold text-white">{thesis.emphasis}</p>
          </div>
          <p className="display-lg mt-16 text-white lg:mt-28">
            {thesis.display.lead} <span className="text-cyan">{thesis.display.accent}</span>
          </p>
          <p className="eyebrow mt-8 !text-[0.9375rem] text-white/75">{thesis.statement}</p>
        </Container>
      </section>

      {/* ==================================================== §5 FRAMEWORK */}
      <Section tone="alt">
        <Container>
          <SectionHeading eyebrow={framework.eyebrow} lines={framework.headingLines} className="max-w-5xl [&_h2]:!text-[clamp(1.75rem,1rem+2.6vw,3.125rem)]">
            <h3 className="mt-6 !text-[clamp(1.25rem,1rem+0.9vw,1.75rem)] font-semibold text-action">
              {framework.supporting}
            </h3>
          </SectionHeading>
          <div className="mt-12 lg:mt-16">
            <Framework steps={framework.steps} amplifier={framework.amplifier} />
          </div>
          <p className="lede mt-10 max-w-3xl text-navy lg:mt-14">{framework.explanation}</p>
        </Container>
      </Section>

      {/* ================================================ §6 CUSTOMIZATION */}
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

      {/* ==================================================== §8 CASE STUDY */}
      <Section>
        <Container>
          <SectionHeading eyebrow={caseStudy.eyebrow} lines={caseStudy.heading} className="max-w-4xl" />
          <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
            <div>
              <h3 className="text-action">{caseStudy.subhead}</h3>
              <Prose paragraphs={caseStudy.body} className="mt-5" />
              <p className="mt-6 text-lg font-semibold leading-snug text-navy">{caseStudy.conclusion}</p>
            </div>
            {/* Typographic archetypes — never photographs of people. */}
            <div className="flex flex-col">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                {caseStudy.panels.map((panel, i) => (
                  <div
                    key={panel.name}
                    className={`flex flex-col justify-between rounded-[var(--radius-base)] p-6 sm:min-h-[16rem] lg:p-8 ${
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
              <p className="mt-5 border-t-2 border-navy pt-4 text-center text-lg font-bold text-navy">
                {caseStudy.connector}
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
            {posts.length > 0 && (
              <ul className="divide-y divide-line-strong border-y border-line-strong">
                {posts.map((post) => (
                  <li key={post.url}>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-track="ideas_article_click"
                      data-track-location="home_ideas"
                      data-track-label={post.title}
                      className="group flex flex-col gap-1 py-6 sm:flex-row sm:items-baseline sm:gap-8"
                    >
                      {post.date && (
                        <time dateTime={post.isoDate || undefined} className="eyebrow shrink-0 text-ink-faint sm:w-36">
                          {post.date}
                        </time>
                      )}
                      <span className="text-xl font-bold leading-snug text-navy transition-colors group-hover:text-action">
                        {post.title}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
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

      {/* =================================================== §11 TESTIMONIAL */}
      <Section tone="alt">
        <Container>
          <QuoteBlock quote={anvilQuote} source={testimonial.source} masthead={img.inquirerLogo} />
        </Container>
      </Section>

      {/* ===================================================== §12 FINAL CTA */}
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <Image
          src={bfc.closing}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover object-[72%_50%]"
        />
        {/*
          The wash, measured with the type hidden (so the sample is the
          photograph, not the glyphs' antialiasing): at 0.80 the worst pixel
          behind the text column gives white 7.62:1, the 80%-white reassurance
          line 5.60:1, the body 6.05:1 — every line clears 4.5:1. The eyebrow
          is white rather than cyan here for the same reason; see Eyebrow.
        */}
        <div aria-hidden="true" className="absolute inset-0 bg-navy/80" />
        <Container className="relative py-24 text-center md:py-32 lg:py-40">
          <SectionHeading eyebrow={finalCta.eyebrow} lines={finalCta.heading} tone="photo" className="mx-auto max-w-4xl [&_h2]:!text-[clamp(2.25rem,1.3rem+3.6vw,4.25rem)]" />
          <p className="lede mx-auto mt-6 max-w-2xl text-white/85">{finalCta.body}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 min-[420px]:flex-row">
            <Button href={site.cta.href} glyph="arrow" track="build_your_keynote_click" trackLocation="final_cta">
              {finalCta.primary}
            </Button>
            <Button href={site.cta.href} variant="outlineLight" track="check_availability_click" trackLocation="final_cta">
              {finalCta.secondary}
            </Button>
          </div>
          <p className="mt-8 text-[0.9375rem] text-white/80">{finalCta.reassurance}</p>
        </Container>
      </section>
    </>
  );
}
