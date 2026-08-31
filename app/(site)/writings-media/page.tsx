import type { Metadata } from "next";
import Image from "next/image";
import { site } from "@/content/site";
import {
  mediaIntro, videos, podcasts, publications, expertTalks, podcastNote,
} from "@/content/media";
import { img } from "@/content/media-manifest";
import {
  Container, Section, Eyebrow, Button, JsonLd, VideoEmbed,
} from "@/components/primitives";
import { breadcrumbSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

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

export default function WritingsMediaPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Writings + Media", path: "/writings-media/" },
        ])}
      />

      <section
        className="relative bg-[var(--color-navy)] text-white"
        style={{
          backgroundImage: `url(${img.speakingBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="bg-[var(--color-navy)]/80">
          <Container className="py-24 sm:py-32">
            <h1 className="text-white">Writings + Media</h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">{mediaIntro}</p>
          </Container>
        </div>
      </section>

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

      <Section>
        <Container size="measure" className="text-center">
          <Eyebrow>Newsletter</Eyebrow>
          <h2>Steve writes regularly.</h2>
          <p className="mt-4 text-[var(--color-ink-soft)]">
            Thoughts and insights, straight to your inbox.
          </p>
          <div className="mt-7 flex justify-center">
            <Button href={site.social.substack}>Get The Newsletter</Button>
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
