# stevewelch.com

The speaking site, rebuilt off WordPress as a Next.js app so it can be changed,
measured, and experimented on without a plugin in the way.

Its single job is to convert an event organizer who found it through search into
a booking inquiry that reaches Steve's team directly, with no bureau in between.

---

## Status

Rebuilt from the full WordPress export (`stevewelch.WordPress.20260826.xml`) —
16 pages, 10 posts, 155 media records, ACF block data, the theme's custom CSS,
and Yoast metadata. Content, structure, URLs and palette are the real site's,
not a reconstruction.

| | Status |
|---|---|
| URLs and page structure | **Exact** — all 12 published pages at their existing paths |
| Copy | **From the export** — the site's own words |
| Palette and typeface | Poppins from the export; palette from Steve's 2026-09-25 mockup — `#06153d`/`#0062f2`/`#0066fc` (see `app/globals.css`) |
| Logo walls, testimonials, media list | **Real** — recovered, not invented |
| Image files | **Not yet present** — run `scripts/download-media.sh` |
| Component-level styling | **Interpreted** — see below |

### The one remaining gap

The export carries the theme's *custom* CSS (colours, button radius, card
shadow) but not its compiled stylesheet, so the exact spacing rhythm, type
scale, and how each ACF block renders visually are an interpretation. Two or
three full-page screenshots would close it. Everything else is settled.

### Getting the images

WordPress has no "export media library" button, and a WXR export stores URLs
rather than bytes — but every file is still served publicly by the live site:

```bash
bash scripts/download-media.sh     # 155 files → public/media/
```

**Run this before cancelling the IONOS hosting.** Some of those originals exist
nowhere else, and once the site is gone they are gone. Keep a copy off this repo
too.

Until it runs, nothing breaks: logo cards show the organization's name, hero
sections fall back to their navy background, video blocks show a play button.

### Facts corrected against the export

Third-party sources were wrong on two points that had made it into the first
build. The site's own words win:

- **Sold Mitos at 30**, not 29.
- **Acquired by Parker (NYSE: PH)** — not "a Fortune 500 company." Corroborated
  twice: Parker Hannifin also appears in the "Selected Companies I have worked
  with" logo wall.

### What was deliberately not carried over

- **The 10 blog posts.** All are theme demo placeholders — titled `post-title`
  through `post-title-10`, identical 2,274 bytes, all dated February 2024.
- **`/articles/` and `/search/`.** Empty template pages (76 bytes each). Both
  redirect rather than 404, since the URLs are indexed.
- **Four draft pages** (`investor`, `executive`, `timeline-example`, and one
  untitled) are unpublished on the original and are not built. `investor` and
  `executive` look like audience-specific landing pages — say the word and
  they get built.
- **Gravity Forms.** Form definitions live outside a WXR export. Forms 2
  (contact), 3 (free-chapter opt-in) and 4 (foundation giving) are replaced by
  one booking form that captures event date, audience size, format and budget.

---

## URLs — why they are unchanged

Every page keeps the exact path WordPress serves it on, trailing slash included:

```
/                    /books/                     /privacy-policy/
/about/              /books/restore/             /terms-and-conditions/
/speaking/           /writings-media/
/contact/            /welch-family-foundation/
```

All twelve return 200 with no redirect hop. Those URLs are indexed and carry
whatever authority they have earned; renaming them throws it away.
`trailingSlash: true` is what makes the slash match.

Two additions sit alongside them:

- **`/speaking/<pillar>/`** — Purpose, People, Process and Hyper Wellness each
  get a page. `/speaking/` still carries all four. The reason is narrow: an
  organizer searching "employee wellbeing keynote speaker" and one searching
  "change management keynote speaker" have different problems, and one page
  cannot rank for both because it cannot be about both.
- **`/press-kit/`** — bios at three lengths, the stage introduction, A/V needs.

## Google Ads landing pages

Campaign landing pages live at `/lp/<slug>/`, one config object each in
`content/landing-pages.ts`. Three ship: `keynote-speaker`,
`organizational-change-speaker`, `wellness-speaker`.

