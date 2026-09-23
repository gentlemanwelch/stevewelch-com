/*
 * IMAGES IN THIS FILE — AND A BUG THAT SHIPPED, WRITTEN DOWN SO IT STAYS FIXED.
 *
 * Until 2026-09-23 the logo wall and the video poster rendered
 *
 *     <picture><source srcset="x.webp" type="image/webp"><img src="x.png"></picture>
 *
 * for every raster file, on the stated assumption that "if the WebP is not
 * there the browser quietly falls back to the original <img>". It does not.
 * The browser picks a source ONCE; if that file 404s the image is simply
 * broken — tested in Chromium, naturalWidth 0, no retry. Only files that
 * scripts/optimise-media.mjs had converted (those over 120 KB) had a .webp
 * twin, so every smaller raster logo was broken: on /speaking/ that was CNBC,
 * Children's Hospital of Philadelphia, NVCA, and the speaking-reel poster —
 * the proof section of the page organizers are sent to, and the same wall on
 * the paid landing pages.
 *
 * The fix removes the guess rather than patching it:
 *
 *   - Video posters use next/image, which serves WebP/AVIF itself, at the
 *     width actually displayed, with no twin file to forget. The old reason
 *     for avoiding it — next/image throws at build time on a missing local
 *     file — no longer applies: every file in public/media is committed (195
 *     of them), so the file is always there, and if one ever were missing a
 *     failed build is a far better failure than a silently broken image.
 *   - Logos are small; they load as they are. SVG where available.
 *
 * Do not reintroduce a <source> pointing at a file nobody has checked exists.
 */

import Image from "next/image";
import Link from "next/link";
import { CountUp } from "@/components/CountUp";
import type { ReactNode } from "react";
import { buttonClasses, type ButtonVariant } from "@/lib/buttonStyles";

/** Standard page gutter. One value, one place. */
export function Container({
  children,
  size = "wide",
  className = "",
}: {
  children: ReactNode;
  size?: "wide" | "measure";
  className?: string;
}) {
  /*
    Both sizes share the SAME outer container and gutters, so every page keeps
    one continuous left edge from the hero down through the body copy. Only the
    inner measure changes.

    Centring the narrow measure independently (the obvious implementation) makes
    long-form text start further right than the h1 above it, which reads as a
    layout mistake rather than as an editorial choice.
  */
  return (
    <div className={`mx-auto w-full max-w-[var(--container-wide)] px-5 sm:px-8 lg:px-12 ${className}`}>
      {size === "measure" ? (
        <div className="max-w-[var(--container-measure)]">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}

/**
 * A vertical band. `tone` switches the background so alternating sections
 * separate without a border, which keeps long pages from reading as one
 * undifferentiated column.
 *
 * Padding is the spec's rhythm: "88–128px desktop, 56–80px tablet, 40–64px
 * mobile". 56 / 80 / 112 sits inside all three bands.
 */
export function Section({
  children,
  tone = "canvas",
  className = "",
  id,
}: {
  children: ReactNode;
  tone?: "canvas" | "alt" | "ink";
  className?: string;
  id?: string;
}) {
  const tones = {
    canvas: "bg-[var(--color-canvas)]",
    alt: "bg-[var(--color-surface-alt)]",
    ink: "bg-[var(--color-ink)] text-white",
  };
  return (
    <section id={id} className={`py-14 md:py-20 lg:py-28 ${tones[tone]} ${className}`}>
      {children}
    </section>
  );
}

/**
 * The small letter-spaced label above a heading. Names a section without
 * spending a heading level on it, so the h2 underneath stays the real one and
 * the document outline stays clean for screen readers and crawlers.
 *
 * On light backgrounds it is the action blue (5.04:1 on white, 4.57:1 on the
 * tint). On solid navy it is cyan, 6.46:1 — the action blue on navy would be
 * 2.1:1 and unreadable at 13px.
 *
 * OVER A PHOTOGRAPH it is white (`onPhoto`). Measured on the homepage's
 * closing band — a stage photograph under an 80% navy wash — cyan fell to
 * 3.46:1 at the worst pixel, because the wash lets the brightest stage lights
 * through. White over the same pixels is 7.62:1.
 */
export function Eyebrow({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "onDark" | "onPhoto";
}) {
  const color = tone === "onPhoto" ? "text-white" : tone === "onDark" ? "text-cyan" : "text-action";
  return <p className={`eyebrow mb-4 ${color}`}>{children}</p>;
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  /**
   * The glyph the copy calls for. "Build Your Keynote →" and "▶ Watch Steve
   * Speak" are written with them in 01_HOMEPAGE_COPY.md; they render
   * aria-hidden, so a screen reader announces "Build Your Keynote", not
   * "Build Your Keynote right arrow".
   */
  glyph?: "arrow" | "play";
  /**
   * Analytics. Read by components/TrackEvents.tsx through ONE delegated
   * listener on the document, so a button can be tracked without turning the
   * section it sits in into client JavaScript — which would take that
   * section's content out of the static HTML the AI crawlers read.
   */
  track?: string;
  trackLocation?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  glyph,
  track,
  trackLocation,
}: ButtonProps) {
  const isExternal = href.startsWith("http");
  const content = (
    <>
      {glyph === "play" && (
        <svg width="12" height="14" viewBox="0 0 12 14" aria-hidden="true" className="shrink-0">
          <path d="M12 7 0 14V0z" fill="currentColor" />
        </svg>
      )}
      <span>{children}</span>
      {glyph === "arrow" && <span aria-hidden="true">→</span>}
    </>
  );
  const data = track
    ? { "data-track": track, "data-track-location": trackLocation }
    : {};

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses(variant, className)}
        {...data}
      >
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClasses(variant, className)} {...data}>
      {content}
    </Link>
  );
}

