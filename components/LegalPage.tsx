import { Container, Section, JsonLd } from "@/components/primitives";
import { breadcrumbSchema } from "@/lib/jsonld";
import type { LegalBlock } from "@/content/legal";

/**
 * Shared renderer for the two legal pages.
 *
 * Blocks are rendered as real elements rather than injected as HTML — the text
 * came out of a WordPress export, and there is no reason to hand a page the
 * ability to run whatever markup happened to be stored in a post body.
 *
 * Consecutive list items are grouped into a single <ul> so the markup is valid
 * and screen readers announce list length correctly.
 */
export function LegalPage({
  title,
  path,
  blocks,
}: {
  title: string;
  path: string;
  blocks: LegalBlock[];
}) {
  const grouped: (LegalBlock | { kind: "ul"; items: string[] })[] = [];
  for (const block of blocks) {
    const last = grouped[grouped.length - 1];
    if (block.kind === "li") {
      if (last && "kind" in last && last.kind === "ul") last.items.push(block.text);
      else grouped.push({ kind: "ul", items: [block.text] });
    } else {
      grouped.push(block);
    }
  }

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: title, path },
        ])}
      />

      <section className="border-b border-[var(--color-line)] bg-[var(--color-tint)]">
        <Container className="py-16 sm:py-20">
          <h1>{title}</h1>
        </Container>
      </section>

      <Section>
        <Container size="measure">
          <div className="space-y-5 leading-relaxed">
            {grouped.map((block, i) => {
              if ("items" in block) {
                return (
                  <ul key={i} className="space-y-2 pl-1">
                    {block.items.map((item, j) => (
                      <li key={j} className="flex gap-3">
                        <span aria-hidden="true" className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-blue)]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (block.kind === "heading") {
                return (
                  <h2 key={i} className="pt-6 text-xl sm:text-2xl">
                    {block.text}
                  </h2>
                );
              }
              return <p key={i}>{block.text}</p>;
            })}
          </div>
        </Container>
      </Section>
    </>
  );
}
