/**
 * Global site configuration.
 *
 * Everything a human might want to change without touching a component lives
 * in `content/`. This file holds the values that appear on every page: the
 * name, the domain, navigation, contact details, social profiles.
 *
 * NOTE ON ACCURACY: every biographical claim in `content/` was drawn from
 * public sources (the existing stevewelch.com, Crunchbase, press coverage).
 * Anything the author has not personally confirmed is marked with a
 * `REVIEW:` comment. Nothing in here should be published unread — a speaker
 * site is a credibility document, and a single wrong number costs more than
 * the page earns.
 */

export const site = {
  name: "Steve Welch",

  /**
   * The canonical origin. Every canonical URL, sitemap entry, Open Graph tag
   * and JSON-LD `@id` is built from this, so changing it here changes it
   * everywhere. No trailing slash.
   */
  url: "https://www.stevewelch.com",

  /**
   * The platform, as the Built for Change packet names it (00_READ_ME_FIRST):
   * "BUILT FOR CHANGE — AI, Leadership, and the Organizations That Adapt".
   * Feeds the default <title>, llms.txt, and the brand line in the footer.
   */
  tagline: "Built for Change — AI, Leadership, and the Organizations That Adapt",

  brand: {
    name: "Built for Change",
    /** The footer's closing line, set as a slide. */
    line: "BUILT FOR CHANGE.",
  },

  /**
   * The default meta description — the spec's own suggested wording
   * (02_DESIGN_IMPLEMENTATION_SPEC, "SEO / metadata").
   *
   * It replaced a description saying Steve "is expanding the accessibility of
   * wellness therapies", written when he was Restore's CEO. He stepped down
   * effective 10 February 2025 and remains on the board.
   */
  description:
    "Entrepreneur, CEO and investor Steve Welch delivers deeply customized " +
    "keynotes on AI, leadership and organizational change through his " +
    "Purpose, People and Process framework.",

  /**
   * Booking inquiries. This address is the conversion point of the whole site:
   * the entire SEO effort exists to put qualified event organizers here.
   */
  /**
   * Booking inquiries. This address is the conversion point of the whole site.
   *
   * Confirmed: this is the inbox Steve's team works. It is also the fallback the
   * inquiry API uses when INQUIRY_TO_EMAIL is unset, so the form still reaches
   * a real person even if that variable is forgotten in Vercel.
   */
  email: "steve@stevewelch.com",

  /**
   * Home base. Feeds the PostalAddress in the Person schema, and would anchor
   * any future "keynote speaker in <city>" pages.
   *
   * REVIEW — GENUINELY UNRESOLVED, and the evidence points two ways:
   *   Austin, TX      — Restore Hyper Wellness is headquartered there and he
   *                     is its CEO.
   *   Philadelphia PA — Dreamit Ventures, the Philadelphia Inquirer quote, and
   *                     the foundation's work with a Montessori school in
   *                     Valley Forge all sit in south-eastern Pennsylvania.
   *
   * Austin is the current guess. Getting this wrong tells search engines the
   * wrong service area for a speaker who travels for a living, so it is worth
   * one word of confirmation rather than a coin flip.
   */
  location: {
    city: "Austin",
    region: "TX",
    country: "US",
  },

  /**
   * Portrait for the homepage hero and the press kit.
   *
   * Left empty on purpose: no photograph was available when this was built, and
   * every page renders correctly without one. Drop a file in /public and set
   * the path here to switch it on everywhere at once.
   *
   * A speaker site converts substantially better with a real photograph of the
   * person on a stage, so this is worth doing early. Use a high-resolution
   * landscape shot; 1600px wide is plenty.
   */
  portrait: "", // e.g. "/steve-welch.jpg"
  portraitAlt: "Steve Welch speaking on stage",

  /**
   * Navigation — the Built for Change packet's order and labels
   * (01_HOMEPAGE_COPY §1): Speaking · About · Ideas · Books · Event Planners.
   *
   * THE LABELS CHANGED; THE URLS DID NOT, and must not. Every path below is the
   * one WordPress served, already indexed and carrying whatever authority it
   * has earned. Renaming a URL to match a label throws that away:
   *
   *   "Ideas"           → /writings-media/   (was labelled "Writings + Media")
   *   "Event Planners"  → /press-kit/        (reworked into the planner page in
   *                                            phase 2; /press-kit/ was the
   *                                            rebuild's own addition, so it can
   *                                            be redirected later if wanted)
   *
   * "Family Foundation" left the main nav, per the packet. It stays in the
   * footer — dropping it from both would orphan an indexed page, and a page
   * nothing links to slowly falls out of the index.
   *
   * "Contact" is no longer a nav item because the primary CTA beside the nav
   * goes there (see `cta` below).
   */
  nav: [
    { href: "/speaking/", label: "Speaking" },
    { href: "/about/", label: "About" },
    { href: "/writings-media/", label: "Ideas" },
    { href: "/books/", label: "Books" },
    { href: "/press-kit/", label: "Event Planners" },
  ],

  footerNav: [
    { href: "/speaking/", label: "Speaking" },
    { href: "/about/", label: "About" },
    { href: "/writings-media/", label: "Ideas" },
    { href: "/books/", label: "Books" },
    { href: "/press-kit/", label: "Event Planners" },
    { href: "/contact/", label: "Contact" },
    { href: "/welch-family-foundation/", label: "Family Foundation" },
  ],

  /**
   * THE primary call to action, everywhere. The spec: "Primary CTA
   * everywhere: Build Your Keynote. Do not invent multiple synonymous booking
   * CTAs. Consistency is part of the brand." One definition, so it cannot
   * drift into "Book Steve" on one page and "Get in touch" on another.
   */
  cta: { label: "Build Your Keynote", href: "/contact/" },

  /**
   * Used for JSON-LD `sameAs`, which is how search engines tie this site to the
   * same real person described on LinkedIn, Crunchbase and elsewhere. That
   * association is one of the cheaper credibility signals available, so keep
   * the list accurate and complete.
   */
  social: {
    linkedin: "https://www.linkedin.com/in/livefreeordie",
    substack: "https://stevewelch3.substack.com",
    crunchbase: "https://www.crunchbase.com/person/steve-welch",
  },

  /**
   * Links the booking auto-reply offers, when they exist.
   *
   * Both are EMPTY until the real thing is ready, and the auto-reply simply
   * omits whatever is missing. An email promising a showreel that 404s is
   * worse than an email that never mentions one.
   *
   *   reelUrl      — the 90-second keynote reel, once cut
   *   calendarUrl  — a Calendly/Cal.com link to a 15-minute inquiry call
   */
  booking: {
    reelUrl: "",
    calendarUrl: "",
  },

  /**
   * Speaking fee. PUBLISHED, as a floor.
   *
   * This used to be hidden, on the reasoning that publishing a number anchors
   * every negotiation to the bottom of it and removes a reason for the
   * organizer to make contact. That argument holds for a site funded entirely
   * by organic traffic, where an extra inquiry costs nothing.
   *
   * It stops holding the moment clicks are being paid for. A click from an
   * organizer with $6,000 costs exactly the same as one from an organizer with
   * $40,000, and the cheap one costs again in the reply it takes to decline.
   * A stated floor turns those away before they spend either. It also reads as
   * a tier signal: speakers who publish a floor are read as more established
   * than speakers who make you ask.
   *
   * Steve set the floor at $20,000 on 2026-09-16. It is a FLOOR, not a range —
   * there is deliberately no ceiling here, so a larger budget is never capped
   * by a number on a web page.
   *
   * The known cost: the occasional university or nonprofit booking at $12,000
   * that would previously have started a conversation now does not. That is
   * the intended trade, not an oversight.
   *
   * `BUDGET_RANGES` in components/InquiryForm.tsx must stay consistent with
   * this. Publishing a floor beside a dropdown offering "Under $10,000" invites
   * exactly the inquiry the floor exists to prevent.
   */
  fee: {
    min: 20000,
    currency: "USD",
    showPublicly: true,
    /** The one phrasing, used everywhere it appears. */
    label: "Engagements start at $20,000.",
    /** Shorter form, for tight spaces like landing-page bullets. */
    short: "From $20,000",
  },
} as const;

export type Site = typeof site;
