import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { books, getBook, freeChapter, bookLabels } from "@/content/books";
import { testimonials } from "@/content/testimonials";
import { site } from "@/content/site";
import { Container, Section, Button, Prose, JsonLd } from "@/components/primitives";
import { PageHero } from "@/components/kit/PageHero";
import { SectionHeading } from "@/components/kit/SectionHeading";
import { LinkCard } from "@/components/kit/LinkCard";
import { CtaBand } from "@/components/kit/CtaBand";
import { buildMetadata } from "@/lib/seo";

/**
 * A single book. /books/restore/ exists on the WordPress original and is
 * indexed, so it is reproduced at that exact URL; the other book gets the same
 * treatment for the cost of nothing.
 */

export function generateStaticParams() {
  return books.map((book) => ({ slug: book.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) return {};
  const full = book.subtitle ? `${book.title}: ${book.subtitle}` : book.title;
  return buildMetadata({
    title: full,
    description: book.blurb,
    path: `/books/${book.slug}/`,
    keywords: [book.title, `${book.title} Steve Welch`],
    type: "article",
  });
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = getBook(slug);
  if (!book) notFound();

  const other = books.find((b) => b.slug !== book.slug);
  const full = book.subtitle ? `${book.title}: ${book.subtitle}` : book.title;

  // The endorsements are for Restore specifically — they name it. Showing them
  // on the other book's page would be a quiet lie.
  const endorsements = book.slug === "restore" ? testimonials : [];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Book",
          name: full,
          author: { "@id": `${site.url}/#person` },
          description: book.blurb,
          url: `${site.url}/books/${book.slug}/`,
          /*
            Where the book can actually be bought. This is the half of "buy the
            book" a crawler can read: an assistant asked where to get Restore has
            somewhere to send the person, rather than only a page that mentions
            it. No `price` — it moves, and there is no source for it here; a
            guessed number on a credibility document is worse than none.
          */
          ...(book.buyUrl && {
            offers: {
              "@type": "Offer",
              url: book.buyUrl,
              availability: "https://schema.org/InStock",
              seller: { "@type": "Organization", name: "Amazon" },
            },
          }),
          ...(endorsements.length > 0 && {
            review: endorsements.map((t) => ({
              "@type": "Review",
              reviewBody: t.quote,
              author: { "@type": "Person", name: t.name },
            })),
          }),
        }}
      />
      <PageHero
        eyebrow={bookLabels.eyebrow}
        title={book.title}
        lede={book.subtitle}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Books", path: "/books/" },
          { name: book.title, path: `/books/${book.slug}/` },
        ]}
        aside={
          /* The cover on its own pale field, as the artwork is drawn. */
          <div className="flex justify-center rounded-[var(--radius-base)] bg-tint-warm p-6 sm:p-10">
            <Image
              src={book.cover.src}
              alt={book.cover.alt}
              width={book.cover.width}
              height={book.cover.height}
              priority
              className="h-auto max-h-[26rem] w-auto"
            />
          </div>
        }
      >
        <p className="eyebrow text-white/75">{book.role}</p>
        {book.buyUrl && (
          <div className="mt-8">
            <Button href={book.buyUrl} glyph="arrow">{bookLabels.buy}</Button>
          </div>
        )}
      </PageHero>

      <Section>
        <Container size="measure">
          <Prose paragraphs={book.description} className="text-lg text-navy" />
        </Container>
      </Section>

      {endorsements.length > 0 && (
        <Section tone="alt">
          <Container>
            {/* Endorsements OF THE BOOK, and headed as such — presenting them
                as speaking testimonials would be dishonest. They are also the
                `review` entries in this page's Book markup, which is only
                legitimate because they are visible here. */}
            <SectionHeading lines={bookLabels.endorsements} />
            <ul className="mt-12 grid gap-x-10 gap-y-12 lg:mt-14 lg:grid-cols-3">
              {endorsements.map((t) => (
                <li key={t.name} className="flex flex-col border-t-2 border-navy pt-6">
                  <figure className="flex flex-1 flex-col">
                    <blockquote className="flex-1 leading-relaxed text-navy">{t.quote}</blockquote>
                    <figcaption className="mt-6 flex items-center gap-4">
                      {t.image && (
                        /*
                          Empty alt: the person's name sits immediately beside
                          it in text, so announcing the image too would read
                          the name twice.
                        */
                        <Image
                          src={t.image}
                          alt=""
                          aria-hidden="true"
                          width={400}
                          height={400}
                          className="h-14 w-14 shrink-0 rounded-[var(--radius-base)] object-cover"
                        />
                      )}
                      <span className="min-w-0">
                        <span className="block font-bold text-navy">{t.name}</span>
                        <span className="mt-0.5 block text-[0.9375rem] leading-snug text-ink-faint">{t.title}</span>
                      </span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      {other && (
        <Section>
          <Container>
            <h2 className="!text-[clamp(1.75rem,1.2rem+1.8vw,2.5rem)] font-extrabold">{bookLabels.other}</h2>
            <div className="mt-8 max-w-xl">
              <LinkCard
                href={`/books/${other.slug}/`}
                eyebrow={other.subtitle}
                title={other.title}
                body={other.blurb}
                action={bookLabels.otherAction}
              />
            </div>
          </Container>
        </Section>
      )}

      {/* The free chapter goes to the chapter. It used to go to /contact/ —
          a booking form, for someone who asked for a PDF. */}
      <CtaBand
        heading={[freeChapter.heading, freeChapter.headingEm]}
        longHeading
        primary={{ label: freeChapter.cta, href: freeChapter.pdfHref }}
        location={`book_${book.slug}_free_chapter`}
      />
    </>
  );
}
