import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { speakingPillars, hyperWellness } from "@/content/speaking";
import { books } from "@/content/books";

/**
 * Generated from the same content the pages are, so a talk or a book added to
 * `content/` is submitted to search engines without anyone remembering to do
 * it. Hand-maintained sitemaps drift, and a drifted sitemap is worse than none
 * — it teaches a crawler that the file cannot be trusted.
 *
 * URLs carry the trailing slash to match `trailingSlash: true` and the
 * WordPress originals. A sitemap that lists the non-canonical form of a URL
 * sends the crawler through a redirect on every visit.
 *
 * `priority` is a weak hint at best, but the ordering it encodes is honest: the
 * pages that produce bookings rank above the pages that support them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // The eight pages that exist on the WordPress site, at their existing URLs,
  // plus the one addition (/press-kit/).
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${site.url}/`, changeFrequency: "monthly", priority: 1.0, lastModified },
    { url: `${site.url}/speaking/`, changeFrequency: "monthly", priority: 0.9, lastModified },
    { url: `${site.url}/contact/`, changeFrequency: "yearly", priority: 0.9, lastModified },
    { url: `${site.url}/about/`, changeFrequency: "yearly", priority: 0.8, lastModified },
    { url: `${site.url}/books/`, changeFrequency: "yearly", priority: 0.6, lastModified },
    { url: `${site.url}/writings-media/`, changeFrequency: "weekly", priority: 0.6, lastModified },
    { url: `${site.url}/welch-family-foundation/`, changeFrequency: "yearly", priority: 0.5, lastModified },
    { url: `${site.url}/press-kit/`, changeFrequency: "yearly", priority: 0.5, lastModified },
  ];

  /* Legal pages are intentionally absent: both are noindex, and listing a
     noindex URL in a sitemap asks a crawler to fetch a page it has been told
     to ignore. */

  const talkRoutes: MetadataRoute.Sitemap = [...speakingPillars, hyperWellness].map((talk) => ({
    url: `${site.url}/speaking/${talk.slug}/`,
    changeFrequency: "monthly",
    priority: 0.8,
    lastModified,
  }));

  const bookRoutes: MetadataRoute.Sitemap = books.map((book) => ({
    url: `${site.url}/books/${book.slug}/`,
    changeFrequency: "yearly",
    priority: 0.5,
    lastModified,
  }));

  return [...staticRoutes, ...talkRoutes, ...bookRoutes];
}
