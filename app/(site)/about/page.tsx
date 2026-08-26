import type { Metadata } from "next";
import {
  aboutHero, byTheNumbers, restoreToday, lifeBoxesHeading, lifeBoxes,
  restoreOrigin, dreamitOrigin, investmentVehicles, bioLong,
} from "@/content/bio";
import { img, selectedInvestmentLogos, workedWithLogos } from "@/content/media-manifest";
import {
  Container, Section, Eyebrow, Button, Prose, JsonLd, LogoWall, StatGrid,
} from "@/components/primitives";
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

      <section
        className="relative bg-[var(--color-navy)] text-white"
        style={{
          backgroundImage: `url(${img.aboutWork})`,
          backgroundSize: "cover",
          backgroundPosition: "bottom center",
        }}
      >
        <div className="bg-[var(--color-navy)]/85">
          <Container className="py-24 sm:py-32">
            <Eyebrow>{aboutHero.eyebrow}</Eyebrow>
            <h1 className="max-w-3xl text-white">{aboutHero.heading}</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
              {aboutHero.body}
            </p>
          </Container>
        </div>
      </section>

      <Section>
        <Container>
          <StatGrid heading="By the numbers" stats={byTheNumbers} />
        </Container>
      </Section>

      {/* The "3 buckets" — Family, Himself, Work. */}
      <Section tone="alt">
        <Container>
          <h2 className="text-center">{lifeBoxesHeading}</h2>
          <ul className="mt-12 grid gap-6 md:grid-cols-3 md:items-stretch">
            {lifeBoxes.map((box, i) => {
              const image = [img.aboutFamily, img.aboutHimself, img.aboutWork][i];
              return (
                <li
                  key={box.title}
                  className="relative flex min-h-[19rem] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-navy)] p-7 text-white shadow-[var(--shadow-card)]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-cover bg-center opacity-45"
                    style={{ backgroundImage: `url(${image})` }}
                  />
                  <span className="relative">
                    <span className="block text-2xl font-bold">{box.title}</span>
                    <span className="mt-3 block text-[0.95rem] leading-relaxed text-white/85">
                      {box.content}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>

      {/* Restore: where it came from, and where it is now. */}
      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <Eyebrow>{restoreOrigin.heading}</Eyebrow>
              <h2>Restore Hyper Wellness</h2>
              <p className="mt-4 text-lg leading-relaxed">{restoreOrigin.body}</p>
            </div>
            <div className="rounded-[var(--radius-card)] bg-[var(--color-navy)] p-8 sm:p-10">
              <StatGrid stats={restoreToday} tone="dark" />
            </div>
          </div>
        </Container>
      </Section>

      {/* Dreamit: the same shape — why it started, what he wanted from it. */}
      <Section tone="alt">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <Eyebrow>{dreamitOrigin.heading}</Eyebrow>
              <h2>Dreamit Ventures</h2>
              <p className="mt-4 text-lg leading-relaxed">{dreamitOrigin.body}</p>
            </div>
            <div>
              <p className="font-semibold text-[var(--color-ink)]">I wanted to:</p>
              <ul className="mt-4 space-y-3">
                {dreamitOrigin.wantedTo.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-blue)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <LogoWall heading="Selected Investments" logos={selectedInvestmentLogos} />
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <LogoWall heading="Selected Companies I have worked with" logos={workedWithLogos} />
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="text-center">{investmentVehicles.heading}</h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-2">
            {investmentVehicles.vehicles.map((v) => (
              <li
                key={v.name}
                className="rounded-[var(--radius-card)] bg-white p-7 shadow-[var(--shadow-card)]"
              >
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-accent)]">
                  {v.stage}
                </p>
                <h3 className="mt-2">{v.name}</h3>
                <p className="mt-3 leading-relaxed">{v.body}</p>
                {v.href && (
                  <a
                    href={v.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-sm font-semibold text-[var(--color-accent)] underline underline-offset-4"
                  >
                    {v.linkLabel}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="alt">
        <Container size="measure">
          <h2>The longer version</h2>
          <div className="mt-6">
            <Prose paragraphs={bioLong} />
          </div>
        </Container>
      </Section>

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
