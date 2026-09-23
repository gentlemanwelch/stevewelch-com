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

export function LogoStrip({ logos }: { logos: readonly SizedLogo[] }) {
  return (
    <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-10 sm:gap-x-14 lg:justify-between lg:gap-x-8">
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
                // 80% on a phone so five marks wrap to a tidy 3 + 2.
                style={{ width: `calc(${w}px * var(--logo-scale, 1))`, height: "auto" }}
                className="[--logo-scale:0.8] sm:[--logo-scale:1]"
              />
            </picture>
          </li>
        );
      })}
    </ul>
  );
}
