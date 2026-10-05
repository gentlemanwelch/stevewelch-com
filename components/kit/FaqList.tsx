import { JsonLd } from "@/components/primitives";
import { faqSchema } from "@/lib/jsonld";
import type { Faq } from "@/content/faq";

/**
 * Questions and answers, with their FAQPage markup — built from the SAME list,
 * so the markup can only ever describe the questions a visitor can see.
 *
 * That pairing is the point of the component. /contact/ used to show five
 * questions and mark up all eight; Google's guidelines treat markup for
 * content that is not on the page as a violation, and the usual consequence
 * is that the rich result is dropped for the whole page.
 *
 * Render ONE per page: two would emit two FAQPage blocks.
 *
 * Answers are always in the HTML, never behind a disclosure widget — this is
 * the content an assistant quotes when asked how to book Steve and what it
 * costs, and the crawlers that ask never run the script to open it.
 */
export function FaqList({ faqs }: { faqs: readonly Faq[] }) {
  return (
    <>
      <JsonLd data={faqSchema(faqs)} />
      <dl className="divide-y divide-line-strong border-y border-line-strong">
        {faqs.map((faq) => (
          <div key={faq.question} className="grid gap-3 py-7 lg:grid-cols-[1fr_1.5fr] lg:gap-12 lg:py-9">
            <dt className="text-lg font-bold leading-snug text-navy lg:text-xl">{faq.question}</dt>
            <dd className="leading-relaxed">{faq.answer}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
