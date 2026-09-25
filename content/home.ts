/**
 * HOMEPAGE — "Built for Change".
 *
 * Every string here is from 01_HOMEPAGE_COPY.md in the Built for Change
 * handoff packet, as written. The packet's instruction is explicit: "Copy
 * should be implemented as written unless Steve explicitly approves a change.
 * Minor punctuation/line-wrap changes are fine; strategic rewriting is not."
 * Edit this file freely — but an edit here is a copy change, not a code change,
 * and belongs to Steve.
 *
 * The page renders these in the packet's section order (§2–§12); §1 and §13
 * are the header and footer.
 *
 * REVISED 2026-09-25 from the CMO's homepage revision brief
 * (Claude_Homepage_Revision_Brief), which Steve passed on to apply: more
 * stature, less repetition, a proof strip, "Built for the Room" in place of
 * "Case study", and one final CTA. Where this file departs from the packet,
 * the brief is the later instruction.
 *
 * `headingLines` arrays are headings the packet sets on two lines. They render
 * as ONE heading element with a line break, so a screen reader and a crawler
 * read one sentence rather than two.
 */

/* §2 — Hero ------------------------------------------------------------- */

export const hero = {
  eyebrow: "STEVE WELCH",
  /** The H1. The spec: "H1 remains Built for Change." */
  heading: "BUILT FOR CHANGE.",
  /** Set as the first H2 — the copy marks it `##` under the H1. */
  subhead: "AI, Leadership, and the Organizations That Adapt",
  body: "Steve Welch has spent 25 years founding, scaling, leading, and investing in companies. Built for Change brings those lessons to leaders confronting the most consequential technology shift of their careers.",
  /* The brief gives this twice, full (§2) and cut (§5). Steve chose the
     full one: it names Purpose, People and Process on the first screen,
     which the brief's own 15-second test asks for. */
  thesis:
    "AI change only works when the fundamentals are already in place: clear purpose, aligned people, and processes that drive consistent execution. Then AI amplifies everything.",
  primaryCta: "Build Your Keynote",
  secondaryCta: "Watch Steve Speak",
  /* "400+ Companies" is the revision brief's line — Dreamit's portfolio,
     which Steve co-founded. It settles the old 400+ / 350+ question. */
  credibility: ["FOUNDER", "CEO", "INVESTOR", "400+ COMPANIES"],
};

/* Proof strip — directly under the hero ------------------------------------ */

/*
 * The brief's §3: "within seconds, a meeting planner should understand the
 * magnitude of Steve's operating experience." Every figure is one the site
 * already carries and sources — byTheNumbers and restoreToday in
 * content/bio.ts, and bioLong's "over the last twenty-five years" (Mitos was
 * founded in 2001). Nothing new is claimed here.
 */
export const proof = [
  { value: "400+", to: 400, label: "Companies backed", sentence: "Steve Welch has backed more than 400 companies." },
  { value: "$10B+", to: 10, label: "Combined market capitalization", sentence: "The companies Steve Welch has invested in have a combined market capitalization exceeding $10 billion." },
  { value: "225+", to: 225, label: "Restore locations", sentence: "Steve Welch helped build Restore Hyper Wellness, which operates more than 225 locations." },
  { value: "25+", to: 25, label: "Years building and leading companies", sentence: "Steve Welch has spent more than 25 years building and leading companies." },
];

/* §3 — Career authority -------------------------------------------------- */

export type Chapter = {
  name: string;
  headline: string;
  body: string;
  image: "mitos" | "dreamit" | "restore" | "portrait";
};

