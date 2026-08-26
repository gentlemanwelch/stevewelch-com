import Link from "next/link";
import { Container, Button } from "@/components/primitives";
import { talks } from "@/content/talks";

/**
 * A 404 that keeps a visitor on the site.
 *
 * WordPress URLs that do not survive the migration will land here, so it lists
 * the real destinations rather than apologising. Anything that shows up in
 * Search Console's coverage report repeatedly should get a redirect added in
 * next.config.ts instead.
 */
export default function NotFound() {
  return (
    <Container className="py-24 sm:py-32">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
        404
      </p>
      <h1 className="mt-3 text-[2.4rem] leading-tight sm:text-[3rem]">
        That page has moved on.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-[var(--color-ink-soft)]">
        The site was recently rebuilt and this address did not survive the move. Here is where
        everything went.
      </p>

      <ul className="mt-10 grid gap-3 sm:grid-cols-2">
        {talks.map((talk) => (
          <li key={talk.slug}>
            <Link
              href={`/speaking/${talk.slug}/`}
              className="block rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-5 py-4 text-[0.95rem] font-medium text-[var(--color-ink)] transition-colors hover:border-[var(--color-ink)]"
            >
              {talk.title}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button href="/">Back to the homepage</Button>
        <Button href="/contact/" variant="secondary">
          Book Steve
        </Button>
      </div>
    </Container>
  );
}
