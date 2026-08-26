import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { speakingPillars, hyperWellness, anvilQuote } from "@/content/speaking";
import { site } from "@/content/site";
import { Container, Section, Eyebrow, Button, Prose, JsonLd } from "@/components/primitives";
import { breadcrumbSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

/**
 * One page per pillar: /speaking/purpose/, /people/, /process/,
 * /hyper-wellness/.
 *
 * These are the site's only structural addition, and the reason is narrow: an
 * organizer searching "employee wellbeing keynote speaker" and one searching
 * "change management keynote speaker" have different problems, and the single
 * /speaking/ page cannot rank for both because it cannot be about both. Each
 * pillar is already a distinct argument on the original — this gives each one
 * room to be made properly.
 *
 * Nothing was removed from /speaking/ to build these. The hub still carries all
 * four, and links down.
 */

type Entry = {
  slug: string;
  name: string;
  statement: string;
  points: string[];
  body: string[];
  audiences: string[];
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
};

/** Hyper wellness has no bullet list on the original, so it gets an empty one. */
const entries: Entry[] = [
  ...speakingPillars,
  { ...hyperWellness, points: [] },
];

const getEntry = (slug: string) => entries.find((e) => e.slug === slug);

export function generateStaticParams() {
  return entries.map((e) => ({ pillar: e.slug }));
}

/** Anything else 404s — a soft 404 gets indexed and dilutes the real pages. */
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

export default async function PillarPage({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar } = await params;
  const entry = getEntry(pillar);
  if (!entry) notFound();

  const others = entries.filter((e) => e.slug !== entry.slug);

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
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Speaking", path: "/speaking/" },
          { name: entry.name, path: `/speaking/${entry.slug}/` },
        ])}
      />

      <section className="border-b border-[var(--color-line)] bg-[var(--color-tint)]">
        <Container className="py-14 sm:py-20">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--color-ink-faint)]">
              <li><Link href="/" className="hover:text-[var(--color-accent)]">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/speaking/" className="hover:text-[var(--color-accent)]">Speaking</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-[var(--color-ink)]">{entry.name}</li>
            </ol>
          </nav>

          <Eyebrow>Speaking</Eyebrow>
          <h1 className="max-w-3xl">{entry.name}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-soft)]">
            {entry.statement}
          </p>
          <div className="mt-8">
            <Button href="/contact/">Book Steve to Speak</Button>
          </div>
        </Container>
      </section>

      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
            <div>
              <h2 className="sr-only">About this session</h2>
              <Prose paragraphs={entry.body} />

              {entry.points.length > 0 && (
                <>
                  <h2 className="mt-14 text-2xl sm:text-3xl">What it covers</h2>
                  <ul className="mt-6 space-y-3">
                    {entry.points.map((point) => (
                      <li key={point} className="flex gap-3 leading-relaxed">
                        <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-blue)]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]">
                <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
                  Built for
                </h2>
                <ul className="mt-3 space-y-2 text-[0.95rem] text-[var(--color-ink-soft)]">
                  {entry.audiences.map((a) => <li key={a}>{a}</li>)}
                </ul>
              </div>
              <div className="rounded-[var(--radius-card)] bg-[var(--color-tint)] p-6">
                <blockquote className="leading-relaxed text-[var(--color-ink)]">
                  “{anvilQuote}”
                </blockquote>
                <Link
                  href="/contact/"
                  className="mt-4 inline-block text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-ink)]"
                >
                  Start a conversation →
                </Link>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <h2 className="text-2xl sm:text-3xl">The rest of the framework</h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-3">
            {others.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/speaking/${other.slug}/`}
                  className="group flex h-full flex-col rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]"
                >
                  <h3 className="text-[var(--color-blue)]">{other.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                    {other.statement}
                  </p>
                  <span className="mt-4 text-sm font-semibold text-[var(--color-accent)]">Read →</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