export const career = {
  eyebrow: "A 25-YEAR JOURNEY",
  heading: "BUILT, NOT JUST STUDIED.",
  intro:
    "Steve has experienced change from nearly every seat at the table: entrepreneur, CEO, investor, buyer, seller and operator. Those experiences are the source material for the ideas he brings to the stage.",
  chapters: [
    {
      name: "Mitos",
      /* "Founded at 23" is the revision brief's, which settles the old
         23-or-24 question. Sold at 30 is the site's long-standing fact. */
      headline: "Founded at 23. Sold at 30.",
      body: "Founded Mitos Technologies, built and scaled the company, and sold it to Parker Hannifin.",
      image: "mitos",
    },
    {
      name: "Dreamit",
      headline: "400+ companies backed.",
      body: "Co-founded Dreamit Ventures and worked alongside hundreds of founders building companies across technology and healthcare.",
      image: "dreamit",
    },
    {
      name: "Restore",
      headline: "225+ locations.",
      /* Past tense is correct: Steve stepped down as CEO effective
         10 February 2025 and remains on the board. */
      body: "Helped build Restore Hyper Wellness into a national business and later returned as CEO during a period of intense change.",
      image: "restore",
    },
    {
      name: "25+ Years",
      headline: "Seeing change from every seat at the table.",
      body: "Founder. CEO. Investor. Buyer. Seller. Operator.",
      image: "portrait",
    },
  ] satisfies Chapter[],
};

/* §4 — Change thesis ----------------------------------------------------- */

/*
 * The bridge. The brief's §5: "Keep this primarily visual… One supporting
 * sentence is enough. Do not restate the full Purpose / People / Process
 * explanation here." The emphasis paragraph, the "PURPOSE. PEOPLE. PROCESS.
 * THEN AI." display line and the closing statement all restated what the
 * hero and the framework now say once each.
 */
export const thesis = {
  headingLines: ["Change isn’t new.", "The speed is."],
  body: "Markets change. Technologies change. People change. Business models change. AI accelerates all of it.",
};

/* §5 — Framework --------------------------------------------------------- */

export const framework = {
  eyebrow: "THE FRAMEWORK",
  headingLines: [
    "THE IDEAS DIDN’T COME FROM THE SPEAKING CIRCUIT.",
    "THEY CAME FROM BUILDING COMPANIES.",
  ],
  steps: [
    { key: "purpose", name: "Purpose", line: "Establishes direction." },
    { key: "people", name: "People", line: "Align behind the purpose." },
    { key: "process", name: "Process", line: "Drives consistent execution." },
  ],
  /**
   * The spec is specific: AI "must read Amplifies Everything. Do not write
   * 'Multiplies Process' or 'Multiplies the Process.'" It acts on the whole
   * system, not on the last block.
   */
  amplifier: { name: "AI", line: "AMPLIFIES EVERYTHING." },
  /* The one supporting line, under the graphic. It replaced a heading above
     it and a paragraph below it that made the same point twice. */
  supporting: "AI is not the foundation. It accelerates whatever system is already there.",
};

/* §6 — Customization ----------------------------------------------------- */

export const customization = {
  eyebrow: "BUILT AROUND YOUR ORGANIZATION",
  headingLines: [
    "No two organizations are facing the same change.",
    "Why should they hear the same keynote?",
  ],
  /* First person, in Steve's voice, as the packet writes it. */
  /* "Multiple working sessions", not "a call": the brief's §6 — "Do not
     reduce the customization promise to 'a pre-event call.'" */
  body: "I don’t give canned speeches. Every engagement starts with multiple working sessions with the organizers — about your organization, your audience and what you need them to leave with. The framework stays consistent. The stories, examples, data and emphasis are built for the room.",
  inputs: [
    { name: "YOUR ORGANIZATION", line: "What is changing?" },
    { name: "YOUR AUDIENCE", line: "Who is in the room?" },
    { name: "YOUR OUTCOME", line: "What should they think or do differently?" },
  ],
};

/* §7 — Speaking reel ----------------------------------------------------- */

export const reel = {
  eyebrow: "SEE STEVE SPEAK",
  heading: "See the keynote, not just the résumé.",
  /** "Use the existing speaking reel until a new Built for Change reel is
      produced." No autoplay — the player loads only when pressed. */
  overlay: "Watch Steve’s Keynote Reel",
  youtubeId: "m5oykqwZjUU",
};

