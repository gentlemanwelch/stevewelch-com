/**
 * Speaking page — transcribed from the WordPress export.
 *
 * The first rebuild invented three "signature talks" from search snippets.
 * They are deleted. The real page is built on the Purpose / People / Process
 * framework, resting on hyper wellness, and that is what is here.
 *
 * STRUCTURE: the original renders all of this on one /speaking/ page, and it
 * still does. Each pillar ALSO gets its own page at /speaking/<pillar>/ — the
 * one addition, made because an organizer searching "employee wellbeing
 * keynote speaker" and one searching "change management keynote speaker" are
 * different people, and a single page cannot rank for both because it cannot
 * be about both. Nothing is taken off the hub to make that work.
 */

export const speakingHero = {
  eyebrow: "Speaking",
  heading: "Entrepreneur. Investor. Disruptor.",
  cta: "Book Steve to Speak",
};

export const speakingIntro =
  "Steve Welch has been a guest speaker on multiple continents. He has a track record of engaging audiences and empowering them with the tools and mindset to drive change in their organizations and their personal lives.";

export const exploreHeading = "Explore the mindset needed to drive change";

export type SpeakingPillar = {
  slug: string;
  name: string;
  /** The statement as it appears on /speaking/. */
  statement: string;
  /** The three bullets under it. */
  points: string[];
  /** Page-specific SEO. */
  seoTitle: string;
  metaDescription: string;
  keywords: string[];
  /** Expanded argument for the pillar's own page. */
  body: string[];
  audiences: string[];
};

export const speakingPillars: SpeakingPillar[] = [
  {
    slug: "purpose",
    name: "Purpose",
    statement:
      "Purpose should be the guiding force illuminating our paths with clarity and intention.",
    points: [
      "Creating value is your north star",
      "Fostering a collective mission",
      "Personal aspirations to daily decisions",
    ],
    seoTitle: "Purpose-Driven Leadership Keynote Speaker",
    metaDescription:
      "A keynote on purpose as an operating discipline: why value creation is the north star every stakeholder can rally behind, and how it reaches daily decisions.",
    keywords: [
      "purpose driven leadership speaker",
      "value creation keynote speaker",
      "company mission keynote speaker",
      "leadership keynote speaker",
    ],
    body: [
      "A company or product needs to generate a profit, but first it needs to create value. That distinction sounds academic until you watch an organization try to operate without it — a team that cannot say what the work is for will optimise for whatever is measured, and what is measured is rarely the thing that matters.",
      "Steve's argument is that value creation is the north star all stakeholders can rally behind and employees can find purpose in. Not a statement on a wall. A test you can apply to a roadmap on a Tuesday, and which tells you what to stop doing.",
      "The session moves from the collective mission down to the individual: how a shared purpose gets translated into personal aspirations, and from there into the daily decisions that actually constitute a strategy. That last step is where most purpose work fails, and it gets the most time.",
    ],
    audiences: [
      "Corporate leadership and all-hands meetings",
      "Industry associations and annual conferences",
      "Executive teams and leadership offsites",
    ],
  },
  {
    slug: "people",
    name: "People",
    statement:
      "People are your most valuable asset and a team with the right skills and experiences will succeed.",
    points: [
      "Balancing diverse perspectives with functional expertise",
      "Mentoring to benefit others",
      "Recognizing relationships change you",
    ],
    seoTitle: "Team & Talent Keynote Speaker",
    metaDescription:
      "A keynote on the people side of change: balancing diverse perspectives against functional expertise, mentoring, and why the right team is the whole advantage.",
    keywords: [
      "employee engagement keynote speaker",
      "team building keynote speaker",
      "talent and culture speaker",
      "mentorship keynote speaker",
    ],
    body: [
      "Every company says its people are its greatest asset. Very few are organised as though that were true. Steve has tested the claim from an unusual number of angles — founding four companies, being first money into more than 350, and running one at national scale — and the pattern holds in all of them: having the right people, with the right experience, driven by a common purpose is how you power change.",
      "The talk gets specific about a tension most leadership teams handle badly: balancing diverse perspectives against functional expertise. Hire only for expertise and you get a team that agrees too early. Hire only for perspective and nothing ships. Where that balance sits is a judgment call, and the session is about how to make it deliberately rather than by accident.",
      "It closes on mentoring and on something Steve states plainly and rarely gets said from a stage: that relationships change you. Not that they are useful, or strategic — that the people you work closely with alter what you are capable of.",
    ],
    audiences: [
      "Corporate leadership and all-hands meetings",
      "HR, talent, and people-operations conferences",
      "Founder communities and accelerators",
    ],
  },
  {
    slug: "process",
    name: "Process",
    statement: "While not sexy, process and structure are key to achieving success.",
    points: [
      "Benefits of quick iteration cycles",
      "Building frameworks to help teams and individuals prioritize",
      "Connecting professional and personal goals",
    ],
    seoTitle: "Organizational Change & Execution Keynote Speaker",
    metaDescription:
      "A keynote on the unglamorous half of change: quick iteration cycles, frameworks that let teams prioritize, and connecting professional goals to personal ones.",
    keywords: [
      "organizational change keynote speaker",
      "change management keynote speaker",
      "execution and operations speaker",
      "business transformation speaker",
    ],
    body: [
      "Steve opens this one by conceding the point: process is not sexy. It is also the reason some organizations turn a good idea into a result in six weeks and others take two years to decide who owns it.",
      "The core of the session is iteration speed. A process that provides structure with quick iteration cycles empowers an organization to drive change and achieve results — and the mechanism is not that people work harder, it is that the distance between noticing something and being allowed to act on it gets shorter. Every additional approval in that chain has a cost that is invisible on an org chart and obvious in a roadmap.",
      "From there it becomes practical: how to build frameworks that help teams and individuals prioritize, rather than frameworks that mostly generate meetings. And it ends by connecting professional goals to personal ones, on the argument that a process someone only follows at work is a process they do not believe in.",
    ],
    audiences: [
      "Transformation, strategy, and operations teams",
      "Corporate leadership and strategy offsites",
      "Industry associations and trade conferences",
    ],
  },
];

