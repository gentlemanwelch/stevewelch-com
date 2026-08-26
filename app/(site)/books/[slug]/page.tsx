import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { books, getBook, freeChapter } from "@/content/books";
import { testimonials } from "@/content/testimonials";
import { site } from "@/content/site";
import { Container, Section, Eyebrow, Button, Prose, JsonLd } from "@/components/primitives";
import { breadcrumbSchema } from "@/lib/jsonld";
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
          ...(endorsements.length > 0 && {
            review: endorsements.map((t) => ({
              "@type": "Review",
              reviewBody: t.quote,
              author: { "@type": "Person", name: t.name },
            })),
          }),
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Books", path: "/books/" },
          { name: book.title, path: `/books/${book.slug}/` },
        ])}
      />

      <section className="bg-[var(--color-navy)] text-white">
        <Container className="py-16 sm:py-24">
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-white/60">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/books/" className="hover:text-white">Books</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-white">{book.title}</li>
            </ol>
          </nav>
          <Eyebrow>About the Book</Eyebrow>
          <h1 className="text-white">{book.title}</h1>
          {book.subtitle && (
            <p className="mt-3 text-xl text-white/75 sm:text-2xl">{book.subtitle}</p>
          )}
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-white/60">
            {book.role}
          </p>
          {book.buyUrl && (
            <div className="mt-8">
              <Button href={book.buyUrl}>Buy the Book</Button>
            </div>
          )}
        </Container>
      </section>

      <Section>
        <Container size="measure">
          <Prose paragraphs={book.description} className="text-lg" />
        </Container>
      </Section>

      {endorsements.length > 0 && (
        <Section tone="alt">
          <Container>
            <h2 className="text-center">What readers said</h2>
            <ul className="mt-12 grid gap-6 lg:grid-cols-3">
              {endorsements.map((t) => (
                <li
                  key={t.name}
                  className="flex flex-col rounded-[var(--radius-card)] bg-white p-7 shadow-[var(--shadow-card)]"
                >
                  <blockquote className="flex-1 leading-relaxed text-[var(--color-ink-soft)]">
                    {t.quote}
                  </blockquote>
                  <p className="mt-5 border-t border-[var(--color-line)] pt-4">
                    <span className="block font-bold text-[var(--color-ink)]">{t.name}</span>
                    <span className="mt-1 block text-sm text-[var(--color-ink-faint)]">
                      {t.title}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <section className="bg-[var(--color-blue)]">
        <Container className="py-14 text-center">
          <h2 className="mx-auto max-w-2xl text-white">{freeChapter.heading}</h2>
          <div className="mt-7 flex justify-center">
            <Button href="/contact/" variant="secondary">{freeChapter.cta}</Button>
          </div>
        </Container>
      </section>

      {other && (
        <Section>
          <Container>
            <h2 className="text-2xl sm:text-3xl">The other book</h2>
            <Link
              href={`/books/${other.slug}/`}
              className="group mt-8 block max-w-xl rounded-[var(--radius-card)] bg-white p-7 shadow-[var(--shadow-card)]"
            >
              <h3>{other.title}</h3>
              {other.subtitle && (
                <p className="mt-1 text-sm text-[var(--color-ink-faint)]">{other.subtitle}</p>
              )}
              <p className="mt-3 leading-relaxed">{other.blurb}</p>
              <span className="mt-5 inline-block text-sm font-semibold text-[var(--color-accent)]">
                About this book →
              </span>
            </Link>
          </Container>
        </Section>
      )}
    </>
  );
}
