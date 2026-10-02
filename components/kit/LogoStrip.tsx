import type { SizedLogo } from "@/content/media-manifest";

/**
 * A row of organization logos, OPTICALLY normalised.
 *
 * The packet: "Normalize optical height, not literal pixel height. Keep
 * generous spacing." At an equal pixel height a 3:1 wordmark reads three times
 * the size of a square badge. So each logo is given the same visual AREA
 * instead — height = √(area ÷ ratio), width = ratio × height — which is the
 * standard way to make a mixed set of marks look like one set.
 *
 * No cards, no shadows: the spec asks for "structure, rules and whitespace"
 * over "generic SaaS card grids".
 *
 * <picture>/<img> rather than next/image, the repo's convention for logos:
 * next/image throws at BUILD time on a missing local file, which would let one
 * absent logo break a deploy. Here a missing file renders its alt text — the
 * organization's name — which is a legible fallback.
 */
const AREA = { default: 5200, large: 9000, xl: 15000 }; // px² at desktop; a 2:1 mark is ~52 / ~67 / ~87px tall

/**
 * `layout="grid"` for a long list: five to a row from lg, so ten logos sit as
 * two even rows instead of a full row and a straggling second one spread
 * edge to edge by justify-between.
 *
 * `layout="trio"` for six logos at `size="xl"`: three to a row from sm, two
 * on a phone. At that size six will not fit one row, and 3 + 3 reads as a
 * deliberate set where 5 + 1 would read as an accident. Each logo shrinks to
 * its cell if the cell is narrower than the logo (a wide mark on a phone).
 *
 * A logo with a `caption` gets that line set under the mark — for a mark that
 * does not say who it is (NVCA). It hangs below without moving the mark, so
 * the row's marks stay on one line.
 */
export function LogoStrip({
  logos,
  layout = "row",
  size = "default",
}: {
  logos: readonly SizedLogo[];
  layout?: "row" | "grid" | "trio";
  /** `large`: about a third bigger — for a short list given its own band,
      as on /speaking/ (Steve, 2026-09-28: "make those all larger").
      `xl`: bigger again — the homepage and /speaking/ strips (Steve,
      2026-10-01: "make those logos all bigger"), used with `trio`. */
  size?: "default" | "large" | "xl";
}) {
  const list =
    layout === "grid"
      ? "grid grid-cols-2 place-items-center gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-10"
      : layout === "trio"
      ? "grid grid-cols-2 items-center gap-x-6 gap-y-16 sm:grid-cols-3 sm:gap-x-10 lg:gap-y-20"
      : /* Spread edge to edge only when there are enough marks to fill the
           row; three spread that way sit at the far left, the centre and the
           far right, with nothing between them. */
        `flex flex-wrap items-center justify-center gap-x-10 gap-y-10 sm:gap-x-14 ${
          logos.length >= 5 ? "lg:justify-between lg:gap-x-8" : "lg:gap-x-24"
        }`;
  return (
    <ul className={list}>
      {logos.map((logo) => {
        const h = Math.round(Math.sqrt(AREA[size] / logo.ratio));
        const w = Math.round(logo.ratio * h);
        return (
          <li
            key={logo.name}
            className={`relative flex items-center justify-center ${layout === "trio" ? "w-full" : logo.caption ? "flex-col" : ""}`}
          >
            <picture>
              <img
                src={logo.file}
                alt={logo.name}
                width={w}
                height={h}
                loading="lazy"
                decoding="async"
                /* The box is the MARK's shape, and object-fit: cover crops the
                   file to it — so a file with empty margins (the CHOP cut-out
                   is 60% transparent space) shows its mark at full size
                   instead of shrunk inside the margins. Every padded file here
                   has its mark centred, which is what cover's default centre
                   crop assumes. 80% on a phone so a row wraps tidily. */
                style={{
                  width: `calc(${w}px * var(--logo-scale, 1))`,
                  maxWidth: "100%",
                  height: "auto",
                  aspectRatio: `${w} / ${h}`,
                  objectFit: "cover",
                }}
                className="[--logo-scale:0.8] sm:[--logo-scale:1]"
              />
            </picture>
            {logo.caption && (
              /* aria-hidden: the image's alt already says the same words.
                 In `trio` it hangs below the cell, as wide as the cell and no
                 wider, so the row's marks stay level and nothing runs off a
                 phone screen. In the smaller row and grid it sits in the
                 flow under the mark, where the logo is too narrow to hang a
                 readable line from. */
              <span
                aria-hidden="true"
                className={`text-center text-[0.75rem] font-semibold leading-snug text-ink-soft sm:text-[0.8125rem] ${
                  layout === "trio" ? "absolute inset-x-0 top-full mt-2" : "mt-2 w-max max-w-[11rem]"
                }`}
              >
                {logo.caption}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
