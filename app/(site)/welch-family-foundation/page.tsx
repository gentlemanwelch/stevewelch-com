import type { Metadata } from "next";
import { foundation } from "@/content/foundation";
import Image from "next/image";
import { img } from "@/content/media-manifest";
import { Container, Section, JsonLd } from "@/components/primitives";
import { FoundationForm } from "@/components/FoundationForm";
import { breadcrumbSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

/**
 * /welch-family-foundation/ — rebuilt block for block against the original.
 *
 * Its export gives six sections in this order: the hero, "Their Story Begins"
 * with a photograph beside it, the STEM paragraph with the classroom photograph
 * on the other side, a full-bleed "What We Do" band with the copy on a tinted
 * card, "How You Can Help?" with the enquiry form, and the partner logos. The
 * first build had all of the words and none of the structure — no photographs,
 * no band, no logos, and no form at all.
 *
 * A heading with a cyan rule under it is this page's signature, used on all
 * three of its section headings; that is the `border-underline` class the
 * export applies.
 */
export const metadata: Metadata = buildMetadata({
  title: "Welch Family Foundation",
  description:
    "The Welch Family Foundation invests their time and money in individuals, organizations, and platforms that they believe will create the future leaders of tomorrow.",
  path: "/welch-family-foundation/",
  keywords: [
    "Welch Family Foundation",
    "STEM education foundation",
    "Steve and Nicole Welch",
    "STEM scholarships",
  ],
});

export default function FoundationPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Welch Family Foundation", path: "/welch-family-foundation/" },
        ])}
      />

      {/*
        The hero. Steve and Nicole on the water, heading to the right —
        `content_position: "right"` at 62% — with the page's cyan rule under it.
        Height in vw for the reason the /writings-media/ hero carries: the band
        is narrower than the photograph, so object-fit scales by width and a
        fixed pixel height would crop the two of them differently on every
        screen.
      */}
      <section className="relative isolate flex min-h-[24rem] items-center bg-[var(--color-navy)] text-white md:min-h-[min(34vw,560px)]">
        <Image
          src={img.foundationHero}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[30%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-black/35 md:hidden" />
        <div className="absolute inset-0 hidden md:block bg-[linear-gradient(to_right,rgba(0,0,0,0.10)_0%,rgba(0,0,0,0.10)_32%,rgba(0,0,0,0.45)_48%,rgba(0,0,0,0.45)_100%)]" />

        <Container className="relative w-full py-16">
          <div className="md:ml-auto md:w-[62%]">
            <h1 className="text-white">{foundation.heading}</h1>
            <span
              aria-hidden="true"
              className="mt-5 block h-[5px] w-full max-w-[17rem] bg-[var(--color-cyan)]"
            />
          </div>
        </Container>
      </section>

      {/* Their Story Begins — copy left, photograph right. */}
      <Section>
        <Container>
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
            <div>
              <RuledHeading>{foundation.storyBegins.heading}</RuledHeading>
              <p className="mt-6 text-xl font-semibold leading-snug text-[var(--color-blue-deep)]">
                {foundation.storyBegins.body[0]}
              </p>
              <p className="mt-5 leading-relaxed text-[var(--color-ink-soft)]">
                {foundation.storyBegins.body[1]}
              </p>
            </div>
            <Image
              src={img.foundationStory}
              alt="Steve and Nicole Welch seated together"
              width={1000}
              height={667}
              className="h-auto w-full rounded-[var(--radius-card)]"
            />
          </div>
        </Container>
      </Section>

      {/* The mirror: photograph left, copy right. */}
      <Section>
        <Container>
          <div className="grid items-center gap-10 md:grid-cols-2 md:gap-14">
            <Image
              src={img.foundationClassroom}
              alt="Nicole Welch leading a group of young children in a classroom"
              width={1000}
              height={667}
              className="h-auto w-full rounded-[var(--radius-card)] md:order-1"
            />
            <div className="md:order-2">
              <p className="text-xl font-semibold leading-snug text-[var(--color-blue-deep)]">
                {foundation.pastDecade[0]}
              </p>
              <p className="mt-5 leading-relaxed text-[var(--color-ink-soft)]">
                {foundation.pastDecade[1]}
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/*
        What We Do — full-bleed photograph with the copy on a tinted card over
        it, per `content_background: "#edf5f9"` and `content_position: "center"`
        at 80%. The card is opaque, so nothing here depends on contrast against
        the photograph behind it.
      */}
      <section className="relative isolate">
        <Image
          src={img.foundationWhatWeDoBg}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
        <Container className="relative py-16 sm:py-24">
          <div className="mx-auto max-w-4xl rounded-[var(--radius-card)] bg-[var(--color-tint)] p-8 text-center shadow-[var(--shadow-card)] sm:p-12">
            <RuledHeading center>{foundation.whatWeDo.heading}</RuledHeading>
            <p className="mt-6 text-left text-xl font-semibold leading-snug text-[var(--color-blue-deep)] sm:text-center">
              {foundation.whatWeDo.body[0]}
            </p>
            <p className="mt-5 text-left leading-relaxed text-[var(--color-ink-soft)] sm:text-center">
              {foundation.whatWeDo.body[1]}
            </p>
          </div>
        </Container>
      </section>

      {/* How You Can Help? — the ask, then the form. */}
      <Section>
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <RuledHeading center>{foundation.howToHelp.heading}</RuledHeading>
            <p className="mt-6 text-left text-xl font-semibold leading-snug text-[var(--color-blue-deep)] sm:text-center">
              {foundation.howToHelp.body[0]}
            </p>
            <p className="mt-4 text-left leading-relaxed text-[var(--color-ink-soft)] sm:text-center">
              {foundation.howToHelp.body[1]}
            </p>
            <p className="mt-6 font-bold text-[var(--color-blue)]">
              {foundation.howToHelp.body[2]}
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl">
            <h3 className="text-center text-[var(--color-blue-deep)]">
              {foundation.form.heading}
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-left leading-relaxed text-[var(--color-ink-soft)] sm:text-center">
              {foundation.form.body}
            </p>
            <div className="mt-8">
              <FoundationForm />
            </div>
          </div>
        </Container>
      </Section>

      {/* The partner logos, on cards, as the original closes. */}
      <Section tone="alt">
        <Container>
          <h2 className="sr-only">Organizations the Foundation supports</h2>
          <ul className="grid gap-6 sm:grid-cols-3">
            {foundation.partners.map((partner) => (
              <li
                key={partner.name}
                className="flex h-32 items-center justify-center rounded-[var(--radius-card)] bg-white p-7 shadow-[var(--shadow-card)]"
              >
                <Image
                  src={img[partner.image as keyof typeof img]}
                  alt={partner.name}
                  width={400}
                  height={160}
                  className="h-full w-auto max-w-full object-contain"
                />
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}

/** A heading with the page's cyan rule under it — its `border-underline`. */
function RuledHeading({
  children,
  center = false,
}: {
  children: React.ReactNode;
  center?: boolean;
}) {
  return (
    <h2 className={center ? "text-center text-[var(--color-blue-deep)]" : "text-[var(--color-blue-deep)]"}>
      <span className="inline-block">
        {children}
        <span aria-hidden="true" className="mt-2 block h-[4px] w-full bg-[var(--color-cyan)]" />
      </span>
    </h2>
  );
}
