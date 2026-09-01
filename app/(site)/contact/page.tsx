import Image from "next/image";
import type { Metadata } from "next";
import { site } from "@/content/site";
import { faqs } from "@/content/faq";
import { img } from "@/content/media-manifest";
import { InquiryForm } from "@/components/InquiryForm";
import { Container, Section, Eyebrow, JsonLd } from "@/components/primitives";
import { breadcrumbSchema, faqSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

/**
 * The conversion page. Everything else on this site is upstream of this form.
 *
 * The one thing it does differently from a standard contact page is say
 * plainly, above the form, that inquiries reach Steve’s team rather than an agency.
 * That is the whole competitive argument against a bureau listing, and it only
 * works if it is stated.
 */
export const metadata: Metadata = buildMetadata({
  title: "Book Steve Welch",
  description:
    "Check availability and fees for a keynote by Steve Welch. Inquiries go directly to Steve’s team — no agency, no bureau fee — with a reply normally within two business days.",
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

      {/*
        A photo hero, which this page was missing entirely — it opened on a
        plain white band. The block gives `hero_image: 1915`, the same
        photograph as the home hero, with `full-width-txt` so everything is
        centred.

        object-top, not centre: this band is short, and the vertical middle of a
        1920x1023 frame cuts Steve off at the eyes. Anchoring to the top keeps
        his face whole and fills the right of the band — where the centred type
        sits — with the dot-pattern wall. On mobile the window narrows to 44% of
        the frame and centring it clips him to a shoulder, so it shifts to 15%,
        which holds him centred with wall either side and measures 6.69:1.

        Same wash caveat as /speaking/: the block says the tint is transparent,
        but centred white type over the middle of this frame lands on Steve
        himself and measures 1.14:1. The floor for 4.5:1 is 0.61 at 1440;
        0.70 leaves margin for the paragraph, which is white at 90%.

        The words are the ones already here rather than the export's, which
        gives the h1 as the single word "Contact" twice over — that block is
        the one saved in `mode: "edit"`, and in any case direct-booking copy
        earns its place on the page an organiser actually converts on.
      */}
      <section className="relative isolate bg-[var(--color-navy)] text-white">
        <Image
          src={img.homeHero}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[15%_0%] md:object-top"
        />
        <div className="absolute inset-0 bg-[var(--color-navy)]/70" />

        <Container className="relative py-20 text-center sm:py-24">
          <Eyebrow tone="onDark">Booking</Eyebrow>
          <h1 className="mx-auto max-w-3xl text-white leading-[1.06]">
            This goes straight to Steve’s team.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/90">
            No agency, no bureau fee, no three-week relay. Tell us the date, who is in the room,
            and what the session needs to accomplish — you will normally hear back within two
            business days.
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
                <ul className="mt-3 space-y-2 text-ui leading-relaxed text-[var(--color-ink)]">
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
                <p className="mt-3 text-ui leading-relaxed text-[var(--color-ink-soft)]">
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
          <h2>Before you write</h2>
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
