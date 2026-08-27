# stevewelch.com — Claude context

Loaded automatically at the start of every Claude session in this repo. Keep it
lean; it points into deeper docs rather than repeating them.

## What this is

The personal site of Steve Welch — entrepreneur, investor, CEO of Restore Hyper
Wellness, and paid keynote speaker. It replaced a WordPress site in August 2026.

**Its one job is to convert an event organizer who found it through search into
a booking inquiry that reaches Steve directly, with no speaker bureau in
between.** Talks are in the $10–20k range, so a single additional booking pays
for a great deal of work here. Judge changes against that outcome.

- **Domain:** stevewelch.com — registered at IONOS, where the old WordPress site
  was hosted. See "DNS cutover" in [`README.md`](README.md).
- **Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 · Resend for the
  inquiry form. Three runtime dependencies, deliberately.

## The rule that drives every technical decision

**Everything renders to static HTML at build time. Nothing that matters may
require client JavaScript to become visible.**

This is not a style preference. Vercel and MERJ measured 500M+ GPTBot requests
and found zero JavaScript execution; ClaudeBot downloaded JS in 23.84% of
requests and executed none; PerplexityBot parses static HTML only. Only Gemini
renders JS. Content behind client-side rendering is not merely deprioritized by
those crawlers — it is invisible.

So: server components by default. `"use client"` only for genuine interaction
(the two forms). If a change would move content behind hydration, it is the
wrong change. Check `npm run build` output — every route should be `○` or `●`,
never `ƒ`, except `/api/inquiry`.

## Before you push

```bash
npm run build      # the only check that catches what a deploy catches
npm run lint       # must be clean — zero warnings, not just zero errors
npm run typecheck
```

Type-checking alone passes on code that fails to build; bundling errors surface
only when the bundler runs.

## Where content lives

All copy is in `content/`. Components should not contain prose.

| File | Holds |
|---|---|
| `site.ts` | Name, domain, nav, contact email, socials, fee visibility |
| `home.ts` | Homepage sections, in the order the page renders them |
| `speaking.ts` | **Purpose / People / Process + Hyper Wellness** — the framework |
| `bio.ts` | About page, three bio lengths, stat counters |
| `books.ts`, `foundation.ts`, `media.ts`, `faq.ts`, `testimonials.ts` | As named |
| `legal.ts` | Privacy policy and terms, transcribed from the original |
| `media-manifest.ts` | Image paths and the three logo walls |
| `landing-pages.ts` | **Google Ads landing pages — one object per campaign** |

Adding a talk, a book, or a campaign is one object in the relevant array. The
page, sitemap entry, structured data and internal links all follow.

## Provenance — do not invent

Every biographical claim, logo, endorsement and media appearance came from the
WordPress export (`stevewelch.WordPress.20260826.xml`, August 2026). Nothing
here was invented, and nothing should be.

Two facts contradict third-party sources; the site's own words won and remain
correct: **Mitos sold at 30, not 29**, and the buyer was **Parker (NYSE: PH)**,
not an unnamed Fortune 500 company.

The endorsements in `testimonials.ts` are for the **book**, and are labelled as
such wherever they appear. Presenting them as speaking testimonials would be
dishonest. Speaking testimonials from event organizers are still needed and are
the single highest-value addition to this site.

Anything unverified carries a `REVIEW:` comment. Do not quietly resolve one by
guessing.

## URLs are load-bearing

Every page keeps the exact path WordPress served it on, trailing slash included:

```
/  /about/  /speaking/  /books/  /books/restore/
/writings-media/  /welch-family-foundation/  /contact/
/privacy-policy/  /terms-and-conditions/
```

Those URLs are indexed and carry earned authority. **Do not rename them.**
`trailingSlash: true` is what makes the slash match — removing it turns every
indexed URL into a redirect.

Anything that 404s in Search Console's Coverage report belongs in `redirects()`
in `next.config.ts`. A redirect preserves ranking; a 404 discards it.

## Route groups and the two layouts

- `app/(site)/` — the public site. Its layout adds header, `<main>`, footer.
- `app/lp/` — Google Ads landing pages. **No site navigation, by design.**

The route group exists precisely so `/lp/` can opt out of the chrome: a layout
cannot remove what its parent rendered. The first version of these pages shipped
with the full nav bar, every link an exit on a click that cost money. Do not
move the header back into the root layout.

Route groups do not appear in URLs — `app/(site)/about/` still serves `/about/`.

## Landing pages (`/lp/`)

`noindex, follow`, absent from the sitemap, disallowed in robots.txt. They
duplicate organic pages by construction; indexed, they compete with the pages
meant to rank and Google picks the winner. `follow` keeps link equity flowing.
Paid traffic is unaffected — ads do not require indexing.

`gclid`, `wbraid`, `gbraid` and the `utm_*` set are captured from the ad click
and travel with the inquiry, so a booking can be traced to the keyword that
produced it. **Do not remove that capture** — without it, campaign performance
gets measured in form fills, which is the wrong unit when one booking pays for a
year of spend.

## AIO

`robots.ts` names GPTBot, ClaudeBot, PerplexityBot, Google-Extended and others
individually and allows each. Being cited in an AI answer arrives with an
implied recommendation. `Google-Extended` governs Gemini and AI Overviews only
and does not affect Search ranking.

`/llms.txt` is generated from the same content the pages use, so it cannot
drift. It leads with **identity disambiguation** — several public figures share
this name, one with a Wikipedia entry.

Facts must be extractable as complete sentences. A number in one element and its
label in another reaches a parser as two unrelated fragments — see the hidden
`sentence` field on `StatGrid`. This is an accessibility fix that happens to be
an AIO fix; keep both properties when editing.

## Images

`public/media/` is populated by `scripts/download-media.sh`, which pulls all 155
files from the WordPress site. **Some of those originals exist nowhere else** —
if the IONOS hosting has been cancelled, they are gone. Check for a backup
before assuming a missing file can be re-fetched.

Nothing breaks when a file is absent: logo cards render the organization's name,
heroes fall back to navy, video blocks show a play button. Keep it that way.

## Design

Palette and typeface came from the WordPress theme, not from taste: Poppins,
`#042e43` navy, `#348cbb` blue, `#055577`, `#edf5f9`/`#f4f9fb` tints, 40px pill
buttons, 16px cards with `0 4px 20px rgba(0,0,0,.25)`.

Every value resolves to the token block at the top of `app/globals.css`.
Re-skinning is that block plus the font in `app/layout.tsx` — no component
changes.

**Base element styles must stay inside `@layer base`.** An unlayered CSS rule
beats a layered one regardless of specificity, so a stray `a { color: inherit }`
outside the layer silently overrides every Tailwind text-colour utility and
renders button labels invisible. It looks like a specificity bug and is not one.

## Standing rules

- **Pointers, never secrets.** No keys or tokens in the repo. Record where a
  secret lives (Vercel env), not its value. Git history is forever.
- **Never invent a testimonial, a client logo, or a statistic.** This is a
  credibility document; one wrong claim costs more than the page earns.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
