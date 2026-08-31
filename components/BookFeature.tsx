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
  learnMoreHref,
  buyUrl,
  desktopArt,
  mobileArt,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  /* Runs of copy; `em` marks the ones set in italic — the book's title. */
  body: { text: string; em?: boolean }[];
  learnMoreHref: string;
  buyUrl?: string;
  desktopArt: string;
  mobileArt: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--color-tint-warm)]">
      <picture>
        <source media="(min-width: 768px)" srcSet={desktopArt} />
        <img
          src={mobileArt}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover object-bottom md:object-right md:object-contain"
        />
      </picture>

      <Container className="relative py-16 sm:py-20 md:py-28">
        {/*
          The copy occupies the left half on desktop, where the artwork leaves
          space. On mobile the art sits behind the lower half, so the text gets
          the full width and a bottom margin to clear it.
        */}
        <div className="max-w-xl pb-[22rem] md:max-w-[52%] md:pb-0">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-blue-deep)]">
            {eyebrow}
          </p>
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
          <p className="mt-5 leading-relaxed text-[var(--color-ink-soft)]">
            {body.map((part, i) =>
              part.em ? <em key={i}>{part.text}</em> : <span key={i}>{part.text}</span>,
            )}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={learnMoreHref}
              className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-blue)] px-7 py-3 font-bold text-white transition-colors hover:bg-[var(--color-blue-deep)]"
            >
              Learn More
            </Link>
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
