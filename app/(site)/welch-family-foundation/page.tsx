import type { Metadata } from "next";
import { foundation } from "@/content/foundation";
import { Container, Section, Eyebrow, Button, Prose, JsonLd } from "@/components/primitives";
import { breadcrumbSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

/** /welch-family-foundation/ — rebuilt against the WordPress original. */
export const metadata: Metadata = buildMetadata({
  title: "Welch Family Foundation",
  description:
    "The Welch Family Foundation invests their time and money in individuals, organizations, and platforms that they believe will create the future leaders of tomorrow.",
  path: "/welch-family-foundation/",
  keywords: [
    "Welch Family Foundation",
    "STEM education foundation",
    "Steve and Nicole Welch",
    "STEM scholarships",
  ],
});

export default function FoundationPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Welch Family Foundation", path: "/welch-family-foundation/" },
        ])}
      />

      <section className="bg-[var(--color-navy)] text-white">
        <Container className="py-24 sm:py-32">
          <Eyebrow>Foundation</Eyebrow>
          <h1 className="max-w-3xl text-white">{foundation.heading}</h1>
        </Container>
      </section>

      <Section>
        <Container>
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2>{foundation.storyBegins.heading}</h2>
            </div>
            <Prose paragraphs={foundation.storyBegins.body} />
          </div>
        </Container>
      </Section>

      <Section tone="alt">
        <Container size="measure">
          <Prose paragraphs={foundation.pastDecade} className="text-lg" />
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="rounded-[var(--radius-card)] bg-[var(--color-tint)] p-8 sm:p-12">
            <h2>{foundation.whatWeDo.heading}</h2>
            <div className="mt-5">
              <Prose paragraphs={foundation.whatWeDo.body} />
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="alt">
        <Container size="measure">
          <h2>{foundation.howToHelp.heading}</h2>
          <div className="mt-5">
            <Prose paragraphs={foundation.howToHelp.body} />
          </div>
          {/*
            The original renders Gravity Form 4 here (a donation enquiry).
            Form definitions are not carried in a WXR export, so this routes to
            the contact page rather than shipping a form whose fields are a
            guess. Tell Claude what the form asked for and it becomes a form.
          */}
          <div className="mt-8">
            <Button href="/contact/">Get in touch about giving</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
