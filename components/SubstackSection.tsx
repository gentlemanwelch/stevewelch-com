import { Container, Section } from "@/components/primitives";
import { SectionHeading } from "@/components/kit/SectionHeading";
import { PostList } from "@/components/kit/PostList";
import { site } from "@/content/site";
import { mediaLabels } from "@/content/media";
import type { SubstackPost } from "@/lib/substack";

/**
 * The newsletter, directly under the /writings-media/ hero.
 *
 * Two halves, deliberately: the posts prove he writes, the subscribe box lets
 * someone act on it without leaving the page.
 *
 * The posts are SERVER-RENDERED from the RSS feed rather than drawn by
 * Substack's widget. The widget is JavaScript, and the crawlers that now decide
 * whether Steve turns up in an answer — GPTBot, ClaudeBot, PerplexityBot — run
 * none. To them the widget's section is empty, on the one page whose job is to
 * show a body of writing. Rendered on the server it is ordinary HTML they read
 * like any other. They render as the homepage's Ideas list does (PostList), so
 * the two read as one body of work.
 *
 * The subscribe box IS Substack's own iframe, because a form has to post to
 * Substack to work, and there is nothing to gain from rebuilding it.
 *
 * If the feed is unreachable the posts simply do not render and the subscribe
 * half carries the section on its own — see lib/substack.ts.
 */
export function SubstackSection({ posts }: { posts: SubstackPost[] }) {
  return (
    <Section tone="alt">
      <Container>
        <div className={`grid gap-10 ${posts.length > 0 ? "lg:grid-cols-[1fr_1.6fr] lg:gap-16" : ""}`}>
          <div>
            <SectionHeading eyebrow={mediaLabels.newsletterEyebrow} lines={mediaLabels.newsletterHeading} />
            {/*
              Substack's own embed. Its height is fixed by Substack, so the
              wrapper gives it a fixed box rather than trying to size to content
              across an origin it cannot measure into.
            */}
            <iframe
              src={`${site.social.substack}/embed`}
              title={mediaLabels.subscribeTitle}
              width="480"
              height="150"
              loading="lazy"
              className="mt-8 h-[150px] w-full max-w-[480px] rounded-[var(--radius-base)] border border-line bg-white"
            />
            {/*
              The same destination as a plain link, for anyone the iframe fails
              for — a blocker, a privacy setting, a crawler — and so the section
              always contains one real, followable link to the publication.
            */}
            <a
              href={site.social.substack}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-6 items-center font-bold text-action underline underline-offset-4 hover:text-action-dark"
            >
              {mediaLabels.readAll}
            </a>
          </div>
          {posts.length > 0 && <PostList posts={posts} location="writings_media" />}
        </div>
      </Container>
    </Section>
  );
}
