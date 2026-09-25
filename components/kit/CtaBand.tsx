import Image from "next/image";
import { site } from "@/content/site";
import { finalCta } from "@/content/home";
import { bfc } from "@/content/media-manifest";
import { Button, Container } from "@/components/primitives";
import { SectionHeading } from "@/components/kit/SectionHeading";

type Action = {
  label: string;
  href: string;
  /** The event components/TrackEvents.tsx sends on click. */
  track?: string;
};

/**
 * The closing band: one question, one or two actions. Lifted from the
 * homepage's §12 so every page ends the same way.
 *
 * THE PHOTOGRAPH IS FIXED, deliberately — there is no `image` prop. The 80%
 * navy wash was measured over THIS picture with the type hidden: white 7.62:1
 * at the worst pixel behind the text column, the 85% body 6.05:1, the 80%
 * reassurance line 5.60:1. A different picture would need a new measurement,
 * and a prop would make it easy to skip one. To change the picture, change
 * `bfc.closing` and re-measure once, for every page.
 *
 * `photo={false}` is the plain navy version, for a page that already has a
 * photograph close above.
 */
export function CtaBand({
  eyebrow,
  heading,
  body,
  primary,
  secondary,
  reassurance,
  location,
  photo = true,
  longHeading = false,
}: {
  eyebrow?: string;
  heading: string | readonly string[];
  body?: string;
  primary: Action;
  secondary?: Action;
  reassurance?: string;
  /** Sent with the click events, to tell one page's band from another's. */
  location: string;
  photo?: boolean;
  /** A heading that is a sentence and a book title, not a question. */
  longHeading?: boolean;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy text-white">
      {photo && (
        <>
          <Image
            src={bfc.closing}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="object-cover object-[72%_50%]"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-navy/80" />
        </>
      )}
      <Container className={`relative text-center ${photo ? "py-24 md:py-32 lg:py-40" : "py-20 md:py-28"}`}>
        <SectionHeading
          eyebrow={eyebrow}
          lines={heading}
          tone={photo ? "photo" : "dark"}
          className={`mx-auto max-w-4xl ${
            longHeading
              ? "[&_h2]:!text-[clamp(1.75rem,1.2rem+2vw,3rem)]"
              : "[&_h2]:!text-[clamp(2.25rem,1.3rem+3.6vw,4.25rem)]"
          }`}
        />
        {body && <p className="lede mx-auto mt-6 max-w-2xl text-white/85">{body}</p>}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 min-[420px]:flex-row">
          <Button href={primary.href} glyph="arrow" track={primary.track} trackLocation={location}>
            {primary.label}
          </Button>
          {secondary && (
            <Button href={secondary.href} variant="outlineLight" track={secondary.track} trackLocation={location}>
              {secondary.label}
            </Button>
          )}
        </div>
        {reassurance && <p className="mt-8 text-[0.9375rem] text-white/80">{reassurance}</p>}
      </Container>
    </section>
  );
}

/**
 * The site's standard close — the homepage's own final call to action. Used
 * wherever a page has no closing question of its own.
 *
 * ONE button. It used to carry "Check Availability" beside "Build Your
 * Keynote", and both went to the same form; the revision brief's §10: "Do not
 * present two choices if they do the same thing." If Check Availability comes
 * back, it has to do something different — a short date / city inquiry.
 */
export function ClosingCta({ location, photo = true }: { location: string; photo?: boolean }) {
  return (
    <CtaBand
      eyebrow={finalCta.eyebrow}
      heading={finalCta.heading}
      body={finalCta.body}
      primary={{ label: finalCta.primary, href: site.cta.href, track: "build_your_keynote_click" }}
      reassurance={finalCta.reassurance}
      location={location}
      photo={photo}
    />
  );
}
