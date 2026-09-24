import Image from "next/image";
import type { Metadata } from "next";
import { site } from "@/content/site";
import {
  aboutHero, aboutLabels, byTheNumbers, lifeBoxesEyebrow, lifeBoxesHeading, lifeBoxes,
  investmentVehicles,
} from "@/content/bio";
import { img } from "@/content/media-manifest";
import { Container, Section } from "@/components/primitives";
import { PageHero } from "@/components/kit/PageHero";
import { SectionHeading } from "@/components/kit/SectionHeading";
import { StatRow } from "@/components/kit/StatRow";
import { Chapter } from "@/components/kit/Chapter";
import { CtaBand } from "@/components/kit/CtaBand";
import { Timeline } from "@/components/Timeline";
import { buildMetadata } from "@/lib/seo";

/**
 * /about/ — rebuilt for Built for Change.
 *
 * Order: hero → by the numbers → the three buckets (Family, Himself, Work) →
 * the timeline → the investment vehicles → a booking close.
 *
 * WHAT CHANGED, beyond the look:
 *   - The hero photograph sits beside the copy. It used to sit under it, with
 *     a black ramp measured at 5.1:1 over the brightest water in the frame.
 *   - The three buckets used to hide their copy until hover — which a phone
 *     cannot do and a keyboard only could because the cards were given a
 *     tabIndex. The copy is now simply under each photograph.
 *
 * The Restore and Dreamit origin stories in content/bio.ts (`restoreOrigin`,
 * `dreamitOrigin`) are still not rendered, as before this rebuild. The
 * homepage's career section now tells that story; putting them here as well
 * is Steve's call, not a layout decision.
 */
export const metadata: Metadata = buildMetadata({
  title: "About — Entrepreneur, Investor, Speaker",
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

const bucketImages = [
  { src: img.aboutFamily, alt: "Steve Welch and his family on a boat", focus: "50% 40%" },
  { src: img.aboutHimself, alt: "Steve Welch holding a surfboard at the beach", focus: "50% 35%" },
  { src: img.aboutWork, alt: "Steve Welch speaking on stage", focus: "50% 35%" },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={aboutHero.eyebrow}
        title={aboutHero.heading}
        lede={aboutHero.body}
        longTitle
        image={{ src: img.aboutHero, alt: "Steve Welch kiteboarding", focus: "86% 60%" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "About", path: "/about/" },
        ]}
      />

      <Section tone="alt">
        <Container>
          <SectionHeading lines={aboutLabels.numbersHeading} />
          <div className="mt-10 lg:mt-14">
            {/* The numbers count up as they arrive; each is also in the HTML
                as its final value and as a complete sentence. See StatRow. */}
            <StatRow stats={byTheNumbers} />
          </div>
        </Container>
      </Section>

      {/* The "3 buckets" — Family, Himself, Work. */}
      <Section>
        <Container>
          <SectionHeading eyebrow={lifeBoxesEyebrow} lines={lifeBoxesHeading} className="max-w-4xl" />
          <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-3 lg:mt-16 lg:gap-x-12">
            {lifeBoxes.map((box, i) => (
              <Chapter
                key={box.title}
                headline={box.title}
                body={box.content}
                image={bucketImages[i].src}
                alt={bucketImages[i].alt}
                focus={bucketImages[i].focus}
                sizes="(min-width: 768px) 30vw, 100vw"
              />
            ))}
          </div>
        </Container>
      </Section>

      <Timeline />

      {/*
        Steve's Investment Vehicles. The name ships as an <h3> in text beneath
        the mark rather than living only inside the image: a logo is not a
        heading, and a crawler reading this page should find "Dreamit
        Ventures" as words.
      */}
      <Section tone="alt">
        <Container>
          <SectionHeading lines={investmentVehicles.heading} />
          <ul className="mt-12 grid gap-x-12 gap-y-14 md:grid-cols-2 lg:mt-16 lg:gap-x-16">
            {investmentVehicles.vehicles.map((v) => (
              <li key={v.name} className="flex flex-col border-t-2 border-navy pt-8">
                <div className="flex h-20 items-center">
                  {v.logo && (
                    <Image
                      src={v.logo}
                      alt=""
                      aria-hidden="true"
                      width={480}
                      height={200}
                      className="h-auto max-h-full w-auto max-w-[15rem]"
                    />
                  )}
                </div>
                <p className="eyebrow mt-8 text-action">{v.stage}</p>
                <h3 className="mt-2 !text-[clamp(1.625rem,1.1rem+1.8vw,2.5rem)] font-extrabold leading-[1.08] tracking-tight">
                  {v.name}
                </h3>
                <p className="mt-4 max-w-xl leading-relaxed">{v.body}</p>
                {v.href && (
                  <a
                    href={v.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-6 w-fit items-center font-bold text-action underline underline-offset-4 hover:text-action-dark"
                  >
                    {v.linkLabel}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/*
        The booking ask. Not on the original — /about/ there simply stops after
        the vehicles — and Steve put it back: this is the second most visited
        page on the site, and everything above is the case for him; this is the
        only thing on it that lets someone act on that.
      */}
      <CtaBand
        heading={aboutLabels.closing.heading}
        body={aboutLabels.closing.body}
        primary={{ label: site.cta.label, href: site.cta.href, track: "build_your_keynote_click" }}
        secondary={{ label: aboutLabels.closing.speakingLink, href: "/speaking/" }}
        location="about_final_cta"
      />
    </>
  );
}
