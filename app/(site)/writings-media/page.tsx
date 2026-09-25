import type { Metadata } from "next";
import {
  mediaIntro, mediaLabels, videos, podcasts, publications, expertTalks, podcastNote,
} from "@/content/media";
import { img } from "@/content/media-manifest";
import { Container, Section, VideoEmbed } from "@/components/primitives";
import { PageHero } from "@/components/kit/PageHero";
import { SectionHeading } from "@/components/kit/SectionHeading";
import { MediaList } from "@/components/kit/MediaList";
import { CtaBand } from "@/components/kit/CtaBand";
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

/*
 * The hero photograph sits beside the copy. It used to sit under it, with a
 * graded wash, a second brightened copy of the picture masked over Steve, and
 * a height set in vw so the crop landed at his shoes — a page of measurement
 * to keep type legible over a stage. Beside the copy it needs none of it.
 */
const appearances = [
  { heading: mediaLabels.podcasts, items: podcasts },
  { heading: mediaLabels.publications, items: publications },
  { heading: mediaLabels.expertTalks, items: expertTalks },
];

export default async function WritingsMediaPage() {
  /*
    Read on the server so the posts are in the HTML. The fetch revalidates
    hourly and can never throw — see lib/substack.ts — so a Substack outage
    costs this page its post list, not the page.
  */
  const posts = await getSubstackPosts(3);

  return (
    <>
      <PageHero
        eyebrow={mediaLabels.eyebrow}
        title={mediaLabels.heading}
        lede={mediaIntro}
        image={{ src: img.speakingBg, alt: "Steve Welch speaking on stage", focus: "26% 30%" }}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: mediaLabels.heading, path: "/writings-media/" },
        ]}
      />

      <SubstackSection posts={posts} />

      <Section>
        <Container>
          <SectionHeading lines={mediaLabels.videos} />
          <ul className="mt-10 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {videos.map((video) => (
              <li key={video.youtubeId}>
                <VideoEmbed youtubeId={video.youtubeId} title={video.title} poster={video.poster} />
                <p className="mt-4 text-lg font-bold leading-snug text-navy">{video.title}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {appearances.map((group, i) => (
        <Section key={group.heading} tone={i % 2 === 0 ? "alt" : "canvas"}>
          <Container>
            <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
              <SectionHeading lines={group.heading} className="[&_h2]:!text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)]" />
              <MediaList items={group.items} />
            </div>
          </Container>
        </Section>
      ))}

      {/* For podcast hosts. One button: a second one here ("Build Your
          Keynote") went to the same form, which the revision brief rules out
          — the header CTA is one scroll away for anyone booking. */}
      <CtaBand
        heading={mediaLabels.podcastHeading}
        body={podcastNote}
        primary={{ label: mediaLabels.getInTouch, href: "/contact/" }}
        location="writings_media_final_cta"
        photo={false}
      />
    </>
  );
}
