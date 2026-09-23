/**
 * Google Ads landing pages, served at /lp/<slug>/.
 *
 * ADDING A CAMPAIGN IS ONE OBJECT IN THIS ARRAY. The page, its tracking, its
 * noindex tag and its exclusion from the sitemap all follow automatically.
 *
 * Four things about these pages differ from the organic site, all deliberate:
 *
 *  1. NOINDEX. A paid landing page is a near-duplicate of an organic page by
 *     construction. Indexed, it competes with the page that is supposed to
 *     rank, and Google picks a winner you did not choose. `follow` is kept so
 *     link equity still flows onward. Paid traffic is unaffected — ads do not
 *     require indexing.
 *
 *  2. NO NAVIGATION. Every extra link is an exit. These pages carry one action.
 *
 *  3. MESSAGE MATCH. `headline` should echo the ad's headline nearly verbatim.
 *     Google scores Landing Page Experience as a Quality Score input, and
 *     Quality Score moves cost-per-click — a visitor who clicked "keynote
 *     speaker on organizational change" and lands on a page saying exactly that
 *     bounces less, which compounds into cheaper clicks at the same position.
 *
 *  4. ONE OFFER. No newsletter, no book, no foundation. Book a call.
 */

export type LandingPage = {
  slug: string;
  /** Internal note — who this is for and which campaign. Never rendered. */
  campaign: string;
  /** Should echo the ad headline as closely as the truth allows. */
  headline: string;
  subhead: string;
  /**
   * Browser tab / bookmark title. Not indexed, so keep it human.
   *
   * WITHOUT the site name — app/layout.tsx appends " | Steve Welch" to every
   * page title via `title.template`, and these read "… — Steve Welch | Steve
   * Welch" in the tab until 2026-09-21 because nobody looked at a tab.
   */
  title: string;
  /** Three to five. Short, concrete, benefit-shaped. */
  bullets: string[];
  /** Proof strip — real numbers only. */
  proof: { value: string; label: string; sentence?: string }[];
  ctaLabel: string;
  /**
   * Which logo wall to show, if any. Social proof is the highest-leverage
   * element on a page like this.
   */
  logos?: "speaking" | "worked-with" | "none";
  /** Optional A/B partner. Two slugs, same campaign, one variable changed. */
  variantOf?: string;
  /** Set true only if this page is genuinely unique content, not a duplicate. */
  indexable?: boolean;
};

