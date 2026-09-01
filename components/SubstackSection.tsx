/*
 * Post covers come from Substack's CDN as a plain <img>, not next/image.
 * next/image needs every remote host declared in next.config, Substack serves
 * these from more than one, and a host that is not on the list does not degrade
 * — it throws. An unoptimised cover is a smaller price than a page that breaks
 * the first time Substack changes CDN. Same reasoning as the artwork in
 * BookFeature.
 */
import { Container } from "@/components/primitives";
import { site } from "@/content/site";
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
 * like any other.
 *
 * The subscribe box IS Substack's own iframe, because a form has to post to
 * Substack to work, and there is nothing to gain from rebuilding it.
 *
 * If the feed is unreachable the posts simply do not render and the subscribe
 * half carries the section on its own — see lib/substack.ts.
 */
export function SubstackSection({ posts }: { posts: SubstackPost[] }) {
  return (
    <section className="bg-[var(--color-tint)]">
      <Container className="py-16 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-blue-deep)]">
            Newsletter
          </p>
          <h2 className="mt-3 text-[var(--color-blue-deep)]">Steve writes on Substack</h2>
        </div>

        {posts.length > 0 && (
          <ol className="mx-auto mt-12 max-w-4xl space-y-8">
            {posts.map((post) => (
              <li key={post.url}>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-6 rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-card)] transition-shadow hover:shadow-lg sm:flex-row sm:items-center sm:gap-8"
                >
                  {post.image && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={post.image}
                      alt=""
                      loading="lazy"
                      className="h-48 w-full shrink-0 rounded-[10px] object-cover sm:h-40 sm:w-40"
                    />
                  )}
                  <div className="min-w-0">
                    {post.date && (
                      <time
                        dateTime={post.isoDate}
                        className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--color-blue-muted)]"
                      >
                        {post.date}
                      </time>
                    )}
                    <h3 className="mt-2 text-xl leading-snug text-[var(--color-blue-deep)] group-hover:text-[var(--color-accent)]">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 leading-relaxed text-[var(--color-ink-soft)]">
                        {post.excerpt}
                      </p>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ol>
        )}

        {/*
          Substack's own embed. Its height is fixed by Substack, so the wrapper
          gives it a fixed box rather than trying to size to content across an
          origin it cannot measure into.
        */}
        <div className="mx-auto mt-12 max-w-[480px]">
          <iframe
            src={`${site.social.substack}/embed`}
            title="Subscribe to Steve Welch on Substack"
            width="480"
            height="150"
            loading="lazy"
            className="h-[150px] w-full rounded-[var(--radius-card)] border border-[var(--color-line)] bg-white"
          />
          {/*
            The same destination as a plain link, for anyone the iframe fails
            for — a blocker, a privacy setting, a crawler — and so the section
            always contains one real, followable link to the publication.
          */}
          <p className="mt-4 text-center text-sm">
            <a
              href={site.social.substack}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block py-2 font-semibold text-[var(--color-accent)] underline underline-offset-4"
            >
              Read every post on Substack
            </a>
          </p>
        </div>
      </Container>
    </section>
  );
}
