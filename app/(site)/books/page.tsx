import type { Metadata } from "next";
import { featuredBook, featuredEntrepreneurs, getBook } from "@/content/books";
import { img } from "@/content/media-manifest";
import { BookFeature } from "@/components/BookFeature";
import { OptInBar } from "@/components/OptInBar";
import { JsonLd } from "@/components/primitives";
import { booksSchema, breadcrumbSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

/**
 * /books/ — rebuilt against its own block list in the export, which is three
 * blocks and nothing else:
 *
 *   acf/book-cta                          the Restore feature
 *   two-column-content-section  opt-in    the free-chapter band
 *   overlay-content-section     entrepeneurs-book
 *
 * NO PAGE HERO. The first build opened on a navy band with "Books" and a line
 * of copy I wrote; the original has no such block, and the band pushed both
 * covers below the fold on a laptop. The page starts on the Restore artwork,
 * which is the point of it.
 *
 * The <h1> survives that as screen-reader-only text. A page with no h1 at all
 * is a real cost — it is the strongest single signal of what a page is about,
 * and both these books are things people search by name — but it does not have
 * to be a visible band to count. Crawlers read it; the layout is the original's.
 *
 * The first build also rendered both books as text-only rows with the covers
 * missing entirely. A book's cover is the argument for the book. Both blocks
 * now carry theirs, mirrored the way the original mirrors them: Restore with
 * the cover right, Entrepreneurs with the cover left.
 */
export const metadata: Metadata = buildMetadata({
  title: "Books",
  description:
    "Learn more about Steve Welch’s books “Restore: The Life-Changing Power of Right Away Wellness” and “We Are All Born Entrepreneurs.”",
  path: "/books/",
  keywords: [
    "We Are All Born Entrepreneurs",
    "Restore The Life-Changing Power of Right-Away Wellness",
    "Steve Welch book",
  ],
});

export default function BooksPage() {
  return (
    <>
      <JsonLd data={booksSchema()} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Books", path: "/books/" },
        ])}
      />

      <h1 className="sr-only">Books by Steve Welch</h1>

      <BookFeature
        eyebrow={featuredBook.eyebrow}
        title={featuredBook.title}
        subtitle={featuredBook.subtitle}
        body={featuredBook.body}
        learnMoreHref={featuredBook.learnMoreHref}
        buyUrl={getBook(featuredBook.slug)?.buyUrl}
        desktopArt={img.restoreBookBg}
        mobileArt={img.restoreBookBgMobile}
      />

      <OptInBar />

      {/*
        The mirror. `content_position: "right"` in its block, so the copy is on
        the right and the cover on the left; an <hr /> under the heading, which
        Restore does not have; and one button, "Buy the Book" — no "Learn More",
        which is why none is passed. The book's own page is still reachable: each
        book page links to the other, so it is not orphaned by the omission.
      */}
      <BookFeature
        title={featuredEntrepreneurs.title}
        subtitle={featuredEntrepreneurs.subtitle}
        body={featuredEntrepreneurs.body}
        rule
        buyUrl={getBook(featuredEntrepreneurs.slug)?.buyUrl}
        desktopArt={img.entrepreneursBookBg}
        mobileArt={img.entrepreneursBookBgMobile}
        side="right"
      />
    </>
  );
}