export const landingPages: LandingPage[] = [
  {
    /*
     * THE LEAD AD GROUP. This is where the AI + change budget points.
     *
     * The headline is the ad headline, near enough verbatim, and it opens on
     * competitive urgency — never on relativising AI. See the long note on
     * `aiChange` in content/speaking.ts for why that sequence is not
     * negotiable: it is Steve's actual argument, and the "AI is overhyped,
     * fundamentals still matter" version was explicitly rejected.
     *
     * The organic twin is /speaking/driving-change-in-the-age-of-ai/, which
     * makes the same case at length and is the page meant to rank. This one is
     * noindex, carries no navigation, and exists to convert a paid click.
     */
    slug: "ai-change-speaker",
    campaign: "AI + change — the lead ad group",
    headline: "Get to AI Before Your Competitors Do",
    subhead:
      "The advantage is real and it is going fast. Most organizations will miss it — not because the technology is hard, but because they cannot implement. Steve Welch has driven change through four companies he founded, 350+ he was first money into, and the national business he helped build, and he speaks to leadership teams about what has to be true before any of it lands.",
    title: "AI and Change Keynote Speaker",
    bullets: [
      "Why the advantage goes to the organization that can implement, not the one that buys first",
      "What else is driving change right now that has nothing to do with AI",
      "Purpose, people, process — the capability that decides both",
      "Engagements start at $20,000 — a straight answer on availability, not a negotiation",
    ],
    proof: [
      { value: "4", label: "companies founded", sentence: "Steve Welch has founded 4 companies." },
      { value: "350+", label: "companies built or backed", sentence: "Steve Welch has built from scratch or been the first investor in more than 350 companies." },
      { value: "225+", label: "Restore locations", sentence: "Steve Welch helped build Restore Hyper Wellness, which operates more than 225 studios nationwide." },
    ],
    ctaLabel: "Check availability",
    logos: "worked-with",
  },
  {
    slug: "keynote-speaker",
    campaign: "Brand + generic keynote terms",
    headline: "Book a Keynote Speaker Who Has Actually Run the Companies",
    subhead:
      "Steve Welch has founded four companies, invested in 400+, and helped build a national health business. He speaks to leadership teams about driving change through purpose, people, and process — and inquiries reach his team directly, with no bureau in between.",
    title: "Book a Keynote Speaker",
    bullets: [
      "45–60 minute keynote, tailored on a call before your event",
      "Corporate, association, and founder audiences on multiple continents",
      "Booking goes straight to Steve’s team — no agency, no bureau fee",
      "Engagements start at $20,000 — a straight answer on availability, not a negotiation",
    ],
    proof: [
      { value: "350+", label: "companies built or backed", sentence: "Steve Welch has built from scratch or been the first investor in more than 350 companies." },
      { value: "400+", label: "investments", sentence: "Steve Welch has invested in over 400 companies." },
      { value: "$10B+", label: "combined market cap", sentence: "Those companies have a combined market capitalization exceeding $10 billion." },
    ],
    ctaLabel: "Check availability",
    logos: "speaking",
  },
  {
    slug: "organizational-change-speaker",
    campaign: "Change management / transformation terms",
    headline: "A Keynote on Change That Has Survived Contact With a P&L",
    subhead:
      "Most change programs fail at the first step, not the last — the organization picks a change it can announce rather than the one that would move the business. Steve Welch has watched that failure in ten-person startups and in companies with thousands of employees, and the mechanism is identical.",
    title: "Organizational Change Keynote Speaker",
    bullets: [
      "How to identify the change actually needed, not the one easiest to announce",
      "Telling resistance worth listening to from resistance worth overriding",
      "Making a change survive its first bad quarter",
      "A diagnostic your leadership team can run the week after",
    ],
    proof: [
      { value: "25 yrs", label: "building and scaling companies", sentence: "Steve Welch has spent 25 years building and scaling companies." },
      { value: "4", label: "companies founded", sentence: "Steve Welch has founded 4 companies." },
      { value: "225+", label: "Restore locations", sentence: "Steve Welch helped build Restore Hyper Wellness, which operates more than 225 studios nationwide." },
    ],
    ctaLabel: "Check availability",
    logos: "worked-with",
  },
  {
    slug: "wellness-speaker",
    campaign: "Employee wellbeing / human performance terms",
    headline: "An Employee Wellbeing Keynote From Someone Who Built the Business",
    subhead:
      "Not a wellness consultant. Steve Welch helped build Restore Hyper Wellness — 225+ studios, 57,000 members, 3 million therapies delivered in 2024 — and he speaks about the energy leaders need to drive change, without the supplement-aisle vocabulary.",
    title: "Employee Wellbeing Keynote Speaker",
    bullets: [
      "Why capacity, not strategy, is the binding constraint on most teams",
      "The few inputs that carry most of the performance difference",
      "Where the evidence supports the wellness industry — and where it outruns it",
      "Why your wellbeing benefit goes unused, and the design change that fixes it",
    ],
    proof: [
      { value: "225+", label: "Restore studios nationwide", sentence: "Restore Hyper Wellness operates more than 225 studios nationwide." },
      { value: "57,000", label: "members", sentence: "Restore Hyper Wellness serves 57,000 members." },
      { value: "3M+", label: "therapies in 2024", sentence: "Restore Hyper Wellness delivered more than 3 million therapies in 2024." },
    ],
    ctaLabel: "Check availability",
    logos: "speaking",
  },
];

export function getLandingPage(slug: string): LandingPage | undefined {
  return landingPages.find((p) => p.slug === slug);
}
