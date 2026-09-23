import Image from "next/image";

/**
 * One chapter of the career section: a real photograph, the organization, a
 * headline, a line. The spec: "Each chapter must contain a meaningful
 * image/logo and short copy… Mobile: stack chapters vertically with image and
 * copy paired. Do not compress them into tiny four-column cards."
 *
 * `focus` is the object-position for the crop, because every stand-in
 * photograph has its subject somewhere different in the frame.
 */
export function Chapter({
  name,
  headline,
  body,
  image,
  alt,
  focus = "50% 50%",
}: {
  name: string;
  headline: string;
  body: string;
  image: string;
  alt: string;
  focus?: string;
}) {
  return (
    <article>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-base)] bg-tint">
        <Image
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 44vw, (min-width: 640px) 90vw, 100vw"
          className="object-cover"
          style={{ objectPosition: focus }}
        />
      </div>
      <p className="eyebrow mt-6 text-action">{name}</p>
      <h3 className="mt-2 !text-[clamp(1.625rem,1.1rem+1.8vw,2.5rem)] font-extrabold leading-[1.08] tracking-tight">
        {headline}
      </h3>
      <p className="mt-3 max-w-xl">{body}</p>
    </article>
  );
}
