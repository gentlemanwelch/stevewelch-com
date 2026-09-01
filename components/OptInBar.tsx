import Image from "next/image";
import { Container } from "@/components/primitives";
import { freeChapter } from "@/content/books";
import { img } from "@/content/media-manifest";

/**
 * The free-chapter opt-in band, shared by the homepage and /books/.
 *
 * The original composes it as a two-column block — the mailing-list icon in a
 * narrow first column, the heading and the form in a wide second — and that is
 * what this is. The icon was sitting unused in public/media while both pages
 * rendered a bare centred line of text; it is the thing that makes the band
 * read as an offer rather than a divider.
 *
 * THE FORM. The original puts a Gravity Form here — first name, email, "Join
 * Now" — and captures an address before sending the chapter. This sends the
 * chapter. That decision is recorded on `freeChapter.pdfHref` and it stands for
 * two reasons: an ungated PDF scores better on Landing Page Experience, which
 * is half of Google Ads Quality Score, and this site earns from bookings rather
 * than from a list. It is a trade, not an oversight — the form is a small
 * change whenever the list is worth more than the friction, and it needs a real
 * destination (a Resend audience) before it ships, because a form that posts
 * nowhere is worse than a button that works.
 */
export function OptInBar() {
  return (
    <section className="bg-[var(--color-blue)]">
      <Container className="py-12 sm:py-14">
        <div className="flex flex-col items-center gap-7 text-center sm:flex-row sm:items-center sm:gap-10 sm:text-left">
          <Image
            src={img.mailingListIcon}
            alt=""
            aria-hidden="true"
            width={168}
            height={168}
            className="h-20 w-20 shrink-0 sm:h-[6.5rem] sm:w-[6.5rem]"
          />
          <div>
            <h2 className="text-white text-xl leading-snug sm:text-2xl">
              {freeChapter.heading}
              <span className="block italic">{freeChapter.headingEm}</span>
            </h2>
            <a
              href={freeChapter.pdfHref}
              className="mt-6 inline-flex rounded-[var(--radius-pill)] border-2 border-white bg-white px-7 py-3 font-bold text-[var(--color-navy)] transition-colors hover:bg-transparent hover:text-white"
            >
              {freeChapter.cta}
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
