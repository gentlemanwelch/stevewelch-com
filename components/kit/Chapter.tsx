import Image from "next/image";

/**
 * One chapter of the career section: a real photograph, the organization, a
 * headline, a line. The spec: "Each chapter must contain a meaningful
 * image/logo and short copy… Mobile: stack chapters vertically with image and
 * copy paired. Do not compress them into tiny four-column cards."
 *
 * `focus` is the object-position for the crop, because every photograph has
 * its subject somewhere different in the frame.
 *
 * `logo` shows the image whole, padded, on the tile's pale panel instead of
 * cropping it to fill. `mix-blend-multiply` lets a logo that comes on a white
 * background (the Mitos JPEG) take the panel's colour, so no white box shows.
 */
export function Chapter({
  name,
  headline,
  body,
  image,
  alt,
  focus = "50% 50%",
  logo = false,
  sizes = "(min-width: 1024px) 44vw, (min-width: 640px) 90vw, 100vw",
}: {
  name?: string;
  headline: string;
  body: string;
  image: string;
  alt: string;
  focus?: string;
  /** A logo rather than a photograph: contained, not cropped. */
  logo?: boolean;
  /** The rendered width, for next/image — narrower in a three-up grid. */
  sizes?: string;
}) {
  return (
    <article>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-base)] bg-tint">
        <Image
          src={image}
          alt={alt}
          fill
          sizes={sizes}
          className={logo ? "object-contain p-[12%] mix-blend-multiply" : "object-cover"}
          style={logo ? undefined : { objectPosition: focus }}
        />
      </div>
      {name && <p className="eyebrow mt-6 text-action">{name}</p>}
      <h3 className={`${name ? "mt-2" : "mt-6"} !text-[clamp(1.625rem,1.1rem+1.8vw,2.5rem)] font-extrabold leading-[1.08] tracking-tight`}>
        {headline}
      </h3>
      <p className="mt-3 max-w-xl">{body}</p>
    </article>
  );
}
