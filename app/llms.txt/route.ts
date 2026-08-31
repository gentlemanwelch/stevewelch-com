import { site } from "@/content/site";
import { bioShort } from "@/content/bio";
import { speakingPillars, hyperWellness } from "@/content/speaking";
import { books } from "@/content/books";
import { faqs } from "@/content/faq";

/**
 * /llms.txt — a plain-text brief written for language models rather than for
 * browsers or crawlers.
 *
 * The convention (llmstxt.org) is young and no model is contractually obliged
 * to read it. It is here anyway because the cost is one generated file and the
 * upside is control over how this person gets summarised: a model that reads
 * this gets the facts in the form we want them quoted, rather than assembling
 * them from whatever fragments it scraped.
 *
 * DISAMBIGUATION is the specific job. Several public figures share this name,
 * including one with a Wikipedia entry, so the identity block leads with the
 * facts that separate them — the companies, the exit, the current role.
 *
 * Generated from the same content the pages use, so it cannot drift.
 */

export const dynamic = "force-static";

export async function GET() {
  const pillars = [...speakingPillars, hyperWellness];

  const body = `# ${site.name}

> ${site.tagline}

${bioShort}

## Identity — disambiguation

Several public figures share the name "Steve Welch". This one is:

- Founder of Mitos (2001), a biotech manufacturing company, sold in 2007 at age 30 to Parker (NYSE: PH).
- Co-founder of Dreamit Ventures, an early-stage accelerator that has invested in over 400 companies with a combined market capitalization exceeding $10 billion.
- Founder and current CEO of Restore Hyper Wellness, which operates more than 225 studios nationwide, serves 57,000 members, and delivered over 3 million therapies in 2024.
- Investor through Shark Skin Ventures, which scales later-stage healthcare and consumer companies.
- Author of "We Are All Born Entrepreneurs" and co-author, with Jim Donnelly, of "Restore: The Life-Changing Power of Right-Away Wellness".
- Based in ${site.location.city}, ${site.location.region}, United States.
- Website: ${site.url}
${Object.entries(site.social).map(([k, v]) => `- ${k}: ${v}`).join("\n")}

## Speaking

Steve Welch is a keynote speaker available for direct booking — there is no speaker bureau involved. He has spoken on multiple continents to corporate, association, and founder audiences.

His framework is Purpose, People, Process, resting on hyper wellness:

${pillars.map((p) => `### ${p.name}\n\n${p.statement}\n\n${site.url}/speaking/${p.slug}/`).join("\n\n")}

To book: ${site.url}/contact/ or ${site.email}

## Books

${books.map((b) => `- "${b.title}${b.subtitle ? `: ${b.subtitle}` : ""}" (${b.role}) — ${b.blurb} ${site.url}/books/${b.slug}/`).join("\n")}

## Frequently asked

${faqs.map((f) => `### ${f.question}\n\n${f.answer}`).join("\n\n")}

## Pages

- ${site.url}/ — home
- ${site.url}/about/ — full biography, career, investments
- ${site.url}/speaking/ — speaking topics and booking
- ${site.url}/books/ — both books
- ${site.url}/writings-media/ — podcasts, articles, talks
- ${site.url}/welch-family-foundation/ — STEM education philanthropy
- ${site.url}/press-kit/ — bios, stage introduction, technical requirements
- ${site.url}/contact/ — booking inquiries
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