They differ from the organic site in four deliberate ways:

1. **`noindex, follow`**, absent from the sitemap, disallowed in robots.txt.
   They duplicate organic pages by construction; indexed, they compete with the
   pages meant to rank. Paid traffic is unaffected — ads do not need indexing.
2. **No site navigation.** Every link is an exit on a click you paid for.
3. **Message match.** `headline` should echo the ad headline near-verbatim.
   Landing Page Experience is a Quality Score input and Quality Score moves
   cost-per-click, so a matching, fast page buys the same position for less.
4. **Attribution.** `gclid`, `wbraid`, `gbraid` and `utm_*` are captured from
   the click and sent with the inquiry, so a booking traces back to the keyword
   that produced it. An inquiry that carries a Google click identifier is
   subject-tagged `[Ads]`.

To add a campaign: append an object to `content/landing-pages.ts`. That is all.

### Measurement

GA4 is live (`booking_inquiry`, fired on a confirmed submission only, marked as
a key event). The Google Ads conversion goes live when its two values are set.
All three are Vercel **Config** variables, **Production only** — preview and
local traffic must not pollute a property judged on a few dozen conversions:

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX
NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=xxxxxxxxxxxxxxx
```

`lib/analytics.ts` is the only thing that fires the conversion. **Do not set
`NEXT_PUBLIC_GOOGLE_ADS_CONVERSION`** — an earlier version of this README listed
it, and the landing form fired a second conversion from it on top of the one
above, so setting both would have counted every paid inquiry twice. That second
path is removed; the name is recorded here so nobody re-adds it.

**Your own visits.** Open the live site once with `?internal=on` and that
browser is remembered: its visits reach GA4 marked `traffic_type=internal`, and
it never fires the Google Ads conversion. `?internal=off` undoes it. It is per
browser, so do it on each device — and GA4 only drops the marked visits once
its Internal Traffic data filter is switched from Testing to Active.

## The CRM record

Every booking inquiry is saved to a Supabase database as well as emailed. It
is the first piece of a CRM that will live at `/admin`; today there are no
screens, only the record.

- **Where:** `leads` (one per person), `inquiries` (one per form submission),
  `lead_events` (the timeline) and `ad_weeks` (the ad numbers typed in by
  hand). Their definitions are the files in `supabase/migrations/`.
- **Switching it on:** set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` in Vercel,
  on Production and Preview. Without them the form works and saves nothing.
- **The email comes first.** A save that fails never fails the form. The
  inquiry email to Steve opens with a red line saying it was not saved.
- **One submission, one record.** The form gives each submission an id and
  reuses it on a retry, so a double click is one inquiry, one email to Steve
  and one reply to the organizer.
- **Tests are marked.** An inquiry sent from a preview, or from the address
  inquiries are delivered to, is saved as a test and its subject starts
  `[Test]`. On a preview the organizer's reply goes to Steve, never to the
  address typed.
- **Closed to browsers.** The tables refuse every key except the secret one.

A database change is a new file in `supabase/migrations/`, applied to the
project **before** the code that needs it is merged. Structure only: no lead
data, no keys and no addresses belong in this repository.

### The door at /admin

The CRM's screens live at `/admin`, behind "Sign in with Google" for **one**
account. Behind the door today: the Leads list, and a page for each lead.

- **Who gets in:** the Google account named in `ADMIN_GOOGLE_EMAIL`, and nobody
  else. There are no users, roles or passwords to manage.
- **Switching it on:** the four settings under "The door" in `.env.example`,
  on Production and Preview, plus the return addresses on the Google sign-in
  client. With any one missing the door is shut and the sign-in page says so.
- **How long a sign-in lasts:** seven days. Changing `ADMIN_GOOGLE_EMAIL` or
  `ADMIN_SESSION_SECRET` signs everyone out at once.
