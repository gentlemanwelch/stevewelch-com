import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Copy beside a photograph — the photograph FIRST on a phone, then the words,
 * and side by side from lg. `mirror` puts the photograph on the right, so a
 * run of these can alternate down a page.
 *
 * The photograph and the words never overlap. See PageHero for why.
 */
export function SplitFeature({
  image,
  mirror = false,
  aspect = "landscape",
  children,
}: {
  image: { src: string; alt: string; focus?: string };
  mirror?: boolean;
  aspect?: "landscape" | "portrait";
  children: ReactNode;
}) {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div
        className={`relative overflow-hidden rounded-[var(--radius-base)] bg-tint ${
          aspect === "portrait" ? "aspect-[4/5]" : "aspect-[4/3]"
        } ${mirror ? "lg:order-2" : ""}`}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
          style={{ objectPosition: image.focus ?? "50% 50%" }}
        />
      </div>
      <div>{children}</div>
    </div>
  );
}
