import { Container, Section } from "@/components/primitives";
import { PageHero } from "@/components/kit/PageHero";
import { SquareList } from "@/components/kit/SquareList";
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
      <PageHero
        tone="light"
        title={title}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: title, path },
        ]}
      />

      <Section>
        <Container size="measure">
          <div className="space-y-5 leading-relaxed">
            {grouped.map((block, i) => {
              if ("items" in block) {
                return <SquareList key={i} items={block.items} />;
              }
              if (block.kind === "heading") {
                return (
                  <h2 key={i} className="pt-6 !text-[clamp(1.375rem,1.15rem+0.9vw,1.75rem)] font-bold">
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
