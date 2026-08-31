import type { Metadata } from "next";
import Image from "next/image";
import {
  mediaIntro, videos, podcasts, publications, expertTalks, podcastNote,
} from "@/content/media";
import { img } from "@/content/media-manifest";
import {
  Container, Section, Button, JsonLd, VideoEmbed,
} from "@/components/primitives";
import { breadcrumbSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";
import { getSubstackPosts } from "@/lib/substack";
import { SubstackSection } from "@/components/SubstackSection";

/**
 * /writings-media/ — rebuilt against the WordPress original.
 *
 * Order is the original's: hero → Videos → Podcast Interviews → Media
 * Publications → Expert Talks. Every item is real and came out of the export;
 * the first rebuild had this page empty.
 */
export const metadata: Metadata = buildMetadata({
  title: "Writings + Media",
  description:
    "Learn more about Steve Welch through his appearances in expert talks, podcasts, and other media.",
  path: "/writings-media/",
  keywords: [
    "Steve Welch podcast",
    "Steve Welch interview",
    "Steve Welch media",
    "Restore Hyper Wellness press",
  ],
});

/** One row of the appearance lists. */
/**
 * One row of an appearance list.
 *
 * Each entry carries its own artwork on the original — an episode thumbnail for
 * a podcast, a masthead for a publication — and the first build rendered all of
 * these as plain text. A masthead does work no amount of copy can: "The
 * Washington Post" set in Poppins is a claim, the masthead is evidence.
 *
 * `image` is optional, so a row without artwork degrades to the text-only
 * layout rather than leaving a gap.
 */
function AppearanceList({
  items,
}: {
  items: readonly { outlet: string; title: string; url: string; action: string; image?: string }[];
}) {
  return (
    <ul className="divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
      {items.map((item) => (
        <li key={item.url + item.title} className="flex items-start gap-5 py-6">
          {item.image && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden shrink-0 sm:block"
              tabIndex={-1}
              aria-hidden="true"
            >
              <Image
                src={item.image}
                alt=""
                width={160}
                height={160}
                className="h-24 w-24 rounded-lg bg-white object-contain p-2 shadow-[var(--shadow-card)]"
              />
            </a>
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-accent)]">
              {item.outlet}
            </p>
            <h3 className="mt-2 text-xl">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-[var(--color-accent)] hover:underline"
              >
                {item.title}
              </a>
            </h3>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-semibold text-[var(--color-accent)]"
            >
              {item.action} →
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default async function WritingsMediaPage() {
  /*
    Read on the server so the posts are in the HTML. The fetch revalidates
    hourly and can never throw — see lib/substack.ts — so a Substack outage
    costs this page three cards, not the page.
  */
  const posts = await getSubstackPosts(3);

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Writings + Media", path: "/writings-media/" },
        ])}
      />

      {/*
        The hero. It was a CSS background under a flat 80% navy wash — the
        heaviest on the site — which left Steve a silhouette on his own stage.
        Same treatment as /speaking/, mirrored, because this frame is the mirror
        of that one: he stands at about 21-31% across, on the LEFT, and the
        block puts the heading on the right (`content_position: "right"`, 60%).

        So the wash grades the other way: 12% over him, rising to 60% under the
        heading. Measured, the worst text-sized block behind the h1 is 8.9:1 —
        it was 11.5:1 at the flat 80%, and the difference bought back the whole
        photograph. A second copy of the same file sits over the first,
        brightened and masked to the left, so the light lands on him.

        The heading moves right with it. That is not a separate change: grading
        the wash makes the left side the bright side, and a heading left there
        would sit on top of him over the brightest part of the frame.

        object-top per `background_position: "top-center"`. On mobile the window
        is 38% of the frame and centring it leaves him out of the picture
        entirely, so it shifts to 11%, which centres him; measured there, even a
        0.38 wash holds 5:1, so mobile keeps its own light too.

        HEIGHT IS SET IN vw, NOT PIXELS, and that is the point rather than a
        flourish. From md the band is narrower than 0.46 of its width, so
        object-fit scales the photograph by WIDTH — meaning the fraction of
        Steve the band reveals depends entirely on its height as a ratio of its
        width, and a fixed pixel height would cut him at a different place on
        every screen. At 37.5vw he comes down to his shoes at any desktop width.
        The 620px cap keeps a very wide monitor from turning a page header into
        a full-bleed poster; above that width he crops at the thigh again, which
        is the trade.

        Mobile is the other regime and needs its own floor. There the band is
        TALLER than 0.46 of its width, so the scale is HEIGHT-driven: the whole
        frame is in view top to bottom and the band's height decides how big
        Steve is rather than how much of him shows. Shrink the band and he
        shrinks with it — at 310px he was a figure behind the heading. 26rem
        renders him at about 90px wide on a 390px screen, which reads.
      */}
      <section className="relative isolate flex min-h-[26rem] items-center bg-[var(--color-navy)] text-white md:min-h-[min(37.5vw,620px)]">
        <Image
          src={img.speakingBg}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[11%_top] md:object-top"
        />
        <Image
          src={img.speakingBg}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="hero-lift-left hidden object-cover object-top [filter:brightness(1.32)_contrast(1.08)_saturate(1.10)] md:block"
        />

        <div className="absolute inset-0 bg-[var(--color-navy)]/38 md:hidden" />
        <div className="absolute inset-0 hidden md:block bg-[linear-gradient(to_right,rgba(4,46,67,0.12)_0%,rgba(4,46,67,0.12)_30%,rgba(4,46,67,0.60)_44%,rgba(4,46,67,0.60)_100%)]" />

        <Container className="relative w-full py-16 sm:py-20">
          <div className="md:ml-auto md:w-[60%]">
            <h1 className="text-white">Writings + Media</h1>
            <p className="mt-6 text-lg leading-relaxed text-white/90">{mediaIntro}</p>
          </div>
        </Container>
      </section>

      <SubstackSection posts={posts} />

      <Section>
        <Container>
          <h2>Videos</h2>
          <ul className="mt-10 grid gap-6 lg:grid-cols-3">
            {videos.map((video) => (
              <li key={video.youtubeId}>
                <VideoEmbed youtubeId={video.youtubeId} title={video.title} poster={video.poster} />
                <p className="mt-3 font-semibold leading-snug">{video.title}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="alt">
        <Container size="measure">
          <h2>Podcast Interviews</h2>
          <div className="mt-8">
            <AppearanceList items={podcasts} />
          </div>
        </Container>
      </Section>

      <Section>
        <Container size="measure">
          <h2>Media Publications</h2>
          <div className="mt-8">
            <AppearanceList items={publications} />
          </div>
        </Container>
      </Section>

      <Section tone="alt">
        <Container size="measure">
          <h2>Expert Talks</h2>
          <div className="mt-8">
            <AppearanceList items={expertTalks} />
          </div>
        </Container>
      </Section>

      <Section tone="ink">
        <Container className="text-center">
          <h2 className="text-white">Hosting a podcast?</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">{podcastNote}</p>
          <div className="mt-8 flex justify-center">
            <Button href="/contact/">Get in touch</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
