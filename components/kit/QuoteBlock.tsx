import Image from "next/image";

/**
 * An attributed quotation.
 *
 * The attribution is not optional, and that is the point of the component: the
 * packet allows a quote only if it is "genuine, attributable", and a masthead
 * under a line is what turns a sentence into a citation. The publication is
 * also named in text, for anything that cannot read the image.
 */
export function QuoteBlock({
  quote,
  source,
  masthead,
}: {
  quote: string;
  source: string;
  masthead?: string;
}) {
  return (
    <figure className="mx-auto max-w-4xl text-center">
      <span aria-hidden="true" className="block text-6xl font-extrabold leading-none text-blue">
        “
      </span>
      <blockquote className="mt-2 text-[clamp(1.5rem,1.1rem+1.6vw,2.5rem)] font-bold leading-snug tracking-tight text-navy">
        {quote}
      </blockquote>
      <figcaption className="mt-8 flex flex-col items-center gap-2">
        {masthead ? (
          <>
            <Image
              src={masthead}
              alt=""
              aria-hidden="true"
              width={320}
              height={44}
              className="h-7 w-auto opacity-80 sm:h-8"
            />
            <span className="sr-only">{source}</span>
          </>
        ) : (
          <span className="eyebrow text-ink-faint">{source}</span>
        )}
      </figcaption>
    </figure>
  );
}
