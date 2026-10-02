import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "@/components/primitives";
import { SectionHeading } from "@/components/kit/SectionHeading";
import { Breadcrumbs, type Crumb } from "@/components/kit/Breadcrumbs";

/**
 * The top of every interior page.
 *
 * THE RULE IT ENFORCES: type never sits on a photograph. The pages this
 * replaced each opened on a full-bleed photo under a navy or black wash, and
 * each wash had to be measured for that one crop — the comments recording
 * 1.14:1, 1.94:1, 2.17:1 before the fix are still in git history. One page
 * never was measured. A new photo meant a new measurement, and nothing made
 * anyone take it.
 *
 * The homepage settled it the other way: copy on a solid colour (white on the
 * navy is 17.8:1, whatever the picture), the photograph BESIDE it. That is
 * the `image` form here, so a page can swap its photograph without anyone
 * re-measuring anything.
 *
 * Forms:
 *   navy          text on navy. The default.
 *   navy + image  the homepage pattern: photo right from lg, below the copy
 *                 on a phone.
 *   navy + aside  a second column, for the /lp/ inquiry form, which has to be
 *                 on the first screen.
 *   light         a quiet tint band, for pages that are not selling anything:
 *                 the legal pages and the 404.
 *
 * `breadcrumbs` renders the trail (visible only when it is more than
 * Home / Page) and always emits its BreadcrumbList markup.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  tone = "navy",
  image,
  aside,
  breadcrumbs,
  longTitle = false,
  children,
}: {
  eyebrow?: string;
  title: string | readonly string[];
  lede?: string;
  tone?: "navy" | "light";
  /** Navy only. `focus` is the object-position of the crop. */
  image?: { src: string; alt: string; focus?: string };
  /** Navy only, and not with `image`. */
  aside?: ReactNode;
  breadcrumbs?: readonly Crumb[];
  /**
   * For a headline that is a sentence rather than a name — /about/'s is
   * fifteen words. At the full h1 size it would run to six lines in the
   * copy column.
   */
  longTitle?: boolean;
  /** Actions, a fee line — whatever belongs under the lede. */
  children?: ReactNode;
}) {
  const dark = tone === "navy";

  const copy = (
    <>
      {breadcrumbs && <Breadcrumbs trail={breadcrumbs} tone={dark ? "dark" : "light"} />}
      <SectionHeading
        as="h1"
        eyebrow={eyebrow}
        lines={title}
        tone={dark ? "dark" : "light"}
        className={`max-w-4xl ${longTitle ? "[&_h1]:!text-[clamp(2.125rem,1.4rem+2.6vw,3.5rem)] [&_h1]:!leading-[1.08]" : ""}`}
      />
      {lede && <p className={`lede mt-6 max-w-2xl ${dark ? "text-white/80" : ""}`}>{lede}</p>}
      {children && <div className="mt-8">{children}</div>}
    </>
  );

  if (!dark) {
    return (
      <section className="border-b border-line bg-tint">
        <Container className="pb-12 pt-10 sm:pb-16 sm:pt-14 lg:pb-20 lg:pt-16">{copy}</Container>
      </section>
    );
  }

  if (image) {
    return (
      <section className="relative isolate overflow-hidden bg-navy text-white">
        <Container className="relative z-10">
          <div className="pb-12 pt-10 sm:pb-16 sm:pt-14 lg:flex lg:min-h-[min(calc(76svh-4.75rem),44rem)] lg:w-[46%] lg:flex-col lg:justify-center lg:py-20 lg:pr-6">
            {copy}
          </div>
        </Container>
        {/* One image element for both layouts, as on the homepage: in flow
            below the copy on a phone, pinned to the right half from lg. */}
        <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[2/1] lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto lg:w-[56%]">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 56vw, 100vw"
            className="object-cover"
            style={{ objectPosition: image.focus ?? "50% 50%" }}
          />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-navy to-transparent lg:hidden" />
          <div aria-hidden="true" className="absolute inset-y-0 left-0 hidden w-[30%] bg-gradient-to-r from-navy via-navy/60 to-transparent lg:block" />
        </div>
      </section>
    );
  }

  if (aside) {
    return (
      <section className="bg-navy text-white">
        <Container className="grid gap-10 pb-14 pt-10 sm:pb-16 sm:pt-14 lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-16 lg:py-20">
          <div>{copy}</div>
          <div>{aside}</div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-navy text-white">
      <Container className="pb-14 pt-10 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-20">{copy}</Container>
    </section>
  );
}
