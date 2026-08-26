/*
 * next/image is deliberately NOT used for the logo wall or the video poster.
 *
 * Both draw from `public/media/`, whose files arrive via
 * scripts/download-media.sh and may legitimately be absent — next/image throws
 * at build time on a missing local file, which would make a missing logo break
 * the deploy instead of degrading to alt text. These are also small, lazily
 * loaded, and never the LCP element, so the optimisation the rule is protecting
 * is not worth a brittle build.
 */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import type { ReactNode } from "react";

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
    <div className={`mx-auto w-full max-w-5xl px-6 sm:px-8 ${className}`}>
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
    <section id={id} className={`py-16 sm:py-24 ${tones[tone]} ${className}`}>
      {children}
    </section>
  );
}

/**
 * Small uppercase label above a heading. Gives a section a name without
 * spending a heading level on it — the h2 underneath stays the real one, which
 * keeps the document outline clean for both screen readers and crawlers.
 */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
      {children}
    </p>
  );
}

type ButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function Button({ href, children, variant = "primary", className = "" }: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[0.95rem] font-semibold transition-colors duration-200";
  const variants = {
    primary:
      "bg-[var(--color-accent)] text-white hover:bg-[var(--color-ink)]",
    secondary:
      "border border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-ink)]",
    ghost:
      "text-[var(--color-accent)] hover:text-[var(--color-ink)] px-0",
  };
  const isExternal = href.startsWith("http");

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`${base} ${variants[variant]} ${className}`}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </Link>
  );
}

/** Renders a paragraph array from `content/` at a comfortable measure. */
export function Prose({ paragraphs, className = "" }: { paragraphs: readonly string[]; className?: string }) {
  return (
    <div className={`space-y-5 text-[1.0625rem] leading-[1.75] ${className}`}>
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
            <img
              src={logo.file}
              alt={logo.name}
              loading="lazy"
              className="absolute inset-0 m-auto h-[56px] w-[calc(100%-3rem)] bg-white object-contain object-center sm:h-[64px]"
            />
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
  stats: readonly { value: string; label: string; sentence?: string }[];
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
              {s.value}
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
}: {
  youtubeId: string;
  title: string;
  poster?: string;
}) {
  const thumb = poster ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] bg-[var(--color-navy)] shadow-[var(--shadow-card)]">
      <details className="group">
        <summary className="relative flex aspect-video cursor-pointer list-none items-center justify-center">
          <img
            src={thumb}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover opacity-70 transition-opacity group-open:hidden"
          />
          <span className="relative z-10 flex flex-col items-center gap-3 group-open:hidden">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95">
              <svg width="22" height="24" viewBox="0 0 22 24" aria-hidden="true">
                <path d="M21 12 0 24V0z" fill="var(--color-navy)" />
              </svg>
            </span>
            <span className="px-6 text-center font-semibold text-white">{title}</span>
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
