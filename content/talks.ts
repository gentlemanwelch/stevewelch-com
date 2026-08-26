/**
 * Speaking topics.
 *
 * THESE ARE HIS REAL THREE, recovered from stevewelch.com/speaking/. The
 * previous version of this file invented four talks; they have been deleted.
 * The `summary` on each is close to the site's own wording — treat it as the
 * anchor and expand around it rather than rewriting it.
 *
 * STRUCTURE NOTE: the WordPress site lists all three on a single /speaking/
 * page. That page is reproduced, and in addition each topic now gets its own
 * page at /speaking/<slug>/. That is the one structural change made for SEO,
 * and the reasoning is specific: an organizer searching "employee wellbeing
 * keynote speaker" and one searching "change management keynote speaker" are
 * different people with different problems, and a single page cannot rank for
 * both because it cannot be about both. The hub still shows all three, so
 * nothing about the original page is lost.
 */

export type Talk = {
  slug: string;
  /** The topic name as it appears on stevewelch.com. */
  title: string;
  /** One line under the title. */
  subtitle: string;
  /** Close to the site's own description of this topic. */
  summary: string;
  /** The <title> tag — front-loads the phrase a booker actually types. */
  seoTitle: string;
  /** The search-result snippet. Written to earn a click. */
  metaDescription: string;
  audiences: string[];
  /** The body of the page. Each string is a paragraph. */
  body: string[];
  takeaways: string[];
  formats: string[];
  keywords: string[];
};