/**
 * THE FIFTH PAGE, AND THE ONE THE ADS POINT AT.
 *
 * Deliberately NOT a member of `speakingPillars`. Purpose, People and Process
 * are the framework the whole site is organised around, and Steve was explicit
 * when this was commissioned (2026-09-16) that he does not want the brand to
 * become an AI brand: "I want to keep the purpose, people and process because
 * I think that's integral in the driving change regardless of whether you have
 * AI or not." Folding AI into the three would make it a fourth leg of a
 * framework that has three. It sits beside them instead, as the application of
 * the framework that organizers are asking for right now.
 *
 * THE ARGUMENT IS LOAD-BEARING AND IT IS NOT THE OBVIOUS ONE. An earlier draft
 * offered "AI is overhyped, fundamentals still matter" and Steve rejected it
 * outright. His version, verbatim:
 *
 *   "AI is coming. You need to beat your competitors there. But there is much
 *   beyond AI to drive change and it all starts with making sure your
 *   organization has people, purpose and a process to implement."
 *
 * Three moves, in this order, and the order is the point:
 *   1. Move on AI, and move before your competitors. No hedging.
 *   2. AI is not the whole change agenda.
 *   3. Either way you cannot implement anything without the foundation.
 *
 * So the copy here OPENS ON URGENCY and only then turns to capability. It must
 * never open by relativising AI — that is the talk Steve does not give, and it
 * is also the talk every other speaker is giving. Rewrite this copy if you
 * like, but keep that sequence.
 *
 * Commercially this is the wedge: it meets the budget that exists today
 * ("we need an AI speaker") without competing as an AI futurist, which is a
 * crowded field and one Steve would lose on credentials. What he has that they
 * do not is an operator record of actually landing change.
 */
export const aiChange = {
  slug: "driving-change-in-the-age-of-ai",
  name: "Driving Change in the Age of AI",
  heading: "Driving Change in the Age of AI",
  statement:
    "AI is coming, and getting there before your competitors is a real advantage. Most organizations will not — not because the technology is hard, but because they cannot implement.",
  points: [
    "Why moving first on AI is a real advantage — and what it is actually an advantage in",
    "The reason most organizations will not get there: they cannot implement",
    "What else is driving change right now that has nothing to do with AI",
    "Purpose, people, process — the capability that decides all of it",
  ],
  seoTitle: "AI and Change Management Keynote Speaker",
  metaDescription:
    "A keynote on getting to AI before your competitors — and why most organizations will not. The constraint is never the technology. It is whether you can implement.",
  keywords: [
    "ai change management speaker",
    "ai transformation keynote speaker",
    "speaker on leading through ai",
    "ai and organizational change speaker",
    "keynote speaker on ai adoption",
  ],
  body: [
    "Steve does not open this one with a caveat. AI is coming, the advantage of getting there before your competitors is real, and an organization treating it as wait-and-see has made a decision whether it says so or not. None of that is in dispute and the session does not spend its time arguing it.",
    "What is in dispute is who actually gets there. Steve has watched the same pattern in the four companies he founded, in the 350+ he was first money into, and in the national business he runs today: the constraint is almost never the technology. It is that the organization cannot implement. The pilot runs, the deck gets presented, and eighteen months later nothing in the operating rhythm has changed. That failure has nothing to do with AI — it was there before, on every other change the company tried to make. AI only makes it expensive faster.",
    "The second half of the argument is the part organizations most need and least expect from a talk with AI in the title: there is a great deal beyond AI driving change right now, and a company that pours its entire change capacity into one technology will be caught flat by the rest of it. What generalises is the capability, not the tool.",
    "Which returns it to purpose, people and process — not as a consolation prize beside the AI question, but as the answer to it. Purpose, so the organization can tell which moves are worth making rather than chasing whichever one is in the trade press. People, because the ones who have to live with the change decide whether it survives its first bad quarter. Process, because iteration speed is the whole game when nobody yet knows the right answer. Get those right and you get there first. Get them wrong and you will buy the software anyway, and your competitors will still beat you to it.",
  ],
  audiences: [
    "Corporate leadership and all-hands meetings",
    "Industry associations and annual conferences",
    "Transformation, strategy, and operations teams",
  ],
};

