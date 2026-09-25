import type { Metadata } from "next";
import { foundation } from "@/content/foundation";
import { img } from "@/content/media-manifest";
import { Container, Section } from "@/components/primitives";
import { FoundationForm } from "@/components/FoundationForm";
import { PageHero } from "@/components/kit/PageHero";
import { SectionHeading } from "@/components/kit/SectionHeading";
import { SplitFeature } from "@/components/kit/SplitFeature";
import { LogoStrip } from "@/components/kit/LogoStrip";
import { buildMetadata } from "@/lib/seo";

/**
 * /welch-family-foundation/ — rebuilt for Built for Change.
 *
 * The original's six sections, in its order: the hero, "Their Story Begins"
 * with a photograph beside it, the STEM paragraph with the classroom
 * photograph on the other side, "What We Do", "How You Can Help?" with the
 * enquiry form, and the partner logos.
 *
 * What changed: every photograph now sits BESIDE its words. The hero was under
 * a black ramp that was never measured, and "What We Do" was a card floated
 * over a full-bleed photograph. The arena photograph that was that band's
 * background is now its picture, beside the copy like the two above it.
 *
 * Out of the main nav since Built for Change, still in the footer. It sells
 * nothing, so it closes on its own form rather than on a booking CTA.
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
  const partners = foundation.partners.map((p) => ({
    name: p.name,
    file: img[p.image as keyof typeof img],
    ratio: p.ratio,
  }));

  return (
    <>
      <PageHero
        title={foundation.heading}
        lede={foundation.storyBegins.body[0]}
        image={{ src: img.foundationHero, alt: "Steve and Nicole Welch by a lake", focus: "22% 45%" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: foundation.heading, path: "/welch-family-foundation/" },
        ]}
      />

      <Section>
        <Container>
          <SplitFeature
            mirror
            image={{ src: img.foundationStory, alt: "Steve and Nicole Welch seated together", focus: "50% 60%" }}
          >
            <SectionHeading lines={foundation.storyBegins.heading} />
            <p className="lede mt-6 text-navy">{foundation.storyBegins.body[1]}</p>
          </SplitFeature>
        </Container>
      </Section>

      <Section tone="alt">
        <Container>
          <SplitFeature
            image={{ src: img.foundationClassroom, alt: "Nicole Welch leading a group of young children in a classroom" }}
          >
            <p className="lede font-semibold text-navy">{foundation.pastDecade[0]}</p>
            <p className="mt-5 leading-relaxed">{foundation.pastDecade[1]}</p>
          </SplitFeature>
        </Container>
      </Section>

      <Section>
        <Container>
          <SplitFeature
            mirror
            image={{ src: img.foundationWhatWeDoBg, alt: "Students on stage in a packed arena" }}
          >
            <SectionHeading lines={foundation.whatWeDo.heading} />
            <p className="lede mt-6 font-semibold text-navy">{foundation.whatWeDo.body[0]}</p>
            <p className="mt-5 leading-relaxed">{foundation.whatWeDo.body[1]}</p>
          </SplitFeature>
        </Container>
      </Section>

      {/* How You Can Help? — the ask, then the form. */}
      <Section tone="alt">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
            <div>
              <SectionHeading lines={foundation.howToHelp.heading} />
              <p className="lede mt-6 font-semibold text-navy">{foundation.howToHelp.body[0]}</p>
              <p className="mt-5 leading-relaxed">{foundation.howToHelp.body[1]}</p>
              <p className="mt-6 border-t-2 border-navy pt-5 text-lg font-bold text-navy">{foundation.howToHelp.body[2]}</p>
            </div>
            <div>
              <h3 className="!text-[clamp(1.5rem,1.2rem+1vw,2rem)] font-extrabold">{foundation.form.heading}</h3>
              <p className="mt-3 leading-relaxed">{foundation.form.body}</p>
              <div className="mt-8">
                <FoundationForm />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <h2 className="eyebrow mb-12 text-center !text-[0.8125rem] !font-semibold !tracking-[0.18em] text-ink-faint lg:mb-14">
            {foundation.partnersHeading}
          </h2>
          <LogoStrip logos={partners} />
        </Container>
      </Section>
    </>
  );
}
