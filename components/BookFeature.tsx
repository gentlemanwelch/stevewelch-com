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
  body: string;
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
          <h2 className="mt-3 text-[var(--color-blue-deep)]">
            {title}
            {subtitle && (
              <span className="mt-1 block text-[0.72em] leading-tight">{subtitle}</span>
            )}
          </h2>
          <p className="mt-5 leading-relaxed text-[var(--color-ink-soft)]">{body}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={learnMoreHref}
              className="inline-flex rounded-[var(--radius-pill)] bg-[var(--color-blue)] px-7 py-3 font-bold text-white transition-colors hover:bg-[var(--color-blue-deep)]"
            >
              Learn More
            </Link>
            {/*
              "Buy the Book" appears only once a retailer link exists. The
              original renders it unconditionally, but shipping a button that
              goes nowhere is worse than shipping one fewer button — see the
              REVIEW note on `buyUrl` in content/books.ts.
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
