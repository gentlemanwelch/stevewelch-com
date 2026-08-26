import type { Metadata } from "next";
import { site } from "@/content/site";
import { bioOneLine, bioShort, bioLong, credentials } from "@/content/bio";
import { speakingPillars, hyperWellness } from "@/content/speaking";
import { Container, Section, Eyebrow, Button, JsonLd } from "@/components/primitives";
import { breadcrumbSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

/**
 * Press kit — the one page on this site that is NOT on the WordPress original.
 *
 * It earns its place: organizers search "<name> press kit" and "<name> speaker
 * bio" directly, and publishing bios, the stage introduction and A/V needs
 * removes four emails from every engagement. A speaker with a proper press kit
 * has visibly done this before.
 *
 * It is deliberately kept separate from /writings-media/ (which is his real
 * page, reproduced) so the original structure stays intact.
 *
 * This page exists because the alternative is answering the same four emails
 * before every event: send us a bio, send us a headshot, how should we
 * introduce you, what do you need on stage. Publishing all of it removes the
 * round trips — and organizers searching "<name> press kit" or "<name> speaker
 * bio" land somewhere useful instead of on a contact form.
 *
 * It is also a quiet trust signal. A speaker with a proper press kit has done
 * this before.
 */
export const metadata: Metadata = buildMetadata({
  title: "Press Kit",
  description:
    "Speaker bios, introduction, topics, and technical requirements for events featuring Steve Welch. Everything an event organizer needs, ready to use.",
  path: "/press-kit/",
  keywords: ["Steve Welch press kit", "Steve Welch speaker bio", "Steve Welch headshot", "speaker one sheet"],
});

/**
 * The introduction the host reads from the lectern. Written to be spoken aloud
 * — short sentences, no semicolons, and a last line that hands over cleanly.
 */
const stageIntroduction = `Our next speaker has built from scratch, or been the first investor in, more than 350 companies over the last twenty-five years. He founded Mitos and sold it at the age of 30 to Parker. He co-founded Dreamit Ventures, which has backed over 400 companies now worth more than ten billion dollars combined. Today he is the CEO of Restore Hyper Wellness — 225 studios, 57,000 members. He is the author of "We Are All Born Entrepreneurs." He speaks about driving change through purpose, people, and process. Please welcome Steve Welch.`;

const avRequirements = [
  "Wireless lavalier or over-ear microphone (preferred over handheld)",
  "Confidence monitor or a laptop on the lectern showing current slide",
  "HDMI connection with 16:9 projection",
  "Ability to move — no lectern-bound setups where it can be avoided",
  "A clicker, or a stage manager cueing slides",
];

export default function MediaPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Press Kit", path: "/press-kit/" },
        ])}
      />

      <section className="border-b border-[var(--color-line)]">
        <Container className="py-16 sm:py-24">
          <Eyebrow>Press kit</Eyebrow>
          <h1 className="max-w-3xl text-[2.4rem] leading-[1.06] sm:text-[3.2rem]">
            Everything you need to promote the event.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-soft)]">
            Bios at three lengths, the stage introduction, topics, and technical requirements. Copy
            anything on this page and use it as is — no permission needed.
          </p>
        </Container>
      </section>

      <Section>
        <Container size="measure">
          <h2 className="text-3xl">Biographies</h2>

          <div className="mt-8 space-y-8">
            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
                One line
              </h3>
              <p className="mt-3 leading-relaxed">{bioOneLine}</p>
            </div>

            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
                Short — for programs
              </h3>
              <p className="mt-3 leading-relaxed">{bioShort}</p>
            </div>

            <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
                Full — for websites
              </h3>
              <div className="mt-3 space-y-4 leading-relaxed">
                {bioLong.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="alt">
        <Container size="measure">
          <h2 className="text-3xl">Stage introduction</h2>
          <p className="mt-3 text-[var(--color-ink-soft)]">
            Roughly 40 seconds, written to be read aloud.
          </p>
          <blockquote className="mt-8 rounded-2xl border-l-2 border-[var(--color-accent)] bg-[var(--color-surface)] p-6 text-lg leading-relaxed text-[var(--color-ink)]">
            {stageIntroduction}
          </blockquote>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl">Topics</h2>
              <ul className="mt-6 space-y-4">
                {[...speakingPillars, { ...hyperWellness, statement: hyperWellness.statement }].map((pillar) => (
                  <li key={pillar.slug}>
                    <p className="text-lg font-bold text-[var(--color-ink)]">{pillar.name}</p>
                    <p className="mt-1 text-[0.95rem] leading-relaxed text-[var(--color-ink-faint)]">
                      {pillar.statement}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-3xl">Technical requirements</h2>
              <ul className="mt-6 space-y-3">
                {avRequirements.map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span aria-hidden="true" className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <h2 className="mt-12 text-3xl">Photography</h2>
              <p className="mt-4 leading-relaxed text-[var(--color-ink-soft)]">
                {/*
                  REVIEW: replace this paragraph with direct download links once
                  high-resolution headshots and stage photography are in /public.
                  Organizers need these and will email for them otherwise.
                */}
                High-resolution headshots and stage photography are available on request — email{" "}
                <a className="text-[var(--color-accent)] underline underline-offset-4" href={`mailto:${site.email}`}>
                  {site.email}
                </a>{" "}
                and they will come back the same day.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <h2 className="sr-only">Fact sheet</h2>
          <dl className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {credentials.map((item) => (
              <div key={item.label}>
                <dt className="text-lg font-semibold text-[var(--color-ink)]">
                  {item.label}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-[var(--color-ink-faint)]">
                  {item.detail}
                </dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>

      <Section tone="ink">
        <Container className="text-center">
          <h2 className="text-3xl text-white sm:text-[2.6rem]">Need something else?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Ask and it will be sent the same day.
          </p>
          <div className="mt-8 flex justify-center">
            <Button href="/contact/">Get in touch</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
