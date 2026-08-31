import { site } from "@/content/site";
import { bioShort } from "@/content/bio";
import { speakingPillars, hyperWellness } from "@/content/speaking";
import { faqs } from "@/content/faq";
import { books } from "@/content/books";

/**
 * Structured data (JSON-LD).
 *
 * This is the part of SEO that is genuinely mechanical rather than a matter of
 * taste: search engines will read an explicit machine-readable description of
 * who this person is and what he offers, and they will not infer it reliably
 * from prose. It is also what makes a knowledge panel and FAQ rich results
 * possible.
 *
 * Everything below describes things that are actually true and actually on the
 * page. Marking up claims that do not appear in the visible content is a
 * guidelines violation and gets the markup ignored at best.
 */

const PERSON_ID = `${site.url}/#person`;
const WEBSITE_ID = `${site.url}/#website`;

/** The central entity. Everything else on the site points back at this. */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: site.name,
    url: site.url,
    description: bioShort,
    jobTitle: "Keynote Speaker, Entrepreneur, and Author",
    /**
     * `sameAs` is how a search engine confirms that the Steve Welch on this
     * site is the same one on LinkedIn and Crunchbase. That identity link is
     * what lets third-party credibility count toward this domain.
     */
    sameAs: Object.values(site.social),
    knowsAbout: [
      "Entrepreneurship",
      "Startup accelerators",
      "Venture capital",
      "Corporate innovation",
      "Human performance",
      "Health and wellness",
      "Leadership",
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.city,
      addressRegion: site.location.region,
      addressCountry: site.location.country,
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: site.url,
    name: site.name,
    description: site.description,
    publisher: { "@id": PERSON_ID },
    inLanguage: "en-US",
  };
}

/**
 * The speaking practice as an offered service. This is the markup that has a
 * chance of surfacing the site for "hire a keynote speaker on X" rather than
 * only for his name — `serviceType` and the catalog of talks are what tie the
 * person to the thing being searched for.
 */
export function speakingServiceSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${site.url}/speaking#service`,
    name: `Keynote Speaking — ${site.name}`,
    serviceType: "Keynote speaking",
    provider: { "@id": PERSON_ID },
    areaServed: "Worldwide",
    description: site.description,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Signature talks",
      itemListElement: [...speakingPillars, { ...hyperWellness, points: [] }].map((talk) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: talk.name,
          description: talk.statement,
          url: `${site.url}/speaking/${talk.slug}/`,
        },
      })),
    },
  };
}

/**
 * FAQ markup. These answers can appear directly in search results, which is
 * disproportionately valuable here: an organizer who gets "how do I book him"
 * answered in the result page arrives already knowing there is no agency in
 * the middle.
 */
export function faqSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function booksSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: books.map((book, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Book",
        name: book.subtitle ? `${book.title}: ${book.subtitle}` : book.title,
        author: { "@id": PERSON_ID },
        url: `${site.url}/books`,
        // The retail link, same as on each book's own page. Deliberately no
        // price: it changes, and nothing here is a source for it.
        ...(book.buyUrl && {
          offers: {
            "@type": "Offer",
            url: book.buyUrl,
            availability: "https://schema.org/InStock",
            seller: { "@type": "Organization", name: "Amazon" },
          },
        }),
      },
    })),
  };
}

/**
 * Breadcrumbs. Beyond the trail shown in search results, this is how a crawler
 * understands that /speaking/<talk> is a child of /speaking rather than an
 * orphan — which is what concentrates authority on the hub page.
 */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${site.url}${crumb.path === "/" ? "" : crumb.path}`,
    })),
  };
}
