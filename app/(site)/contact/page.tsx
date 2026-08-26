import type { Metadata } from "next";
import { site } from "@/content/site";
import { faqs } from "@/content/faq";
import { InquiryForm } from "@/components/InquiryForm";
import { Container, Section, Eyebrow, JsonLd } from "@/components/primitives";
import { breadcrumbSchema, faqSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

/**
 * The conversion page. Everything else on this site is upstream of this form.
 *
 * The one thing it does differently from a standard contact page is say
 * plainly, above the form, that inquiries reach Steve rather than an agency.
 * That is the whole competitive argument against a bureau listing, and it only
 * works if it is stated.
 */
export const metadata: Metadata = buildMetadata({
  title: "Book Steve Welch",
  description:
    "Check availability and fees for a keynote by Steve Welch. Inquiries go directly to Steve — no agency, no bureau fee — with a reply normally within two business days.",
  path: "/contact/",
  keywords: ["book Steve Welch", "hire keynote speaker", "speaker booking inquiry", "keynote speaker availability"],
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={faqSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact/" },
        ])}
      />

      <section className="border-b border-[var(--color-line)]">
        <Container className="py-16 sm:py-20">
          <Eyebrow>Booking</Eyebrow>
          <h1 className="max-w-3xl text-[2.4rem] leading-[1.06] sm:text-[3.2rem]">
            This goes straight to Steve.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-soft)]">
            No agency, no bureau fee, no three-week relay through an assistant. Tell him the date,
            who is in the room, and what the session needs to accomplish — you will normally hear
            back within two business days.
          </p>
        </Container>
      </section>

      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
            <div>
              <h2 className="sr-only">Inquiry form</h2>
              <InquiryForm />
            </div>

            <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
                  Prefer email?
                </h2>
                <a
                  className="mt-3 block font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-accent)] underline underline-offset-4"
                  href={`mailto:${site.email}`}
                >
                  {site.email}
                </a>
              </div>

              <div className="rounded-2xl bg-[var(--color-accent-soft)] p-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
                  What helps most
                </h2>
                <ul className="mt-3 space-y-2 text-[0.95rem] leading-relaxed text-[var(--color-ink)]">
                  <li>The date, or the window you are working in</li>
                  <li>Who is in the room and how many</li>
                  <li>What should be different when they walk out</li>
                  <li>Your budget range — it gets you a straight answer faster</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-faint)]">
                  Also available for
                </h2>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--color-ink-soft)]">
                  A selected number of podcasts and media interviews. Mention the show and format in
                  your message.
                </p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="alt">
        <Container size="measure">
          <h2 className="text-3xl">Before you write</h2>
          <dl className="mt-8 divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
            {faqs.slice(0, 5).map((faq) => (
              <div key={faq.question} className="py-6">
                <dt className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--color-ink)]">
                  {faq.question}
                </dt>
                <dd className="mt-2 leading-relaxed text-[var(--color-ink-soft)]">{faq.answer}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </Section>
    </>
  );
}
