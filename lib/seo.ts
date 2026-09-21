import type { Metadata } from "next";
import { site } from "@/content/site";

/**
 * Every page's metadata is built here rather than hand-written per page, so
 * that a canonical URL, an Open Graph image and a Twitter card can never be
 * forgotten on a new page — the only way to make a page is to go through this
 * function, and the function always sets them.
 *
 * The canonical tag matters more than usual on this site. WordPress will have
 * been serving some of these pages with and without a trailing slash, with and
 * without `www`, and possibly under `?p=` query URLs. Search engines treat
 * those as separate pages competing with each other. One explicit canonical per
 * page collapses them back into one.
 */
export function buildMetadata({
  title,
  description,
  path,
  keywords,
  ogImage,
  type = "website",
}: {
  /**
   * Page title WITHOUT the site name — the template in app/layout.tsx appends
   * " | Steve Welch" to it.
   *
   * Pass it anyway and it is stripped below rather than doubled. That guard is
   * not decoration: four pillar pages, the contact page and all three landing
   * pages shipped titles reading "… | Steve Welch | Steve Welch" and stayed
   * that way through a full rebuild and a DNS cutover, because a title tag is
   * the one piece of a page nobody ever looks at. The waste is real — Google
   * renders about 60 characters, and fifteen of them were the brand name a
   * second time, pushing the words an organizer actually searched for out of
   * the visible part of the result.
   */
  title: string;
  description: string;
  /** Path with a leading slash, e.g. "/speaking". Use "/" for the homepage. */
  path: string;
  keywords?: readonly string[];
  ogImage?: string;
  type?: "website" | "article" | "profile";
}): Metadata {
  const url = `${site.url}${path === "/" ? "" : path}`;
  const image = ogImage ?? "/opengraph-image";

  /* See the note on `title`. Separators are en/em dash or pipe with spaces —
     the three anyone actually types. */
  const bare = title.replace(
    new RegExp(`\\s*[|\u2013\u2014-]\\s*${site.name}\\s*$`),
    "",
  );

  return {
    title: bare,
    description,
    keywords: keywords ? [...keywords] : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: `${bare} | ${site.name}`,
      description,
      url,
      siteName: site.name,
      type,
      locale: "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: `${bare} — ${site.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${bare} | ${site.name}`,
      description,
      images: [image],
    },
  };
}
