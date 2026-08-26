import type { Metadata } from "next";
import { books, freeChapter } from "@/content/books";
import { Container, Section, Button, JsonLd } from "@/components/primitives";
import { booksSchema, breadcrumbSchema } from "@/lib/jsonld";
import { buildMetadata } from "@/lib/seo";

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

      <section className="bg-[var(--color-navy)] text-white">
        <Container className="py-24 sm:py-32">
          <h1 className="text-white">Books</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            One about why people start things. One about whether they have the energy to finish
            them.
          </p>
        </Container>
      </section>

      <Section>
        <Container>
          <div className="space-y-14">
            {books.map((book) => (
              <article
                key={book.slug}
                className="grid gap-8 border-b border-[var(--color-line)] pb-14 last:border-0 last:pb-0 lg:grid-cols-[1fr_1.6fr]"
              >
                <div>
                  <h2>{book.title}</h2>
                  {book.subtitle && (
                    <p className="mt-2 text-lg text-[var(--color-ink-faint)]">{book.subtitle}</p>
                  )}
                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-[var(--color-accent)]">
                    {book.role}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button href={`/books/${book.slug}/`}>About this book</Button>
                    {book.buyUrl && (
                      <Button href={book.buyUrl} variant="secondary">
                        Buy the Book
                      </Button>
                    )}
                  </div>
                </div>
                <div className="space-y-4 leading-relaxed">
                  {book.description.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <section className="bg-[var(--color-blue)]">
        <Container className="py-14 text-center">
          <h2 className="mx-auto max-w-2xl text-white">{freeChapter.heading}</h2>
          <div className="mt-7 flex justify-center">
            <Button href="/contact/" variant="secondary">{freeChapter.cta}</Button>
          </div>
        </Container>
      </section>

      <Section tone="ink">
        <Container className="text-center">
          <h2 className="text-white">Bring the ideas to your stage.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/speaking/">See the speaking page</Button>
            <Button href="/contact/" variant="secondary">Check availability</Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
