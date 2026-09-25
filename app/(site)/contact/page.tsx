import type { Metadata } from "next";
import { site } from "@/content/site";
import { faqs } from "@/content/faq";
import { contactPage } from "@/content/contact";
import { InquiryForm } from "@/components/InquiryForm";
import { Container, Section } from "@/components/primitives";
import { PageHero } from "@/components/kit/PageHero";
import { SectionHeading } from "@/components/kit/SectionHeading";
import { SquareList } from "@/components/kit/SquareList";
import { FaqList } from "@/components/kit/FaqList";
import { buildMetadata } from "@/lib/seo";

/**
 * The conversion page. Everything else on this site is upstream of this form.
 *
 * NO PHOTOGRAPH IN THE HEADER, on purpose. It used to open on a full-width
 * photo under a 70% wash, which pushed the form most of a screen further down
 * on a phone — on the one page where the form is the point. The header is now
 * a short navy band and the first field is on the first or second screen.
 */
export const metadata: Metadata = buildMetadata({
  title: "Check Availability and Fees",
  description:
    "Check availability and fees for a keynote by Steve Welch. Engagements start at $20,000. Inquiries go directly to Steve’s team — no agency, no bureau fee — and you are acknowledged immediately.",
  path: "/contact/",
  keywords: ["book Steve Welch", "hire keynote speaker", "speaker booking inquiry", "keynote speaker availability"],
});

/* The heading style of the three notes beside the form: a label, not a
   headline — they are asides to the form, not competitors with it. */
const noteHeading = "eyebrow !text-[0.875rem] font-bold text-navy";

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow={contactPage.eyebrow}
        title={contactPage.heading}
        lede={contactPage.body}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact/" },
        ]}
      />

      <Section>
        <Container>
          <div className="grid gap-14 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
            <div>
              <h2 className="sr-only">{contactPage.formHeading}</h2>
              <InquiryForm />
            </div>

            <aside className="space-y-10 lg:sticky lg:top-28 lg:self-start">
              {/*
                NO “Investment” CARD HERE. There was one, stating the floor beside
                the form; Steve removed it on 2026-09-21 because the form already
                carries the same information — the budget dropdown now opens at
                “$20,000 – $30,000”, so an organizer learns the floor at the moment
                they have to answer for it, which is the moment it does its work.
                Saying it twice on one page reads as a price tag rather than a
                qualifier.

                The floor is still PUBLISHED, which is the thing that matters for
                paid clicks — it is in this page’s meta description (so it
                qualifies before the click is paid for), in the “Before you write”
                FAQ below, in the /speaking/ hero, on every /lp/ page, in the
                booking auto-reply, and in the Offer schema. Do not read this
                deletion as a reversal of that decision; see the note on
                site.fee.
              */}
              <div className="border-t-2 border-navy pt-5">
                <h2 className={noteHeading}>{contactPage.email.heading}</h2>
                <a
                  className="mt-3 inline-flex min-h-6 items-center text-lg font-bold text-action underline underline-offset-4 hover:text-action-dark"
                  href={`mailto:${site.email}`}
                >
                  {site.email}
                </a>
              </div>

              <div className="border-t-2 border-navy pt-5">
                <h2 className={noteHeading}>{contactPage.helps.heading}</h2>
                <SquareList items={contactPage.helps.items} className="mt-4 text-[1rem] text-navy" />
              </div>

              <div className="border-t-2 border-navy pt-5">
                <h2 className={noteHeading}>{contactPage.alsoAvailable.heading}</h2>
                <p className="mt-3 text-[1rem]">{contactPage.alsoAvailable.body}</p>
              </div>
            </aside>
          </div>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <SectionHeading lines={contactPage.faqHeading} />
          <div className="mt-10 lg:mt-14">
            {/* The booking questions only. FaqList marks up exactly what it
                shows — this page used to mark up all eight and show five. */}
            <FaqList faqs={faqs.slice(0, contactPage.faqCount)} />
          </div>
        </Container>
      </Section>
    </>
  );
}
