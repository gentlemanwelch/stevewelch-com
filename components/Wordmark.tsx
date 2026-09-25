import { site } from "@/content/site";

/**
 * The wordmark: STEVE WELCH, set in type — as Steve's hero mockup draws it
 * (2026-09-25), heavy and letter-spaced. It replaces the lowercase "steve
 * welch" SVG, which stays in public/media unused.
 *
 * Set type rather than a drawing, so it is always in the site's own Poppins
 * and colour, and needs no inverted copy for the dark footer. The name is
 * written in its normal case and uppercased with CSS, so anything that reads
 * the text gets "Steve Welch", not an acronym to spell out.
 *
 * Smaller and tighter below xl: on a phone the name, the compact CTA and the
 * menu button have to fit across a 380px header, and at 1024 the full-size
 * name runs into "Speaking".
 */
export function Wordmark({ size = "header", className = "" }: { size?: "header" | "footer"; className?: string }) {
  const scale =
    size === "footer"
      ? "text-[1.25rem] tracking-[0.18em] sm:text-[1.5rem]"
      : "text-[0.9375rem] tracking-[0.12em] sm:text-[1.25rem] sm:tracking-[0.16em] xl:text-[1.5rem] xl:tracking-[0.18em]";
  return (
    <span className={`whitespace-nowrap font-extrabold uppercase leading-none ${scale} ${className}`}>
      {site.name}
    </span>
  );
}
