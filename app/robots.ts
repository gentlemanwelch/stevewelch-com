import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/**
 * robots.txt
 *
 * AI crawlers are allowed EXPLICITLY rather than left to the wildcard.
 *
 * The reasoning is commercial, not technical. Being quoted in a ChatGPT or
 * Perplexity answer to "who are good keynote speakers on organizational
 * change" is worth more than a mid-page organic result, because the answer
 * arrives with an implied recommendation. Blocking those crawlers — or leaving
 * it ambiguous — opts out of that entirely.
 *
 * Google-Extended is the separate control for Gemini and AI Overviews; it does
 * NOT affect normal Google Search ranking, so allowing it costs nothing here.
 *
 * Named individually so the intent is unmistakable to a human reading the file
 * later, and so any one of them can be revoked without touching the others.
 */
const AI_CRAWLERS = [
  "GPTBot",          // OpenAI — training and ChatGPT browsing
  "OAI-SearchBot",   // OpenAI — ChatGPT search index
  "ChatGPT-User",    // OpenAI — user-initiated fetches
  "ClaudeBot",       // Anthropic
  "Claude-User",     // Anthropic — user-initiated fetches
  "PerplexityBot",   // Perplexity index
  "Perplexity-User", // Perplexity — user-initiated fetches
  "Google-Extended", // Gemini / AI Overviews (separate from Googlebot)
  "Applebot-Extended",
  "cohere-ai",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /lp/ holds paid-search landing pages. They are near-duplicates of the
        // organic pages by design, so indexing them would set them competing
        // against the pages that are supposed to rank. Each also carries a
        // noindex tag — this is belt and braces, and the tag is what actually
        // governs, since a Disallow alone can still leave a URL indexed
        // without a snippet.
        disallow: ["/api/", "/lp/"],
      },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/api/", "/lp/"],
      })),
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