- **Kept away from search engines and from analytics.** The pages are
  `noindex`, disallowed in robots.txt, and sent with `X-Robots-Tag`. They load
  no analytics: the tag lives in `components/SiteScripts.tsx`, which only the
  public layouts render.

### The Leads list and a lead's page

`/admin/` lists everyone who has inquired, newest activity first: their budget
answer, stage, where they came from, the event, and the last thing that
happened. `/admin/leads/<id>/` is one lead: the brief to read before calling
them, and the timeline.

- **What needs you is at the top.** Today that is an inquiry that was saved
  while the email about it failed: the one case where the CRM knows something
  the inbox does not.
- **Tests are hidden** unless asked for (`?tests=1`). An inquiry sent from a
  preview, or from the address inquiries are delivered to, is a test.
- **A lead is addressed by its record id**, never a name or an email, and the
  list never asks the database for an email address.
- **Times are shown in Central time**, whatever the server's clock says.
- **"Send a test inquiry to myself"**, on the empty list, sends a real inquiry
  through the real form from the owner's own address.

### After the inquiry: the outcome, the Pipeline and the Reports

A lead's page has an "After the call" panel: **Call held**, **No-show**,
**Qualified**, **Not a fit**, a stage menu, and the next step, its due date,
the fee and notes. `/admin/pipeline/` shows every open lead in the column of
its stage. `/admin/reports/` counts them.

- **A form fill is never counted as a booked call, and a booked call is never
  counted as an engagement.** A lead moves only when the owner says so, one
  fact per press. "Qualified" does not mark the call as held. The counting
  rules are in `lib/crm/reports.ts`, each one checked on its own.
- **Where a lead is, and how far it got, are two things.** A no-show goes back
  to being an inquiry without forgetting a call was booked; a closed lead
  remembers the stage it reached. "Booked" counts only leads booked now.
- **Nothing here emails the lead.** The buttons write to the database and do
  nothing else.
- **A change and its line on the timeline are saved together**, in one
  database function (`crm_lead_action`), or not at all.
- **A closed lead who inquires again is open again**, so nobody who writes
  back is missing from the Pipeline.
- **A next step that has come due is put at the top of the Leads list**, with
  the inquiries whose email failed.
- **The spend gates are kept count of, not applied.** Spend, clicks and the
  campaign's first day are typed in on the Reports page. Nothing in the CRM
  pauses or spends anything.
- **Reports know no names.** That page asks the database for stages and
  sources only, and never for a test.

## AIO — being cited by AI answers

`robots.ts` names GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot,
Google-Extended and others individually and allows each. `Google-Extended`
governs Gemini and AI Overviews only; it does not affect Search ranking.

`/llms.txt` is generated from the same content as the pages, so it cannot drift.
It leads with identity disambiguation, because several public figures share this
name — one of them has a Wikipedia entry.

Facts are emitted as complete sentences as well as display fragments. A number
in one element and its label in another reaches a parser as two unrelated
pieces; see the hidden `sentence` field on `StatRow` (`components/kit/StatRow.tsx`).

## Running it

```bash
npm install
npm run dev          # http://localhost:3000
```

Before every push:

```bash
npm run build        # the only check that catches what a deploy catches
npm run lint         # must be clean — zero warnings, not just zero errors
npm run typecheck
```

After any change to the booking form, `app/api/inquiry/route.ts` or `lib/crm/`:

```bash
npm run build && node scripts/test-inquiry-route.mjs
```

That runs the real, built route against stand-ins for Supabase and Resend and
checks that a failed save, a failed reply or a double send never costs an
inquiry. It needs no keys and sends no email.

After any change under `app/admin/`, `app/api/admin/` or to `lib/crm/session.ts`
or `lib/crm/google.ts`:

```bash
npm run build && node scripts/test-admin-door.mjs
```

That tries every way into `/admin` that should fail — a forged or expired
cookie, another Google account, an unverified address, a return from Google
that this browser never started, a half-configured deployment — and the one
way that should work. It needs nobody's Google account.

After any change to the lead screens, `lib/crm/leads.ts` or `lib/crm/format.ts`:

