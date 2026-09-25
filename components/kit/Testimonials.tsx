import { organizerTestimonial, testimonial } from "@/content/home";
import { anvilQuote } from "@/content/speaking";
import { img } from "@/content/media-manifest";
import { QuoteBlock } from "@/components/kit/QuoteBlock";

/**
 * What people said: an organizer first, the press second.
 *
 * The order is the argument. A meeting planner is persuaded by another
 * organizer describing what their room did afterward, so Ryan's quote is the
 * feature. The Inquirer line stays — it is real and it is colour — but set
 * small and labelled as press, the revision brief's §9.
 *
 * One component, so the homepage, /speaking/ and the landing pages always
 * show the same quotes in the same order. The sources and permissions are
 * recorded against `organizerTestimonial` in content/home.ts.
 */
export function Testimonials() {
  return (
    <div>
      <QuoteBlock
        quote={organizerTestimonial.quote}
        source={organizerTestimonial.name}
        role={organizerTestimonial.role}
      />
      <div aria-hidden="true" className="mx-auto my-12 w-16 border-t border-line-strong md:my-14" />
      <QuoteBlock
        variant="press"
        label={testimonial.label}
        quote={anvilQuote}
        source={testimonial.source}
        masthead={img.inquirerLogo}
      />
    </div>
  );
}
