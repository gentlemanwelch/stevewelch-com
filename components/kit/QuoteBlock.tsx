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
  role,
  masthead,
  variant = "feature",
  label,
}: {
  quote: string;
  /** Who said it — a person's name, or the publication. */
  source: string;
  /** A person's title and organization, set under their name. */
  role?: string;
  masthead?: string;
  /**
   * `press`: labelled as press and set small. A press line is colour, not
   * the proof a meeting planner is looking for, so it sits under an
   * organizer's quote rather than in place of one (the revision brief's §9).
   */
  variant?: "feature" | "press";
  /** The label above a `press` quote, e.g. "IN THE PRESS". */
  label?: string;
}) {
  const press = variant === "press";
  return (
    <figure className={`mx-auto text-center ${press ? "max-w-2xl" : "max-w-4xl"}`}>
      {press ? (
        label && <p className="eyebrow mb-5 text-ink-faint">{label}</p>
      ) : (
        <span aria-hidden="true" className="block text-6xl font-extrabold leading-none text-blue">
          “
        </span>
      )}
      <blockquote
        className={
          press
            ? "text-[clamp(1.125rem,1rem+0.6vw,1.5rem)] font-semibold leading-snug text-navy"
            : "mt-2 text-[clamp(1.375rem,1.05rem+1.1vw,2.125rem)] font-bold leading-[1.3] tracking-tight text-navy"
        }
      >
        {press ? `“${quote}”` : quote}
      </blockquote>
      <figcaption className={`flex flex-col items-center gap-2 ${press ? "mt-5" : "mt-8"}`}>
        {masthead ? (
          <>
            <Image
              src={masthead}
              alt=""
              aria-hidden="true"
              width={320}
              height={44}
              className={`w-auto opacity-80 ${press ? "h-6" : "h-7 sm:h-8"}`}
            />
            <span className="sr-only">{source}</span>
          </>
        ) : role ? (
          <>
            <span className="eyebrow !font-bold text-navy">{source}</span>
            <span className="text-[0.9375rem] leading-snug text-ink-faint">{role}</span>
          </>
        ) : (
          <span className="eyebrow text-ink-faint">{source}</span>
        )}
      </figcaption>
    </figure>
  );
}
