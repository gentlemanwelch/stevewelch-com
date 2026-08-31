import { site } from "@/content/site";

/**
 * Recent posts from Steve's Substack, read server-side.
 *
 * WHY NOT THE WIDGET. The original embedded substackapi.com's feed widget,
 * which draws itself in the browser. GPTBot, ClaudeBot and PerplexityBot
 * execute no JavaScript, so to them that section is empty — on a page whose
 * whole job is to prove the man writes. This fetches the same feed on the
 * server instead and renders real HTML, which they can read.
 *
 * FAILURE IS NOT AN ERROR. Substack going slow, changing shape, or rate
 * limiting must never take the page down, so everything here returns [] rather
 * than throwing, and the section falls back to the subscribe card. That also
 * makes local builds work on networks where Substack is unreachable.
 */

export type SubstackPost = {
  title: string;
  url: string;
  /** ISO date, or "" when the feed omits or malforms pubDate. */
  isoDate: string;
  /** Human date, pre-formatted so server and client cannot disagree. */
  date: string;
  excerpt: string;
  image?: string;
};

const FEED_URL = `${site.social.substack}/feed`;

/** Strip tags, collapse whitespace, decode the handful of entities RSS uses. */
function toText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#x27;/g, "'")
    .replace(/&#8217;|&rsquo;/g, "’")
    .replace(/&#8216;|&lsquo;/g, "‘")
    .replace(/&#8220;|&ldquo;/g, "“")
    .replace(/&#8221;|&rdquo;/g, "”")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/\s+/g, " ")
    .trim();
}

/** Contents of <tag>, CDATA unwrapped. Returns "" when the tag is absent. */
function tag(xml: string, name: string): string {
  const m = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`).exec(xml);
  if (!m) return "";
  const raw = m[1].trim();
  const cdata = /^<!\[CDATA\[([\s\S]*?)\]\]>$/.exec(raw);
  return (cdata ? cdata[1] : raw).trim();
}

function clamp(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[,;:.—-]+$/, "")}…`;
}

/** Exported for the tests; the network is the only part they cannot cover. */
export function parseFeed(xml: string, limit: number): SubstackPost[] {
  const items = xml.match(/<item[\s\S]*?<\/item>/g) ?? [];
  const posts: SubstackPost[] = [];

  for (const item of items) {
    const title = toText(tag(item, "title"));
    const url = tag(item, "link");
    if (!title || !url) continue;

    const pubDate = tag(item, "pubDate");
    const when = pubDate ? new Date(pubDate) : null;
    const valid = when && !Number.isNaN(when.getTime());

    // The cover comes from <enclosure url> on Substack. Some items have none.
    const enclosure = /<enclosure\b[^>]*\burl="([^"]+)"/.exec(item)?.[1];

    posts.push({
      title,
      url,
      isoDate: valid ? when.toISOString() : "",
      date: valid
        ? when.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          })
        : "",
      excerpt: clamp(toText(tag(item, "description")), 190),
      image: enclosure,
    });
    if (posts.length === limit) break;
  }
  return posts;
}

export async function getSubstackPosts(limit = 3): Promise<SubstackPost[]> {
  try {
    const res = await fetch(FEED_URL, {
      // Substack answers a bare fetch inconsistently; identify properly.
      headers: { "user-agent": "stevewelch.com (+https://www.stevewelch.com)" },
      // Rebuild this page's feed hourly rather than on every request, and
      // without a deploy. Substack posts are not breaking news.
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return parseFeed(await res.text(), limit);
  } catch {
    return [];
  }
}