/**
 * The foundation under the three pillars. On the original this is its own
 * section headed "It All Starts With Hyper Wellness" — it is the connective
 * argument between Steve's day job and his speaking, so it gets its own page
 * too.
 */
export const hyperWellness = {
  slug: "hyper-wellness",
  name: "Hyper Wellness",
  heading: "It All Starts With Hyper Wellness",
  statement:
    "The hyper wellness lifestyle allows leaders to have the proper energy to drive change and find the purpose, people and processes that will lead to success",
  seoTitle: "Wellness & Human Performance Keynote Speaker",
  metaDescription:
    "A keynote on the energy leaders need to drive change, from the CEO of Restore Hyper Wellness — 225+ studios, 57,000 members, 3M+ therapies delivered in 2024.",
  keywords: [
    "wellness keynote speaker",
    "employee wellbeing keynote speaker",
    "human performance speaker",
    "executive performance speaker",
    "corporate wellness speaker",
  ],
  body: [
    "Ask a stalled leadership team what is wrong and they will describe a strategy problem. Spend a day with them and you will usually find something simpler underneath it: capable people running at a fraction of their capacity, making decisions at four in the afternoon they would not have made at nine in the morning, and treating that as the cost of the job.",
    "This is the load-bearing argument beneath everything else Steve speaks about. The hyper wellness lifestyle is what gives leaders the energy to drive change — and without it the purpose, the people and the processes never get found, because finding them is hard work and hard work requires fuel.",
    "He did not arrive at this from a book. Restore Hyper Wellness began with a problem he had personally: while training for a triathlon, he and Jim Donnelly started using cryotherapy for recovery, liked how it felt, and did not like the customer experience. The company that came out of that now runs 225+ studios nationwide, has 57,000 members, and delivered more than three million therapies in 2024.",
    "The session ends practically — the short list of inputs that carry most of the effect, an honest account of where the evidence supports the wellness industry and where it outruns it, and why a wellbeing benefit nobody uses has bought the organization nothing at all.",
  ],
  audiences: [
    "Executive teams and leadership offsites",
    "Sales kickoffs and company-wide meetings",
    "Healthcare, benefits, and wellbeing conferences",
  ],
};

/**
 * Every page that lives under /speaking/, in the order they are argued.
 *
 * ONE LIST, THREE CONSUMERS: the [pillar] route generates a page per entry,
 * sitemap.ts submits it, and speakingServiceSchema() lists it as an Offer.
 * They used to spell out `[...speakingPillars, hyperWellness]` separately in
 * each place, which worked right up until a fifth page was added — at which
 * point two of the three would have quietly gone on describing four.
 *
 * `points` is normalised to an array here so every consumer has one shape.
 */
export type Talk = SpeakingPillar;

export const talks: Talk[] = [
  ...speakingPillars,
  { ...aiChange, points: [...aiChange.points] },
  { ...hyperWellness, points: [] },
];

/** Pulled from the site's own general-testimonial block. */
export const anvilQuote =
  "Steve Welch is an entrepreneur whose ideas fly like sparks off an anvil.";

export const speakingReel = {
  heading: "Speaking Reel",
  url: "https://www.youtube.com/watch?v=m5oykqwZjUU",
  youtubeId: "m5oykqwZjUU",
};

export const podcastNote = {
  heading: "Steve is available for select podcast opportunities",
  body: "Reach out if you'd like to connect",
};