/* §8 — Built for the Room ----------------------------------------------- */

/*
 * NOT A CASE STUDY, and not called one. The brief's §7: "We are not claiming
 * an intervention with measured outcomes. The section demonstrates how the
 * same core framework becomes a different keynote for a specific audience."
 * So there are no results here, no client name, and the two panels are
 * archetypes — never photographs of people. The body is drafted from the
 * brief's "what this example should communicate".
 */
export const builtForTheRoom = {
  eyebrow: "BUILT FOR THE ROOM",
  heading: "One framework. A different keynote every time.",
  subhead: "Insurance Industry",
  body: [
    "The keynote was built around a challenge facing the industry: how leaders manage experienced, non-AI-native employees alongside AI-native colleagues whose work styles and productivity can look fundamentally different.",
    "The message was not old versus young. Organizations need both. The leadership problem is making them effective together rather than forcing one group to become the other.",
  ],
  /** The four principles the keynote was built around, keyed by the
      framework so the same system is visibly at work. */
  principles: [
    { name: "Purpose", line: "gives both groups a reason to move in the same direction." },
    { name: "People", line: "need to be valued for different forms of contribution and leverage." },
    { name: "Process", line: "creates consistency and lets different working styles function inside one organization." },
    { name: "AI", line: "amplifies what is already working once those foundations exist." },
  ],
  panels: [
    { name: "EXPERIENCED JUDGMENT", traits: ["Deep expertise", "Context", "Institutional knowledge", "Seeing risks the data doesn’t show"] },
    { name: "AI-NATIVE LEVERAGE", traits: ["New workflows", "Faster iteration", "Automation", "Far more output with new tools"] },
  ],
  payoff: "Purpose aligns them. Process lets them work together. AI amplifies what works.",
};

/* §9 — Ideas ------------------------------------------------------------- */

export const ideas = {
  eyebrow: "IDEAS ON CHANGE",
  heading: "The work continues offstage.",
  body: "Steve writes about AI, entrepreneurship, organizations and the forces changing how people work and lead.",
  cta: "Read Steve’s Writing",
  /* The three most recent essays come from Substack at build time, with real
     titles and dates — never hard-coded. See lib/substack.ts. */
};

/* §10 — Selected organizations ------------------------------------------ */

export const organizations = {
  eyebrow: "SELECTED AUDIENCES & ORGANIZATIONS",
  /* Logos: selectedOrganizationLogos in content/media-manifest.ts. */
};

/* §11 — Testimonial ------------------------------------------------------ */

/*
 * The packet: "Only use a genuine, attributable quote… If no strong organizer
 * testimonial is available at launch, use the existing legitimate
 * Philadelphia Inquirer quote, clearly attributed." That is what renders — the
 * quote lives in content/speaking.ts as `anvilQuote`. An organizer testimonial
 * validating the customization is the one to collect next.
 */
/*
 * PRESS, AND LABELLED AS PRESS. The revision brief's §9: the Inquirer line is
 * "colorful but not strong conversion proof for a meeting planner", so until
 * verified organizer testimonials exist it stays "clearly identified as press
 * and visually secondary". Two or three organizer quotes on customization and
 * audience outcome are the end state — never invented.
 */
export const testimonial = {
  label: "IN THE PRESS",
  source: "The Philadelphia Inquirer",
};

/* §12 — Final CTA -------------------------------------------------------- */

export const finalCta = {
  eyebrow: "START WITH THE OUTCOME",
  heading: "What do you need your audience to leave with?",
  body: "Tell Steve what’s changing, who’s in the room and what you need the session to accomplish.",
  /* ONE action. "Check Availability" went to the same form as this button;
     the brief's §10: "Do not present two choices if they do the same
     thing." */
  primary: "Build Your Keynote",
  reassurance: "Inquiries go directly to Steve’s team. No agency in between.",
};