```bash
npm run build && node scripts/test-admin-leads.mjs
node --no-warnings scripts/test-crm-format.mjs
```

The first runs the Leads list and a lead's page against a stand-in for the
database, with made-up people: who can see them, what they ask the database
for, and that what they show is right. The second checks the CRM's wording —
sources, budgets, dates, "3 hours ago" — one small function at a time.

After any change to the "After the call" panel, the Pipeline, the Reports,
`app/api/admin/leads/`, `app/api/admin/reports/` or `lib/crm/reports.ts`:

```bash
npm run build && node scripts/test-admin-outcome.mjs
node --no-warnings scripts/test-crm-reports.mjs
```

The first checks that only the owner can change a lead, that what is typed is
checked before it is saved, that no press sends an email, and that the three
screens show the right leads in the right places. The second checks every
counting rule: what is an inquiry, a booked call, a held call, a booking.

A change to a database function is checked against the real database before
it is applied: the migration and a set of checks are run in one statement
that ends by raising an error, so everything is rolled back.

`npm run build` is not optional. Type-checking alone passes on code that fails
to build, because bundling errors only surface when the bundler runs.

---

## Editing the site

All copy lives in `content/`. Nothing in `app/` or `components/` needs to be
opened to change what the site says.

| File | What it holds |
|---|---|
| `content/site.ts` | Name, domain, navigation, contact email, social links, fee visibility, portrait |
| `content/bio.ts` | Three bio lengths, credentials strip, career timeline |
| `content/speaking.ts` | **The keynotes — `talks` is the one list; each gets its own page. The most important file here.** |
| `content/books.ts` | Both books |
| `content/faq.ts` | Booking FAQ (also emitted as FAQ structured data) |
| `content/media.ts` | Writings + Media appearances. Ships empty — see below. |
| `content/foundation.ts` | Welch Family Foundation mission and focus areas |
| `content/testimonials.ts` | Ships empty on purpose. See below. |

**Adding a keynote** means adding one object to `talks` in `content/speaking.ts`. The
page, the sitemap entry, the structured data, the footer link, and the
cross-links from the other topic pages all follow automatically. Same for a
book in `content/books.ts`.

---

## The four things worth doing first

1. **Get real testimonials into `content/testimonials.ts`.** It ships empty and
   every page that uses it renders nothing, so the site is honest as-is — but a
   booker choosing between two speakers at the same fee chooses on evidence
   that someone else booked you and was glad. Ask the week after each event,
   and get a name, title, and organization. Three named quotes will move more
   bookings than any other change here.

2. **Add a photograph.** Set `site.portrait` to a file in `/public`. A stage
   shot beats a headshot. Until one exists the hero shows the Philadelphia
   Inquirer line instead, which does a similar job but not the same one.

3. **Fill in `content/media.ts`.** The Writings + Media page ships with an
   empty appearance list and renders an honest placeholder rather than a
   fabricated back catalogue. Every real podcast, article and talk added there
   is third-party evidence that somebody else put Steve in front of an
   audience — exactly the signal both a booker and a search engine weigh.

4. **Connect the form to email.** Until `RESEND_API_KEY` and
   `INQUIRY_FROM_EMAIL` are set, `/api/inquiry` returns a clear error and the
   form offers a `mailto:` fallback — deliberately, because a booking form that
   silently swallows a $15,000 inquiry is worse than no form at all.

---

## Deploying

Vercel, connected to this repository.

1. Import `gentlemanwelch/stevewelch-com`. Root directory is the repo root —
   no override needed.
2. Add the environment variables from `.env.example`.
3. Deploy, and check the preview URL before touching DNS.

### Moving the domain off 1&1 / IONOS

The domain is registered at IONOS and currently points at WordPress hosting.
Nothing needs to be transferred — only the DNS records need to change.

1. Deploy to Vercel and confirm the preview works end to end, form included.
2. In Vercel: **Project → Settings → Domains**, add `stevewelch.com` and
   `www.stevewelch.com`. Vercel will show the exact records to create.
