import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { talks, speakingLabels } from "@/content/speaking";
import { organizerTestimonial } from "@/content/home";
import { site } from "@/content/site";
import { Container, Section, Button, Prose, JsonLd } from "@/components/primitives";
import { PageHero } from "@/components/kit/PageHero";
import { SquareList } from "@/components/kit/SquareList";
import { LinkCard, LinkGrid } from "@/components/kit/LinkCard";
import { ClosingCta } from "@/components/kit/CtaBand";
import { buildMetadata } from "@/lib/seo";

/**
 * One page per keynote: /speaking/purpose/, /people/, /process/,
 * /driving-change-in-the-age-of-ai/, /hyper-wellness/.
 *
 * These are the site's only structural addition, and the reason is narrow: an
 * organizer searching "employee wellbeing keynote speaker" and one searching
 * "change management keynote speaker" have different problems, and the single
 * /speaking/ page cannot rank for both because it cannot be about both. Each
 * pillar is already a distinct argument on the original — this gives each one
 * room to be made properly.
 *
 * Nothing was removed from /speaking/ to build these. The hub still carries all
 * of them, and links down.
 *
 * The breadcrumb markup used to list "Home" twice (Home › Home › Speaking ›
 * Purpose). It is now built by Breadcrumbs from the same trail as the visible
 * one, so the two cannot disagree.
 */

const getEntry = (slug: string) => talks.find((e) => e.slug === slug);

export function generateStaticParams() {
  return talks.map((e) => ({ pillar: e.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string }>;
}): Promise<Metadata> {
  const { pillar } = await params;
  const entry = getEntry(pillar);
  if (!entry) return {};
  return buildMetadata({
    title: entry.seoTitle,
    description: entry.metaDescription,
    path: `/speaking/${entry.slug}/`,
    keywords: entry.keywords,
    type: "article",
  });
}

/* A label over an aside block — an aside to the argument, not a rival
   headline. */
const noteHeading = "eyebrow !text-[0.875rem] font-bold text-navy";

export default async function PillarPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar } = await params;
  const entry = getEntry(pillar);
  if (!entry) notFound();

  const others = talks.filter((e) => e.slug !== entry.slug);
  const location = `topic_${entry.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          "@id": `${site.url}/speaking/${entry.slug}/#service`,
          name: `${entry.name} — keynote by ${site.name}`,
          serviceType: "Keynote speaking",
          description: entry.metaDescription,
          url: `${site.url}/speaking/${entry.slug}/`,
          provider: { "@id": `${site.url}/#person` },
          areaServed: "Worldwide",
          audience: entry.audiences.map((a) => ({ "@type": "Audience", audienceType: a })),
        }}
      />

      <PageHero
        eyebrow={speakingLabels.topicEyebrow}
        title={entry.name}
        lede={entry.statement}
        image={entry.image}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Speaking", path: "/speaking/" },
          { name: entry.name, path: `/speaking/${entry.slug}/` },
        ]}
      >
        <Button href={site.cta.href} glyph="arrow" track="build_your_keynote_click" trackLocation={location}>
          {site.cta.label}
        </Button>
      </PageHero>

      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
            <div>
              <h2 className="sr-only">{speakingLabels.about}</h2>
              <Prose paragraphs={entry.body} className="max-w-[42rem]" />

              {entry.points.length > 0 && (
                <>
                  <h2 className="mt-14 !text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)] font-extrabold">{speakingLabels.covers}</h2>
                  <SquareList items={entry.points} className="mt-6 max-w-[42rem] text-navy" />
                </>
              )}
            </div>

            <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
              <div className="border-t-2 border-navy pt-5">
                <h2 className={noteHeading}>{speakingLabels.builtFor}</h2>
                <SquareList items={entry.audiences} className="mt-4 text-[1rem] text-navy" />
              </div>
              {/* An organizer's words, attributed — see `organizerTestimonial`
                  in content/home.ts for the source and permission. */}
              <figure className="border-t-2 border-navy pt-5">
                <blockquote className="text-lg font-bold leading-snug text-navy">“{organizerTestimonial.quote}”</blockquote>
                <figcaption className="mt-4">
                  <span className="eyebrow block !font-bold text-navy">{organizerTestimonial.name}</span>
                  <span className="mt-1 block text-[0.9375rem] leading-snug text-ink-faint">{organizerTestimonial.role}</span>
                </figcaption>
              </figure>
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <h2 className="!text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)] font-extrabold">{speakingLabels.rest}</h2>
          <div className="mt-10">
            <LinkGrid columns={4}>
              {others.map((other) => (
                <li key={other.slug}>
                  <LinkCard
                    href={`/speaking/${other.slug}/`}
                    title={other.name}
                    body={other.statement}
                    action={speakingLabels.read}
                  />
                </li>
              ))}
            </LinkGrid>
          </div>
        </Container>
      </Section>

      <ClosingCta location={location} />
    </>
  );
}
