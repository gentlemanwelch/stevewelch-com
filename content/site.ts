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
   * The single sentence Google shows under the title in search results for the
   * homepage, and the sentence a booker reads first. It has one job: say what
   * he speaks about and that he is bookable.
   */
  tagline: "Driving Change Through Purpose, People, Process",

  description:
    "Steve Welch is a successful entrepreneur and investor, who has founded and " +
    "exited businesses in the healthcare and consumer industries. Steve is " +
    "expanding the accessibility of wellness therapies that provide lasting " +
    "health benefits to consumers.",

  /**
   * Booking inquiries. This address is the conversion point of the whole site:
   * the entire SEO effort exists to put qualified event organizers here.
   */
  /**
   * Booking inquiries. This address is the conversion point of the whole site.
   *
   * Confirmed: this is the inbox Steve reads. It is also the fallback the
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
   * Navigation, matching the WordPress site's own structure and URLs.
   *
   * The paths are reproduced EXACTLY — /speaking/, /about/, /books/,
   * /writings-media/, /welch-family-foundation/, /contact/ — because those URLs
   * are already indexed and already carry whatever authority they have earned.
   * A rebuild that renames them throws that away and needs a redirect map to
   * claw part of it back. Keeping them costs nothing.
   *
   * /press-kit/ is the one addition. See content/pressKit.ts for why.
   */
  nav: [
    { href: "/about/", label: "About" },
    { href: "/books/", label: "Books" },
    { href: "/speaking/", label: "Speaking" },
    { href: "/writings-media/", label: "Writings + Media" },
    { href: "/welch-family-foundation/", label: "Family Foundation" },
    { href: "/contact/", label: "Contact" },
  ],

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
   * Speaking fee. Kept out of the public pages by default.
   *
   * Publishing a range filters out unqualified inquiries but also anchors
   * every negotiation to the bottom of it, and removes the reason for an
   * organizer to make contact at all. The recommendation is to leave
   * `showPublicly` false and let the inquiry form ask for the event's budget
   * instead — you learn their number before quoting yours.
   */
  fee: {
    min: 10000,
    max: 20000,
    currency: "USD",
    showPublicly: false,
  },
} as const;

export type Site = typeof site;
