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
  /** Page title WITHOUT the site name — the template appends it. */
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

  return {
    title,
    description,
    keywords: keywords ? [...keywords] : undefined,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url,
      siteName: site.name,
      type,
      locale: "en_US",
      images: [{ url: image, width: 1200, height: 630, alt: `${title} — ${site.name}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${site.name}`,
      description,
      images: [image],
    },
  };
}
