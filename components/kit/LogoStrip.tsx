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
const AREA = 5200; // px² at desktop; ~52px tall for a 2:1 mark

/**
 * `layout="grid"` for a long list: five to a row from lg, so ten logos sit as
 * two even rows instead of a full row and a straggling second one spread
 * edge to edge by justify-between.
 */
export function LogoStrip({ logos, layout = "row" }: { logos: readonly SizedLogo[]; layout?: "row" | "grid" }) {
  const list =
    layout === "grid"
      ? "grid grid-cols-2 place-items-center gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-10"
      : /* Spread edge to edge only when there are enough marks to fill the
           row; three spread that way sit at the far left, the centre and the
           far right, with nothing between them. */
        `flex flex-wrap items-center justify-center gap-x-10 gap-y-10 sm:gap-x-14 ${
          logos.length >= 5 ? "lg:justify-between lg:gap-x-8" : "lg:gap-x-24"
        }`;
  return (
    <ul className={list}>
      {logos.map((logo) => {
        const h = Math.round(Math.sqrt(AREA / logo.ratio));
        const w = Math.round(logo.ratio * h);
        return (
          <li key={logo.name} className="flex items-center justify-center">
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
                  height: `calc(${h}px * var(--logo-scale, 1))`,
                  objectFit: "cover",
                }}
                className="[--logo-scale:0.8] sm:[--logo-scale:1]"
              />
            </picture>
          </li>
        );
      })}
    </ul>
  );
}
