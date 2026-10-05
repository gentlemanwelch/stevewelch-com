import type { SubstackPost } from "@/lib/substack";

/**
 * Steve's latest essays, as a ruled list: date, then title. Real posts only,
 * fetched from Substack at build time and in the static HTML — the packet:
 * "Use real article titles and dates. Do not hard-code fake article names."
 * The caller renders nothing when the list is empty.
 */
export function PostList({ posts, location }: { posts: readonly SubstackPost[]; location: string }) {
  return (
    <ul className="divide-y divide-line-strong border-y border-line-strong">
      {posts.map((post) => (
        <li key={post.url}>
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            data-track="ideas_article_click"
            data-track-location={location}
            data-track-label={post.title}
            className="group flex flex-col gap-1 py-6 sm:flex-row sm:items-baseline sm:gap-8"
          >
            {post.date && (
              <time dateTime={post.isoDate || undefined} className="eyebrow shrink-0 text-ink-faint sm:w-36">
                {post.date}
              </time>
            )}
            <span className="text-xl font-bold leading-snug text-navy transition-colors group-hover:text-action">
              {post.title}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