/** Renders a paragraph array from `content/` at a comfortable measure. */
export function Prose({ paragraphs, className = "" }: { paragraphs: readonly string[]; className?: string }) {
  return (
    <div className={`space-y-5 text-body leading-[1.75] ${className}`}>
      {paragraphs.map((text, i) => (
        <p key={i}>{text}</p>
      ))}
    </div>
  );
}

/**
 * Injects a JSON-LD block.
 *
 * `dangerouslySetInnerHTML` is the documented way to emit JSON-LD in React —
 * the alternative, putting the JSON in as a child, escapes the quotes and
 * produces markup no parser will read. The input is our own object literal
 * built at build time from `content/`, never user input, so there is no
 * injection surface. The `<` escape guards the one case that would matter if
 * that ever changed: a string containing `</script>`.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/**
 * A logo wall.
 *
 * The original renders these as white cards with a soft shadow and the mark
 * contained at a fixed height — `#logo-holder .cell` in the theme's custom CSS,
 * reproduced here from those exact values.
 *
 * If a logo file has not been downloaded yet, the browser renders the `alt`
 * text — the organization's name — inside the card. That is a legible fallback
 * that needs no JavaScript, so this stays a server component. An `onError`
 * handler would have forced the whole grid to ship as client JS to hide a
 * placeholder that reads perfectly well as text.
 *
 * Run `scripts/download-media.sh` to populate the files.
 */
