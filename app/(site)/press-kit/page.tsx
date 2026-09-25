import Link from "next/link";
import type { Metadata } from "next";
import { site } from "@/content/site";
import { bioOneLine, bioShort, bioLong, credentials } from "@/content/bio";
import { talks } from "@/content/speaking";
import { eventPlanners as ep } from "@/content/event-planners";
import { Container, Section, Button } from "@/components/primitives";
import { PageHero } from "@/components/kit/PageHero";
import { SectionHeading } from "@/components/kit/SectionHeading";
import { SquareList } from "@/components/kit/SquareList";
import { ClosingCta } from "@/components/kit/CtaBand";
import { buildMetadata } from "@/lib/seo";

/**
 * Event Planners, at /press-kit/ — see content/event-planners.ts for why the
 * URL did not change with the name.
 *
 * The one page on this site that was not on the WordPress original. It earns
 * its place: organizers search "<name> press kit" and "<name> speaker bio"
 * directly, and every answer published here is an email that does not need
 * to be sent before the event.
 *
 * TOPICS come from `talks`, the list the /speaking/[pillar] route builds its
 * pages from. They used to be spelled out here as `[...speakingPillars,
 * hyperWellness]`, and so left out the AI keynote — the one most requested.
 */
export const metadata: Metadata = buildMetadata({
  title: "Event Planners — Press Kit, Bios and Stage Introduction",
  description:
    "Speaker bios, introduction, topics, and technical requirements for events featuring Steve Welch. Everything an event organizer needs, ready to use.",
  path: "/press-kit/",
  keywords: ["Steve Welch press kit", "Steve Welch speaker bio", "Steve Welch headshot", "speaker one sheet"],
});

const bios = [
  { label: ep.bioLabels.oneLine, paragraphs: [bioOneLine] },
  { label: ep.bioLabels.short, paragraphs: [bioShort] },
  { label: ep.bioLabels.long, paragraphs: bioLong },
];

/* A label, not a headline: these name a block of copy to lift. */
const label = "eyebrow !text-[0.875rem] font-bold text-navy";

export default function EventPlannersPage() {
  return (
    <>
      <PageHero
        eyebrow={ep.eyebrow}
        title={ep.heading}
        lede={ep.body}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: ep.navName, path: "/press-kit/" },
        ]}
      >
        <Button href={site.cta.href} glyph="arrow" track="build_your_keynote_click" trackLocation="event_planners_hero">
          {site.cta.label}
        </Button>
      </PageHero>

      <Section>
        <Container>
          <SectionHeading lines={ep.biosHeading} />
          <div className="mt-10 lg:mt-14">
            {bios.map((bio) => (
              <div key={bio.label} className="grid gap-4 border-t-2 border-navy py-8 lg:grid-cols-[16rem_1fr] lg:gap-12 lg:py-10">
                <h3 className={label}>{bio.label}</h3>
                <div className="max-w-[46rem] space-y-4 leading-relaxed">
                  {bio.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <SectionHeading lines={ep.introHeading}>
            <p className="mt-4">{ep.introNote}</p>
          </SectionHeading>
          <blockquote className="mt-10 max-w-4xl border-l-4 border-action pl-6 text-[clamp(1.25rem,1.05rem+0.8vw,1.625rem)] font-medium leading-relaxed text-navy lg:pl-10">
            {ep.stageIntroduction}
          </blockquote>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20">
            <div>
              <h2 className="!text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)] font-extrabold">{ep.topicsHeading}</h2>
              <ul className="mt-8 divide-y divide-line-strong border-y border-line-strong">
                {talks.map((talk) => (
                  <li key={talk.slug}>
                    <Link href={`/speaking/${talk.slug}/`} className="group block py-5">
                      <span className="block text-lg font-bold text-navy transition-colors group-hover:text-action">
                        {talk.name} <span aria-hidden="true" className="text-action">→</span>
                      </span>
                      <span className="mt-1 block text-[0.9375rem] leading-relaxed">{talk.statement}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="!text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)] font-extrabold">{ep.avHeading}</h2>
              <SquareList items={ep.avRequirements} className="mt-8 text-navy" />

              <h2 className="mt-14 !text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)] font-extrabold">{ep.photoHeading}</h2>
              <p className="mt-5 leading-relaxed">
                {ep.photoBefore}{" "}
                <a className="font-semibold text-action underline underline-offset-4 hover:text-action-dark" href={`mailto:${site.email}`}>
                  {site.email}
                </a>{" "}
                {ep.photoAfter}
              </p>
              <p className="mt-4 leading-relaxed">{ep.somethingElse}</p>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <h2 className="sr-only">{ep.factSheetHeading}</h2>
          <dl className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {credentials.map((item) => (
              <div key={item.label} className="border-t-2 border-navy pt-5">
                <dt className="text-xl font-extrabold leading-snug text-navy">{item.label}</dt>
                <dd className="mt-2 text-[0.9375rem] leading-relaxed">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <ClosingCta location="event_planners_final_cta" />
    </>
  );
}
