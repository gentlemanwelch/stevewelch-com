/*
 * next/image cannot express a <picture> art-direction swap — two genuinely
 * different compositions at two breakpoints, not one image at two sizes — so
 * this uses a plain <img> inside <picture> rather than flattening the design to
 * satisfy the linter. The assets are SVG, so no raster optimisation is lost.
 */
import Link from "next/link";
import { Container } from "@/components/primitives";

/**
 * The featured-book block.
 *
 * The artwork is a full-bleed background rather than an inline image: a pale
 * field with the 3D cover and its decorative wellness icons on the RIGHT and
 * the left two-thirds deliberately empty for the copy. That is how the original
 * composes it, and it is why the first build's two little text cards lost so
 * much — the cover IS the argument for the book, and it was missing entirely.
 *
 * `side` mirrors the whole thing. /books/ carries this block twice: Restore
 * with the cover on the right and the copy on the left, then We Are All Born
 * Entrepreneurs with the cover on the left and the copy on the right. Both
 * artworks are 1440-wide SVGs with the cover on one side and the rest empty, so
 * the mirror is object-position plus a margin, not a second component.
 *
 * Desktop and mobile use different files, not one file scaled. The mobile
 * artwork is recomposed portrait with the cover above the text, so scaling the
 * landscape version down would put the book off-screen. `<picture>` with a
 * media query is the honest way to express "two different images", and it lets
 * the browser download only the one it needs.
 */
export function BookFeature({
  eyebrow,
  title,
  subtitle,
  body,
  rule = false,
  learnMoreHref,
  buyUrl,
  desktopArt,
  mobileArt,
  side = "left",
}: {
  /* Only the Restore block carries one ("About the Book"). */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /* Runs of copy; `em` marks the ones set in italic — the book's title. */
  body: { text: string; em?: boolean }[];
  /* The <hr /> under the heading. The Entrepreneurs block has one; Restore does not. */
  rule?: boolean;
  /* Absent on the Entrepreneurs block, whose only button is "Buy the Book". */
  learnMoreHref?: string;
  buyUrl?: string;
  desktopArt: string;
  mobileArt: string;
  /* Which side the COPY sits on; the artwork takes the other. */
  side?: "left" | "right";
}) {
  const copyRight = side === "right";
  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-tint-warm)]">
      {/*
        MOBILE PUTS THE ARTWORK IN THE FLOW, above the copy. It used to be
        absolutely positioned at every width with a 22rem bottom padding on the
        copy meant to clear it — and it did not: object-cover scales the art to
        fill the whole section, whose height is set by the copy, so the cover
        came up through the paragraph and made both unreadable. Reserving space
        for an element that sizes itself from the space is circular. In the flow
        it simply cannot overlap.

        From md the img goes absolute again, and it stays a direct child of the
        section rather than moving inside Container, because the section is
        full-bleed — inside the container the art would be inset by the
        container's own max-width and gutters.
      */}
      <picture>
        <source media="(min-width: 768px)" srcSet={desktopArt} />
        <img
          src={mobileArt}
          alt=""
          aria-hidden="true"
          className={`mx-auto block h-auto w-full max-w-[19rem] px-6 pt-14 md:absolute md:inset-0 md:mx-0 md:h-full md:w-full md:max-w-none md:px-0 md:pt-0 md:object-contain ${
            copyRight ? "md:object-left" : "md:object-right"
          }`}
        />
      </picture>

      <Container className="relative pb-16 pt-10 sm:pb-20 md:py-28">
        {/* The copy takes one half on desktop, where the artwork leaves the
            other empty; full width on mobile, under the art. */}
        <div className={`max-w-xl md:max-w-[52%] ${copyRight ? "md:ml-auto" : ""}`}>
          {eyebrow && (
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-blue-deep)]">
              {eyebrow}
            </p>
          )}
          {/*
            Both lines are the SAME size. The export has this as a single <h2>
            with "Restore:" and the full title as consecutive lines inside it —
            one heading, one size — and the live page renders it that way. The
            first build stepped the second line down to 0.72em, which reads as a
            title-and-subtitle pair rather than one title that happens to break.
            The span is here only to force the line break; it carries no size.
          */}
          <h2 className="mt-3 text-[var(--color-blue-deep)]">
            {title}
            {subtitle && <span className="block leading-tight">{subtitle}</span>}
          </h2>
          {rule && (
            <hr
              aria-hidden="true"
              className="mt-5 h-[4px] w-full max-w-[13rem] border-0 bg-[var(--color-cyan)]"
            />
          )}
          <p className="mt-5 leading-relaxed text-[var(--color-ink-soft)]">
            {body.map((part, i) =>
              part.em ? <em key={i}>{part.text}</em> : <span key={i}>{part.text}</span>,
            )}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {learnMoreHref && (
              <Link
                href={learnMoreHref}
                className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-blue)] px-7 py-3 font-bold text-white transition-colors hover:bg-[var(--color-blue-deep)]"
              >
                Learn More
              </Link>
            )}
            {/*
              "Buy the Book" is still gated on the link existing — a button that
              goes nowhere is worse than one fewer button — but the link is real
              now, so it renders. It is the Amazon URL the original's own button
              points at, and it opens in a new tab as the original does: this is
              the one place on the site that sends a visitor away, and the rest
              of the page is what a booking enquiry comes from.
            */}
            {buyUrl && (
              <a
                href={buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-coral)] px-7 py-3 font-bold text-white transition-colors hover:bg-[var(--color-coral-dark)]"
              >
                Buy the Book
              </a>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