export const talks: Talk[] = [
  {
    slug: "hyper-wellness-and-leadership",
    title: "Hyper-Wellness and Leadership",
    subtitle: "The energy to drive change is not a metaphor. It is the constraint.",
    summary:
      "The hyper wellness lifestyle allows leaders to have the proper energy to drive change, and to find the purpose, people and processes that will lead to success.",
    seoTitle: "Wellness & Leadership Keynote Speaker | Hyper-Wellness and Leadership",
    metaDescription:
      "A keynote on the energy leaders need to drive change, from the CEO of Restore Hyper Wellness. Science-backed and practical, for executive teams and company-wide audiences.",
    audiences: [
      "Executive teams and leadership offsites",
      "Sales kickoffs and company-wide meetings",
      "Healthcare, benefits, and HR conferences",
      "Wellbeing and human capital summits",
    ],
    body: [
      `Ask a stalled leadership team what is wrong and they will describe a strategy problem. Spend a day with them and you will usually find something simpler underneath it: capable people running at a fraction of their capacity, making decisions at four in the afternoon they would not have made at nine in the morning, and treating that as the unavoidable cost of the job.`,

      `Steve's argument is that the hyper wellness lifestyle is what gives leaders the energy to drive change — and that without it, the purpose, the people and the processes never get found, because finding them is hard work and hard work requires fuel. This is not a talk about self-care. It is a talk about capacity as an operating input.`,

      `He built the case the hard way. Restore Hyper Wellness started from a problem he had personally, and from an observation that the barrier to health has never really been information — most people know what they ought to do. The barrier is access and convenience. Making recovery something a person could use on a Tuesday afternoon, rather than once a year at a clinic, turned out to matter more than any amount of persuasion. It became the largest retail health company in the country.`,

      `The session ends somewhere practical: the short list of inputs that carry most of the effect, an honest account of where the evidence supports the wellness industry and where it outruns it, and why a wellbeing benefit nobody uses has bought the organization precisely nothing.`,
    ],
    takeaways: [
      "Why energy, not strategy, is the binding constraint on most leadership teams",
      "The small number of inputs that account for most of the difference in daily performance",
      "What the evidence supports on recovery — and where the wellness industry outruns it",
      "Why wellbeing benefits go unused, and the design change that fixes it",
      "How energy connects directly to finding the purpose, people and processes that drive success",
    ],
    formats: [
      "45–60 minute keynote",
      "Keynote plus moderated Q&A",
      "Executive team session",
      "Fireside chat or moderated interview",
    ],
    keywords: [
      "wellness keynote speaker",
      "employee wellbeing keynote speaker",
      "human performance speaker",
      "executive performance speaker",
      "corporate wellness speaker",
    ],
  },

  {
    slug: "organizational-change",
    title: "Organizational Change",
    subtitle:
      "Identifying the change that is actually needed — and getting an organization to accept it.",
    summary:
      "Steve speaks to the process of identifying and instituting the change that is needed to take organizations to the next level.",
    seoTitle: "Organizational Change Keynote Speaker | Steve Welch",
    metaDescription:
      "A keynote on identifying and instituting the change an organization needs to reach the next level — from an entrepreneur who has built, sold, and scaled companies for 25 years.",
    audiences: [
      "Corporate leadership and all-hands meetings",
      "Transformation, strategy, and operations teams",
      "Industry associations and annual conferences",
      "Boards and executive committees",
    ],
    body: [
      `Most change programs fail at the first step rather than the last. The organization picks a change that is legible — reorganize the reporting lines, adopt the new platform, rename the division — because a legible change can be announced. The change that would actually move the business is usually harder to name and much harder to sell, so it goes unaddressed while everyone stays busy.`,

      `Steve has been on both sides of this. He has built companies from nothing, sold one to a public acquirer, invested first money into hundreds more, and now runs one at national scale. That range is the point of the talk: he has watched the same failure appear in a ten-person startup and in a company with thousands of employees, and the mechanism is identical in both.`,

      `The session works through the process — how to identify the change that is genuinely needed rather than the one that is easiest to describe, how to tell the difference between resistance that is protecting something valuable and resistance that is protecting a habit, and how to institute a change so it survives the first quarter it underperforms.`,

      `It is built for a room with authority to act. The examples are specific, the failures are included, and it ends with a diagnostic a leadership team can run on itself the following week.`,
    ],
    takeaways: [
      "How to identify the change that is actually needed, not the one that is easiest to announce",
      "Why most change programs fail at the first step rather than the last",
      "The difference between resistance worth listening to and resistance worth overriding",
      "How to institute a change so it survives its first bad quarter",
      "A diagnostic a leadership team can run on its own organization",
    ],
    formats: [
      "45–60 minute keynote",
      "Leadership team workshop",
      "Half-day executive session",
      "Fireside chat",
    ],
    keywords: [
      "organizational change keynote speaker",
      "change management keynote speaker",
      "business transformation speaker",
      "leadership keynote speaker",
      "corporate culture speaker",
    ],
  },

  {
    slug: "value-creation-and-purpose",
    title: "Value Creation and Purpose",
    subtitle:
      "People are the most valuable asset in almost every organization. Most are managed as though they were not.",
    summary:
      "Steve has engaged many audiences on the tools and mindset needed to drive change within an organization, emphasizing that people are the most valuable asset in almost every organization.",
    seoTitle: "Value Creation & Purpose Keynote Speaker | Steve Welch",
    metaDescription:
      "A keynote on the tools and mindset that drive change inside an organization, and on treating people as what they actually are — the most valuable asset almost every company has.",
    audiences: [
      "Corporate leadership and all-hands meetings",
      "Industry associations and annual conferences",
      "Founder and accelerator communities",
      "Universities and business schools",
    ],
    body: [
      `Every company says its people are its greatest asset. Very few are organized as though that were true. The gap between the two shows up in specific, measurable places — how long it takes for someone four levels down to get a decision made, what happens to the first person who tries something and is wrong, whether anyone senior can name what the work is actually for.`,

      `This is the talk closest to Steve's own book. "We Are All Born Entrepreneurs" came out of hundreds of interviews with entrepreneurs about their successes and their failures, and the conclusion that surprised him was how ordinary the instinct turned out to be. The desire to build something is not a rare trait distributed to a few founders. What is rare is an environment where acting on it is safe.`,

      `From there the session gets concrete about value creation: where it actually comes from in an organization, why purpose is an operational asset rather than a poster, and what tools and mindset a leader needs to unlock the people already on the payroll rather than going looking for different ones.`,

      `It works best in a room that is not full of founders. The people who get the most from it are usually the ones who have never called themselves entrepreneurs and have been sitting on an idea about their own job for two years.`,
    ],
    takeaways: [
      "Where value creation actually originates inside an organization",
      "Why the entrepreneurial instinct is common and the conditions for it are rare",
      "The organizational habits that reliably kill an idea before it is spoken aloud",
      "How purpose functions as an operational asset rather than a statement on a wall",
      "A concrete change each leader can make to how their team's first failure is handled",
    ],
    formats: [
      "45–60 minute keynote",
      "Keynote plus moderated Q&A",
      "Half-day workshop for leadership teams",
      "Fireside chat",
    ],
    keywords: [
      "entrepreneurship keynote speaker",
      "value creation speaker",
      "purpose driven leadership speaker",
      "employee engagement keynote speaker",
      "innovation keynote speaker",
    ],
  },
];

export function getTalk(slug: string): Talk | undefined {
  return talks.find((t) => t.slug === slug);
}