export function LogoWall({
  heading,
  logos,
}: {
  heading: string;
  logos: readonly { name: string; file: string }[];
}) {
  return (
    <div>
      <h2 className="text-center text-2xl">{heading}</h2>
      <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {logos.map((logo) => (
          <li
            key={`${logo.name}-${logo.file}`}
            className="relative flex h-[7.5rem] items-center justify-center rounded-[var(--radius-card)] bg-white p-6 shadow-[var(--shadow-card)]"
          >
            {/*
              The name is always rendered, and the image is layered over it on
              an opaque background. When the file exists it covers the text;
              when it does not, the card reads as the organization's name
              instead of an empty box. No JavaScript, no broken-image icon.
            */}
            <span className="px-2 text-center text-sm font-semibold text-[var(--color-ink-faint)]">
              {logo.name}
            </span>
            <picture>
              <img
                src={logo.file}
                alt={logo.name}
                loading="lazy"
                className="absolute inset-0 m-auto h-[56px] w-[calc(100%-3rem)] bg-white object-contain object-center sm:h-[64px]"
              />
            </picture>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A statistic from one of the theme's counter blocks.
 *
 * EXTRACTABILITY: a big number in one element and its label in another reads
 * fine to a person and badly to a machine. A model pulling facts out of the
 * HTML gets "225+" and "studios nationwide" as two unrelated fragments, and
 * either drops the fact or reassembles it wrongly.
 *
 * So each stat also emits one complete sentence, visually hidden. Screen
 * readers get a coherent sentence instead of a stream of orphaned numbers,
 * which is the same win — this is an accessibility fix that happens to be an
 * AIO fix. `sentence` overrides the generated form where the natural phrasing
 * needs a verb the label does not supply.
 */
export function StatGrid({
  heading,
  stats,
  tone = "light",
}: {
  heading?: string;
  stats: readonly { value: string; label: string; sentence?: string; to?: number }[];
  tone?: "light" | "dark";
}) {
  const valueColor = tone === "dark" ? "text-white" : "text-[var(--color-blue)]";
  const labelColor = tone === "dark" ? "text-white/70" : "text-[var(--color-ink-soft)]";

  /*
    Column count follows the number of stats rather than being fixed at four.
    Hardcoding four split a three-stat block into four narrow columns — and
    inside the narrow card on /about/ that squeezed the values until they
    overlapped and read as "225+57,000M+". Written out in full because Tailwind
    scans source text for class names and cannot see an interpolated one.
  */
  const columns =
    stats.length <= 2
      ? "sm:grid-cols-2"
      : stats.length === 3
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div>
      {heading && (
        <h2 className={`text-center text-2xl ${tone === "dark" ? "text-white" : ""}`}>
          {heading}
        </h2>
      )}
      <dl className={`${heading ? "mt-10" : ""} grid gap-8 ${columns}`}>
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            {/* aria-hidden on the split halves so assistive tech reads the
                whole sentence below rather than the fragments twice. */}
            <dt
              className={`text-3xl font-bold leading-none tabular-nums sm:text-4xl ${valueColor}`}
              aria-hidden="true"
            >
              {s.to ? <CountUp to={s.to} display={s.value} /> : s.value}
            </dt>
            <dd className={`mt-2 text-sm leading-snug ${labelColor}`} aria-hidden="true">
              {s.label}
            </dd>
            <dd className="sr-only">{s.sentence ?? `${s.value} ${s.label}`}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * A YouTube embed that does not load YouTube until it is clicked.
 *
 * The naive `<iframe>` pulls roughly a megabyte of player JavaScript and sets
 * third-party cookies on every page view, whether or not anyone presses play —
 * which costs Core Web Vitals on a page whose job is ranking. This renders the
 * poster frame and swaps in the real player on click.
 */
export function VideoEmbed({
  youtubeId,
  title,
  poster,
  trackLocation,
}: {
  youtubeId: string;
  title: string;
  poster?: string;
  /** Fires `watch_speaking_reel` when opened — see components/TrackEvents.tsx. */
  trackLocation?: string;
}) {
  /*
     Prefer a local poster. The i.ytimg.com fallback still works, but it is a
     third-party request on page load for an image we usually already own, and
     it is the only thing on the site that reaches outside our own origin
     before someone has asked for a video.
  */
  const thumb = poster ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-navy)]">
      <details
        className="group"
        {...(trackLocation
          ? { "data-track-open": "watch_speaking_reel", "data-track-location": trackLocation }
          : {})}
      >
        <summary className="relative flex aspect-video cursor-pointer list-none items-center justify-center">
          {thumb.startsWith("/media/") ? (
            <Image
              src={thumb}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 1320px) 1224px, 100vw"
              className="object-cover opacity-70 transition-opacity group-open:hidden"
            />
          ) : (
            <picture>
              <img
                src={thumb}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity group-open:hidden"
              />
            </picture>
          )}
          <span className="relative z-10 flex flex-col items-center gap-3 group-open:hidden">
            <span className="flex h-16 w-16 items-center justify-center rounded-[var(--radius-base)] bg-action transition-colors group-hover:bg-action-dark sm:h-20 sm:w-20">
              <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
                <path d="M21 12 0 24V0z" fill="#fff" />
              </svg>
            </span>
            <span className="px-6 text-center text-lg font-bold text-white [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]">{title}</span>
          </span>
        </summary>
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </details>
    </div>
  );
}