3. In the IONOS DNS panel, update:
   - `www` — `CNAME` → the value Vercel gives
   - `@` (apex) — `A` → the address Vercel gives
4. Leave every `MX` record alone. Touching those breaks email.
5. Wait for propagation, then confirm both hostnames serve the new site and
   that `stevewelch.com` redirects to `www` (or the reverse — pick one and be
   consistent; `content/site.ts` currently assumes `www`).

**Do not cancel the WordPress hosting until the new site has been live and
correct for a couple of weeks.** It is the only remaining copy of the original
content.

### The day after cutover

- Submit `https://www.stevewelch.com/sitemap.xml` in Google Search Console.
- Use the **URL Inspection** tool on the homepage and `/speaking` to request
  indexing rather than waiting.
- Watch Search Console's **Coverage** report for 404s from old WordPress URLs.
  Every one that appears should get a redirect added to `redirects()` in
  `next.config.ts` — a few common ones are already there, guessed rather than
  observed. A redirect preserves whatever ranking that URL had earned; a 404
  discards it.

---

## How the SEO is built

The strategy is that an event organizer almost never searches a speaker's name.
They search the thing they need said on their stage. So the site is structured
around topics rather than around a résumé:

- **`/speaking/<topic>/`** — one substantial page per topic, each targeting its
  own cluster of search terms. These are the pages meant to earn traffic. A
  single page cannot rank for "change management keynote speaker" *and*
  "employee wellbeing speaker" because it cannot be about both.
- **`/speaking`** — the hub, targeting the broad term, linking down to the talks
  and carrying the booking FAQ.
- **`/press-kit/`** — bookers search for it by name, it removes four emails
  from every engagement, and having one signals that you have done this before.
- **`/about`** — the credibility page, written in verifiable specifics because
  that is what search engines weigh and what readers check.

Mechanically, every page carries: a single `<h1>`, an explicit canonical URL,
Open Graph and Twitter cards, and JSON-LD. The structured data describes a
`Person`, a `WebSite`, the speaking practice as a `Service` with a catalog of
talks, `FAQPage` markup on the booking questions, and `BreadcrumbList` trails.
The sitemap and `robots.txt` are generated from the same content, so they cannot
drift.

Everything except `/api/inquiry` is statically generated. Page speed is a
ranking input and a booker comparing speakers does not wait on a spinner.

### Where to experiment

The point of leaving WordPress is being able to run experiments. The cheapest
ones, roughly in order of expected return:

- **More topic pages.** This is the lever. Each well-written topic page is
  another entry point. Three is a start, not a ceiling.
- **Location pages** — if a meaningful share of bookings are regional, a page
  per major market ("keynote speaker in Austin") is a well-worn play. Only worth
  it if the pages are genuinely about the market and not templated filler, which
  gets treated as spam.
- **Industry pages** — "keynote speaker for healthcare conferences" and the
  like, where the argument is tailored to that industry's situation.
- **Publishing.** The Substack already exists. Cross-posting the best pieces
  here, on this domain, builds the topical authority that makes the commercial
  pages rank.

---

## Design

Warm editorial, high contrast, no stock photography: an audience of corporate
event organizers reads restraint as seniority.

Every colour, font, and rhythm value resolves to a token at the top of
`app/globals.css`. Matching the old WordPress theme — or any other look — means
editing that one block and swapping the two font families in `app/layout.tsx`.
No component needs to change.

One trap worth knowing about, documented in the file itself: base element styles
have to stay inside `@layer base`. An unlayered CSS rule beats a layered one
regardless of specificity, so a stray `a { color: inherit }` written outside the
layer silently overrides every Tailwind text-colour utility on the site and
renders button labels invisible. It looks like a specificity bug and is not one.

---

## Stack

Next.js 16 (App Router) · React 19 · Tailwind CSS v4 · Resend for the form.

Three runtime dependencies, on purpose. This site should still build in five
years without a dependency archaeology project.
